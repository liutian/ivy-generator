import { apiPath_p } from './key';
import { InjectFlags } from '@angular/core';

export class ClassDep {

  constructor(
    public name: string,
    public type?: string,
    public decorators?: ('SkipSelf' | 'Host' | 'Self' | 'Optional')[],
    public createType: 'instance' | 'newClass' | 'normal' = 'normal') {
  }

  gCode() {
    if (this.createType === 'normal') {
      let flags = InjectFlags.Default;
      if (Array.isArray(this.decorators)) {
        flags = this.decorators.reduce((_flags, flag) => {
          if (flag === 'Host') {
            // tslint:disable-next-line:no-bitwise
            return _flags | InjectFlags.Host;
          } else if (flag === 'Self') {
            // tslint:disable-next-line:no-bitwise
            return _flags | InjectFlags.Self;
          } else if (flag === 'SkipSelf') {
            // tslint:disable-next-line:no-bitwise
            return _flags | InjectFlags.SkipSelf;
          } else if (flag === 'Optional') {
            // tslint:disable-next-line:no-bitwise
            return _flags | InjectFlags.Optional;
          }
          return _flags;
        }, flags);
      }
      return `${apiPath_p}.ng_ɵɵdirectiveInject(${this.type},${Number(flags)})`;
    } else if (this.createType === 'newClass') {
      return `new ${this.type}()`;
    } else {
      return this.type;
    }
  }
}
