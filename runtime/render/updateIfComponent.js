import vms from './componentVms.js';
import renderComponent from './renderComponent.js';
import updateElement from './updateElement.js';
import getProps from './getNewProps.js';

export default function updateIfComponent(node, meta, Component) {
  const bool = meta.directives.if.call(this);
  if (bool) {
    const props = getProps.call(this, meta.bindings, meta.props, Component.props);
    if (node.nodeType === 8) {
      renderComponent(node, Component, props);
    } else {
      const vm = vms.get(node.__vmid__);
      // TODO check props update
      Object.assign(vm.$props, props);
      updateElement.call(vm, node, Component.meta);
    }
  } else if (node.nodeType !== 8) {
    const newNode = document.createComment('');
    const vm = vms.get(node.__vmid__);
    Object.defineProperty(vm, '$destroy', {value: true});
    vms.delete(node.__vmid__);
    node.parentNode.replaceChild(newNode, node);
  }
}
