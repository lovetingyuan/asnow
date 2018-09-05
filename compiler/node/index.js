import parseNode from './parseNode.js';

export default function compile(template) {
  const ast = parse5.parseFragment(template.trim());
  const root = ast.childNodes[0];
  return parseNode(root);
}
