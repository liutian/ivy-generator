import { TextInterpolate } from './TextInterpolate';

const bindingRegx = /^\[([\w.$\-]+)\]$/;
const eventRegx = /^\(([\w.$\-]+)\)$/;
const structRegx = /^\*(\w+)$/;
const refRegx = /^#(\w+)$/;
const twoWayBindingRegx = /^\[\(([\w.$\-]+)\)\]$/;

const assignRegx = /[\w\s$]+=[\w\s\$]+/;
const proxyRegx = /[\w\s$.]+:[\w\s\$]+/;
const ofRegx = /[\w\s\$]+of[\w\s$.]+/;

export class NodeAttr {
  name?: string;
  _type?: 'attr' | 'event' | 'binding' | 'struct' | 'ref' | 'twoWayBinding';
  _textInterpolate?: TextInterpolate;
  _index: number;

  constructor(public rawName: string, public value = '') {
    this.name = rawName.trim();
    if (!this.name) {
      throw new Error('attr.rawName not empty');
    }

    if (bindingRegx.test(rawName)) {
      this._type = 'binding';
      this.name = bindingRegx.exec(rawName)[1];
    } else if (eventRegx.test(rawName)) {
      this._type = 'event';
      this.name = eventRegx.exec(rawName)[1];
    } else if (structRegx.test(rawName)) {
      this._type = 'struct';
      this.name = structRegx.exec(rawName)[1];
    } else if (refRegx.test(rawName)) {
      this._type = 'ref';
      this.name = refRegx.exec(rawName)[1];
    } else if (twoWayBindingRegx.test(rawName)) {
      this._type = 'twoWayBinding';
      this.name = twoWayBindingRegx.exec(rawName)[1];
    } else {
      this._type = 'attr';
    }
  }

  static detectStructAttr(attr: NodeAttr): NodeAttr[] {
    const attrs = [];

    (attr.value || '').split(';').map(expr => expr.trim()).forEach((expr) => {
      if (assignRegx.test(expr)) {
        const [key, value] = expr.split(/\s*=\s*/);
        const [prefix, name] = key.trim().split(/\s+/);
        attrs.push(new NodeAttr(`${prefix}-${name}`, value));
      } else if (proxyRegx.test(expr)) {
        const [key, value] = expr.split(/\s*:\s*/);
        const suffix = key.charAt(0).toUpperCase() + key.slice(1);
        attrs.push(new NodeAttr(`[${attr.name}${suffix}]`, value));
      } else if (ofRegx.test(expr)) {
        const [item, list] = expr.split(/\s*of\s*/);
        attrs.push(new NodeAttr(attr.name, ''));
        attrs.push(new NodeAttr(`[${attr.name}Of]`, list));
        const [prefix, value] = item.trim().split(/\s+/);
        attrs.push(new NodeAttr(`${prefix}-${value}`, ''));
      }
    });

    if (attrs.length === 0) {
      attrs.push(new NodeAttr(`[${attr.name}]`, attr.value));
    }
    return attrs;
  }

  static detectAttrs(attrs: NodeAttr[], pipeMap: Map<string, string[]>) {
    const bindAttrs: NodeAttr[] = [];
    const refAttrs: NodeAttr[] = [];
    const normalAttrs: NodeAttr[] = [];
    const eventAttrs: NodeAttr[] = [];
    const textInterpolateAttrs: NodeAttr[] = [];
    let structAttr: NodeAttr, classAttr: NodeAttr, styleAttr: NodeAttr, structAttrList: NodeAttr[];
    let dynamicClass = false;
    let dynamicStyle = false;

    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      if (attr._type === 'struct') {
        if (structAttr) {
          throw new Error('structAttr must be only one');
        }
        structAttr = attr;
        structAttrList = NodeAttr.detectStructAttr(attr);
      } else if (attr._type === 'binding') {
        if (validValue(attr.value, attr.rawName)) {
          bindAttrs.push(attr);
        }
        if (this.name.startsWith('class')) {
          dynamicClass = true;
        } else if (this.name.startsWith('style')) {
          dynamicStyle = true;
        }
      } else if (attr._type === 'twoWayBinding') {
        if (validValue(attr.value, attr.rawName)) {
          bindAttrs.push(attr);
          eventAttrs.push(new NodeAttr(attr.name + 'Change', attr.value + ' = $event'));
        }
      } else if (attr._type === 'ref') {
        refAttrs.push(attr);
      } else if (attr._type === 'event') {
        if (validValue(attr.value, attr.rawName)) {
          eventAttrs.push(attr);
        }
      } else if (attr.name === 'class') {
        validValue(attr.value, attr.rawName);
        if (TextInterpolate.interpolateRegx.test(attr.value)) {
          const interpolate = new TextInterpolate(attr.value, pipeMap);
          attr._textInterpolate = interpolate;
          textInterpolateAttrs.push(attr);
          dynamicClass = true;
        } else {
          classAttr = attr;
        }
      } else if (attr.name.startsWith('style')) {
        validValue(attr.value, attr.rawName);
        if (TextInterpolate.interpolateRegx.test(attr.value)) {
          const interpolate = new TextInterpolate(attr.value, pipeMap);
          attr._textInterpolate = interpolate;
          textInterpolateAttrs.push(attr);
          dynamicStyle = true;
        } else {
          styleAttr = attr;
        }
      } else {
        if (TextInterpolate.interpolateRegx.test(attr.value)) {
          const interpolate = new TextInterpolate(attr.value, pipeMap);
          attr._textInterpolate = interpolate;
          textInterpolateAttrs.push(attr);
          bindAttrs.push(attr);
        } else {
          normalAttrs.push(attr);
        }
      }
    }

    return { structAttr, normalAttrs, classAttr, styleAttr, bindAttrs, refAttrs, structAttrList, eventAttrs, textInterpolateAttrs, dynamicClass, dynamicStyle };
  }

  static findDirectives(attrs: NodeAttr[], directiveMap: Map<string, string[]>): string[] {
    const directives = [];
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];

      if (attr._type !== 'ref' && attr._type !== 'event' && attr.name !== 'class' && attr.name !== 'style') {
        const directiveList = directiveMap.get(attr.name);
        if (Array.isArray(directiveList) && directiveList.length > 0) {
          directives.push(...directiveList);
        } else {
          // throw new Error('not found directive:' + attr.name);
        }
      }
    }

    return directives;
  }

  static detectAttrsForTemplateNode(attrs: NodeAttr[]) {
    const declareVars = {};
    const templateAttrs = [];
    const bindAttrs = [];
    const refAttrs = [];

    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      if (attr.name.startsWith('let-')) {
        const varName = attr.name.replace('let-', '').trim();
        if (!varName) {
          throw new Error(`template attrs ${attr.name} syntax error`);
        }
        declareVars[varName] = attr;
      } else if (attr._type === 'ref') {
        refAttrs.push(attr);
      } else {
        if (attr._type === 'binding') {
          bindAttrs.push(attr);
        }
        templateAttrs.push(attr);
      }
    }

    return { declareVars, templateAttrs, refAttrs, bindAttrs };
  }

  static compare(a: NodeAttr, b: NodeAttr) {
    const aIsStyle = a.name.startsWith('style') || a.name.startsWith('class');
    const bIsStyle = b.name.startsWith('style') || b.name.startsWith('class');
    if (aIsStyle && !bIsStyle) {
      return 1;
    } else if (!aIsStyle && bIsStyle) {
      return -1;
    } else {
      return 0;
    }
  }
}

function validValue(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`attr.value must be required (name: ${name})`);
  }
  return true;
}
