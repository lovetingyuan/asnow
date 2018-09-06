export default function parseExpression(expression) {
  // path.replaceWith(t.memberExpression(t.identifier('this'), node))
  return {
    expression,
    vars: []
  }
}

export function parseForExpression(expression) {
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
  result.list = listExp;
  if (indexExp) {
    result.index = indexExp;
  }
  if (keyExp) {
    result.key = keyExp;
  }
  return result;
}

export function parseEventExpression(expression) {
  expression = expression.trim();
  const result = {};
  const exps = expression.split(/\(|\)/).filter(Boolean);
  result.handler = exps[0];
  if (exps.length > 1) {
    result.args = exps[1].split(',').map(v => v.trim());
  }
  return result;
}

