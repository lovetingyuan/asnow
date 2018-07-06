import updateElement from './updateElement.js';

export default function updateForNode(node, meta, state) {
  const parent = node.parentNode;
  const condition = meta.directives.if;
  const newScope = {  __proto__: state };
  const { key, value: valueName, index: indexName } = meta.directives.for;
  let list = meta.directives.for.list.call(state);
  if (condition) {
    list = list.filter((v, i) => {
      newScope[valueName] = v;
      indexName && (newScope[indexName] = i);
      return condition.call(newScope);
    });
  }
  const length = list.length;
  const keys = [];
  if (node.nodeType === 8) {
    if (!length) return;
    let next = node.nextSibling;
    for (let index = 0; index < length; index++) {
      newScope[valueName] = list[index];
      indexName && (newScope[indexName] = index);
      let newNode = meta.element.cloneNode(true);
      updateElement(newNode, meta, newScope);
      if (!index) {
        newNode.__length__ = length;
        if (key) {
          keys.push(key.call(newScope));
          newNode.__keys__ = keys;
        }
        parent.replaceChild(newNode, node);
      } else {
        key && keys.push(key.call(newScope));
        if (next) {
          parent.insertBefore(newNode, next);
        } else {
          parent.appendChild(newNode);
        }
      }
    }
  } else {
    if (!length) {
      let len = node.__length__ - 1;
      while(len--) {
        parent.removeChild(node.nextSibling);
      }
      parent.replaceChild(document.createComment('for'), node);
      return;
    }
    if (!key) { // default reuse each node one by one
      let currentNode = node;
      const preLength = node.__length__;
      for (let index = 0, len = Math.min(preLength, length); index < len; index++) {
        newScope[valueName] = list[index];
        indexName && (newScope[indexName] = index);
        updateElement(currentNode, meta, newScope);
        !index && (currentNode.__length__ = length);
        currentNode = currentNode.nextSibling;
      }
      if (preLength < length) {
        for (let index = preLength; index < length; index++) {
          newScope[valueName] = list[index];
          indexName && (newScope[indexName] = index);
          let newNode = meta.element.cloneNode(true);
          updateElement(newNode, meta, newScope);
          currentNode ? parent.insertBefore(newNode, currentNode) : parent.appendChild(newNode);
        }
      } else if (preLength > length) {
        const lastNode = currentNode.previousSibling;
        for (let i = length; i < preLength; i++) {
          parent.removeChild(lastNode.nextSibling);
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
        } else {
          newNode = meta.element.cloneNode(true);
        }
        updateElement(newNode, meta, newScope);
        if (!index) {
          newNode.__length__ = length;
          newNode.__keys__ = newKeys;
        }
        currentNode ? parent.insertBefore(newNode, currentNode) : parent.appendChild(newNode);
      }
      Object.keys(preNodes).forEach(oldKey => {
        let child = preNodes[oldKey];
        child && parent.removeChild(child);
      });
      preNodes = null;
    }
  }
  return length;
}
