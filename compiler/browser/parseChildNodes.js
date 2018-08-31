import parseNode from './parseNode.js';

export default function parseChildNodes(node) {
  const nodes = {};
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const meta = parseNode(children[i]);
    if (meta) {
      nodes[i] = meta;
    }
  }
  if (Object.keys(nodes).length) {
    return nodes;
  }
}
