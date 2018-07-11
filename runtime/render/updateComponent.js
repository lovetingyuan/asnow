import renderComponent from './renderComponent.js';
import updateElement from './updateElement.js';
import vms from './componentVms.js';
import updateIfNode from './updateIfNode.js';
import updateForNode from './updateForNode.js';
import getProps from './getNewProps.js';

export default function updateComponent(node, meta, Component) {
  const { bindings, props: staticProps, directives } = meta;
  if (directives) {
    if (directives.for) {
      return updateForNode.call(this, node, meta, Component); // need to return the length
    } else if (directives.if) {
      updateIfNode.call(this, node, meta, Component);
    }
  } else {
    const props = getProps.call(this, bindings, staticProps, Component.props);
    if (node.nodeType === 8) {
      const newNode = renderComponent.call(this, Component, props);
      node.parentNode.replaceChild(newNode, node);
    } else {
      const vm = vms.get(node.__vmid__);
      // TODO check props update
      Object.assign(vm.$props, props);
      updateElement.call(vm, node, Component.meta);
    }
  }
}
