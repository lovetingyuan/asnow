import { parseExpression } from './parseExpression.js';

const hasExpressReg = /[^\\]?\$\{.+?\}/;
const blankReg = /\s{2,}/g;

export default function parseText(node) {
  if (hasExpressReg.test(node.value)) {
    const value = parseExpression(node.value, 'text');
    if (value) {
      return {
        type: 'text',
        value
      }
    }
  }
  node.value = node.value.replace(blankReg, ' ');
}
