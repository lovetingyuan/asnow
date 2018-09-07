import parse5 from 'parse5';
import parseComponent from './parseComponent.js';
import parseElement from './parseElement.js';
import parseText from './parseText.js';

function relpaceWithComment(node) {
  const comment = {
    nodeName: '#comment',
    data: '',
    parentNode: node.parentNode
  };
  const idx = node.parentNode.childNodes.indexOf(node);
  node.parentNode.childNodes[idx] = comment;
  node.parentNode = null;
}

export default function parseNode(node) {
  if (node.nodeName === '#text') {
    const meta = parseText(node);
    if (meta) {
      relpaceWithComment(node);
      return meta;
    }
  } else if (node.tagName) {
    if (node.tagName.indexOf('-') < 0) {
      const meta = parseElement(node);
      if (meta) {
        if (meta.directives) {
          relpaceWithComment(node);
          meta.static = parse5.serialize({
            nodeName: '#document-fragment',
            childNodes: [node]
          });
        }
        return meta;
      }
    } else {
      const meta = parseComponent(node);
      relpaceWithComment(node);
      return meta;
    }
  }
}
