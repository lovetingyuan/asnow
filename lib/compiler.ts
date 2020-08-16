import Meta, { ElementMeta, ConditionMeta, LoopMeta, TextMeta, ComponentMeta } from 'types/Meta'
import { ComponentClass, CompiledComponentClass } from 'types/Component'
import { isElement, isText, toFunc, isComponent, CamelToHyphen } from './utils'

export default function compile (component: ComponentClass) {
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

function parseNode (node: Node | HTMLElement[], components: Record<string, ComponentClass>): Meta {
  if (Array.isArray(node)) {
    return parseConditions(node, components)
  } else {
    if (node.nodeType === 3) {
      return parseTextNode(node as Text)
    } else if (node.nodeType === 1) {
      const element = node as HTMLElement
      if (isComponent(element)) {
        return parseComponent(element, components)
      }
      if (element.hasAttribute('#for')) {
        return parseLoop(element, components)
      }
      return parseElement(element, components)
    } else {
      throw new Error('Unknown node type: ' + node)
    }
  }
}

function parseConditions (elements: HTMLElement[], components: Record<string, ComponentClass>): ConditionMeta {
  const conditionMeta: ConditionMeta = {
    type: 'condition',
    conditions: []
  }
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    const conditionBlock: ConditionMeta['conditions'][0] = {
      type: '' as any,
      condition: null as any,
      node: null as any
    }
    if (i === 0) {
      const value = element.getAttribute('#if')?.trim()
      if (!value) throw new Error('#if can not be empty.')
      conditionBlock.type = 'if'
      conditionBlock.condition = toFunc(value);
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
      conditionBlock.condition = toFunc(value);
      element.removeAttribute('#elif')
    }
    conditionBlock.node = isComponent(element) ? parseComponent(element, components) : parseElement(element, components)
    conditionMeta.conditions.push(conditionBlock)
  }
  return conditionMeta
}

function parseComponent (node: HTMLElement, components: Record<string, ComponentClass>): ComponentMeta {
  const attrs = [...node.attributes]
  const propsExpression = '{' + attrs.map(({ name, value }) => {
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
  let [item, list] = value.split(/ of /).map(v => v.trim())
  let index: string | undefined
  if (/^\(.+\)$/.test(item)) {
    [item, index] = item.slice(1, -1).split(',').map(v => v.trim())
  }
  loopMeta.item = item
  if (index) {
    loopMeta.index = index
  }
  loopMeta.loop = toFunc(list)
  element.removeAttribute('#for')
  loopMeta.node = isComponent(element) ? parseComponent(element, components) : parseElement(element, components)
  return loopMeta
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
  const childrenMeta: Meta[] = []
  // let staticCount = 0
  const childNodes = [...element.childNodes]
  const conditionNodes: HTMLElement[] = []
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]
    if (!isElement(child) && !isText(child)) continue
    // blank, if, elif, else, other
    if (isElement(child)) {
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
        childrenMeta.push(parseNode(child, components))
      }
    } else {
      if (child.textContent?.trim()) {
        if (conditionNodes.length) {
          childrenMeta.push(parseConditions(conditionNodes.slice(), components))
          conditionNodes.length = 0
        }
        childrenMeta.push(parseTextNode(child))
      } else {
        if (!conditionNodes.length) { // else ignore blank node between condition nodes
          childrenMeta.push({
            type: 'text', static: true, text: ' '
          })
        }
      }
    }
  }
  if (conditionNodes.length) {
    childrenMeta.push(parseConditions([...conditionNodes], components))
    conditionNodes.length = 0
  }
  const meta: ElementMeta = {
    type: 'element',
    element: null as any
  }
  // if (staticCount === children.length && !actions && !bindings) {
  //   meta.element = cloneElement(element)
  //   meta.static = true
  //   return meta
  // }
  element.innerHTML = ''
  meta.element = element.cloneNode(true) as HTMLElement
  if (actions) {
    meta.actions = actions
  }
  if (bindings) {
    meta.bindings = bindings
  }
  if (childrenMeta.length) {
    meta.children = childrenMeta
  }
  return meta
}
