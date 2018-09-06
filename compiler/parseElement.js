import { parseEventExpression, parseForExpression } from './parseExpression.js';
import parseNode from './parseNode.js';

function parseElementAttrs(node) {
  const directives = {};
  const bindings = {};
  const events = {};
  const attrs = [];
  for (let attr of node.attrs) {
    const { name, value } = attr;
    if (name[0] === '#') {
      let _value = value;
      if (name === '#for') {
        _value = parseForExpression(value);
      }
      directives[name.substr(1)] = _value;
    } else if (name[0] === ':') {
      let _value = value;
      if (name === ':style' || name === ':class') {
        _value = [value, ''];
      }
      bindings[name.substr(1)] = _value;
    } else if (name[0] === '@') {
      events[name.substr(1)] = parseEventExpression(value);
    } else {
      attrs.push(attr);
    }
    if (attrs.style) {
      if (bindings.style) {
        bindings.style[1] = attrs.style;
        delete attrs.style;
      }
    }
    if (attrs.class) {
      if (bindings.class) {
        bindings.class[1] = attrs.class;
        delete attrs.class;
      }
    }
  }
  return {
    directives: Object.keys(directives).length ? directives : null,
    bindings: Object.keys(bindings).length ? bindings : null,
    events: Object.keys(events).length ? events : null,
    attrs: attrs
  };
}

function parseChildren(node) {
  const children = [];
  for (let i = 0; i < node.childNodes.length; i++) {
    children[i] = parseNode(node.childNodes[i]) || null;
  }
  return children;
}

export default function parseElement(node) {
  const { directives, bindings, events, attrs } = parseElementAttrs(node);
  node.attrs = attrs;
  const children = parseChildren(node);
  const staticElement = !directives && !bindings && !events && !children.length;
  if (!staticElement) {
    return {
      type: 'element',
      directives,
      bindings,
      events,
      children,
    }
  }
}
