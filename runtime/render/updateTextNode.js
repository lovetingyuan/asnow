export default function updateTextNode(node, meta, state) {
  let newText = meta.value.call(state);
  const parent = node.parentNode;
  if (!newText) {
    if (node.nodeType !== 8) {
      const comment = document.createComment('');
      parent.replaceChild(comment, node);
    }
  } else if (newText !== node.nodeValue) {
    if (node.nodeType !== 3) {
      const newNode = document.createTextNode(newText);
      parent.replaceChild(newNode, node);
    } else {
      node.nodeValue = newText;
    }
  }
}
