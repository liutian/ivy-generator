import { Component } from './Component';
import { apiPath_p, componentName_p } from './key';

const defualt_options = {
  namespace: 'gc',
  apiPath: 'window.gc_apis'
};

export class CodeFactory {

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

  _createComponent(comp: Component) {
    let gc = (<any>window)[this.options.namespace];
    if (!gc) {
      gc = (<any>window)[this.options.namespace] = {};
    }

    const codes = this.gComponentWrap(comp);
    comp._sourceCodes = codes;
    Function(codes)();

    return gc[comp.className];
  }

  gComponentWrap(comp: Component) {
    const codes = this.gComponent(comp);
    return `(function (window){
      ${codes}
      window.${this.options.namespace}.${comp.className} = ${comp.className};
    })(window);\n`;
  }

  gComponent(comp: Component): string {
    const codes = comp.gCode(this.componentMap, this.directiveMap, this.pipeMap);

    return codes.replace(new RegExp(componentName_p, 'g'), comp.className)
      .replace(new RegExp(apiPath_p, 'g'), this.options.apiPath);
  }

}
