import { parseForExpression, parseEventExpression } from './parseExpression.js';

function parseComponentAttrs(attrs) {
  const directives = {};
  const _attrs = {};
  const bindings = {};
  const events = {};
  for (let attr of attrs) {
    const { name, value } = attr;
    if (name[0] === '#') {
      let _value = value;
      if (name === '#for') {
        _value = parseForExpression(value);
      }
      directives[name.substr(1)] = _value;
    } else if (name[0] === '@') {
      events[name.substr(1)] = parseEventExpression(value);
    } else if (name[0] === ':') {
      bindings[name.substr(1)] = value;
    } else {
      _attrs[name] = value;
    }
  }
  return {
    directives: Object.keys(directives).length ? directives : null,
    bindings: Object.keys(bindings).length ? bindings : null,
    events: Object.keys(events).length ? events : null,
    attrs: Object.keys(_attrs).length ? _attrs : null,
  };
}

export default function parseComponent(node) {
  const { directives, bindings, attrs, events } = parseComponentAttrs(node.attrs);
  return {
    type: 'component',
    name: node.tagName,
    directives,
    bindings,
    attrs,
    events,
  };
}