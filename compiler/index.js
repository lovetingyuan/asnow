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

export default function compile(node, returnNode) {
  if (typeof node === 'string') {
    node = templateToElement(node);
  }
  if (node.nodeType !== 1) return;
  if (returnNode) {
    return {
      meta: parseNode(node),
      node
    };
  } else {
    return parseNode(node);
  }
}
