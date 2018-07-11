import parseNode from './parseNode.js';

function templateToElement(template) {
  let div = document.createElement('div');
  div.innerHTML = template;
  const element = div.firstElementChild;
  if (div.children.length !== 1 || !element || element.nodeType !== 1) {
    throw new Error(`${template} must has a single element as root`);
  }
  div = null;
  return element;
}

export default function compile(name, node) {
  if (typeof node === 'string') {
    node = templateToElement(node);
  }
  if (node.nodeType !== 1) return;
  let meta = parseNode(node) || {};
  node.setAttribute('data-component', name);
  meta.template = node.outerHTML;
  meta.element = node.cloneNode(true);
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