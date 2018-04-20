import { parseElementAttributes } from './parseAttributes.js';
import parseChildNodes from './parseChildNodes.js';

export default function parseElement(element) {
  const meta = {};
  const attrMap = parseElementAttributes(element);
  if (attrMap) {
    if (attrMap.directives) {
      meta.directives = attrMap.directives;
    }
    if (attrMap.bindings) {
      meta.bindings = attrMap.bindings;
    }
    if (attrMap.attrs) {
      meta.attrs = attrMap.attrs;
    }
  }
  const nodes = parseChildNodes(element);
  if (nodes) {
    meta.nodes = nodes;
  }
  if (attrMap && attrMap.directives) {
    meta.template = element.outerHTML;
    element.parentNode.replaceChild(document.createComment(''), element);
  }
  if (Object.keys(meta).length) {
    if (meta.directives) {
      if (meta.directives.if && meta.directives.for) {
        meta.type = 'for-if';
      } else if (meta.directives.if) {
        meta.type = 'if';
      } else if (meta.directives.for) {
        meta.type = 'for';
      }
    } else {
      meta.type = 'element';
    }
    return meta;
  }
}
