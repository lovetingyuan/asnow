const hasExpressReg = /[^\\]?\$\{.+?\}/;
const blankReg = /\s{2,}/g;

export default function parseText(node) {
  if (hasExpressReg.test(node.value)) {
    // relpaceWithComment(node);
    return {
      type: 'text',
      value: node.value
    }
  } else {
    node.value = node.value.replace(blankReg, ' ');
  }
}