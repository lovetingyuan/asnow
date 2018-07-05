const hasExpressReg = /[^\\]?\{(.+?)[^\\]?\}/;
const blankReg = /\s{2,}/g;

export default function parseTextNode(node) {
  let text = node.nodeValue;
  if (!hasExpressReg.test(text)) {
    const ret = node.nodeValue = text.trim();
    return ret ? null : [];
  }
  const texts = parseText(text);
  const parent = node.parentNode;
  const next = node.nextSibling;
  for(let i = 0; i < texts.length; i++) {
    let text = texts[i];
    let newNode;
    if (text instanceof String) {
      newNode = document.createComment('');
      texts[i] = {
        type: 'text',
        value: new Function(`with(this){return String(${text})}`)
      };
    } else {
      newNode = document.createTextNode(text.replace(blankReg, ' '));
      texts[i] = null;
    }
    if (!i) {
      parent.replaceChild(newNode, node);
    } else if (next) {
      parent.insertBefore(newNode, next);
    } else {
      parent.appendChild(newNode);
    }
  }
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
            const ret = text.substring(0, exp[0]).trim();
            ret && result.push(ret);
          }
        } else {
          if (exp[0] > lastIndex + 1) {
            const ret = text.substring(lastIndex + 1, exp[0]).trim();
            ret && result.push(ret);
          }
        }
        lastIndex = i;
        const ret = text.substring(exp[0] + 1, exp[1]).trim();
        ret && result.push(new String(ret));
        rightCount = leftCount = 0;
      }
    }
  }
  if (lastIndex < text.length - 1) {
    const ret = text.substring(lastIndex + 1).trim();
    ret && result.push(ret);
  }
  return result;
}
