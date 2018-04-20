import parseForExpression from './parseForExpression.js';

function parseComponentAttributes(node) {
  const attrs = [...node.attributes];
  const attrMap = {
    directives: {}, // start with '#', for now: #if, #for
    bindings: {}, // attributes with bindings, start with ':'
    attrs: {}, // normal attributes, for now: style, class
  };
  for (let i = 0, len = attrs.length; i < len; i++) {
    const attrName = attrs[i].nodeName;
    const attrValue = attrs[i].nodeValue;
    switch (attrName) {
      case 'props': {
        attrMap.props = attrValue;
        break;
      }
      case '#if': {
        attrMap.directives.if = attrValue;
        break;
      }
      case '#for': {
        attrMap.directives.for = parseForExpression(attrValue);
        break;
      }
      default: {
        if (attrName[0] === ':') {
          attrMap.bindings[attrName.substr(1)] = attrValue;
        } else {
          attrMap.attrs[attrName] = attrValue;
        }
        break;
      }
    }
  }
  if (attrMap.bindings.style && attrMap.attrs.style) {
    if (attrMap.attrs.style.substr(-1) !== ';') {
      attrMap.attrs.style += ';';
    }
    attrMap.bindings.style = [attrMap.bindings.style, attrMap.attrs.style];
    delete attrMap.attrs.style;
  }
  if (attrMap.bindings.class && attrMap.attrs.class) {
    attrMap.bindings.class = [attrMap.bindings.class, attrMap.attrs.class];
    delete attrMap.attrs.class;
  }

  if (!Object.keys(attrMap.directives).length) {
    delete attrMap.directives;
  }
  if (!Object.keys(attrMap.bindings).length) {
    delete attrMap.bindings;
  }
  if (!Object.keys(attrMap.attrs).length) {
    delete attrMap.attrs;
  }
  return attrMap;
}

function parseElementAttributes(node) {
  const attrs = [...node.attributes];
  const attrMap = {
    directives: {}, // start with '#', for now: #if, #for
    bindings: {}, // attributes with bindings, start with ':'
  };
  let style;
  let className;
  for (let i = 0, len = attrs.length; i < len; i++) {
    const attrName = attrs[i].nodeName;
    const attrValue = attrs[i].nodeValue;
    switch (attrName) {
      case '#if': {
        attrMap.directives.if = attrValue;
        node.removeAttribute('#if');
        break;
      }
      case '#for': {
        attrMap.directives.for = parseForExpression(attrValue);
        node.removeAttribute('#for');
        break;
      }
      case 'style': {
        style = attrValue.trim();
        if (style && style.substr(-1) !== ';') {
          style += ';';
        }
        break;
      }
      case 'class': {
        className = attrValue.trim();
        break;
      }
      default: {
        if (attrName[0] === ':') {
          attrMap.bindings[attrName.substr(1)] = attrValue;
          node.removeAttribute(attrName);
        }
        break;
      }
    }
  }

  if (attrMap.bindings.style) {
    if (style) {
      attrMap.bindings.style = [attrMap.bindings.style, style];
      node.removeAttribute('style');
    }
  }

  if (attrMap.bindings.class) {
    if (className) {
      attrMap.bindings.class = [attrMap.bindings.class, className];
      node.removeAttribute('class');
    }
  }

  if (!Object.keys(attrMap.directives).length) {
    delete attrMap.directives;
  }
  if (!Object.keys(attrMap.bindings).length) {
    delete attrMap.bindings;
  }
  if (attrMap.directives || attrMap.bindings) {
    return attrMap;
  }
}

export {
  parseComponentAttributes,
  parseElementAttributes
};
