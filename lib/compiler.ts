import Meta, { ElementMeta, ConditionMeta, LoopMeta, TextMeta, ComponentMeta } from 'types/Meta'
import { ComponentClass, CompiledComponentClass } from 'types/Component'
import { isElement, isText, toFunc, isComponent, CamelToHyphen } from './utils'

export default function compile (component: ComponentClass): CompiledComponentClass {
  if ('meta' in component) return component as CompiledComponentClass
  const domparser = new DOMParser()
  const doc = domparser.parseFromString(component.template.trim(), 'text/html')
  if (!doc.body.firstElementChild || doc.body.firstElementChild.nodeType !== 1) {
    throw new Error(`Invalid template of component ${component.name}`)
  }
  if (doc.body.childNodes.length !== 1) {
    throw new Error('Component template must only have one root element.' + component.name)
  }
  const componentsMap = component.components || {}
  Object.keys(componentsMap).forEach(name => {
    if (!isComponent(name)) {
      const comp = componentsMap[name]
      delete componentsMap[name]
      componentsMap[CamelToHyphen(name)] = comp
    }
  })
  component.components = componentsMap
  const meta = parseElement(doc.body.firstElementChild as HTMLElement, componentsMap)
  const compiledComponent = component as CompiledComponentClass
  compiledComponent.meta = meta
  return compiledComponent
}

function parseElementOrComponent (element: HTMLElement, components: Record<string, ComponentClass>) {
  return isComponent(element) ? parseComponent(element, components) : parseElement(element, components)
}

function parseConditions (elements: HTMLElement[], components: Record<string, ComponentClass>): ConditionMeta {
  const conditionMeta: ConditionMeta = {
    type: 'condition',
    conditions: []
  }
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    const conditionBlock: ConditionMeta['conditions'][0] = {
      type: '',
      condition: null,
      node: null
    } as unknown as  ConditionMeta['conditions'][0]
    if (i === 0) {
      const value = element.getAttribute('#if')?.trim()
      if (!value) throw new Error('#if can not be empty.')
      conditionBlock.type = 'if'
      conditionBlock.condition = toFunc(`!!(${value})`)
      element.removeAttribute('#if')
    } else if (i === elements.length - 1 && element.hasAttribute('#else')) {
      const value = element.getAttribute('#else')?.trim()
      if (value) throw new Error('#else must be empty.')
      conditionBlock.type = 'else'
      conditionBlock.condition = () => true
      element.removeAttribute('#else')
    } else { // elif
      const value = element.getAttribute('#elif')?.trim()
      if (!value) throw new Error('#elif can not be empty.')
      conditionBlock.condition = toFunc(`!!(${value})`)
      element.removeAttribute('#elif')
    }
    conditionBlock.node = parseElementOrComponent(element, components)
    conditionMeta.conditions.push(conditionBlock)
  }
  return conditionMeta
}

function parseComponent (node: HTMLElement, components: Record<string, ComponentClass>): ComponentMeta {
  const attrs = [...node.attributes]
  const propsExpression = '{' + attrs.map(({ name, value }) => {
    value = value.trim()
    if (value[0] === '{' && value[value.length - 1] === '}') {
      value = value.slice(1, -1)
    } else {
      value = JSON.stringify(value)
    }
    return `${JSON.stringify(name)}:(${value}),`
  }) + '}'
  const tagName = node.tagName.toLowerCase()
  if (!components[tagName]) {
    throw new Error(`component ${tagName} can not be resolved.`)
  }
  return {
    type: 'component',
    component: compile(components[tagName]),
    props: toFunc(propsExpression)
  }
}

function parseTextNode (node: Text): TextMeta {
  const text = node.textContent ?? ''
  const isStatic = !/\{[^}]+?\}/.test(text)
  return {
    type: 'text',
    text: isStatic ? text : toFunc('`' + text.replace(/\{/g, '${') + '`'),
    static: isStatic
  }
}

function parseLoop (element: HTMLElement, components: Record<string, ComponentClass>): LoopMeta {
  const loopMeta = {
    type: 'loop',
    loop: null,
    item: null,
    node: null
  } as unknown as LoopMeta
  const value = element.getAttribute('#for')?.trim()
  if (!value) throw new Error('#for can not be empty.')
  const forExps = value.split(/ +(of|by) +/).map(v => v.trim()).filter(Boolean)
  if (forExps.length !== 3 && forExps.length !== 5) {
    throw new Error('Invalid #for value: ' + value)
  }
  const item = forExps[0]
  const list = forExps[2]
  const key = forExps[4]
  if (/^\(.+\)$/.test(item)) {
    const _item = item.slice(1, -1).split(',').map(v => v.trim()).filter(Boolean)
    if (_item.length > 2) throw new Error('Invalid #for value: ' + value)
    loopMeta.item = _item[0]
    if (_item[1]) loopMeta.index = _item[1]
  } else {
    loopMeta.item = item
  }
  if (key) {
    loopMeta.key = toFunc(key)
  }
  loopMeta.loop = toFunc(list)
  element.removeAttribute('#for')
  loopMeta.node = parseElementOrComponent(element, components)
  return loopMeta
}

function parseChildren(childNodes: ChildNode[], components: Record<string, ComponentClass>) {
  const childrenMeta: Meta[] = []
  const conditionNodes: HTMLElement[] = []
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]
    if (!isElement(child) && !isText(child)) continue
    // blank, if, elif, else, other
    if (isElement(child)) { // handle directives at first
      if (child.hasAttribute('#if')) {
        if (conditionNodes.length) {
          childrenMeta.push(parseConditions([...conditionNodes], components))
          conditionNodes.length = 0
        }
        conditionNodes.push(child)
      } else if (child.hasAttribute('#elif')) {
        if (conditionNodes.length) {
          conditionNodes.push(child)
        } else {
          throw new Error('#elif must be next to #if')
        }
      } else if (child.hasAttribute('#else')) {
        if (conditionNodes.length) {
          conditionNodes.push(child)
          childrenMeta.push(parseConditions([...conditionNodes], components))
          conditionNodes.length = 0
        } else {
          throw new Error('#else must be next to #if or #elif')
        }
      } else {
        if (conditionNodes.length) {
          childrenMeta.push(parseConditions([...conditionNodes], components))
          conditionNodes.length = 0
        }
        if (child.hasAttribute('#for')) {
          childrenMeta.push(parseLoop(child, components))
        } else {
          childrenMeta.push(parseElementOrComponent(child, components))
        }
      }
    } else if (isText(child)) {
      if (child.textContent?.trim()) {
        if (conditionNodes.length) {
          childrenMeta.push(parseConditions(conditionNodes.slice(), components))
          conditionNodes.length = 0
        }
        childrenMeta.push(parseTextNode(child))
      } else if (!conditionNodes.length) { // else ignore blank node between condition nodes
        childrenMeta.push({
          type: 'text', static: true, text: ' '
        })
      }
    }
  }
  if (conditionNodes.length) {
    childrenMeta.push(parseConditions([...conditionNodes], components))
    conditionNodes.length = 0
  }
  return childrenMeta
}

function parseElement (element: HTMLElement, components: Record<string, ComponentClass>): ElementMeta {
  const eventListnerExp = /^([^(]+?)\(([^)]+?)\)$/
  let actions: ElementMeta['actions']
  let bindings: ElementMeta['bindings']
  const attrs = [...element.attributes]
  attrs.forEach(({ name, value }) => {
    value = value.trim()
    if (name[0] === '@') {
      actions = actions || {}
      const actionExp = value.match(eventListnerExp)
      if (actionExp) {
        actions[name.slice(1)] = [actionExp[1].trim(), toFunc('[' + actionExp[2] + ']')]
      } else {
        actions[name.slice(1)] = [value]
      }
      element.removeAttribute(name)
      return
    }
    if (value[0] === '{' && value[value.length - 1] === '}') {
      bindings = bindings || {}
      bindings[name] = toFunc(value.slice(1, -1))
      element.removeAttribute(name)
      return
    }
  })
  const meta = {
    type: 'element',
    element: null
  } as unknown as ElementMeta
  const childrenMeta = parseChildren([...element.childNodes], components)
  const isChildrenStatic = childrenMeta.every(m => ('static' in m) && m.static)
  if (actions) {
    meta.actions = actions
  }
  if (bindings) {
    meta.bindings = bindings
  }
  if (!isChildrenStatic) {
    meta.children = childrenMeta
    element.innerHTML = ''
  }
  if (isChildrenStatic && !actions && !bindings) {
    meta.static = true
  }
  meta.element = element.cloneNode(true) as HTMLElement
  return meta
}
