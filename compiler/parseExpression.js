import buble from 'buble';

function parseExpression(expression, type) {
  // path.replaceWith(t.memberExpression(t.identifier('_vm'), node))
  let code, vars, templateLiteral;
  try {
    if (type === 'text') {
      expression = '`' + expression + '`';
    } else if (type === 'if') {
      expression = '!!(' + expression + ')';
    } else {
      expression = '(' + expression + ')';
    }
    ({ code, vars, templateLiteral } = buble.transform(expression));
  } catch(e) {
    throw new Error('Invalid experssion: ' + expression + ' ' + e.message);
  }
  if (type === 'text' && !templateLiteral) {
    return;
  }
  return getFunction(code, vars);
}

function getFunction(code, vars) {
  const func = new Function(`${vars.length ? 'var _vm=this;' : ''}return ${code}`);
  Object.defineProperty(func, 'vars', {value: vars});
  return func;
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
  parseEventExpression,
  parseForExpression
}
