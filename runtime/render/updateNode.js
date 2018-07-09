import updateElement from './updateElement.js';
import updateTextNode from './updateTextNode.js';
import updateIfNode from './updateIfNode.js';
import updateForNode from './updateForNode.js';
import updateComponent from './updateComponent.js';
import templateToElement from '../../compiler/browser/templateToElement.js';

export default function updateNode(node, meta) {
  if (meta.type === 'component') {
    updateComponent.call(this, node, meta);
  } else if (meta.type === 'element') {
    if (meta.directives) {
      if (meta.directives.for) {
        if (!meta.element) {
          meta.element = templateToElement(meta.template);
        }
        const len = updateForNode.call(this, node, meta);
        if (len > 1) {
          return len;
        }
      } else if (meta.directives.if) {
        if (!meta.element) {
          meta.element = templateToElement(meta.template);
        }
        updateIfNode.call(this, node, meta);
      }
    } else {
      updateElement.call(this, node, meta);
    }
  } else if (meta.type === 'text') {
    updateTextNode.call(this, node, meta);
  }
}
