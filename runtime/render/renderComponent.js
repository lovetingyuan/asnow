import updateElement from "./updateElement.js";
import getId from '../../utils/getId.js';
import vms from './componentVms.js';
import templateToElement from '../../compiler/browser/templateToElement.js';

export default function renderComponent(Component, props = {}) {
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
    $el: {
      value: newNode
    },
    $parent: {
      value: this
    }
  });
  updateElement.call(vm, newNode, Component.meta);
  return newNode;
}
