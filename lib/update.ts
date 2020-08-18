import { VMap, vmidSymbol, propsSymbol, renderElementOrComponent } from './render'
import { VM, CompiledComponentClass } from 'types/Component'
import Meta, { ElementMeta, ConditionMeta, LoopMeta, ComponentMeta, L_HTMLELement, LoopNode, C_HTMLELement, E_HTMLElement } from 'types/Meta'
import { isElement, isComment, isText } from './utils'

function assertNodeType (meta: Meta, node: Node) {
  if (meta.type === 'element' && isElement(node)) return node
  if (meta.type === 'component' && isElement(node) && node.dataset.vmid) return node
  if (meta.type === 'condition') {
    if (isComment(node)) return node
    if (isElement(node) && typeof (node as C_HTMLELement)._if === 'number') return node
  }
  if (meta.type === 'loop') {
    if (isComment(node)) return node
    if (isElement(node) && Array.isArray((node as L_HTMLELement)._for)) return node
  }
  if (meta.type === 'text' && isText(node)) return node
  if (process.env.NODE_ENV === 'development') console.error(meta, node)
  throw new Error('Unmatched meta and node')
}

function updateElement(this: VM, element: HTMLElement, meta: ElementMeta) {
  if (meta.bindings) { // update attributes
    Object.entries(meta.bindings).forEach(([name, val]) => {
      const oldVal = element.getAttribute(name)
      const newVal = val.call(this)
      if (newVal !== oldVal) element.setAttribute(name, newVal)
    })
  }
  if (meta.children) { // update childNodes
    const childNodes = [...element.childNodes]
    for (let i = 0, j = 0; i < meta.children.length; i++, j++) {
      const childMeta = meta.children[i]
      const childNode = childNodes[j]
      assertNodeType(childMeta, childNode)
      if (childMeta.type === 'element') {
        updateElement.call(this, childNode as HTMLElement, childMeta)
      } else if (childMeta.type === 'text') {
        if (typeof childMeta.text === 'function') {
          const oldText = childNode.textContent
          const newText = childMeta.text.call(this)
          if (oldText !== newText) childNode.textContent = newText
        }
      } else if (childMeta.type === 'component') {
        updateComponent.call(this, childNode as HTMLElement, childMeta)
      } else if (childMeta.type === 'condition') {
        assertNodeType(childMeta, childNode)
        updateCondition.call(this, childNode as HTMLElement | Comment, childMeta)
      } else if (childMeta.type === 'loop') {
        const node = childNode as LoopNode
        j += (node._for?.length || 1) - 1
        updateLoop.call(this, node, childMeta)
      }
    }
  }
}

// remove event listeners and components
function cleanElement(element: HTMLElement, remove: true | HTMLElement | Comment) {
  const components = [...element.querySelectorAll('[data-vmid]')] as HTMLElement[]
  const listeners = [...element.querySelectorAll('[data-event]')] as HTMLElement[]
  if (element.dataset.vmid) components.push(element)
  if (element.dataset.event) listeners.push(element)
  listeners.forEach((el) => {
    const listenersMap = (el as E_HTMLElement)._listeners
    Object.entries(listenersMap).forEach(([action, handler]) => {
      el.removeEventListener(action, handler)
    })
  })
  components.forEach((el) => {
    const vmid = el.dataset.vmid
    if (!vmid || !VMap.has(vmid)) throw new Error(`vmid ${vmid} in document but not in vmmap`)
    const vm = VMap.get(vmid) as VM
    if (typeof vm.BeforeRemove === 'function') {
      vm.BeforeRemove()
    }
    VMap.delete(vmid)
  })
  if (remove === true) {
    element.remove()
  } else {
    element.replaceWith(remove)
  }
}

function updateComponent(this: VM, element: HTMLElement, meta: ComponentMeta) {
  const vmid = element.dataset.vmid as string
  const vm = VMap.get(vmid)
  if (!vm) throw new Error(`Can not find vm instance of ${vmid}`)
  const newProps = meta.props.call(this)
  if (typeof vm.PropsUpdate === 'function') {
    vm.PropsUpdate(newProps, vm[propsSymbol as unknown as string])
  }
}

function updateELementOrComponent(this: VM, element: HTMLElement, meta: ElementMeta | ComponentMeta) {
  if (meta.type === 'element') {
    updateElement.call(this, element, meta)
  } else {
    updateComponent.call(this, element, meta)
  }
}

function updateCondition(this: VM, childNode: HTMLElement | Comment, childMeta: ConditionMeta) {
  const targetIndex = childMeta.conditions.findIndex(({ condition }) => condition.call(this))
  if (targetIndex === -1) {
    if (isComment(childNode)) return
    cleanElement(childNode, document.createComment('if'))
    return
  }
  const conditionBlock = childMeta.conditions[targetIndex]
  const conditionMeta = conditionBlock.node
  if (isComment(childNode)) {
    const element = renderElementOrComponent.call(this, conditionMeta)
      ; (element as C_HTMLELement)._if = targetIndex
    childNode.replaceWith(element)
    if (element.dataset.vmid) {
      const vm = VMap.get(element.dataset.vmid) as VM
      if (typeof vm.AfterMount === 'function') {
        vm.AfterMount(element)
      }
    }
  } else {
    if ((childNode as C_HTMLELement)._if === targetIndex) {
      updateELementOrComponent.call(this, childNode, conditionMeta)
    } else {
      const newElement = renderElementOrComponent.call(this, conditionMeta)
        ; (newElement as C_HTMLELement)._if = targetIndex
      cleanElement(childNode, newElement)
      if (newElement.dataset.vmid) {
        const vm = VMap.get(newElement.dataset.vmid) as VM
        if (typeof vm.AfterMount === 'function') {
          vm.AfterMount(newElement)
        }
      }
    }
  }
}

function updateLoop(this: VM, childNode: HTMLElement | Comment, childMeta: LoopMeta) {
  const list = childMeta.loop.call(this)
  const parent = childNode.parentElement
  if (!parent) throw new Error('Error in #for update, no parent element.')
  if (list.length === 0) {
    if (isComment(childNode)) return
    let prevLen = (childNode as L_HTMLELement)._for.length as number
    while (--prevLen) {
      const el = childNode.nextSibling
      if (!isElement(el)) throw new Error('Error in #for update')
      cleanElement(el as HTMLElement, true)
    }
    cleanElement(childNode, document.createComment('for'))
    return
  }
  if (isComment(childNode)) {
    const frag = document.createDocumentFragment()
    const keys: (string | number)[] = []
    const ctx = Object.create(this)
    let _val: unknown, _index: number
    Object.defineProperty(ctx, childMeta.item, {
      get () { return _val }
    })
    if (childMeta.index) {
      Object.defineProperty(ctx, childMeta.index, {
        get () { return _index }
      })
    }
    list.forEach((val, index) => {
      [_val, _index] = [val, index]
      const key = childMeta.key ? childMeta.key.call(ctx) : index
      if (keys.includes(key)) throw new Error('Repeat key in #for ' + key)
      keys.push(key)
      const element = renderElementOrComponent.call(ctx, childMeta.node)
      if (index === 0) (element as L_HTMLELement)._for = keys
      frag.appendChild(element)
    })
    const newNodes = [...frag.childNodes] as HTMLElement[]
    parent.insertBefore(frag, childNode)
    if (newNodes[0].dataset.vmid) {
      newNodes.forEach(el => {
        const vm = VMap.get(el.dataset.vmid as string) as VM
        if (typeof vm.AfterMount === 'function') {
          vm.AfterMount(el)
        }
      })
      newNodes.length = 0
    }
    childNode.remove()
    return
  }
  const prevKeys = (childNode as L_HTMLELement)._for as (string | number)[]
  const currentElementsMap: Record<string | number, HTMLElement> = {}
  let element: Node | null = childNode
  for (const key of prevKeys) {
    if (!isElement(element)) throw new Error('Error in #for update, node is not element.')
    if (key in currentElementsMap) throw new Error('Repeat key in #for: ' + key)
    currentElementsMap[key] = element
    element = element.nextSibling
  }
  const lastElement: Node | null = element
  element = childNode
  const newKeys: (string | number)[] = []
  const ctx = Object.create(this)
  let _val: unknown, _index: number
  Object.defineProperty(ctx, childMeta.item, {
    get () { return _val }
  })
  if (childMeta.index) {
    Object.defineProperty(ctx, childMeta.index, {
      get () { return _index }
    })
  }
  list.forEach((val, index) => {
    [_val, _index] = [val, index]
    const key = childMeta.key ? childMeta.key.call(ctx) : index
    if (newKeys.includes(key)) throw new Error('Repeat key in #for: ' + key)
    newKeys.push(key)
    let el = currentElementsMap[key]
    if (el) {
      if (el === element) {
        if (index === 0) (element as L_HTMLELement)._for = newKeys
        updateELementOrComponent.call(ctx, element as HTMLElement, childMeta.node)
        element = element.nextSibling as HTMLElement
        return
      }
    } else {
      el = renderElementOrComponent.call(ctx, childMeta.node)
    }
    if (index === 0) (el as L_HTMLELement)._for = newKeys
    parent.insertBefore(el, element)
    if (!currentElementsMap[key] && el.dataset.vmid) {
      const vm = VMap.get(el.dataset.vmid) as VM
      if (typeof vm.AfterMount === 'function') {
        vm.AfterMount(el)
      }
    }
  })
  while (element !== lastElement) {
    const el = element
    if (!isElement(element)) throw new Error('Error in #for update, node is not element.')
    element = element.nextSibling
    cleanElement(el as HTMLElement, true)
  }
  // const prevLen = (childNode as any)._for as number
  // const updateLen = Math.min(prevLen, list.length)
  // let element: Node | null = childNode, i = 0
  // for (; i < updateLen; i++) {
  //   if (!isElement(element)) throw new Error('Error in #for update, node is not element.')
  //   const ctx = createLoopCtx.call(this, childMeta, list[i], i)
  //   updateELementOrComponent.call(ctx, element, childMeta.node)
  //   if (i === 0) (element as any)._for = list.length
  //   element = element.nextSibling
  // }
  // if (prevLen < list.length) { // need to add new element
  //   const frag = document.createDocumentFragment()
  //   for (; i < list.length; i++) {
  //     const ctx = createLoopCtx.call(this, childMeta, list[i], i)
  //     const el = renderElementOrComponent.call(ctx, childMeta.node)
  //     frag.appendChild(el)
  //   }
  //   if (element) {
  //     parent.insertBefore(frag, element)
  //   } else {
  //     parent.appendChild(frag)
  //   }
  // } else if (prevLen > list.length) { // need to remove element
  //   if (!isElement(element)) throw new Error('Error in #for update, node is not element.')
  //   for (; i < prevLen - 1; i++) {
  //     const el = element.nextSibling
  //     if (!isElement(el)) throw new Error('Error in #for update, node is not element.')
  //     cleanElement(el, true)
  //   }
  //   cleanElement(element, true)
  // }
}

export default function update<T extends VM, NT = Partial<T>>(vm: T, newState?: NT): void {
  const newVm = Object.assign(vm, newState)
  const vmid = vm[vmidSymbol as unknown as string] as string
  const element = document.querySelector(`[data-vmid="${vmid}"]`)
  if (!isElement(element)) {
    throw new Error('Failed to update ' + vmid)
  }
  const component = vm.constructor as CompiledComponentClass
  const meta = component.meta

  updateElement.call(newVm, element, meta)
}
