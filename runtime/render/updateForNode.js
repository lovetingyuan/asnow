import updateElement from './updateElement.js';

function getNewScope(vname, iname, v, i, state) {
  const scope = {
    [vname]: v
  };
  if (iname) {
    scope[iname] = i;
  }
  scope.__proto__ = state;
  return scope;
}

export default function updateForNode(node, list, meta, state) {
  const length = list.length;
  const parent = node.parentNode;
  const condition = meta.directives.if;
  const { key, value: valueName, index: indexName } = meta.directives.for;
  if (node.nodeType === 8) {
    if (!length) return;
    let keys;
    let next = node.nextSibling;
    for (let index = 0; index < length; index++) {
      const newScope = getNewScope(valueName, indexName, list[index], index, state);
      const bool = condition ? condition.call(newScope) : true;
      let newNode;
      if (bool) {
        newNode = meta.element.cloneNode(true);
        updateElement(newNode, meta, newScope);
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
      let len = node.__length__ - 1;
      while(len--) {
        parent.removeChild(node.nextSibling);
      }
      parent.replaceChild(document.createComment('for'), node);
    } else {
      if (!key) { // default reuse each node one by one
        let currentNode = node;
        const preLength = node.__length__;
        for (let index = 0, len = Math.min(preLength, length); index < len; index++) {
          const newScope = getNewScope(valueName, indexName, list[index], index, state);
          const bool = condition ? condition.call(newScope) : true;
          let newNode;
          if (bool) {
            if (currentNode.nodeType === 8) {
              newNode = meta.element.cloneNode(true);
              parent.replaceChild(newNode, currentNode);
            } else {
              newNode = currentNode;
            }
            updateElement(newNode, meta, newScope);
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
            const newScope = getNewScope(valueName, indexName, list[index], index, state);
            const bool = condition ? condition.call(newScope) : true;
            let newNode;
            if (bool) {
              newNode = meta.element.cloneNode(true);
              updateElement(newNode, meta, newScope);
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
          const newScope = getNewScope(valueName, indexName, list[index], index, state);
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
                updateElement(newNode, meta, newScope);
              } else {
                newNode = oldNode;
                updateElement(newNode, meta, newScope);
              }
            } else {
              if (node.nodeType !== 8) {
                parent.removeChild(oldNode);
                newNode = meta.element.cloneNode(true);
                updateElement(newNode, meta, newScope);
              } else {
                newNode = oldNode;
              }
            }
            delete preNodes[newKey];
          } else {
            if (bool) {
              newNode = meta.element.cloneNode(true);
              updateElement(newNode, meta, newScope);
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
