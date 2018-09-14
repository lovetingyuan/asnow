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
  meta.static = {
    template: parse5.serialize(
      node.nodeName === '#document-fragment' ? node : {
        nodeName: '#document-fragment',
        childNodes: [node]
      }
    )
  };
  Object.defineProperty(meta, 'element', { // only access at runtime
    get() {
      if (!this.static.node) {
        let div = document.createElement('div');
        div.innerHTML = this.static.template;
        Object.defineProperty(this.static, 'node', { value: div.firstElementChild })
        div = null;
      }
      return this.static.node.cloneNode(true);
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
