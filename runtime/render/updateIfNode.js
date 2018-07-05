import updateElement from './updateElement.js';
import templateToElement from '../../compiler/browser/templateToElement.js';

export default function updateIfNode(node, meta, state) {
  const bool = meta.directives.if.call(state);
  if (node.nodeType === 8) {
    if (bool) {
      const element = meta.element.cloneNode(true);
      updateElement(element, meta, state); // if component, must use component scope to update
      node.parentNode.replaceChild(element, node);
    }
  } else {
    if (bool) {
      updateElement(node, meta, state);
    } else {
      const comment = document.createComment('if');
      node.parentNode.replaceChild(comment, node);
    }
  }
}
