import compile from './compiler'
import Meta, { ComponentMeta, ElementMeta } from 'types/Meta'
import { ComponentClass, VM } from 'types/Component'
import { createLoopCtx } from './utils'

function renderNode (this: object, meta: Meta) {
  if (meta.type === 'component') {
    return renderComponent.call(this, meta)
  } else if (meta.type === 'condition') {
    const index = meta.conditions.findIndex(cd => cd.condition.call(this))
    if (index === -1) return document.createComment('if')
    const { node } = meta.conditions[index]
    let element: HTMLElement
    if (node.type === 'element') {
      element = renderElement.call(this, node)
    } else {
      element = renderComponent.call(this, node)
    }
    (element as any)._if = index
    return element
  } else if (meta.type === 'loop') {
    const list = meta.loop.call(this)
    if (!list.length) {
      return document.createComment('for')
    }
    const frag = document.createDocumentFragment()
    const node = meta.node
    for (let i = 0; i < list.length; i++) {
      const ctx = createLoopCtx.call(this, meta, list[i], i)
      const element = node.type === 'component' ? renderComponent.call(ctx, node) : renderElement.call(ctx, node)
      if (i === 0) {
        (element as any)._for = list.length
      }
      frag.appendChild(element)
    }
    return frag
  } else if (meta.type === 'element') {
    return renderElement.call(this, meta)
  } else if (meta.type === 'text') {
    if (typeof meta.text === 'string') {
      return document.createTextNode(meta.text)
    }
    return document.createTextNode(meta.text.call(this))
  }
}

export function renderElement (this: object, meta: ElementMeta): HTMLElement {
  const element = meta.element.cloneNode(true) as HTMLElement
  if (meta.bindings) {
    Object.entries(meta.bindings).forEach(([name, val]) => {
      element.setAttribute(name, val.call(this) + '')
    })
  }
  if (meta.actions) {
    const listeners = (element as any)._listeners = {} as Record<string, (e: Event) => any>
    Object.entries(meta.actions).forEach(([action, handler]) => {
      const [method, args] = handler
      const _handler = (event: Event) => {
        const _args = args ? args.call(this) : []
        _args.push(event)
        return (this as any)[method](..._args)
      }
      element.addEventListener(action, _handler)
      element.dataset.event = 'true'
      listeners[action] = _handler
    })
  }
  if (meta.children) {
    const frag = document.createDocumentFragment()
    meta.children.forEach(child => {
      const node = renderNode.call(this, child)
      node && frag.appendChild(node)
    })
    element.appendChild(frag)
  }
  return element
}

export const VMap: Map<string, VM> = new Map()
export const vmidSymbol = Symbol('vmid')
export const propsSymbol = Symbol('props')

if (process.env.NODE_ENV === 'development') {
  (window as any)._vmap = VMap
}

export function renderComponent (this: object, meta: ComponentMeta): HTMLElement {
  const Component = meta.component
  const props = meta.props.call(this)
  const vm = new Component(props)
  const vmid = (Component.name as string) + '-' + VMap.size
  vm[vmidSymbol] = vmid
  vm[propsSymbol] = props
  VMap.set(vmid, vm)
  const element = renderElement.call(vm, Component.meta)
  element.dataset.vmid = vmid
  return element
}

// render root component
export default function render (component: ComponentClass, target: string | HTMLElement) {
  if (typeof target === 'string') {
    target = document.querySelector(target) as any
  }
  if (target instanceof HTMLElement) {
    const compiledComponent = compile(component)
    target.appendChild(renderComponent.call({}, {
      type: 'component', component: compiledComponent, props: () => ({})
    }))
  } else {
    throw new Error(`invalid target: ${target}`)
  }
}
