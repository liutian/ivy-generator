import { Node } from './Node';
import { TextInterpolate, TInterpolate } from './TextInterpolate';

export class TextNode extends Node {
  constructor(text: string) {
    super('');
    this.textContent = text;
  }

  public parseText(pipeMap: Map<string, string[]>) {
    if (!TextInterpolate.interpolateRegx.test(this.textContent)) {
      return;
    }

    const textInterpolate = new TextInterpolate(this.textContent, pipeMap);
    this._textInterpolate = textInterpolate;

    this._contextNode._interpolateOffsetForContext += textInterpolate.interpolates.length;
    textInterpolate.interpolates.forEach((interpolate: TInterpolate) => {
      interpolate.pipes.forEach((pipe, index) => {
        const matchPipes = pipeMap.get(pipe.name);
        if (!matchPipes) {
          throw new Error('not found pipe:' + pipe.name);
        }
        pipe.index = this._contextNode._consts++;
        matchPipes.forEach(p => {
          this._rootNode._pipesForRoot.add(p);
        });
      });
    });

    // mark ...
    this._contextNode._varsData.push({
      type: 'text-interpolate',
      name: '',
      index: this._index,
      value: this.textContent,
      textInterpolate: textInterpolate,
      node: this
    });
  }
}
