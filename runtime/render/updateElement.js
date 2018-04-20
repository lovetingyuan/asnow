import updateNode from './updateNode.js';

export default function updateElement(node, meta, state) {
  const { nodes, bindings } = meta;
  bindings && Object.keys(bindings).forEach(attrName => {
    const func = bindings[attrName];
    let attrValue = func.call(state);
    let newAttrValue = attrValue + '';
    if (node.getAttribute(attrName) !== newAttrValue) {
      node.setAttribute(attrName, newAttrValue);
    }
    if (attrName === 'value' && typeof node.value === 'string') {
      node.value = newAttrValue;
    }
  });
  const increment = {};
  const children = node.childNodes;
  nodes && Object.keys(nodes).sort((a, b) => a - b).forEach(metaIndex => {
    let nodeIndex = metaIndex = Number(metaIndex);
    Object.keys(increment).sort((a, b) => a - b).forEach(index => {
      if (metaIndex > index) {
        nodeIndex += increment[index];
      }
    });
    const meta = nodes[metaIndex];
    const count = updateNode(children[nodeIndex], meta, state);
    if (typeof count === 'number') {
      increment[metaIndex] = count - 1;
    }
  });
}
