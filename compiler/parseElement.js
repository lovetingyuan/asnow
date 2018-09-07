import { parseEventExpression, parseForExpression, parseExpression } from './parseExpression.js';
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
      } else if (name === '#if') {
        _value = parseExpression(value, 'if');
      } else {
        throw new Error('Unknown directive: ' + name + '=' + value);
      }
      directives[name.substr(1)] = _value;
    } else if (name[0] === ':') {
      bindings[name.substr(1)] = parseExpression(value);
    } else if (name[0] === '@') {
      events[name.substr(1)] = parseEventExpression(value);
    } else {
      if (attr.name === 'style' || attr.name === 'class') {
        attrs[name] = attr;
      } else {
        attrs.push(attr);
      }
    }
    if (attrs.style) {
      if (bindings.style) {
        Object.defineProperty(bindings.style, 'static', { value: attrs.style.value });
      } else {
        attrs.push(attrs.style);
      }
      delete attrs.style;
    }
    if (attrs.class) {
      if (bindings.class) {
        Object.defineProperty(bindings.class, 'static', {value: attrs.class.value});
      } else {
        attrs.push(attrs.class);
      }
      delete attrs.class;
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
  const children = {};
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = parseNode(node.childNodes[i]);
    if (child) {
      children[i] = child;
    }
  }
  return Object.keys(children).length ? children : null;
}

export default function parseElement(node) {
  const { directives, bindings, events, attrs } = parseElementAttrs(node);
  node.attrs = attrs;
  const children = parseChildren(node);
  const staticElement = !directives && !bindings && !events && !children;
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
