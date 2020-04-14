function toDom(template) {
  const div = document.createElement('div')
  const html = template.trim()
  div.innerHTML = html
  return div.firstElementChild
}

function toFunc(expression) {
  return new Function(`with(this) { return (${expression}) }`)
}

export default function compile (template, components = {}) {
  const domparser = new DOMParser()
  const doc = domparser.parseFromString(template.trim(), 'text/html')
  return parseElement(doc.body.firstElementChild, components)
}

function parseNode (node, components) {
  if (node.nodeType === 3) {
    return parseTextNode(node)
  } else if (node.nodeType === 1) {
    const component = components[node.tagName.toLowerCase()]
    if (component) {
      return parseComponent(node, component)
    }
    return parseElement(node, components)
  }
}

function parseComponent (node, component) {
  const attrs = [...node.attributes]
  let propsExpression = '{' + attrs.map(({name, value}) => {
    return `${JSON.stringify(name)}:(${value}),`
  }) + '}'
  return {
    component,
    props: toFunc(propsExpression)
  }
}

function parseTextNode (node) {
  const text = node.textContent
  if (/\{[^}]+?\}/.test(text)) {
    return toFunc('`' + text.replace(/\{/g, '${') + '`')
  } else {
    return text
  }
}

function parseElement (element, components) {
  const meta = {}
  const attrs = [...element.attributes]
  attrs.forEach(({name, value}) => {
    value = value.trim()
    if (name[0] === '@') {
      meta.actions = meta.actions || {}
      meta.actions[name.slice(1)] = value
      element.removeAttribute(name)
      return
    }

    if (name[0] === '#') {
      if (name === '#if') {
        meta.condition = toFunc(value)
        element._if = value
        meta.type = 'if'
      } else if (name === '#else') {
        let ifElement = element.previousSibling
        if (ifElement && ifElement.nodeType === 3 && !ifElement.textContent.trim()) {
          ifElement = ifElement.previousSibling
        }
        if (!ifElement || !ifElement._if) {
          throw new Error('else must be next to if')
        }
        meta.condition = toFunc(`!(${ifElement._if})`)
        meta.type = 'else'
      } else if (name === '#for') {
        const [item, list] = value.split(/ of /)
        meta.name = item
        meta.loop = toFunc(list)
      }
      element.removeAttribute(name)
      return
    }
    if (value[0] === '{' && value[value.length - 1] === '}') {
      meta.bindings = meta.bindings || {}
      meta.bindings[name] = toFunc(value.slice(1, -1))
      element.removeAttribute(name)
      return
    }
  })
  if (element.childNodes.length) {
    element.childNodes.forEach(node => {
      if (node.nodeType === 3 && !node.textContent.trim()) {
        // if (node.textContent[0] === '\n') {
        //   node.remove()
        //   return
        // }
        const [a, b] = [node.previousSibling, node.nextSibling]
        if (a && b && a.nodeType === 1 && b.nodeType === 1 && a.hasAttribute('#if') && b.hasAttribute('#else')) {
          node.remove()
        }
      }
    })
    const childrenMeta = [...element.childNodes].map(node => parseNode(node, components)).filter(Boolean)
    const children = []
    for (let i = 0; i < childrenMeta.length; i++) {
      const childMeta = childrenMeta[i]
      if (childMeta.condition) {
        const conditions = []
        if (childMeta.type === 'if') {
          conditions.push(childMeta)
          const nextChildMeta = childrenMeta[i + 1]
          if (nextChildMeta && nextChildMeta.condition && nextChildMeta.type === 'else') {
            conditions.push(nextChildMeta)
            i++
          }
          children.push(conditions)
          continue
        }
      }
      children.push(childMeta)
    }
    meta.children = children
  }
  element.innerHTML = ''
  meta.template = toDom(element.outerHTML)
  return meta
}
