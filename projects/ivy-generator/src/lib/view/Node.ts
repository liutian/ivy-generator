import { NodeAttr } from './NodeAttr';
import { RefreshData } from '../RefreshData';
import { apiPath_p, componentName_p, } from '../key';
import { VarBuilder } from '../VarBuilder';
import { TextInterpolate, TInterpolate } from './TextInterpolate';
import { TextNode } from './TextNode';

export class Node {
  static viewTick = 0;

  textContent?: string;
  children: Node[] = [];
  attrs: NodeAttr[] = [];

  _id = 0;
  _index = 0;
  _decls = 0;
  _constsStr = [];
  _nodeType: 'element' | 'component' | 'container' | 'template' | 'text' | 'root' = 'root';
  _varsData: RefreshData[] = [];
  _templateFnName?: string;
  _initCodes: string[] = [];
  _refreshCodes: string[] = [];
  _templateNodesForRoot: Node[] = [];
  _directivesForRoot: Set<string> = new Set();
  _pipesForRoot: Set<string> = new Set();

  _compiled = false;
  _contextCompiled?: boolean;
  _contextNode?: Node;
  _rootNode?: Node;
  _rTick = 0;
  _normalAttrs: NodeAttr[] = [];
  _classAttr?: NodeAttr;
  _styleAttr?: NodeAttr;
  _bindAttrs: NodeAttr[] = [];
  _refAttrs: NodeAttr[] = [];
  _eventAttrs: NodeAttr[] = [];
  _templateAttrs: NodeAttr[] = [];
  _structBindAttrs: NodeAttr[] = [];
  _textInterpolateAttrs: NodeAttr[] = [];
  _textInterpolate?: TextInterpolate;
  _declareRefs = new Map<string, NodeAttr>();
  _declareVars = new Map<string, NodeAttr>();
  _interpolateOffsetForContext = 0;
  _ngContentIndex = 0;
  _ngContentSelectors = [];
  _ngContentSelectorsStr = '';
  _styling = false;

  private componentMap: Map<string, string> = new Map<string, string>();
  private directiveMap: Map<string, string[]> = new Map<string, string[]>();
  private pipeMap: Map<string, string[]> = new Map<string, string[]>();

  constructor(public name: string, attrs?: NodeAttr[], children?: Node[]) {
    if (Array.isArray(attrs)) {
      this.attrs = attrs;
    }
    if (Array.isArray(children)) {
      this.children = children;
    }
  }

  compile(componentMap: Map<string, string>, directiveMap: Map<string, string[]>, pipeMap: Map<string, string[]>) {
    if (this._nodeType !== 'root') {
      throw new Error('_nodeType must be root');
    } else if (this._compiled) {
      throw new Error('this viewNode have \'_compiled\'');
    }

    this.componentMap = componentMap;
    this.directiveMap = directiveMap;
    this.pipeMap = pipeMap;

    this.initCompileData(this.children, this, this);
    if (Array.isArray(this._ngContentSelectors) && this._ngContentSelectors.length > 0) {
      this._ngContentSelectorsStr = '[' + this._ngContentSelectors.map(s => `'${s}'`).join(',') + ']';
      this._initCodes.push(`${apiPath_p}.ng_ɵɵprojectionDef(${this._ngContentSelectorsStr});\n`);
    }
    this.compileContextNode(this);
    this._compile(this.children, this, this);
    this._compiled = true;
  }

  getVars() {
    return this._varsData.reduce((sum: number, data: RefreshData) => {
      if (data.type === 'text-interpolate' || data.type === 'attr-interpolate') {
        const textInterpolate = data.textInterpolate;
        sum += textInterpolate.interpolates.length + textInterpolate.pipeCount * 2 + textInterpolate.pipeParamCount;
        if (data.name === 'class' || data.name.startsWith('style.')) {
          sum += 1;
        }
        return sum;
      }
      return sum + 1;
    }, 0);
  }

  private initCompileData(childrenNode: Node[], contextNode: Node, rootNode: Node) {
    for (let i = 0; i < childrenNode.length; i++) {
      const node = childrenNode[i];
      node._id = ++Node.viewTick;
      node._nodeType = this.detectNodeType(node);
      node._index = contextNode._decls++;
      node._contextNode = contextNode;
      node._rootNode = rootNode;

      if (node.name === 'ng-content') {
        rootNode._ngContentSelectors.push('*');
      }

      if (node._nodeType === 'text') {
        (<TextNode>node).parseText(this.pipeMap);
      } else if (node.attrs.length > 0) {
        node.attrs.sort(NodeAttr.compare);
        if (node._nodeType === 'template') {
          this.parseAttrsForTemplateNode(node, node.attrs);
        } else {
          this.parseAttrsForNotTemplateNode(node);
        }
      }

      const isTemplateNode = node._nodeType === 'template'; // 必须在上面代码执行完之后重新判断_nodeType

      if (isTemplateNode) {
        node._templateFnName = componentName_p + this.gTemplateFnName(node, '') + '_Template';
        rootNode._templateNodesForRoot.push(node);
      }

      if (Array.isArray(node.children)) {
        this.initCompileData(node.children, isTemplateNode ? node : contextNode, rootNode);
      }
    }
  }

  private parseAttrsForNotTemplateNode(node: Node) {
    let _tempContextNode = node._contextNode;
    let varsData = _tempContextNode._varsData;
    let varsDataIndex = node._index;
    const {
      structAttr, normalAttrs, classAttr, styleAttr, bindAttrs,
      refAttrs, structAttrList, eventAttrs, textInterpolateAttrs,
      dynamicClass, dynamicStyle
    } = NodeAttr.detectAttrs(node.attrs, this.pipeMap);

    node._textInterpolateAttrs = textInterpolateAttrs;
    node._normalAttrs = normalAttrs;
    node._classAttr = classAttr;
    node._styleAttr = styleAttr;
    node._bindAttrs = bindAttrs;
    node._refAttrs = refAttrs;
    node._eventAttrs = eventAttrs;

    // view._styling = dynamicClass || dynamicStyle;

    if (structAttr) {
      node._nodeType = 'template'; // 这里重写_nodeType
      _tempContextNode = node;
      varsData = _tempContextNode._varsData;
      varsDataIndex = 0;
      node._decls = 1;

      const { declareVars, templateAttrs, bindAttrs: _bindAttrs } = NodeAttr.detectAttrsForTemplateNode(structAttrList);
      node._templateAttrs = templateAttrs;
      node._structBindAttrs = _bindAttrs;

      node._contextNode._interpolateOffsetForContext += _bindAttrs.length;

      Object.keys(declareVars).forEach(name => {
        if (!node._declareVars.has(name)) {
          node._declareVars.set(name, declareVars[name]);
        }
      });

      _bindAttrs.forEach((attr) => {
        node._contextNode._varsData.push({
          type: 'attr-bind',
          name: attr.name,
          index: node._index,
          value: attr.value,
          node: node
        });
      });
    }

    textInterpolateAttrs.forEach(attr => {
      attr._textInterpolate.interpolates.forEach((interpolate: TInterpolate) => {
        _tempContextNode._interpolateOffsetForContext += 1;

        interpolate.pipes.forEach((pipe, index) => {
          if (!this.pipeMap.get(pipe.name)) {
            throw new Error('not found pipe:' + pipe.name);
          }
          pipe.index = _tempContextNode._decls++;
          this.pipeMap.get(pipe.name).forEach(p => {
            node._rootNode._pipesForRoot.add(p);
          });
        });
      });
    });

    const declareRefs = structAttr ? node._declareRefs : node._contextNode._declareRefs;
    refAttrs.forEach(attr => {
      attr._index = _tempContextNode._decls++;
      if (!declareRefs.has(attr.name)) {
        declareRefs.set(attr.name, attr);
      }
    });

    bindAttrs.forEach(attr => {
      if (attr._type === 'binding' || attr._type === 'twoWayBinding') {
        _tempContextNode._interpolateOffsetForContext += 1;
      }
    });

    // mark ...
    Array.from(new Set([...textInterpolateAttrs, ...bindAttrs])).forEach(attr => {
      const type = attr._type === 'binding' || attr._type === 'twoWayBinding' ? 'attr-bind' : 'attr-interpolate';
      varsData.push({
        type: type,
        name: attr.name,
        index: varsDataIndex,
        value: attr.value,
        textInterpolate: attr._textInterpolate,
        node: node
      });
    });

    NodeAttr.findDirectives(
      [...normalAttrs, ...bindAttrs, ...node._templateAttrs, ...node._structBindAttrs],
      this.directiveMap
    ).forEach(d => {
      node._rootNode._directivesForRoot.add(d);
    });
    if (node._nodeType === 'component' || (node._nodeType === 'template' && node.name !== 'ng-template')) {
      const comp = this.componentMap.get(node.name);
      if (comp) {
        node._rootNode._directivesForRoot.add(comp);
      }
    }
  }

  private parseAttrsForTemplateNode(node: Node, attrs: NodeAttr[]) {
    const { declareVars, templateAttrs, refAttrs, bindAttrs } = NodeAttr.detectAttrsForTemplateNode(attrs);

    const declareRefs = node._contextNode._declareRefs;
    refAttrs.forEach(attr => {
      attr._index = node._contextNode._decls++;
      if (!declareRefs.has(attr.name)) {
        declareRefs.set(attr.name, attr);
      }
    });

    Object.keys(declareVars).forEach(name => {
      if (!node._declareVars.has(name)) {
        node._declareVars.set(name, declareVars[name]);
      }
    });

    node._contextNode._interpolateOffsetForContext += bindAttrs.length;
    bindAttrs.forEach((attr) => {
      node._contextNode._varsData.push({
        type: 'attr-bind',
        name: attr.name,
        index: node._index,
        value: attr.value,
        node: node
      });
    });

    const directives = NodeAttr.findDirectives([...templateAttrs, ...bindAttrs], this.directiveMap);
    directives.forEach(d => {
      node._rootNode._directivesForRoot.add(d);
    });

    node._templateAttrs = templateAttrs;
    node._bindAttrs = bindAttrs;
    node._refAttrs = refAttrs;
  }

  private gTemplateFnName(node: Node, fnName): string {
    const _fnName = fnName + `_${node.name.replace(/\-/g, '_')}_${node._index}`;
    if (node._contextNode) {
      return this.gTemplateFnName(node._contextNode, _fnName);
    } else {
      return _fnName;
    }
  }

  private _compile(childrenNode: Node[], contextNode: Node, rootNode: Node) {
    for (let i = 0; i < childrenNode.length; i++) {
      const node = childrenNode[i];
      if (node._nodeType === 'component' || node._nodeType === 'element' || node._nodeType === 'container') {
        this.compileElement(node, contextNode, rootNode);
      } else if (node._nodeType === 'template') {
        const initCode = this.gTemplateCode(node);
        contextNode._initCodes.push(initCode);
        if (node.name === 'ng-template') {
          this.compileContextNode(node);
          this._compile(node.children, node, rootNode);
          // node.children.forEach(v => {
          //   this.compileElement(v, view, rootView);
          // });
        } else {
          node._index = 0;
          this.compileContextNode(node);
          this.compileElement(node, node, rootNode);
        }
      } else if (node._nodeType === 'text') {
        if (node._textInterpolate) {
          contextNode._initCodes.push(`${apiPath_p}.ng_ɵɵtext(${node._index});\n`);
        } else {
          contextNode._initCodes.push(`${apiPath_p}.ng_ɵɵtext(${node._index},'${node.textContent}');\n`);
        }
        this.compilePipes(node, contextNode);
      }
    }
  }

  private compileContextNode(contextNode: Node) {
    if (contextNode._contextCompiled !== true) {
      contextNode._initCodes.push(`const currentView = ${apiPath_p}.ng_ɵɵgetCurrentView();\n`);
      this.gRefreshCode(contextNode);
      contextNode._contextCompiled = true;
    }
  }

  private gTemplateCode(view: Node) {
    const prefix = `${apiPath_p}.ng_ɵɵtemplate(${view._index},${view._templateFnName},${view._decls},${view.getVars()},`;
    if (view.name === 'ng-template') {
      const refParamsStr = this.gRefParams(view);
      const refParamsIndex = view._rootNode.getConstsIndex(refParamsStr);
      const attrs = view._templateAttrs.filter((attr: NodeAttr) => {
        return attr._type === 'attr';
      }).reduce((arr, attr) => {
        arr.push(attr.name, '');
        return arr;
      }, []);
      const attrParamsIndex = view._rootNode.getConstsIndex(attrs.length > 0 ? JSON.stringify(attrs) : 'undefined');

      if (view._bindAttrs.length > 0) {
        attrs.push(<any>3, ...view._bindAttrs.map(a => a.name));
      }
      const refExtractorParam = refParamsStr !== 'undefined' ? `${apiPath_p}.ng_ɵɵtemplateRefExtractor` : 'undefined';
      return prefix + `'ng-template',${attrParamsIndex},${refParamsIndex},${refExtractorParam});\n`;
    } else {
      const attrs = [];
      const bindAttrs: any[] = [];
      const templateAttrs = view._templateAttrs.length > 0 ? [4, ...view._templateAttrs.map(a => a.name)] : [];

      view.attrs.forEach((a) => {
        if (a._type === 'binding' || a._type === 'event') {
          bindAttrs.push(a.name);
        } else if (a._type === 'attr') {
          attrs.push(a.name, a.value || '');
        }
      });

      if (bindAttrs.length > 0) {
        bindAttrs.unshift(3);
      }
      const attrParamsStr = JSON.stringify([...attrs, ...bindAttrs, ...templateAttrs]);
      const attrParamsStrIndex = view._rootNode.getConstsIndex(attrParamsStr);
      return prefix + `'${view.name}',${attrParamsStrIndex});\n`;
    }
  }

  private compileElement(node: Node, contextNode: Node, rootNode: Node) {
    const attrParamsStr = this.gAttrParams(node);
    const attrParamsIndex = rootNode.getConstsIndex(attrParamsStr);
    const refParamsStr = this.gRefParams(node);
    const refParamsIndex = rootNode.getConstsIndex(refParamsStr);
    const initCodes = contextNode._initCodes;

    if (node.name === 'ng-container') {
      if (node.children.length > 0) {
        initCodes.push(`${apiPath_p}.ng_ɵɵelementContainerStart(${node._index} , ${attrParamsIndex} , ${refParamsIndex});\n`);
        this._compile(node.children, contextNode, rootNode);
        initCodes.push(`${apiPath_p}.ng_ɵɵelementContainerEnd();\n`);
      } else {
        initCodes.push(`${apiPath_p}.ng_ɵɵelementContainer(${node._index} , ${attrParamsIndex} , ${refParamsIndex});\n`);
      }
    } else if (node.name === 'ng-content') {
      let selectorParams = 'undefined';
      if (Array.isArray(node.attrs) && node.attrs.length > 0) {
        const selectorValue = node.attrs.find((a => a.name === 'selector')).value;
        selectorParams = `['selector' , '${selectorValue}']`;
      }
      initCodes.push(`${apiPath_p}.ng_ɵɵprojection(${node._index} , ${rootNode._ngContentIndex++} , ${selectorParams});`);
    } else {
      if (node.children.length > 0) {
        initCodes.push(`${apiPath_p}.ng_ɵɵelementStart(${node._index} , '${node.name}' , ${attrParamsIndex} , ${refParamsIndex});\n`);

        this.compileListeners(node, contextNode);
        this.compilePipes(node, contextNode);
        this._compile(node.children, contextNode, rootNode);
        initCodes.push(`${apiPath_p}.ng_ɵɵelementEnd();\n`);
      } else {
        initCodes.push(`${apiPath_p}.ng_ɵɵelement(${node._index}, '${node.name}',${attrParamsIndex},${refParamsIndex});\n`);

        this.compileListeners(node, contextNode);
        this.compilePipes(node, contextNode);
      }
    }
  }

  private compilePipes(node: Node, contextNode: Node) {
    node._textInterpolateAttrs.filter(attr => attr._textInterpolate.pipeCount > 0).forEach(attr => {
      attr._textInterpolate.interpolates.forEach((item: TInterpolate) => {
        item.pipes.forEach((pipe, i) => {
          contextNode._initCodes.push(`${apiPath_p}.ng_ɵɵpipe(${pipe.index},'${pipe.name}');\n`);
        });
      });
    });
    if (node._textInterpolate && node._textInterpolate.pipeCount > 0) {
      node._textInterpolate.interpolates.forEach((item: TInterpolate) => {
        item.pipes.forEach((pipe, i) => {
          contextNode._initCodes.push(`${apiPath_p}.ng_ɵɵpipe(${pipe.index},'${pipe.name}');\n`);
        });
      });
    }
  }

  private compileListeners(node: Node, contextNode: Node) {
    if (node._eventAttrs.length === 0) {
      return;
    }
    const builder = new VarBuilder(contextNode);

    // mark ....
    const codes = node._eventAttrs.map(a => {
      const eventCallbackCodes = a.value.trim().split(/\s*;\s*/).map((f, i, arrs) => {
        if (i === arrs.length - 1) {
          return 'return ' + builder.parseExpression(f) + ';';
        } else {
          return builder.parseExpression(f);
        }
      });

      return `${apiPath_p}.ng_ɵɵlistener('${a.name}' , function($event){
        ${apiPath_p}.ng_ɵɵrestoreView(currentView);
        ${builder.build().join('')}
        ${eventCallbackCodes.join(';')}
      });\n`;
    });

    contextNode._initCodes.push(...codes);
  }

  private gAttrParams(node: Node): string {
    const params = [];

    for (let i = 0; i < node._normalAttrs.length; i++) {
      const attr = node._normalAttrs[i];
      if (attr.name.startsWith('style.')) {
        continue;
      }
      params.push(attr.name, attr.value || '');
    }

    if (node._classAttr) {
      params.push(1, ...node._classAttr.value.trim().split(/\s+/));
    }

    if (node._styleAttr) {
      const arr: any[] = [2];
      node._styleAttr.value.trim().split(/\s*;\s*/).filter(s => s.trim()).forEach(s => {
        arr.push(...s.split(/\s*:\s*/));
      });
      params.push(...arr);
    }

    const bindParams = [];
    if (node._bindAttrs.length > 0) {
      const list = node._bindAttrs.filter(a => !a.name.startsWith('class') && !a.name.startsWith('style'));
      bindParams.push(...list.map(a => a.name));
    }
    if (node._eventAttrs.length > 0) {
      bindParams.push(...node._eventAttrs.map(a => a.name));
    }
    if (bindParams.length > 0) {
      bindParams.unshift(3);
      params.push(...bindParams);
    }

    return params.length > 0 ? JSON.stringify(params) : 'undefined';
  }

  private gRefParams(node: Node): string {
    const params = [];
    node._refAttrs.forEach(a => {
      params.push(a.name, a.value || '');
    });
    return params.length > 0 ? JSON.stringify(params) : 'undefined';
  }

  private gRefreshCode(node: Node) {
    const builder = new VarBuilder(node);
    const refreshCodes = node._refreshCodes;
    let currSelectIndex = 0;
    let currSelectCodeIndex = refreshCodes.length - 1;
    let currStyleSanitizer = false;
    let dynamicClassOrStyle = false;

    node._varsData.forEach((varData, i) => {
      const currNode = varData.node;
      if (currSelectIndex !== varData.index) {
        refreshCodes.push(`${apiPath_p}.ng_ɵɵadvance(${varData.index});\n`);
        currSelectIndex = varData.index;
        currSelectCodeIndex = refreshCodes.length - 1;
        currStyleSanitizer = false;
      }

      let currDynamicClassOrStyle = false;
      if (varData.type === 'attr-bind') {
        if (varData.name === 'class') {
          currNode._styling = currDynamicClassOrStyle = dynamicClassOrStyle = true;
          refreshCodes.push(`${apiPath_p}.ng_ɵɵclassMap(${builder.parseExpression(varData.value)});\n`);
        } else if (varData.name.startsWith('class.')) {
          currNode._styling = currDynamicClassOrStyle = dynamicClassOrStyle = true;
          const className = varData.name.replace('class.', '');
          refreshCodes.push(`${apiPath_p}.ng_ɵɵclassProp('${className}',${builder.parseExpression(varData.value)});\n`);
        } else if (varData.name === 'style') {
          currNode._styling = currDynamicClassOrStyle = dynamicClassOrStyle = true;
          currStyleSanitizer = true;
          refreshCodes.push(`${apiPath_p}.ng_ɵɵstyleMap(${builder.parseExpression(varData.value)});\n`);
        } else if (varData.name.startsWith('style.')) {
          currNode._styling = currDynamicClassOrStyle = dynamicClassOrStyle = true;
          currStyleSanitizer = true;
          const styleName = varData.name.replace('style.', '');
          refreshCodes.push(`${apiPath_p}.ng_ɵɵstyleProp('${styleName}',${builder.parseExpression(varData.value)});\n`);
        } else {
          refreshCodes.push(`${apiPath_p}.ng_ɵɵproperty('${varData.name}',${builder.parseExpression(varData.value)});\n`);
        }
      } else if (varData.type === 'attr-interpolate') {
        const interpolateCount = varData.textInterpolate.interpolates.length;
        const paramsStr = varData.textInterpolate.gCode(node, builder);

        if (varData.name.startsWith('attr.')) {
          const fnName = 'ng_ɵɵattributeInterpolate' + (interpolateCount > 8 ? 'V' : interpolateCount);
          refreshCodes.push(`${apiPath_p}.${fnName}('${varData.name}',${paramsStr});\n`);
        } else if (varData.name.startsWith('class')) {
          currNode._styling = currDynamicClassOrStyle = dynamicClassOrStyle = true;
          const fnName = 'ng_ɵɵclassMapInterpolate' + (interpolateCount > 8 ? 'V' : interpolateCount);
          refreshCodes.push(`${apiPath_p}.${fnName}(${paramsStr});\n`);
        } else if (varData.name.startsWith('style.')) {
          currNode._styling = currDynamicClassOrStyle = dynamicClassOrStyle = true;
          currStyleSanitizer = true;
          const fnName = 'ng_ɵɵstylePropInterpolate' + (interpolateCount > 8 ? 'V' : interpolateCount);
          refreshCodes.push(`${apiPath_p}.${fnName}('${varData.name.replace('style.', '')}',${paramsStr});\n`);
        } else {
          const fnName = 'ng_ɵɵpropertyInterpolate' + (interpolateCount > 8 ? 'V' : interpolateCount);
          refreshCodes.push(`${apiPath_p}.${fnName}('${varData.name}',${paramsStr});\n`);
        }
      } else if (varData.type === 'text-interpolate') {
        const interpolateCount = varData.textInterpolate.interpolates.length;
        const paramsStr = varData.textInterpolate.gCode(node, builder);
        const fnName = 'ng_ɵɵtextInterpolate' + (interpolateCount > 8 ? 'V' : interpolateCount);
        refreshCodes.push(`${apiPath_p}.${fnName}(${paramsStr});\n`);
      }

      const nextNode = node._varsData[i + 1] && node._varsData[i + 1].index !== currSelectIndex;
      if (((nextNode || i === node._varsData.length - 1) && dynamicClassOrStyle) || (dynamicClassOrStyle && !currDynamicClassOrStyle)) {
        if (currStyleSanitizer) {
          const code = `${apiPath_p}.ng_ɵɵstyleSanitizer(${apiPath_p}.ng_ɵɵdefaultStyleSanitizer);\n`;
          refreshCodes.splice(currSelectCodeIndex + 1, 0, code);
        }
        dynamicClassOrStyle = false;
      }
    });

    refreshCodes.unshift(...builder.build());
  }

  private detectNodeType(node: Node) {
    if (node.name === 'ng-template') {
      return 'template';
    } else if (node.name === 'ng-container') {
      return 'container';
    } else if (!node.name && node.textContent) {
      return 'text';
    } else if (this.componentMap.has(node.name)) {
      return 'component';
    } else {
      return 'element';
    }
  }

  private getConstsIndex(str) {
    if (str === 'undefined' || str === 'null') {
      return null;
    }

    let index = this._constsStr.indexOf(str);
    if (index === -1) {
      index = this._constsStr.push(str) - 1;
    }

    return index;
  }
  // tslint:disable-next-line:max-file-line-count
}
