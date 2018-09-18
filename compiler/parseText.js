import { parseExpression } from './parseExpression.js';
import mustache from 'mustache';

const hasExpressReg = /[^\\]?\{.+?\}/;
const blankReg = /\s{2,}/g;

export default function parseText(node) {
  if (hasExpressReg.test(node.value)) {
    let tokens = mustache.parse(node.value, ['{', '}']);
    let hasBinding;
    tokens = tokens.map(token => {
      if (token[0] === 'name') {
        hasBinding = true;
        return token[1];
      }
      return JSON.stringify(token[1].replace(blankReg, ' '));
    });
    if (hasBinding) {
      return {
        type: 'text',
        value: parseExpression(tokens.join('+'))
      }
    }
  }
  node.value = node.value.replace(blankReg, ' ');
}
