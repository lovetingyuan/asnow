import { parseEventExpression, parseForExpression, relpaceWithComment } from './utils.js';
// import parseNode from './parseNode.js';
import parseChildren from './parseChildren.js';

function parseElementAttrs(node) {
  const directives = {};
  const bindings = {};
  const events = {};
  const attrs = [];
  let style;
  let className;
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
      if (name === 'style') {
        style = attr;
      } else if (name === 'class') {
        className = attr;
      } else {
        attrs.push(attr);
      }
    }
    if (style) {
      if (bindings.style) {
        bindings.style[1] = style.value;
      } else {
        attrs.push(style);
      }
    }
    if (className) {
      if (bindings.class) {
        bindings.class[1] = className.value;
      } else {
        attrs.push(className);
      }
    }
  }
  node.attrs = attrs;
  return {
    directives: Object.keys(directives).length ? directives : null,
    bindings: Object.keys(bindings).length ? bindings : null,
    events: Object.keys(events).length ? events : null,
  };
}



export default function parseElement(node) {
  const { directives, bindings, events } = parseElementAttrs(node);
  const children = parseChildren(node);
  if (directives || bindings || events || children) {
    // relpaceWithComment(node);
    return {
      type: 'element',
      tag: node.tagName,
      directives,
      bindings,
      events,
      children,
      static: parse5.serialize(node)
    }
  }
}
