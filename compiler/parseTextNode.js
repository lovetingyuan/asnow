const hasExpressReg = /[^\\]?\{(.+?)[^\\]?\}/;
const blankReg = /\s{2,}/g;

export default function parseTextNode(node) {
  let text = node.nodeValue;
  if (!hasExpressReg.test(text)) {
    node.nodeValue = text.replace(blankReg, ' ');
    return;
  }
  const texts = parseText(text);
  const parent = node.parentNode;
  const next = node.nextSibling;
  texts.forEach((text, index) => {
    let newNode;
    if (text instanceof String) {
      newNode = document.createComment('');
      texts[index] = {
        type: 'text',
        value: text.trim()
      };
    } else {
      newNode = document.createTextNode(text.replace(blankReg, ' '));
      texts[index] = null;
    }
    if (!index) {
      parent.replaceChild(newNode, node);
    } else if (next) {
      parent.insertBefore(newNode, next);
    } else {
      parent.appendChild(newNode);
    }
  });
  return texts;
}

function parseText(text) {
  let leftCount = 0;
  let rightCount = 0;
  const result = [];
  let exp;
  let lastIndex;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '{') {
      leftCount++;
      exp = [i, -1];
    } else if (char === '}') {
      rightCount++;
      if (rightCount > leftCount) {
        throw new Error(`Invalid "{expression}" at index ${exp[0]}~${i}: ${text}`);
      }
      if (rightCount === leftCount) {
        exp[1] = i;
        if (typeof lastIndex !== 'number') {
          if (exp[0] > 0) {
            result.push(text.substring(0, exp[0]));
          }
        } else {
          if (exp[0] > lastIndex + 1) {
            result.push(text.substring(lastIndex + 1, exp[0]));
          }
        }
        lastIndex = i;
        result.push(new String(text.substring(exp[0] + 1, exp[1]).trim()));
        rightCount = leftCount = 0;
      }
    }
  }
  if (lastIndex < text.length - 1) {
    result.push(text.substring(lastIndex + 1));
  }
  return result;
}
