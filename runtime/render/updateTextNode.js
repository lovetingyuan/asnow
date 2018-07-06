export default function updateTextNode(node, meta, state) {
  let newText = meta.value.call(state);
  const parent = node.parentNode;
  if (!newText) {
    if (node.nodeType !== 8) {
      parent.replaceChild(document.createComment(''), node);
    }
  } else if (newText !== node.nodeValue) {
    if (node.nodeType !== 3) {
      parent.replaceChild(document.createTextNode(newText), node);
    } else {
      node.nodeValue = newText;
    }
  }
}
