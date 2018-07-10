import updateElement from "./updateElement.js";
import getId from '../../utils/getId.js';
import vms from './componentVms.js';
import templateToElement from '../../compiler/browser/templateToElement.js';

export default function renderComponent(node, Component, props = {}) {
  if (!Component.meta.element) {
    Component.meta.element = templateToElement(Component.meta.template);
  }
  const newNode = Component.meta.element.cloneNode(true);
  const vm = new Component(props);
  const id = getId();
  vms.set(id, vm);
  newNode.__vmid__ = id;
  Object.defineProperties(vm, {
    $id: {
      value: id
    },
    $props: {
      value: props
    },
    $dom: {
      value: newNode
    }
  });
  updateElement.call(vm, newNode, Component.meta);
  node.parentNode.replaceChild(newNode, node);
}
