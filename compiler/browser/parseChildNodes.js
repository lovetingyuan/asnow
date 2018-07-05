import parseNode from './parseNode.js';

export default function parseChildNodes(node) {
  const nodes = {};
  let textCount = 0;
  const children = [...node.childNodes];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const ret = parseNode(child);
    if (!ret) {
      textCount++;
    } else if (Array.isArray(ret)) {
      ret.forEach((textMeta, i) => {
        if (textMeta) {
          nodes[textCount + i] = textMeta;
        }
      });
      textCount += ret.length;
    } else {
      nodes[textCount++] = ret;
    }
  }
  if (Object.keys(nodes).length) {
    return nodes;
  }
}
