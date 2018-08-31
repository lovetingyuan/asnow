const forExpReg = / +(of|by) +/g;
/** 
 * #for="value of list"
 * #for="value of list by value.id"
 * #for="value, index of list"
 * #for="value, index of list by index"
 */

export default function parseForExpression(forExp) {
  forExp = forExp.trim();
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
  result.list = new Function(`with(this){return ${listExp}}`);
  if (indexExp) {
    result.index = indexExp;
  }
  if (keyExp) {
    result.key = new Function(`with(this){return String(${keyExp})}`);
  }
  return result;
}
