const forExpReg = / +(of|by) +/g;
// const defaultListVar = ['$value', '$index'];

export default function parseForExpression(forExp) {
  const result = {};
  const forExpArr = forExp.split(forExpReg);
  let listVar, listExp, keyExp;
  switch (forExpArr.length) {
    case 1: {
      listExp = forExpArr[0];
      break;
    }
    case 3: {
      if (forExpArr[1] === 'of') {
        listVar = forExpArr[0].split(',').map(v => v.trim()).slice(0, 2);
        listExp = forExpArr[2];
      } else {
        keyExp = forExpArr[2];
        listExp = forExpArr[0];
      }
      break;
    }
    case 5: {
      listVar = forExpArr[0].split(',').map(v => v.trim()).slice(0, 2);
      listExp = forExpArr[2];
      keyExp = forExpArr[4];
      break;
    }
    default: throw new Error(`Invalid '#for' expression: "${forExp}"`);
  }
  if (listVar) {
    result.vars = listVar;
  }
  result.list = listExp;
  if (keyExp) {
    result.key = keyExp;
  }
  return result;
}
