export default function parseEventExpression(expression) {
  expression = expression.trim();
  const result = {};
  const exps = expression.split(/\(|\)/).filter(Boolean);
  result.handler = exps[0];
  if (exps.length > 1) {
    result.args = exps[1].split(',').map(v => new Function(`with(this){return ${v}}`));
  }
  return result;
}
