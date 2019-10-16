export class Input {

  constructor(public publicName: string, public privateName?: string, public initValue?: string) {
    if (!privateName) {
      this.privateName = publicName;
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

  gInputCode() {
    if (this.publicName !== this.privateName) {
      return `${this.privateName}: ['${this.publicName}','${this.privateName}']`;
    } else {
      return `${this.privateName}: '${this.publicName}'`;
    }
  }
}
