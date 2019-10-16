import { Node } from './view/Node';
import { NodeAttr } from './view/NodeAttr';
import { apiPath_p } from './key';

export class VarBuilder {
  contextLink: {
    varName: string,
    node: Node,
    visited: boolean,
    refs: { varName: string, attr: NodeAttr }[]
  }[] = [];

  separatorRegx = /[=?:&|+\-*\/!%><(),]/;

  literals = ['$event', 'true', 'false', 'null', 'undefined'];

  constructor(public node: Node) {
    this.contextLink.push({
      varName: 'ctx',
      node: node,
      visited: false,
      refs: []
    });

    let contextNode = node._contextNode;
    while (contextNode) {
      const varName = '_r' + node._rTick++;
      this.contextLink.push({
        varName: varName,
        node: contextNode,
        visited: false,
        refs: []
      });
      contextNode = contextNode._contextNode;
    }
  }

  parseExpression(expression: string): string {
    expression = expression.trim();

    let word = '';
    let separator = '';
    let newExpression = '';

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];
      if (this.separatorRegx.test(char)) {
        separator += char;
      } else if (separator) {
        word = word.trim();
        if (word) {
          newExpression += this.parsedVar(word);
        }

        newExpression += separator;
        word = char;
        separator = '';
      } else {
        word += char;
      }

      if (i === expression.length - 1) {
        word = word.trim();
        if (word) {
          newExpression += this.parsedVar(word);
        }
        if (separator) {
          newExpression += separator;
        }
      }
    }

    return newExpression;
  }

  parsedVar(name: string) {
    const regx = /^[0-9'"\[}]/;
    name = name.trim();
    if (regx.test(name) || this.literals.includes(name)) {
      return name;
    } else {
      const varArr = name.split('.');
      const varName = this.detectVarName(varArr[0]);
      varArr[0] = varName;
      return varArr.join('.');
    }
  }

  detectVarName(name: string): string {
    for (let i = 0; i < this.contextLink.length; i++) {
      const contextData = this.contextLink[i];
      contextData.visited = true;

      const declareRefs = contextData.node._declareRefs;
      if (declareRefs.has(name)) {
        const ref = contextData.refs.find(r => r.attr.name === name);
        if (ref) {
          return ref.varName;
        } else {
          const varName = '_r' + this.node._rTick++;
          contextData.refs.push({
            varName,
            attr: declareRefs.get(name)
          });
          return varName;
        }
      }

      const declareVars = contextData.node._declareVars;
      const dVar = declareVars.get(name);
      if (dVar) {
        if (!dVar.value) {
          return contextData.varName + '.$implicit';
        } else {
          return contextData.varName + '.' + dVar.value;
        }
      }
    }

    return this.contextLink[this.contextLink.length - 1].varName + '.' + name;
  }


  build(): string[] {
    const codes = [];
    for (let i = 0; i < this.contextLink.length; i++) {
      const contextData = this.contextLink[i];
      if (!contextData.visited) {
        continue;
      }

      if (i > 0) {
        codes.push(`const ${contextData.varName} = ${apiPath_p}.ng_ɵɵnextContext();\n`);
      }

      contextData.refs.forEach(ref => {
        codes.push(`const ${ref.varName} = ${apiPath_p}.ng_ɵɵreference(${ref.attr._index});\n`);
      });
    }
    return codes;
  }

}
