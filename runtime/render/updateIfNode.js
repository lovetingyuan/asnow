import updateElement from './updateElement.js';

export default function updateIfNode(node, meta, state) {
  const bool = meta.directives.if.call(state);
  if (node.nodeType === 8) {
    if (bool) {
      const element = meta.element.cloneNode(true);
      updateElement(element, meta.meta, state); // if component, must use component scope to update
      node.parentNode.replaceChild(element, node);
    }
  } else {
    if (bool) {
      updateElement(node, meta.meta, state);
    } else {
      const comment = document.createComment('if');
      node.parentNode.replaceChild(comment, node);
    }
  }
}
