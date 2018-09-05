import { parseForExpression, parseEventExpression, relpaceWithComment } from './utils.js';

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
      }
      directives[name.substr(1)] = _value;
    } else if (name[0] === '@') {
      events[name.substr(1)] = parseEventExpression(value);
    } else {
      if (name[0] === ':') {
        props[name.substr(1)] = value;
      } else {
        props[name] = value;
      }
    }
  }
  return {
    directives: Object.keys(directives).length ? directives : null,
    props: Object.keys(props).length ? props : null,
    events: Object.keys(events).length ? events : null,
  };
}

export default function parseComponent(node) {
  const { directives, props, events } = parseComponentAttrs(node.attrs);
  // const children = parseChildNodes(node);
  // relpaceWithComment(node);
  return {
    type: 'component',
    tag: node.tagName,
    directives,
    props,
    events,
    // children,
  };
}