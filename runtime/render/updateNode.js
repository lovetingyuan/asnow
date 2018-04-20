import updateElement from './updateElement.js';
import updateTextNode from './updateTextNode.js';
import updateIfNode from './updateIfNode.js';
import updateForNode from './updateForNode.js';

export default function updateNode(node, meta, state) {
  switch (meta.type) {
    case 'element': {
      updateElement(node, meta, state);
      break;
    }
    case 'text': {
      updateTextNode(node, meta, state);
      break;
    }
    case 'if': {
      updateIfNode(node, meta, state);
      break;
    }
    case 'for':
    case 'for-if': {
      const list = meta.directives.for.list.call(state);
      updateForNode(node, list, meta, state);
      if (list.length > 1) {
        return list.length;
      }
      break;
    }
    default: break;
  }
}
