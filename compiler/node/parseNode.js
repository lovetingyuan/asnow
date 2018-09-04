import parseComponent from './parseComponent.js';
import parseElement from './parseElement.js';
import parseText from './parseText.js';

export default function parseNode(node) {
  if (node.nodeName === '#text') {
    return parseText(node);
  }
  if (node.tagName) {
    if (node.tagName.indexOf('-') < 0) {
      return parseElement(node);
    } else {
      return parseComponent(node);
    }
  }
}
