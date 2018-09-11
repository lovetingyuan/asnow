import parse5 from 'parse5';
import parseComponent from './parseComponent.js';
import parseElement from './parseElement.js';
import parseText from './parseText.js';
import { isComponentTag } from './validateTag.js';

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

function setStatic(meta, node) {
  const ast = node.nodeName === '#document-fragment' ? node : {
    nodeName: '#document-fragment',
    childNodes: [node]
  };
  const template = parse5.serialize(ast);
  meta.static = new String(template);
  Object.defineProperty(meta, 'element', { // only access at runtime
    get() {
      if (!this.static._node) {
        let div = document.createElement('div');
        div.innerHTML = this.static;
        this.static._node = div.firstElementChild;
        div = null;
      }
      return this.static._node.cloneNode(true);
    }
  });
}

export default function parseNode(node) {
  if (node.nodeName === '#text') {
    const meta = parseText(node);
    if (meta) {
      relpaceWithComment(node);
      return meta;
    }
  } else if (node.tagName) { // HTMLElement
    if (isComponentTag(node.tagName)) {
      const meta = parseComponent(node);
      relpaceWithComment(node);
      return meta;
    } else {
      const meta = parseElement(node);
      if (meta) {
        if (meta.directives) {
          if (node.root) {
            throw new Error('Root element can not use directives(#for and #if).');
          }
          relpaceWithComment(node);
          setStatic(meta, node);
        }
        if (node.root) {
          setStatic(meta, node);
        }
        return meta;
      }
    }
  }
}
