import './parse5.js'; // export parse5 to global
import parseNode from './parseNode.js';

export default function compile(template) {
  const ast = parse5.parseFragment(template.trim());
  if (ast.childNodes.length !== 1) {
    throw new Error('template can only contain a single root element');
  }
  const meta = parseNode(ast.childNodes[0]);
  meta.template = ast;
  return meta;
}
