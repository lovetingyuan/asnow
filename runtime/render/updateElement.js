import updateNode from './updateNode.js';

function getStyle(binding) {
  let style = '';
  let constant = '';
  if (Array.isArray(binding)) {
    constant = binding[1];
    style = binding[0].call(this);
  } else {
    style = binding.call(this);
  }
  if (Array.isArray(style)) {
    return style.join('') + constant;
  }
  if (style.constructor === Object) {
    return Object.keys(style).map(name => {
      return style[name] ? (`${name}: ${style[name]};`) : '';
    }).join('') + constant;
  }
  return style + constant;
}

function getClass(binding) {
  let className = '';
  let constant = '';
  if (Array.isArray(binding)) {
    constant = ' ' + binding[1];
    className = binding[0].call(this);
  } else {
    className = binding.call(this);
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

export default function updateElement(node, meta) {
  const { children: nodes, bindings, events } = meta;
  bindings && Object.keys(bindings).forEach(attrName => {
    let newAttrValue;
    if (attrName === 'style') {
      newAttrValue = getStyle.call(this, bindings.style);
    } else if (attrName === 'class') {
      newAttrValue = getClass.call(this, bindings.class);
    } else {
      newAttrValue = bindings[attrName].call(this);
    }
    if (node.getAttribute(attrName) !== newAttrValue) {
      node.setAttribute(attrName, newAttrValue);
    }
  });
  if (!node.__events__ && events) {
    const eventNames = node.__events__ = Object.keys(events);
    eventNames.forEach(eventName => {
      const event = events[eventName];
      node.addEventListener(eventName, e => {
        const handlerName = event[0];
        const args = event.slice(1);
        if (typeof this[handlerName] !== 'function') {
          throw new Error(`event handler ${handlerName} not found in Component ${this.constructor.componentName}`);
        }
        return this[handlerName].call(this.__for__ ? this.__proto__ : this, e, ...args.map(arg => arg.call(this)));
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
    const count = updateNode.call(this, children[nodeIndex], nodes[metaIndex]);
    if (count > 1) {
      increment[metaIndex] = count - 1;
    }
  });
}
