import compile from './compiler.js'
import update from './update.js'
export const vmMap = {}

function renderNode (meta) {
  if (meta.component) {
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
    let node
    if (meta.component) {
      node = renderComponent(meta.component, meta.props.call(this))
    } else {
      node = renderElement.call(this, meta[index])
    }
    node._condition = index
    return node
  }
  if (meta.loop) {
    const list = meta.loop.call(this)
    if (!list.length) {
      return document.createComment('for')
    }
    const frag = document.createDocumentFragment()
    let currentIndex
    const ctx = Object.create(Object.getPrototypeOf(this))
    ctx.state = Object.create(this.state, {
      [meta.item]: {
        get () {
          return list[currentIndex]
        }
      },
      ...(meta.index ? {
        [meta.index]: {
          get () {
            return currentIndex
          }
        }
      } : null)
    })
    list.forEach((item, index) => {
      currentIndex = index
      let node
      if (meta.component) {
        node = renderComponent(meta.component, meta.props.call(ctx))
      } else {
        node = renderElement.call(ctx, meta)
      }
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

export function renderElement (meta) {
  const node = meta.template.cloneNode(true)
  for (const [k, v] of Object.entries(meta.bindings || {})) {
    node.setAttribute(k, v.call(this) + '')
  }
  for (const [k, v] of Object.entries(meta.actions || {})) {
    let args = []
    let name = v
    if (Array.isArray(v)) {
      args = v[1].call(this)
      name = v[0]
    }
    const handler = evt => {
      return this[name](...args.concat(evt))
    }
    node.addEventListener(k, handler)
    node._actions = {}
    node._actions[k] = handler
  }
  for (const child of (meta.children || [])) {
    node.appendChild(renderNode.call(this, child))
  }
  return node
}

export function renderComponent (component, props) {
  const vmid = component.name + '_' + Math.random()
  if (!component.meta) {
    component.meta = compile(component.template, component.components)
    component.prototype.set = function set (updater) {
      const nextState = window.immer.produce(this.state, updater)
      if (this.state !== nextState) {
        this.state = nextState
        update(this)
      }
    }
  }
  const vm = new component(props) // eslint-disable-line
  Object.defineProperty(vm, '_vmid', { value: vmid })
  const node = renderElement.call(vm, component.meta)
  node.component = component
  node.dataset.componentId = vmid
  vmMap[vmid] = vm
  return node
}

export default function render (component, target) {
  if (typeof target === 'string') {
    target = document.querySelector(target)
  }
  target.appendChild(renderComponent(component, { count: 0 }))
}
