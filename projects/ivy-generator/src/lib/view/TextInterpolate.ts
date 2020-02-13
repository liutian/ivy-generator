import { VarBuilder } from '../VarBuilder';
import { apiPath_p } from '../key';
import { Node } from './Node';

export interface TInterpolate {
  expr: string;
  pipes: { name: string, params?: string[], index?: number }[];
}

// @dynamic
export class TextInterpolate {
  static interpolateRegx = /{{[^}]+}}/;
  static interpolateRegxGlobal = /{{([^}]+)}}/g;

  stringAndInterpolates: (string | TInterpolate)[] = [];
  interpolates: TInterpolate[] = [];
  pipeCount = 0;
  pipeParamCount = 0;

  constructor(text: string, pipeMap: Map<string, string[]>) {
    let matchs: string[];
    let prefixIndex = TextInterpolate.interpolateRegxGlobal.lastIndex = 0;

    while (matchs = TextInterpolate.interpolateRegxGlobal.exec(text)) {
      const prefix = text.substring(prefixIndex, (<any>matchs).index);
      const [expr, ...pipesStr] = matchs[1].trim().split('|').map(s => s.trim());
      this.pipeCount += pipesStr.length;

      const pipes = pipesStr.map(pipeStr => {
        const [pipeName, ...params] = pipeStr.split(':').map(s => s.trim());
        if (!pipeMap.has(pipeName)) {
          throw new Error('not found pipe:' + pipeName);
        }

        this.pipeParamCount += params.length;

        return {
          name: pipeName,
          params,
        };
      });

      const interpolate = { expr, pipes: pipes.reverse() };
      this.interpolates.push(interpolate);
      this.stringAndInterpolates.push(prefix, interpolate);
      prefixIndex = TextInterpolate.interpolateRegxGlobal.lastIndex;
    }

    const suffix = text.substr(prefixIndex);
    this.stringAndInterpolates.push(suffix);
  }

  public gCode(contextNode: Node, builder: VarBuilder) {
    const interpolateParams = this.stringAndInterpolates.map(item => {
      if (typeof item !== 'object') {
        return `'${item}'`;
      }

      if (!Array.isArray(item.pipes) || item.pipes.length <= 0) {
        return builder.parseExpression(item.expr);
      }

      let param = '#pipe#';
      item.pipes.forEach((pipe, i) => {
        const pipeFnName = pipe.params.length > 3 ? 'ng_ɵɵpipeBindV' : `ng_ɵɵpipeBind${pipe.params.length + 1}`;
        const pipeParamsStr = pipe.params.map(p => {
          return builder.parseExpression(p);
        }).join(',');

        // contextNode._interpolateOffsetForContext += 1;
        if (i < item.pipes.length - 1) {
          param = param.replace('#pipe#', `${apiPath_p}.${pipeFnName}(${pipe.index},${contextNode._interpolateOffsetForContext},#pipe#,${pipeParamsStr})`);
        } else {
          const varName = builder.parseExpression(item.expr);
          param = param.replace('#pipe#', `${apiPath_p}.${pipeFnName}(${pipe.index},${contextNode._interpolateOffsetForContext},${varName},${pipeParamsStr})`);
        }

        contextNode._interpolateOffsetForContext += 2 + pipe.params.length;
      });
      return param;
    });

    return interpolateParams.join(',');
  }
}

