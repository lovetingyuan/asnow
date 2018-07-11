import updateElement from './updateElement.js';
import getProps from './getNewProps.js';
import renderComponent from './renderComponent.js';
import vms from './componentVms.js';

export default function updateIfNode(node, meta, Component) {
  const bool = meta.directives.if.call(this);
  if (node.nodeType === 8) {
    if (bool) {
      let newNode;
      if (Component) {
        const props = getProps.call(this, meta.bindings, meta.props, Component.props);
        newNode = renderComponent.call(this, Component, props);
      } else {
        newNode = meta.element.cloneNode(true);
        updateElement.call(this, newNode, meta); // if component, must use component scope to update
      }
      node.parentNode.replaceChild(newNode, node);
    }
  } else {
    if (bool) {
      if (Component) {
        const vm = vms.get(node.__vmid__);
        // TODO check props update
        const props = getProps.call(this, meta.bindings, meta.props, Component.props);
        Object.assign(vm.$props, props);
        updateElement.call(vm, node, Component.meta);
      } else {
        updateElement.call(this, node, meta);
      }
    } else {
      if (Component) {
        const vm = vms.get(node.__vmid__);
        Object.defineProperty(vm, '$destroy', {value: true});
        vms.delete(node.__vmid__);
      }
      node.parentNode.replaceChild(document.createComment(''), node);
    }
  }
}
