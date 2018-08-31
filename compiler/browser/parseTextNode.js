const hasExpressReg = /[^\\]?\$\{.+?\}/;
const blankReg = /\s{2,}/g;

export default function parseTextNode(node) {
  let text = node.nodeValue;
  if (!hasExpressReg.test(text)) {
    node.nodeValue = text.replace(blankReg, ' ');
    return;
  }
  const parent = node.parentNode;
  parent.replaceChild(document.createComment(''), node);
  return {
    type: 'text',
    value: new Function(`with(this){return (\`${text}\`)}`)
  };
}
