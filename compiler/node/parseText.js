import {relpaceWithComment} from './utils.js';

export default function parseText(node) {
  const hasExpressReg = /[^\\]?\$\{.+?\}/;
  const blankReg = /\s{2,}/g;
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