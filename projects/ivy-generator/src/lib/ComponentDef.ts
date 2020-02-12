import { ClassDep } from './ClassDep';
import { ViewQuery } from './decorator/ViewQuery';
import { ContentQuery } from './decorator/ContentQuery';
import { HostBind } from './decorator/HostBind';
import { Input } from './decorator/Input';
import { Output } from './decorator/Output';
import { Node } from './view/Node';
import { HostListener } from './decorator/HostListener';
import { componentName_p, apiPath_p } from './key';

export class ComponentDef {

  parentClass: string;
  dependencies: ClassDep[] = [];
  classMethods: string[] = [];
  rootNode: Node;
  classConstructor = '';

  selector = '';
  viewQueries: ViewQuery[] = [];
  contentQueries: ContentQuery[] = [];
  hostBindList: HostBind[] = [];
  hostListenerList: HostListener[] = [];
  inputs: Input[] = [];
  outputs: Output[] = [];
  directives: string[] = [];

  _sourceCodes: string;

  constructor(public className: string, public rootChildren: Node[]) {
    this.rootNode = new Node('');
    if (Array.isArray(rootChildren)) {
      this.rootNode.children = rootChildren;
    }
  }

  gCode(componentMap: Map<string, string>, directiveMap: Map<string, string[]>, pipeMap: Map<string, string[]>) {
    this.rootNode.compile(componentMap, directiveMap, pipeMap);
    const templateFunctionDef = this.gTemplateFunctionDef().join('');
    const componentClassDef = this.gComponentClassDef();
    const componentRef = this.gComponentDef();

    return templateFunctionDef + componentClassDef + componentRef;
  }

  private gConstructor() {
    const superStr = this.parentClass ? 'super();\n' : '';
    const classDepsStr = this.dependencies.map(d => `this.${d.name} = ${d.name};\n`).join('');
    const hostBindStr = this.hostBindList.map(b => b.gConstructor()).join('');
    const inputStr = this.inputs.map(i => i.gConstructor()).join('');
    const outputStr = this.outputs.map(o => o.gConstructor()).join('');

    const constructorBodyStr = superStr + classDepsStr + hostBindStr + inputStr + outputStr + (this.classConstructor || '');
    return `
      constructor(${this.dependencies.map(d => d.name).join(',')}){
        ${constructorBodyStr}
      }\n`;
  }

  private gComponentClassDef() {
    return `
    class ${componentName_p} ${this.parentClass ? ' extends ' + this.parentClass : ''}{
      ${this.gConstructor()}
      ${this.classMethods.join('\n')}
    }\n`;
  }

  private gTemplateFunctionDef() {
    return this.rootNode._templateNodesForRoot.map(node => {
      let initCodeStr = '';
      if (node._initCodes.length > 0) {
        initCodeStr = `if(rf & 1){
          ${node._initCodes.join('')}
        }\n`;
      }
      let refreshCodeStr = '';
      if (node._refreshCodes.length > 0) {
        refreshCodeStr = `if(rf & 2){
          ${node._refreshCodes.join('')}
        }\n`;
      }
      return `function ${node._templateFnName}(rf , ctx){
        ${initCodeStr}
        ${refreshCodeStr}
      }\n`;
    });
  }

  private gComponentDef() {
    let initCodeStr = '';
    if (this.rootNode._initCodes.length > 0) {
      initCodeStr = `if(rf & 1){
        ${this.rootNode._initCodes.join('')}
      }\n`;
    }
    let refreshCodeStr = '';
    if (this.rootNode._refreshCodes.length > 0) {
      refreshCodeStr = `if(rf & 2){
        ${this.rootNode._refreshCodes.join('')}
      }\n`;
    }

    const { contentQueriesStr, viewQueryStr, hostStr, inputsStr, outputsStr } = this.gComponentDefOptions();
    const optionCode = contentQueriesStr + viewQueryStr + hostStr + inputsStr + outputsStr;
    const directives = this.directives.concat(Array.from(this.rootNode._directivesForRoot)).map(d => {
      return apiPath_p + '.' + d;
    }).join(',');
    const pipes = Array.from(this.rootNode._pipesForRoot).map(p => {
      return apiPath_p + '.' + p;
    }).join(',');

    return `
    ${componentName_p}.ɵfac = function ${componentName_p}_Factory(t){
      return new (t || ${componentName_p})(${this.dependencies.map(classDep => classDep.gCode()).join(',')});
    };

    ${componentName_p}.ɵcmp = ${apiPath_p}.ng_ɵɵdefineComponent({
      type: ${componentName_p},
      selectors: ${JSON.stringify([this.selector.split(',')])},
      template: function ${componentName_p}_Template(rf,ctx){
        ${initCodeStr}
        ${refreshCodeStr}
      },
      ${this.rootNode._ngContentSelectorsStr ? 'ngContentSelectors: ' + this.rootNode._ngContentSelectorsStr + ',' : ''}
      decls: ${this.rootNode._decls},
      vars: ${this.rootNode.getVars()},
      directives: [${directives}],
      pipes: [${pipes}],
      encapsulation: 2,
      features: ${this.detectFeatures()},
      ${optionCode}
    });
    `;
  }

  private gComponentDefOptions() {
    let hostStr = '';
    let contentQueriesStr = '';
    let viewQueryStr = '';
    let outputsStr = '';
    let inputsStr = '';

    hostStr = this.gComponentHostDef();

    if (this.contentQueries.length > 0) {
      const list = this.contentQueries.sort(ContentQuery.compare);
      contentQueriesStr = `
      contentQueries: function ${componentName_p}_ContentQueries(rf,ctx,dirIndex){
        if(rf & 1){
          ${list.map(q => q.gInitCode())}
        }
        if(rf & 2){
          let _t;
          ${list.map(q => q.gRefreshCode())}
        }
      },`;
    }

    if (this.viewQueries.length > 0) {
      const list = this.viewQueries.sort(ViewQuery.compare);
      viewQueryStr = `
      viewQuery: function ${componentName_p}_Query(rf,ctx){
        if(rf & 1){
          ${list.map(q => q.gInitCode())}
        }
        if(rf & 2){
          ${list.map(q => q.gRefreshCode())}
        }
      },`;
    }

    if (this.inputs.length > 0) {
      inputsStr = `
      inputs: {
        ${this.inputs.map(i => i.gInputCode()).join(',')}
      },\n`;
    }

    if (this.outputs.length > 0) {
      outputsStr = `
      outputs: {
        ${this.outputs.map(o => o.gOutputCode()).join(',')}
      },\n`;
    }

    return { contentQueriesStr, outputsStr, viewQueryStr, hostStr, inputsStr };
  }

  private gComponentHostDef() {
    const hostBindList = Array.isArray(this.hostBindList) ? this.hostBindList : [];
    const hostListenerList = Array.isArray(this.hostListenerList) ? this.hostListenerList : [];

    if (this.hostBindList.length <= 0 && this.hostListenerList.length <= 0) {
      return '';
    }

    const styling = hostBindList.some(bind => {
      return bind.styling();
    });

    let sanitizer = false;
    const hostRefreshStr = hostBindList.sort(HostBind.compare).reduce((str, bind: HostBind) => {
      if (bind.publicName === 'style' && !sanitizer) {
        str += `${apiPath_p}.ng_ɵɵstyleSanitizer(${apiPath_p}.ng_ɵɵdefaultStyleSanitizer);\n`;
        sanitizer = true;
      }

      // mark ... @HostBinding() get title(){}
      str += bind.gRefreshCode();
      return str;
    }, '');

    const hostListenerStr = hostListenerList.reduce((str, listener) => {
      str += listener.gInitCode();
      return str;
    }, '');

    return `
      hostBindings: function ${componentName_p}_HostBindings(rf,ctx,elIndex){
        if (rf & 1){
          ${hostListenerStr}
        }
        if(rf & 2){
          ${hostRefreshStr}
        }
      },\n`;
  }

  private detectFeatures() {
    let features = '';

    if (Array.isArray(this.classMethods)) {
      const hasChanges = this.classMethods.some(method => {
        return method.trim().startsWith('ngOnChanges');
      });
      if (hasChanges) {
        features += `${apiPath_p}.ng_ɵɵNgOnChangesFeature(),`;
      }
    }

    return `[${features}]`;
  }
}
