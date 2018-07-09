export default function updateTextNode(node, meta) {
  let newText = meta.value.call(this);
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
