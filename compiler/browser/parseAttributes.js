import parseForExpression from './parseForExpression.js';
import parseEventExpression from './parseEventExpression.js';

export function parseComponentAttributes() {
  const attrs = [...node.attributes];
  const attrMap = {
    directives: {}, // start with '#', for now: #if, #for
    bindings: {}, // binding props
    props: {}, // static string props
  };
  for (let i = 0, len = attrs.length; i < len; i++) {
    const { nodeName: attrName, nodeValue: attrValue } = attrs[i];
    switch (attrName) {
      case '#if': {
        attrMap.directives.if = new Function(`with(this){return Boolean(${attrValue})}`);
        break;
      }
      case '#for': {
        attrMap.directives.for = parseForExpression(attrValue);
        break;
      }
      default: {
        if (attrName[0] === ':') {
          attrMap.bindings[attrName.substr(1)] = new Function(`with(this){return ${attrValue}}`);
        } else if (attrName[0] !== '#') {
          attrMap.props[attrName] = attrValue;
        }
        break;
      }
    }
  }

  if (!Object.keys(attrMap.directives).length) {
    delete attrMap.directives;
  }
  if (!Object.keys(attrMap.bindings).length) {
    delete attrMap.bindings;
  }
  if (!Object.keys(attrMap.props).length) {
    delete attrMap.props;
  }
  if (attrMap.bindings || attrMap.directives || attrMap.props) {
    return attrMap;
  }
}

export function parseElementAttributes(element) {
  const attrs = [...element.attributes];
  const attrMap = {
    directives: {}, // start with '#', for now: #if, #for
    events: {}, // start with '@'
    bindings: {}, // attributes with bindings, start with ':'
  };
  let staticStyle;
  let staticClass;
  let bindStyle;
  let bindClass;
  for (let i = 0, len = attrs.length; i < len; i++) {
    const { nodeName: attrName, nodeValue: attrValue } = attrs[i];
    switch (attrName) {
      case '#if': {
        attrMap.directives.if = new Function(`with(this){return Boolean(${attrValue})}`);
        element.removeAttribute('#if');
        break;
      }
      case '#for': {
        attrMap.directives.for = parseForExpression(attrValue);
        element.removeAttribute('#for');
        break;
      }
      case 'style': {
        let style = attrValue.trim();
        if (style && style.substr(-1) !== ';') {
          style += ';';
        }
        staticStyle = style;
        break;
      }
      case 'class': {
        staticClass = attrValue.trim();
        break;
      }
      default: {
        console.log(attrName);
        if (attrName[0] === ':') {
          if (attrName === ':style') {
            bindStyle = attrValue;
          } else if (attrName === ':class') {
            bindClass = attrValue;
          } else {
            attrMap.bindings[attrName.substr(1)] = new Function(`with(this){return String(${attrValue})}`);
          }
          element.removeAttribute(attrName);
        } else if (attrName[0] === '@') {
          attrMap.events[attrName.substr(1)] = parseEventExpression(attrValue);
          element.removeAttribute(attrName);
        }
        break;
      }
    }
  }

  if (bindStyle) {
    const bindStyleFunc = new Function(`with(this){return ${bindStyle}}`);
    if (staticStyle) {
      attrMap.bindings.style = [bindStyleFunc, staticStyle];
      element.removeAttribute('style');
    } else {
      attrMap.bindings.style = bindStyleFunc;
    }
  }
  if (bindClass) {
    const bindClassFunc = new Function(`with(this){return ${bindClass}}`);
    if (staticClass) {
      attrMap.bindings.class = [bindClassFunc, staticClass];
      element.removeAttribute('class');
    } else {
      attrMap.bindings.class = bindClassFunc;
    }
  }

  if (!Object.keys(attrMap.directives).length) {
    delete attrMap.directives;
  }
  if (!Object.keys(attrMap.bindings).length) {
    delete attrMap.bindings;
  }
  if (!Object.keys(attrMap.events).length) {
    delete attrMap.events;
  }
  if (attrMap.directives || attrMap.bindings || attrMap.events) {
    return attrMap;
  }
}
