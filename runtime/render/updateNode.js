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
        if (!meta.element) {
          meta.element = templateToElement(meta.template);
        }
        const len = updateForNode(node, meta, state);
        if (len > 1) {
          return len;
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
