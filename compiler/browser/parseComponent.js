import { parseComponentAttributes } from './parseAttributes.js';

export default function parseComponent(node) {
  const attrMap = parseComponentAttributes(node);
  const componentName = node.nodeName.toLowerCase();
  const meta = {
    type: 'component',
    name: componentName
  };
  if (attrMap) {
    if (attrMap.props) {
      meta.props = attrMap.props;
    }
    if (attrMap.directives) {
      meta.directives = attrMap.directives;
    }
    if (attrMap.bindings) {
      meta.bindings = attrMap.bindings;
    }
  }
  node.parentNode.replaceChild(document.createComment(componentName), node);
  return meta;
}
