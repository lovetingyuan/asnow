import parseNode from './parseNode.js';
import { relpaceWithComment } from './utils.js';

export default function parseChildren(node) {
  const nodesMap = Object.create(null);
  for (let i = 0; i < node.childNodes.length; i++) {
    const childNode = node.childNodes[i];
    const meta = parseNode(childNode);
    if (meta) {
      nodesMap[i] = meta;
    } else {
      relpaceWithComment(childNode);
    }
  }
  return Object.keys(nodesMap).length ? nodesMap : null;
}