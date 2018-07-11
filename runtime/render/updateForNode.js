import updateElement from './updateElement.js';
import component from './updateComponent.js';

export default function updateForNode(node, meta, Component) {
  const parent = node.parentNode;
  const condition = meta.directives.if;
  const newScope = {  __proto__: this };
  const { key, value: valueName, index: indexName } = meta.directives.for;
  let list = meta.directives.for.list.call(this);
  condition && (list = list.filter((v, i) => {
    newScope[valueName] = v;
    indexName && (newScope[indexName] = i);
    return condition.call(newScope);
  }));
  const length = list.length;
  const keys = [];
  if (node.nodeType === 8) {
    if (!length) return;
    for (let index = 0; index < length; index++) {
      newScope[valueName] = list[index];
      indexName && (newScope[indexName] = index);
      let newNode;
      if (Component) {
        newNode = component.create.call(newScope, meta, Component);
      } else {
        newNode = meta.element.cloneNode(true);
        updateElement.call(newScope, newNode, meta);
      }
      parent.insertBefore(newNode, node);
      if (!index) {
        newNode.__length__ = length;
        if (key) {
          keys.push(key.call(newScope));
          newNode.__keys__ = keys;
        }
      } else {
        key && keys.push(key.call(newScope));
      }
    }
    parent.removeChild(node);
  } else {
    if (!length) {
      for (let i = 0, len = node.__length__; i < len; i++) {
        const nodeToRemove = node.nextSibling;
        if (Component) {
          component.remove(nodeToRemove);
          // const vm = vms.get(nodeToRemove.__vmid__);
          // Object.defineProperty(vm, '$destroy', {value: true});
          // vms.delete(nodeToRemove.__vmid__);
        }
        if (i === len - 1) {
          parent.replaceChild(document.createComment('for'), node);
        } else {
          parent.removeChild(nodeToRemove);
        }
      }
      return;
    }
    if (!key) { // default reuse each node one by one
      let currentNode = node;
      const preLength = node.__length__;
      for (let index = 0, len = Math.min(preLength, length); index < len; index++) {
        newScope[valueName] = list[index];
        indexName && (newScope[indexName] = index);
        if (Component) {
          component.update.call(newScope, currentNode, meta, Component);
          // const props = getNewProps.call(newScope, meta.props, Component.props);
          // const vm = vms.get(currentNode.__vmid__);
          // Object.assign(vm.$props, props);
          // updateElement.call(vm, currentNode, Component.meta);
        } else {
          updateElement.call(newScope, currentNode, meta);
        }
        !index && (currentNode.__length__ = length);
        currentNode = currentNode.nextSibling;
      }
      if (preLength < length) {
        for (let index = preLength; index < length; index++) {
          newScope[valueName] = list[index];
          indexName && (newScope[indexName] = index);
          let newNode;
          if (Component) {
            newNode = component.create.call(newScope, meta, Component);
            // newNode = renderComponent.call(newScope, Component, meta);
          } else {
            newNode = meta.element.cloneNode(true);
            updateElement.call(newScope, newNode, meta);
          }
          currentNode ? parent.insertBefore(newNode, currentNode) : parent.appendChild(newNode);
        }
      } else if (preLength > length) {
        const lastNode = currentNode.previousSibling;
        for (let i = length; i < preLength; i++) {
          const nodeToRemove = lastNode.nextSibling;
          if (Component) {
            component.remove(nodeToRemove);
            // const vm = vms.get(nodeToRemove.__vmid__);
            // Object.defineProperty(vm, '$destroy', {value: true});
            // vms.delete(nodeToRemove.__vmid__);
          }
          parent.removeChild(nodeToRemove);
        }
      }
    } else { // or reuse node by its uniq key
      let currentNode = node;
      const preLength = node.__length__;
      const preKeys = node.__keys__;
      delete node.__length__;
      delete node.__keys__;
      let preNodes = {};
      for (let i = 0; i < preLength; i++) {
        const key = preKeys[i];
        if (key in preNodes) {
          console.error(`There are same keys: "${key}" at ${meta.template}`); // eslint-disable-line
        }
        preNodes[key] = currentNode;
        currentNode = currentNode.nextSibling;
      }
      let newKeys = [];
      for (let index = 0; index < length; index++) {
        newScope[valueName] = list[index];
        indexName && (newScope[indexName] = index);
        const newKey = key.call(newScope);
        newKeys.push(newKey);
        let newNode = preNodes[newKey];
        if (newNode) {
          preNodes[newKey] = null;
          if (Component) {
            component.update.call(newScope, newNode, meta, Component);
            // const props = getNewProps.call(newScope, meta.props, Component.props);
            // const vm = vms.get(newNode.__vmid__);
            // Object.assign(vm.$props, props);
            // updateElement.call(vm, newNode, Component.meta);
          } else {
            updateElement.call(newScope, newNode, meta);
          }
        } else {
          if (Component) {
            newNode = component.create.call(newScope, meta, Component);
            // newNode = renderComponent.call(newScope, Component, meta);
          } else {
            newNode = meta.element.cloneNode(true);
            updateElement.call(newScope, newNode, meta);
          }
        }
        if (!index) {
          newNode.__length__ = length;
          newNode.__keys__ = newKeys;
        }
        currentNode ? parent.insertBefore(newNode, currentNode) : parent.appendChild(newNode);
      }
      Object.keys(preNodes).forEach(oldKey => {
        const nodeToRemove = preNodes[oldKey];
        if (!nodeToRemove) return;
        if (Component) {
          component.remove(nodeToRemove);
          // const vm = vms.get(nodeToRemove.__vmid__);
          // Object.defineProperty(vm, '$destroy', {value: true});
          // vms.delete(nodeToRemove.__vmid__);
        } else {
          parent.removeChild(nodeToRemove);
        }
      });
      preNodes = null;
    }
  }
  return length;
}
