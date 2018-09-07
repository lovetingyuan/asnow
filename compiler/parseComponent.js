import { parseForExpression, parseEventExpression, parseExpression } from './parseExpression.js';

function parseComponentAttrs(attrs) {
  const directives = {};
  const props = {};
  const events = {};
  for (let attr of attrs) {
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
    } else if (name[0] === '@') {
      events[name.substr(1)] = parseEventExpression(value);
    } else if (name[0] === ':') {
      props[name.substr(1)] = parseExpression(value);
    } else {
      props[name] = value;
    }
  }
  return {
    directives: Object.keys(directives).length ? directives : null,
    props: Object.keys(props).length ? props : null,
    events: Object.keys(events).length ? events : null,
    // attrs: Object.keys(_attrs).length ? _attrs : null,
  };
}

export default function parseComponent(node) {
  const { directives, props, events } = parseComponentAttrs(node.attrs);
  return {
    type: 'component',
    name: node.tagName,
    directives,
    props,
    events,
  };
}