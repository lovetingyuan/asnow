import updateElement from './updateElement.js';
import updateTextNode from './updateTextNode.js';
import updateIfNode from './updateIfNode.js';
import updateForNode from './updateForNode.js';
import component from './updateComponent.js';

export default function updateNode(node, meta) {
  if (meta.type === 'component') {
    const Component = this.constructor.components[meta.name];
    if (!Component) {
      throw new Error(`not found sub component ${meta.name} in ${this.constructor.componentName}`);
    }
    // if (!Component.meta.element) {
    //   Component.meta.element = templateToElement(Component.meta.template);
    // }
    let len;
    if (meta.directives) {
      if (meta.directives.for) {
        len = updateForNode.call(this, node, meta, Component); // need to return the length
      } else if (meta.directives.if) {
        updateIfNode.call(this, node, meta, Component);
      }
    } else {
      if (node.nodeType === 8) {
        const newNode = component.create.call(this, meta, Component);
        node.parentNode.replaceChild(newNode, node);
      } else {
        component.update.call(this, node, meta, Component);
        // const vm = vms.get(node.__vmid__);
        // // TODO check props update
        // const newProps = getProps.call(this, meta.props, Component.props);
        // Object.assign(vm.$props, newProps);
        // updateElement.call(vm, node, Component.meta);
      }
    }
    if (len > 1) {
      return len;
    }
  } else if (meta.type === 'element') {
    if (meta.directives) {
      if (meta.directives.for) {
        // if (!meta.element) {
        //   meta.element = templateToElement(meta.template);
        // }
        const len = updateForNode.call(this, node, meta);
        if (len > 1) {
          return len;
        }
      } else if (meta.directives.if) {
        // if (!meta.element) {
        //   meta.element = templateToElement(meta.template);
        // }
        updateIfNode.call(this, node, meta);
      }
    } else {
      updateElement.call(this, node, meta);
    }
  } else if (meta.type === 'text') {
    updateTextNode.call(this, node, meta);
  }
}
