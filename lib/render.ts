import compile from './compiler'
import update from './update'
import Meta, { ComponentMeta, LoopMeta, ElementMeta } from 'types/Meta'
import Component, { ParsedComponent } from 'types/Component'
import * as immer from 'immer'

export const vmMap: {
  [k: string]: any
} = {}

function isComponentMeta (v: any): v is ComponentMeta {
  return v?.component
}

function isLoopMeta (v: any): v is LoopMeta {
  return v?.loop
}

function renderNode (this: any, meta: Meta) {
  if (isComponentMeta(meta)) {
    let props = meta.props
    if (typeof props === 'function') {
      props = props.call(this)
    }
    return renderComponent(meta.component, props)
  }
  if (meta instanceof HTMLElement) {
    return meta.cloneNode(true)
  }
  if (typeof meta === 'string') {
    return document.createTextNode(meta)
  }
  if (typeof meta === 'function') { // text node
    return document.createTextNode(meta.call(this) + '')
  }

  if (Array.isArray(meta)) {
    const index = meta.findIndex((_meta, i) => {
      if (i === meta.length - 1 && !_meta.condition) return true
      return _meta.condition.call(this)
    })
    if (index === -1) {
      return document.createComment('if')
    }
    const _meta = meta[index]
    let node
    // if (_meta.component) {
    //   node = renderComponent(_meta.component, _meta.props.call(this))
    // } else {
    //   node = renderElement.call(this, _meta)
    // }
    node = renderElement.call(this, _meta)

    node._condition = index
    return node
  }
  if (isLoopMeta(meta)) {
    const list = meta.loop.call(this)
    if (!list.length) {
      return document.createComment('for')
    }
    const frag = document.createDocumentFragment()
    let ctx = this
    if (!(meta.item in this)) {
      ctx = Object.create(this, {
        [immer.immerable]: { value: true }
      })
    }
    list.forEach((item, index) => {
      ctx[meta.item] = item
      if (meta.index) {
        ctx[meta.index] = index
      }
      let node
      // if (meta.component) {
      //   node = renderComponent(meta.component, meta.props.call(ctx))
      // } else {
      //   node = renderElement.call(ctx, meta)
      // }
      node = renderElement.call(ctx, meta)

      node._index = index
      if (!index) {
        node._len = list.length
      }
      frag.appendChild(node)
    })
    return frag
  }
  if (meta.template) {
    return renderElement.call(this, meta)
  }
}

export function renderElement (this: any, meta: ElementMeta) {
  const node = meta.template.cloneNode(true) as HTMLElement
  for (const [k, v] of Object.entries(meta.bindings ?? {})) {
    node.setAttribute(k, v.call(this) + '')
  }
  for (const [k, v] of Object.entries(meta.actions ?? {})) {
    let args: any[] = []
    let name: string
    if (Array.isArray(v)) {
      args = v[1].call(this)
      name = v[0]
    } else {
      name = v
    }
    const handler = (evt: Event) => {
      return this[name](...args.concat(evt))
    }
    node.addEventListener(k, handler)
    node._actions = {}
    node._actions[k] = handler
  }
  for (const child of (meta.children ?? [])) {
    const _node = renderNode.call(this, child)
    if (_node) {
      node.appendChild(_node)
    }
  }
  return node
}

function isParsedComponent (v: any): v is typeof ParsedComponent {
  return 'meta' in v
}

export function renderComponent (component: typeof Component, props: any) {
  const vmid = component.name + '_' + Math.random()
  if (!isParsedComponent(component)) {
    const _component = component as typeof ParsedComponent
    _component.meta = compile(_component.template, _component.components)
    ;(_component as any)[immer.immerable] = true
    _component.prototype.set = function set (updater) {
      const nextState = immer.produce(this, updater)
      if (this !== nextState) {
        if (Object.prototype.hasOwnProperty.call(this, '_vmid')) {
          Object.assign(this, nextState)
        } else {
          Object.assign(Object.getPrototypeOf(this), nextState)
        }
        update(this)
      }
    }
  }
  const Component = component as typeof ParsedComponent
  const vm = new Component(props)
  Object.defineProperty(vm, '_vmid', { value: vmid })
  const node = renderElement.call(vm, Component.meta)
  // node.component = component
  node.dataset.componentId = vmid
  vmMap[vmid] = vm
  return node
}

export default function render (component: typeof Component, target: string | HTMLElement) {
  if (typeof target === 'string') {
    target = document.querySelector(target)
  }
  if (target instanceof HTMLElement) {
    target.appendChild(renderComponent(component, { count: 0 }))
  } else {
    throw new Error(`invalid target: ${target}`)
  }
}
