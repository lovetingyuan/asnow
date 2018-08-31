const recast = require('recast');
const types = recast.types;
const PathVisitor = types.PathVisitor;
const b = types.builders;
const blankReg = /\s{2,}/g;

function Visitor() {
  PathVisitor.apply(this, arguments);
}
Visitor.prototype = Object.assign(Object.create(PathVisitor.prototype), {
  constructor: Visitor,
  /**
   * Visits a template literal, replacing it with a series of string
   * concatenations.
   * @param {NodePath} path
   * @returns {AST.Literal|AST.BinaryExpression}
   */
  visitTemplateLiteral(path) {
    const node = path.node;
    let replacement = b.literal(node.quasis[0].value.cooked.replace(blankReg, ' '));
    for (let i = 1, length = node.quasis.length; i < length; i++) {
      replacement = b.binaryExpression(
        '+',
        b.binaryExpression(
          '+',
          replacement,
          node.expressions[i - 1]
        ),
        b.literal(node.quasis[i].value.cooked.replace(blankReg, ' '))
      );
    }
    return replacement;
  }
});

/**
 * Transform JavaScript written using ES6 by replacing all template string
 * usages with the equivalent ES5.
 *
 *   compile('`Hey, ${name}!`'); // '"Hey, " + name + "!"'
 *
 * @param {string} source
 * @param {{sourceFileName: string, sourceMapName: string}} mapOptions
 * @return {string}
 */
module.exports = function compile(source) {
  const visitor = new Visitor();
  const ast = recast.parse(source);
  return recast.print(types.visit(ast, visitor)).code;
}
