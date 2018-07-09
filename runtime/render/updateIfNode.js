import updateElement from './updateElement.js';

export default function updateIfNode(node, meta) {
  const bool = meta.directives.if.call(this);
  if (node.nodeType === 8) {
    if (bool) {
      const element = meta.element.cloneNode(true);
      updateElement.call(this, element, meta); // if component, must use component scope to update
      node.parentNode.replaceChild(element, node);
    }
  } else {
    if (bool) {
      updateElement.call(this, node, meta);
    } else {
      const comment = document.createComment('if');
      node.parentNode.replaceChild(comment, node);
    }
  }
}
