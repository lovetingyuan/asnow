import updateElement from './updateElement.js';
import updateTextNode from './updateTextNode.js';
import updateIfNode from './updateIfNode.js';
import updateForNode from './updateForNode.js';
import updateComponent from './updateComponent.js';
import templateToElement from '../../compiler/browser/templateToElement.js';

export default function updateNode(node, meta, state) {
  if (meta.type === 'component') {
    updateComponent(node, meta, state);
  } else if (meta.type === 'element') {
    if (meta.directives) {
      if (meta.directives.for) {
        const list = meta.directives.for.list.call(state);
        if (!meta.element) {
          meta.element = templateToElement(meta.template);
        }
        updateForNode(node, list, meta, state);
        if (list.length > 1) {
          return list.length;
        }
      } else if (meta.directives.if) {
        if (!meta.element) {
          meta.element = templateToElement(meta.template);
        }
        updateIfNode(node, meta, state);
      }
    } else {
      updateElement(node, meta, state);
    }
  } else if (meta.type === 'text') {
    updateTextNode(node, meta, state);
  }
}
