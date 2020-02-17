import { ComponentDef } from './ComponentDef';
import { apiPath_p, componentName_p } from './key';

const defualt_options = {
  namespace: 'gc',
  apiPath: 'window.gc_apis'
};

export class CodeFactory {

  private componentNameRegx = new RegExp(componentName_p, 'g');
  private apiPathRegx = new RegExp(apiPath_p, 'g');

  constructor(
    public componentMap: Map<string, string>,
    public directiveMap: Map<string, string[]>,
    public pipeMap: Map<string, string[]>,
    private options?: {
      namespace?: string,
      apiPath?: string
    }) {
    this.options = Object.assign(defualt_options, options);
  }

  _createComponent(compDef: ComponentDef) {
    let gc = (<any>window)[this.options.namespace];
    if (!gc) {
      gc = (<any>window)[this.options.namespace] = {};
    }

    const codes = this.gComponentCodeWrap(compDef);
    compDef._sourceCodes = codes;
    Function(codes)();

    return gc[compDef.className];
  }

  gComponentCodeWrap(compDef: ComponentDef) {
    const codes = this.gComponentCode(compDef);
    return `(function (window){
      ${codes}
      window.${this.options.namespace}.${compDef.className} = ${compDef.className};
    })(window);\n`;
  }

  gComponentCode(compDef: ComponentDef): string {
    const codes = compDef.gCode(this.componentMap, this.directiveMap, this.pipeMap);

    return codes.replace(this.componentNameRegx, compDef.className)
      .replace(this.apiPathRegx, this.options.apiPath);
  }

}
