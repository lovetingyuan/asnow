import { parseElementAttributes } from './parseAttributes.js';
import parseChildNodes from './parseChildNodes.js';
/** {
  *  type: 'element',
  *  nodes: {},
  *  bindings: {
  *   title: Function,
  *   style: [Function, String]
  *  },
  *  directives: {
  *   if: bool,
  *   for: {
  *     list: ,
  *     value: ,
  *     index: ,
  *     key: ,
  *   }
  *  }
  * }
  */
export default function parseElement(element) {
  const meta = {};
  const attrMap = parseElementAttributes(element);
  const nodes = parseChildNodes(element);
  if (nodes) {
    meta.nodes = nodes;
  }
  if (attrMap) {
    if (attrMap.directives) {
      meta.directives = attrMap.directives;
      meta.template = element.outerHTML;
      meta.element = element.cloneNode(true);
      element.parentNode.replaceChild(document.createComment(''), element);
    }
    if (attrMap.bindings) {
      meta.bindings = attrMap.bindings;
    }
    if (attrMap.events) {
      meta.events = attrMap.events;
    }
  }
  if (Object.keys(meta).length) {
    meta.type = 'element';
    return meta;
  }
}