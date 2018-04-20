import getComponent from '../component/getComponent.js';

function templateToElement(template) {
  let div = document.createElement('div');
  div.innerHTML = template;
  const element = div.firstElementChild;
  if (div.children.length !== 1 || !element || element.nodeType !== 1) {
    throw new Error(`${template} must has a single element as root`);
  }
  div = null;
  return element;
}

function transformBindings(bindings) {
  if (!bindings) return null;
  const binds = {};
  Object.keys(bindings).forEach(attrName => {
    const expression = bindings[attrName];
    if (attrName === 'style' || attrName === 'class') {
      if (Array.isArray(expression)) {
        const method = attrName === 'style' ? '_getStyle' : '_getClassName';
        binds[attrName] = new Function(`with(this){return this.${method}(${expression[0]}, ${JSON.stringify(expression[1])})}`);
      } else {
        binds[attrName] = new Function(`with(this){return ${expression}}`);
      }
    } else {
      binds[attrName] = new Function(`with(this){return ${expression}}`);
    }
  });
  return binds;
}

function transformDirectives(directive) {
  if (!directive) return null;
  const result = {};
  Object.keys(directive).forEach(directiveName => {
    const meta = directive[directiveName];
    if (directiveName === 'if') {
      result.if = new Function(`with(this){return Boolean(${meta})}`);
    } else if (directiveName === 'for') {
      const forDirective = result.for = {};
      forDirective.list = new Function(`with(this){return ${meta.list}}`);
      if (meta.key) {
        forDirective.key = new Function(`with(this){return String(${meta.key})}`);
      }
      if (meta.vars) {
        forDirective.vars = meta.vars.slice();
        if (forDirective.vars.length === 1) {
          forDirective.vars.push('$index');
        }
      } else {
        forDirective.vars = ['$value', '$index'];
      }
    }
  });
  return result;
}

function transformElementMeta({ bindings, nodes }) {
  const newMeta = {
    type: 'element',
    bindings: transformBindings(bindings)
  };
  if (nodes) {
    newMeta.nodes = {};
    Object.keys(nodes).forEach(index => {
      newMeta.nodes[index] = transformMeta(nodes[index]);
    });
  }
  return newMeta;
}

export default function transformMeta(meta) {
  let newMeta;
  switch (meta.type) {
    case 'element': {
      newMeta = transformElementMeta(meta);
      break;
    }
    case 'text': {
      newMeta = {
        type: 'text',
        text: new Function(`with(this){return String(${meta.value})}`)
      };
      break;
    }
    case 'if':
    case 'for':
    case 'for-if': {
      newMeta = {
        type: meta.type,
        directives: transformDirectives(meta.directives),
        element: templateToElement(meta.template),
        meta: transformElementMeta({
          bindings: meta.bindings,
          nodes: meta.nodes
        }),
      };
      break;
    }
    case 'component': {
      const { node: element, meta: _meta } = getComponent(meta.name);
      const bindings = transformBindings(meta.bindings);
      if (bindings) {
        Object.assign()
      }
      newMeta = {
        type: 'component',
        name: meta.name,
        element,
        meta: _meta,
        props: new Function(`with(this){return ${meta.props || {}}`),
        bindings: transformBindings(meta.bindings),
        attrs: meta.attrs ? Object.assign({}, meta.attrs) : null,
        directives: transformDirectives(meta.directives),
      };
      break;
    }
    default: break;
  }
  return newMeta;
}
