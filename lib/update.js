import { vmMap, renderComponent, renderElement } from './render.js'

/**
 *
 * meta: [
 *  element, string, function, array, object: { loop, component, normal }
 * ]
 */
function updateNode (node, meta) {
  if (meta instanceof HTMLElement || typeof meta === 'string') { // skip static node
    return
  }
  if (typeof meta === 'function') { // update text node
    const text = node.textContent
    const newText = meta.call(this) + ''
    if (text !== newText) {
      node.textContent = newText
    }
    return
  }

  if (Array.isArray(meta)) {
    updateCondition.call(this, node, meta)
    return
  }
  if (meta.loop) {
    updateList.call(this, node, meta)
    return
  }
  updateElement.call(this, node, meta)
}

function updateList (node, meta) {
  const list = meta.loop.call(this)
  const originLen = node._len || 0
  // let currentIndex
  let ctx = this
  if (!(meta.item in this)) {
    ctx = Object.create(this, {
      [window.immer.immerable]: { value: true }
    })
  }
  const updateLen = Math.min(originLen, list.length)
  let _node = node
  for (let i = 0; i < updateLen; i++) {
    ctx[meta.item] = list[i]
    if (meta.index) {
      ctx[meta.index] = i
    }
    updateElement.call(ctx, _node, meta)
    if (!i) {
      _node._len = list.length
    }
    _node = _node.nextSibling
  }
  if (originLen < list.length) { // add new element
    for (let i = originLen; i < list.length; i++) {
      ctx[meta.item] = list[i]
      if (meta.index) {
        ctx[meta.index] = i
      }
      let newNode
      if (meta.component) {
        let props = meta.props || {}
        if (typeof props === 'function') {
          props = props.call(ctx)
        }
        newNode = renderComponent(meta.component, props)
      } else {
        newNode = renderElement.call(ctx, meta)
      }
      if (_node) {
        _node.parentNode.insertBefore(newNode, _node)
      } else {
        node.parentNode.appendChild(newNode)
      }
      newNode._index = i
      if (!originLen && !i) {
        newNode._len = list.length
      }
    }
    if (node.nodeType === 8) {
      node.remove()
    }
  } else if (originLen > list.length) { // remove extra element
    _node = _node.previousSibling
    for (let i = list.length; i < originLen; i++) {
      _node.nextSibling.remove()
    }
  }
}

function updateCondition (node, meta) {
  const index = meta.findIndex((_meta, i) => {
    if (i === meta.length - 1 && !_meta.condition) return true
    return _meta.condition.call(this)
  })
  if (index === -1) {
    if (node.nodeType !== 8) {
      node.replaceWith(document.createComment('if'))
    }
  } else {
    if (index !== node._condition) {
      const newNode = renderElement.call(this, meta[index])
      newNode._condition = index
      node.replaceWith(newNode)
    } else {
      updateElement.call(this, node, meta[index])
    }
  }
}

function updateElement (element, meta) {
  if (element.nodeType === 8) {
    let node
    if (meta.component) {
      let props = meta.props || {}
      if (typeof props === 'function') {
        props = props.call(this)
      }
      node = renderComponent(meta.component, props)
    } else {
      node = renderElement.call(this, meta)
    }
    element.replaceWith(node)
    return
  }

  if (meta.component) {
    const vm = vmMap[element.dataset.componentId]
    const component = vm.constructor
    // if (vm.onPropsUpdate) {
    //   vm.onPropsUpdate(props)
    // }
    updateElement.call(vm, element, component.meta)
  } else {
    for (const [k, v] of Object.entries(meta.bindings || {})) {
      const attr = element.getAttribute(k)
      const newAttr = v.call(this) + ''
      if (newAttr !== attr) {
        element.setAttribute(k, newAttr)
      }
    }
    if (element._actions) {
      Object.entries(element._actions).forEach(([k, v]) => {
        element.removeEventListener(k, v)
      })
      element._actions = null
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
      element.addEventListener(k, handler)
      element._actions = {}
      element._actions[k] = handler
    }
    const childNodes = [...element.childNodes]
    for (let i = 0, j = 0; i < childNodes.length; j++) {
      const childNode = childNodes[i]
      const childMeta = meta.children[j]
      if (childNode._len > 1) {
        i = i + childNode._len
      } else {
        i++
      }
      updateNode.call(this, childNode, childMeta)
    }
  }
}

export default function update (vm) {
  const vmid = vm._vmid
  const element = document.querySelector(`[data-component-id="${vmid}"]`)
  const component = vm.constructor
  const meta = component.meta

  updateElement.call(vm, element, meta)
}
