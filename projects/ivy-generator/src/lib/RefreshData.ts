import { TextInterpolate } from './view/TextInterpolate';
import { Node } from './view/Node';

export class RefreshData {
  type: 'attr-bind' | 'attr-interpolate' | 'text-interpolate';
  name: string;
  index: number;
  value: string;
  textInterpolate?: TextInterpolate;
  node: Node;
}
