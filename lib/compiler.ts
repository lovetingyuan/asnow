import Component from '../types/Component'
import Meta, { ElementMeta, ConditionMeta, LoopMeta, TextMeta, StaticMeta } from 'types/Meta'

function toDom (template: string) {
  const div = document.createElement('div')
  const html = template.trim()
  div.innerHTML = html
  return div.firstElementChild
}

function toFunc (expression: string) {
  const func = new Function(`with(this) { return (${expression}) }`) // eslint-disable-line
  return func as () => any
}

export default function compile (template: string, components = {}) {
  const domparser = new DOMParser()
  const doc = domparser.parseFromString(template.trim(), 'text/html')
  if (!doc.body.firstElementChild || doc.body.firstElementChild.nodeType !== 1) {
    throw new Error(`invalid template: ${template}`)
  }
  return parseElement(doc.body.firstElementChild as HTMLElement, components)
}

function isElement (node: Node): node is HTMLElement {
  return node.nodeType === 1
}

function isText (node: Node): node is Text {
  return node.nodeType === 3
}

function parseNode (node: Node, components: { [k: string]: Component }): Meta | undefined {
  if (isText(node)) {
    return parseTextNode(node)
  } else if (isElement(node)) {
    const component = components[node.tagName.toLowerCase()]
    if (component) {
      return parseComponent(node, component)
    }
    return parseElement(node, components)
  }
}

function parseComponent (node: HTMLElement, component: Component) {
  const attrs = [...node.attributes]
  const propsExpression = '{' + attrs.map(({ name, value }) => {
    return `${JSON.stringify(name)}:(${value}),`
  }) + '}'
  return {
    component,
    props: toFunc(propsExpression)
  }
}

function parseTextNode (node: Text): TextMeta | StaticMeta {
  const text = node.textContent ?? ''
  if (/\{[^}]+?\}/.test(text)) {
    return toFunc('`' + text.replace(/\{/g, '${') + '`')
  } else {
    return text
  }
}
const eventListnerExp = /^([^(]+?)\(([^)]+?)\)$/
function parseElement (element: HTMLElement, components: { [k: string]: Component }) {
  const meta: ElementMeta | ConditionMeta | LoopMeta = {
    template: null as any
  }
  const attrs = [...element.attributes]
  attrs.forEach(({ name, value }) => {
    value = value.trim()
    if (name[0] === '@') {
      meta.actions = meta.actions ?? {}
      const actionExp = value.match(eventListnerExp)
      if (actionExp) {
        meta.actions[name.slice(1)] = [actionExp[1].trim(), toFunc('[' + actionExp[2] + ']')]
      } else {
        meta.actions[name.slice(1)] = value
      }
      element.removeAttribute(name)
      return
    }

    if (name[0] === '#') {
      if (name === '#if') {
        const _meta = meta as ConditionMeta
        _meta.condition = toFunc(value);
        (element as any)._if = value
        _meta.type = 'if'
      } else if (name === '#else') {
        const _meta = meta as ConditionMeta
        let ifElement = element.previousSibling
        if (
          ifElement?.nodeType === 3 &&
          !ifElement?.textContent?.trim()
        ) {
          ifElement = ifElement.previousSibling
        }
        if (!ifElement || !('_if' in ifElement)) {
          throw new Error('else must be next to if')
        }
        _meta.condition = toFunc(`!(${(ifElement as any)._if})`)
        _meta.type = 'else'
      } else if (name === '#for') {
        const _meta = meta as LoopMeta
        let [item, list] = value.split(/ of /).map(v => v.trim())
        let index
        if (/^\(.+\)$/.test(item)) {
          [item, index] = item.slice(1, -1).split(',').map(v => v.trim())
        }
        _meta.item = item
        if (index) {
          _meta.index = index
        }
        _meta.loop = toFunc(list)
      }
      element.removeAttribute(name)
      return
    }
    if (value[0] === '{' && value[value.length - 1] === '}') {
      meta.bindings = meta.bindings ?? {}
      meta.bindings[name] = toFunc(value.slice(1, -1))
      element.removeAttribute(name)
    }
  })
  if (element.childNodes.length) {
    element.childNodes.forEach(node => {
      if (node.nodeType === 3 && !node?.textContent?.trim()) {
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
      const childMeta: Meta = childrenMeta[i]
      if (childMeta.condition) {
        const conditions = []
        if (childMeta.type === 'if') {
          conditions.push(childMeta)
          const nextChildMeta = childrenMeta[i + 1]
          if (nextChildMeta?.condition && nextChildMeta.type === 'else') {
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
