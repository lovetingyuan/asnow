import getId from '../../utils/getId.js';
import templateToElement from '../../compiler/browser/templateToElement.js';
import updateElement from './updateElement.js';

const vms = new Map();

export default function updateComponent(node, meta) {
  const { bindings, props: staticProps, name: componentName } = meta;
  const Component = this.constructor.components[componentName];
  if (!Component) {
    throw new Error(`not found sub component ${componentName} in ${this.constructor.componentName}`);
  }
  if (node.nodeType === 8) {
    const props = {};
    bindings && Object.keys(bindings).forEach(name => {
      if (name in Component.props) {
        props[name] = bindings[name].call(this);
      } else {
        delete bindings[name];
      }
    });
    staticProps && Object.keys(staticProps).forEach(name => {
      if (name in Component.props) {
        props[name] = staticProps[name];
      } else {
        delete staticProps[name];
      }
    });
    if (!Component.meta.element) {
      Component.meta.element = templateToElement(Component.meta.template);
    }
    const newNode = Component.meta.element.cloneNode(true);
    const vm = new Component(props);
    const id = getId();
    vms.set(id, vm);
    newNode.__vmid__ = id;
    Object.defineProperty(vm, '$id', {value: id});
    updateElement.call(vm, newNode, Component.meta);
    node.parentNode.replaceChild(newNode, node);
  } else {
    const props = {};
    bindings && Object.keys(bindings).forEach(name => {
      props[name] = bindings[name].call(this);
    });
    Object.assign(props, staticProps);
    // TODO receive new props
    const vm = vms.get(node.__vmid__);
    updateElement.call(vm, node, Component.meta);
  }
}
