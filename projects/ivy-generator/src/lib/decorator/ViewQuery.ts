import { apiPath_p } from '../key';

export class ViewQuery {
  constructor(
    public onlyOne: boolean,
    public selector: string,
    public privateName: string,
    public options?: { static?: boolean, read?: string }) {
  }

  static compare(a: ViewQuery, b: ViewQuery) {
    if (a.onlyOne && !b.onlyOne) {
      return -1;
    } else if (!a.onlyOne && b.onlyOne) {
      return 1;
    } else {
      return 0;
    }
  }

  gInitCode() {
    const fnName = this.onlyOne && this.options && this.options.static === true ? 'ng_ɵɵstaticViewQuery' : 'ng_ɵɵviewQuery';
    const selector = this.selector.startsWith('@') ? this.selector.substr(1) : `['${this.selector}']`;
    return `${apiPath_p}.${fnName}(${selector} , true , ${this.options && this.options.read});\n`;
  }

  gRefreshCode() {
    return `${apiPath_p}.ng_ɵɵqueryRefresh((_t = ${apiPath_p}.ng_ɵɵloadViewQuery())) && (ctx.${this.privateName} = ${this.onlyOne ? '_t.first' : '_t'});\n`;
  }

}
