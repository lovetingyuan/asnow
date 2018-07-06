import updateNode from './updateNode.js';

function getStyle(binding, state) {
  let style = '';
  let constant = '';
  if (Array.isArray(binding)) {
    constant = binding[1];
    style = binding[0].call(state);
  } else {
    style = binding.call(state);
  }
  if (Array.isArray(style)) {
    return style.join('') + constant;
  }
  if (style.constructor === Object) {
    return Object.keys(style).map(name => {
      return name + ':' + style[name];
    }).join(';') + constant;
  }
  return style + constant;
}

function getClass(binding, state) {
  let className = '';
  let constant = '';
  if (Array.isArray(binding)) {
    constant = ' ' + binding[1];
    className = binding[0].call(state);
  } else {
    className = binding.call(state);
  }
  if (Array.isArray(className)) {
    return className.join(' ') + constant;
  }
  if (className.constructor === Object) {
    return Object.keys(className).map(name => {
      return className[name] ? name : '';
    }).join(' ') + constant;
  }
  return className + constant;
}

export default function updateElement(node, meta, state) {
  const { nodes, bindings, events, name } = meta;
  if (name) {
    node.setAttribute('data-component', name);
  }
  bindings && Object.keys(bindings).forEach(attrName => {
    let newAttrValue;
    if (attrName === 'style') {
      newAttrValue = getStyle(bindings.style, state);
    } else if (attrName === 'class') {
      newAttrValue = getClass(bindings.class, state);
    } else {
      newAttrValue = bindings[attrName].call(state);
    }
    if (node.getAttribute(attrName) !== newAttrValue) {
      node.setAttribute(attrName, newAttrValue);
    }
  });
  if (!node.__events__ && events) {
    const eventNames = node.__events__ = Object.keys(events);
    eventNames.forEach(eventName => {
      const event = events[eventName];
      node.addEventListener(eventName, function(e) {
        const args = event.args || [];
        event.handler.call(state).call(state, e, ...args.map(arg => arg.call(state)));
      });
    });
  }
  const increment = {}; // handle #for that changed the number of dom
  const children = node.childNodes;
  nodes && Object.keys(nodes).sort().forEach(metaIndex => {
    let nodeIndex = metaIndex = Number(metaIndex);
    Object.keys(increment).sort().forEach(index => {
      if (metaIndex > index) {
        nodeIndex += increment[index];
      }
    });
    const count = updateNode(children[nodeIndex], nodes[metaIndex], state);
    if (count) {
      increment[metaIndex] = count - 1;
    }
  });
}
