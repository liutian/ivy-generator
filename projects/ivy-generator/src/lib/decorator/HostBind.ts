import { apiPath_p } from '../key';

export class HostBind {

  constructor(public publicName: string, public privateName?: string, public initValue?: string) {
    if (!privateName) {
      this.privateName = publicName;
    }
  }

  static compare(a: HostBind, b: HostBind) {
    if (a.styling() && !b.styling()) {
      return 1;
    } else if (!a.styling() && b.styling()) {
      return -1;
    } else {
      return 0;
    }
  }

  gConstructor() {
    if (this.initValue === undefined) {
      return '';
    }

    if (this.initValue.startsWith('@')) {
      return `this.${this.privateName} = ${this.initValue.substr(1)};\n`;
    } else {
      return `this.${this.privateName} = '${this.initValue}';\n`;
    }
  }

  styling() {
    return this.publicName.startsWith('class') || this.publicName.startsWith('style');
  }

  gRefreshCode() {
    let str = '';

    if (this.publicName.startsWith('class.')) {
      str += `${apiPath_p}.ng_ɵɵclassProp('${this.publicName.substr(6)}' , ctx.${this.privateName});\n`;
    } else if (this.publicName.startsWith('style.')) {// mark ... style.fontSize = font-size
      str += `${apiPath_p}.ng_ɵɵstyleProp('${this.publicName.substr(6)}' , ctx.${this.privateName});\n`;
    } else if (this.publicName.startsWith('attr.')) {
      str += `${apiPath_p}.ng_ɵɵattribute('${this.publicName.substr(5)}' , ctx.${this.privateName});\n`;
    } else if (this.publicName.startsWith('class')) {
      str += `${apiPath_p}.ng_ɵɵclassMap(ctx.${this.privateName});\n`;
    } else if (this.publicName.startsWith('style')) {
      str += `${apiPath_p}.ng_ɵɵstyleMap(ctx.${this.privateName},${apiPath_p}.ng_ɵɵdefaultStyleSanitizer);\n`;
    } else {
      str += `${apiPath_p}.ng_ɵɵhostProperty('${this.publicName}' , ctx.${this.privateName});\n`;
    }

    return str;
  }
}
