import { apiPath_p } from '../key';

export class ContentQuery {

  constructor(
    public onlyOne: boolean,
    public selector: string,
    public privateName: string,
    public options?: { static?: boolean, read?: string, descendants?: boolean }) {
  }

  static compare(a: ContentQuery, b: ContentQuery) {
    if (a.onlyOne && !b.onlyOne) {
      return -1;
    } else if (!a.onlyOne && b.onlyOne) {
      return 1;
    } else {
      return 0;
    }
  }

  gInitCode() {
    const fnName = this.onlyOne && this.options && this.options.static === true ? 'ng_ɵɵstaticContentQuery' : 'ng_ɵɵcontentQuery';
    const selector = this.selector.startsWith('@') ? this.selector.substr(1) : `['${this.selector}']`;
    const descendants = !!(this.onlyOne === true || (this.options && this.options.descendants === true));
    return `${apiPath_p}.${fnName}(dirIndex , ${selector} , ${descendants} , ${this.options && this.options.read});\n`;
  }

  gRefreshCode() {
    return `${apiPath_p}.ng_ɵɵqueryRefresh((_t = ${apiPath_p}.ng_ɵɵloadContentQuery())) && (ctx.${this.privateName} = ${this.onlyOne ? '_t.first' : '_t'});\n`;
  }


}
