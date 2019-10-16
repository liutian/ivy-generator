import { apiPath_p } from '../key';

export class Output {
  constructor(public publicName: string, public privateName?: string, public initValue?: string) {
    if (!privateName) {
      this.privateName = publicName;
    }
  }

  gConstructor() {
    if (this.initValue === undefined) {
      return `this.${this.privateName} = new ${apiPath_p}.ng_EventEmitter();\n`;
    }

    if (this.initValue.startsWith('@')) {
      return `this.${this.privateName} = ${this.initValue.substr(1)};\n`;
    } else {
      return `this.${this.privateName} = '${this.initValue}';\n`;
    }
  }

  gOutputCode() {
    return `${this.privateName}: '${this.publicName}'`;
  }
}
