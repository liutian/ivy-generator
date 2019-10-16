import { apiPath_p, componentName_p } from '../key';

export class HostListener {

  constructor(public eventName: string, public privateName?: string, public eventParams?: string[]) {
    if (!privateName) {
      this.privateName = eventName;
    }
  }

  gInitCode() {
    return `${apiPath_p}.ng_ɵɵlistener('${this.eventName}' , function ${componentName_p}_${this.eventName}_HostBindingHandler($event){
      return ctx.${this.privateName}(${this.eventParams.join(',')});
    });\n`;
  }
}
