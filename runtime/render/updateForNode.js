import updateElement from './updateElement.js';

export default function updateForNode(node, list, meta, state) {
  const length = list.length;
  const parent = node.parentNode;
  const condition = meta.directives.if;
  const { key, vars = ['$value', '$index'] } = meta.directives.for;

  if (!node.__length__) {
    if (!length) return;
    let keys;
    let next = node.nextSibling;
    for (let index = 0; index < length; index++) {
      const value = list[index];
      const newScope = Object.assign({
        [vars[0]]: value,
        [vars[1]]: index
      }, state);
      const bool = condition ? condition.call(newScope) : true;
      let newNode;
      if (bool) {
        newNode = meta.element.cloneNode(true);
        updateElement(newNode, meta.meta, newScope);
      } else {
        newNode = document.createComment('for-if');
      }
      if (!index) {
        newNode.__length__ = length;
        if (key) {
          newNode.__keys__ = keys = [ key.call(newScope) ];
        }
        parent.replaceChild(newNode, node);
      } else {
        if (key) {
          keys.push(key.call(newScope));
        }
        if (next) {
          parent.insertBefore(newNode, next);
        } else {
          parent.appendChild(newNode);
        }
      }
    }
  } else {
    if (!length) {
      const len = node.__length__;
      for (let i = 1; i < len; i++) {
        parent.removeChild(node.nextSibling);
      }
      const comment = document.createComment('for');
      comment.__length__ = 0;
      parent.replaceChild(comment, node);
    } else {
      if (!key) { // default reuse each node one by one
        let currentNode = node;
        const preLength = node.__length__;
        for (let index = 0, len = Math.min(preLength, length); index < len; index++) {
          const value = list[index];
          const newScope = Object.assign({
            [vars[0]]: value,
            [vars[1]]: index
          }, state);
          const bool = condition ? condition.call(newScope) : true;
          let newNode;
          if (bool) {
            if (currentNode.nodeType === 8) {
              newNode = meta.element.cloneNode(true);
              parent.replaceChild(newNode, currentNode);
            } else {
              newNode = currentNode;
            }
            updateElement(newNode, meta.meta, newScope);
          } else {
            if (currentNode.nodeType === 8) {
              newNode = currentNode;
            } else {
              newNode = document.createComment('for-if');
              parent.replaceChild(newNode, currentNode);
            }
          }
          if (!index) {
            newNode.__length__ = length;
          }
          currentNode = newNode.nextSibling;
        }
        if (preLength < length) {
          for (let index = preLength; index < length; index++) {
            const value = list[index];
            const newScope = Object.assign({
              [vars[0]]: value,
              [vars[1]]: index
            }, state);
            const bool = condition ? condition.call(newScope) : true;
            let newNode;
            if (bool) {
              newNode = meta.element.cloneNode(true);
              updateElement(newNode, meta.meta, newScope);
            } else {
              newNode = document.createComment('for-if');
            }
            if (currentNode) {
              parent.insertBefore(newNode, currentNode);
            } else {
              parent.appendChild(newNode);
            }
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
          const value = list[index];
          const newScope = Object.assign({
            [vars[0]]: value,
            [vars[1]]: index
          }, state);
          const bool = condition ? condition.call(newScope) : true;
          const newKey = key.call(newScope);
          newKeys.push(newKey);
          let newNode;
          const oldNode = preNodes[newKey];
          if (oldNode) {
            if (bool) {
              if (oldNode.nodeType === 8) {
                parent.removeChild(oldNode);
                newNode = meta.element.cloneNode(true);
                updateElement(newNode, meta.meta, newScope);
              } else {
                newNode = oldNode;
                updateElement(newNode, meta.meta, newScope);
              }
            } else {
              if (node.nodeType !== 8) {
                parent.removeChild(oldNode);
                newNode = meta.element.cloneNode(true);
                updateElement(newNode, meta.meta, newScope);
              } else {
                newNode = oldNode;
              }
            }
            delete preNodes[newKey];
          } else {
            if (bool) {
              newNode = meta.element.cloneNode(true);
              updateElement(newNode, meta.meta, newScope);
            } else {
              newNode = document.createComment('for-if');
            }
          }
          if (!index) {
            newNode.__length__ = length;
            newNode.__keys__ = newKeys;
          }
          if (currentNode) {
            parent.insertBefore(newNode, currentNode);
          } else {
            parent.appendChild(newNode);
          }
        }
        Object.keys(preNodes).forEach(oldKey => {
          parent.removeChild(preNodes[oldKey]);
        });
        preNodes = null;
      }
    }
  }
}
