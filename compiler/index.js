import parse5 from 'parse5';
import parseNode from './parseNode.js';

const invalidRootTags = [
  'html',
  'body',
  'head',
  'script',
  'noscript',
  'style',
  'title',
  'link',
  'meta',
  'base',
  'basefont',
];

export default function compile(template) {
  const templateAst = parse5.parseFragment(template.trim());
  if (templateAst.childNodes.length !== 1) {
    throw new Error('Template can only contain a single root element');
  }
  const rootNode = templateAst.childNodes[0];
  if (!rootNode.tagName) {
    throw new Error('Root node of template must be an element.');
  }
  if (~invalidRootTags.indexOf(rootNode.tagName)) {
    throw new Error(rootNode.tagName + ' can not be used as root node.');
  }
  rootNode.root = true;
  return parseNode(rootNode);
}
