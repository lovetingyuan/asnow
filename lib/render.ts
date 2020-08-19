import compile from './compiler'
import Meta, { ComponentMeta, ElementMeta, ConditionMeta, LoopMeta, C_HTMLELement, L_HTMLELement, E_HTMLElement } from 'types/Meta'
import { ComponentClass, VM } from 'types/Component'

export function renderElementOrComponent (this: VM, meta: ElementMeta | ComponentMeta): HTMLElement {
  if (meta.type === 'element') {
    return renderElement.call(this, meta)
  }
  return renderComponent.call(this, meta)
}

function renderCondition (this: VM, meta: ConditionMeta): HTMLElement | Comment {
  const index = meta.conditions.findIndex(cd => cd.condition.call(this))
  if (index === -1) return document.createComment('if')
  const { node } = meta.conditions[index]
  const element = renderElementOrComponent.call(this, node)
  ;(element as C_HTMLELement)._if = index
  return element
}

function renderLoop (this: VM, meta: LoopMeta): DocumentFragment | Comment {
  const list = meta.loop.call(this)
  if (!list.length) return document.createComment('for')
  const frag = document.createDocumentFragment()
  const keys: (string | number)[] = []
  const ctx = Object.create(this)
  let _val: unknown, _index: number
  Object.defineProperty(ctx, meta.item, {
    get () { return _val }
  })
  if (meta.index) {
    Object.defineProperty(ctx, meta.index, {
      get () { return _index }
    })
  }
  list.forEach((val, index) => {
    [_val, _index] = [val, index]
    const key = meta.key ? meta.key.call(ctx) : index
    if (keys.includes(key)) throw new Error('Repeat key in #for ' + key)
    keys.push(key)
    const element = renderElementOrComponent.call(ctx, meta.node)
    if (index === 0) (element as L_HTMLELement)._for = keys
    frag.appendChild(element)
  })
  return frag
}

function renderNode (this: VM, meta: Meta) {
  if (meta.type === 'component') {
    return renderComponent.call(this, meta)
  }
  if (meta.type === 'condition') {
    return renderCondition.call(this, meta)
  }
  if (meta.type === 'loop') {
    return renderLoop.call(this, meta)
  }
  if (meta.type === 'element') {
    return renderElement.call(this, meta)
  }
  if (meta.type === 'text') {
    if (typeof meta.text === 'string') {
      return document.createTextNode(meta.text)
    }
    return document.createTextNode(meta.text.call(this))
  }
}

function renderElement (this: VM, meta: ElementMeta): HTMLElement {
  const element = meta.element.cloneNode(true) as HTMLElement
  if (element.hasAttribute('ref') && !element.dataset.ref) {
    const ref = element.getAttribute('ref')
    const vmid = this[vmidSymbol as unknown as string]
    element.dataset.ref = vmid + '_' + ref
  }
  if (meta.bindings) {
    Object.entries(meta.bindings).forEach(([name, val]) => {
      element.setAttribute(name, val.call(this) + '')
    })
  }
  if (meta.actions) {
    const listeners: E_HTMLElement['_listeners'] = (element as E_HTMLElement)._listeners = {}
    Object.entries(meta.actions).forEach(([action, handler]) => {
      const [method, args] = handler
      const _handler = (event: Event) => {
        const _args = args ? args.call(this) : []
        _args.push(event)
        if (typeof this[method] !== 'function') {
          throw new Error(`${method} is not a function at ${this.constructor.name}`)
        }
        return this[method](..._args)
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
export const eventSymbol = Symbol('event')
export const parentSymbol = Symbol('parent')

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)._vmap = VMap
  setInterval(() => {
    console.assert(VMap.size === document.querySelectorAll('[data-vmid]').length)
  }, 30)
}

let vmCount = 0

function renderComponent (this: VM, meta: ComponentMeta): HTMLElement {
  const Component = meta.component
  const props = meta.props.call(this)
  const vm = new Component(props)
  const vmid = (Component.name as string) + '-' + (vmCount++)
  vm[vmidSymbol as unknown as string] = vmid
  vm[propsSymbol as unknown as string] = props
  vm[parentSymbol as unknown as string] = this
  vm[eventSymbol as unknown as string] = meta.events
  VMap.set(vmid, vm)
  const element = renderElement.call(vm, Component.meta)
  element.dataset.vmid = vmid
  return element
}

export function getRef<T extends Record<string, HTMLElement>, RT extends keyof T>(vm: VM, refName: RT): T[RT] {
  const vmid = vm[vmidSymbol as unknown as string]
  const element = document.querySelector(`[data-vmid="${vmid}"]`) as HTMLElement
  return element.querySelector(`[data-ref="${vmid}_${refName}"]`) as T[RT]
}

export function callUp (vm: VM, eventName: string, ...args: unknown[]): unknown {
  const eventMap: {
    [k: string]: string
  } | undefined = vm[eventSymbol as unknown as string]
  if (!eventMap) return
  const method = eventMap[eventName]
  while (vm) {
    if (typeof vm[method] === 'function') {
      return vm[method](...args)
    }
    vm = vm[parentSymbol as unknown as string]
  }
}

// render root component
export default function render (component: ComponentClass, target: string | HTMLElement): void {
  if (typeof target === 'string') {
    target = document.querySelector(target) as HTMLElement
  }
  if (target instanceof HTMLElement) {
    const compiledComponent = compile(component)
    const element = renderComponent.call({}, {
      type: 'component', component: compiledComponent, props: () => ({})
    })
    target.appendChild(element)
    element.querySelectorAll('[data-vmid]').forEach((el) => {
      const vm = VMap.get((el as HTMLElement).dataset.vmid as string) as VM
      if (typeof vm.AfterMount === 'function') {
        vm.AfterMount(el)
      }
    })
  } else {
    throw new Error(`invalid target: ${target}`)
  }
}
