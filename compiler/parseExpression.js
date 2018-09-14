import buble from 'buble';
import mustache from 'mustache';

function parseExpression(expression) {
  const varsMap = Object.create(null);
  const contextName = '__$$__';
  let code;
  try {
    code = buble.transform(`void (${expression})`, {
      objectAssign: 'Object.assign',
      _varsMap: varsMap,
      _contextName: contextName
    }).code.substr(5); // 5 === 'void '.length
  } catch (e) {
    throw new Error(`Invalid experssion: ${JSON.stringify(expression)}, ${e.message}`);
  }
  const vars = Object.keys(varsMap);
  const func = new Function(`${vars.length ? `var ${contextName}=this;` : ''}return ${code}`);
  Object.defineProperty(func, 'vars', {value: vars});
  return func;
}

function parseTextExpression(expression) {
  const blankReg = /\s{2,}/g;
  let tokens = mustache.parse(expression, ['{', '}']);
  let hasBinding;
  tokens = tokens.map(token => {
    if (token[0] === 'name') {
      hasBinding = true;
      return token[1];
    }
    return JSON.stringify(token[1].replace(blankReg, ' '));
  });
  if (!hasBinding) return null;
  return parseExpression(tokens.join('+'));
}

function parseForExpression(expression) {
  const forExpReg = / +(of|by) +/g;
  const forExp = expression.trim();
  const result = {};
  const err = new Error(`Invalid #for expression: ${forExp}`);
  const forExpArr = forExp.split(forExpReg);
  if (forExpArr.length !== 3 && forExpArr.length !== 5) {
    throw err;
  }
  let listExp = forExpArr[2];
  let [varExp, indexExp] = forExpArr[0].split(',').map(v => v.trim());
  let keyExp = forExpArr[4];
  if (!listExp || !varExp) {
    throw err;
  }
  result.value = varExp;
  result.list = parseExpression(listExp);
  if (indexExp) {
    result.index = indexExp;
  }
  if (keyExp) {
    result.key = keyExp;
  }
  return result;
}

function parseEventExpression(expression) {
  expression = expression.trim();
  let result = [];
  const exps = expression.split(/\(|\)/).filter(Boolean);
  result.push(exps[0]);
  if (exps.length > 1) {
    result = result.concat(exps[1].split(',').map(v => v.trim()));
  }
  return result;
}

export {
  parseExpression,
  parseTextExpression,
  parseEventExpression,
  parseForExpression
}

