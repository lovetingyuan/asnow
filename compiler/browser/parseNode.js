
import parseComponent from './parseComponent.js';
import parseElement from './parseElement.js';
import parseTextNode from './parseTextNode.js';

function isComponent(node) {
  return node.nodeType === 1 && node.nodeName.indexOf('-') > 0;
}

export default function parseNode(node) {
  if (node.nodeType === 1) {
    if (isComponent(node)) {
      return parseComponent(node);
    } else {
      return parseElement(node);
    }
  } else if (node.nodeType === 3) {
    return parseTextNode(node);
  }
}
