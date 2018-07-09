import parseNode from './parseNode.js';
import templateToElement from './templateToElement.js';

export default function compile(name, node) {
  if (typeof node === 'string') {
    node = templateToElement(node);
  }
  if (node.nodeType !== 1) return;
  let meta = parseNode(node) || {};
  node.setAttribute('data-component', name);
  meta.template = node.outerHTML;
  node = null;
  return meta;
}

/**
 * {
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
 * 
 * {
 *  type: 'component',
 *  directives: {},
 *  bindings: {},
 *  props: {}
 * }
 */