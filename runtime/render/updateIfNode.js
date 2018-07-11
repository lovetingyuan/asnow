import updateElement from './updateElement.js';
import component from './updateComponent.js';

export default function updateIfNode(node, meta, Component) {
  const bool = meta.directives.if.call(this);
  if (node.nodeType === 8) {
    if (bool) {
      let newNode;
      if (Component) {
        newNode = component.create.call(this, meta, Component);
      } else {
        newNode = meta.element.cloneNode(true);
        updateElement.call(this, newNode, meta); // if component, must use component scope to update
      }
      node.parentNode.replaceChild(newNode, node);
    }
  } else {
    if (bool) {
      if (Component) {
        component.update.call(this, node, meta, Component);
      } else {
        updateElement.call(this, node, meta);
      }
    } else {
      if (Component) {
        component.remove(node);
      }
      node.parentNode.replaceChild(document.createComment(''), node);
    }
  }
}
