import { VMap, vmidSymbol, renderComponent, renderElement } from './render'
import { VM, CompiledComponentClass } from 'types/Component'
import Meta, { ElementMeta, ConditionMeta, LoopMeta, ComponentMeta } from 'types/Meta'
import { isElement, isComment, isText, createLoopCtx } from './utils'

function assertNodeType(meta: Meta, node: Node) {
  let error = false
  if (meta.type === 'element' && !isElement(node)) error = true
  if (meta.type === 'component' && (!isElement(node) || !node.dataset.vmid)) error = true
  if (meta.type === 'condition') {
    if (isComment(node)) return
    if (!isElement(node) || typeof (node as any)._if !== 'number') error = true
  }
  if (meta.type === 'loop') {
    if (isComment(node)) return
    if (!isElement(node) || typeof (node as any)._for !== 'number') error = true
  }
  if (meta.type === 'text' && !isText(node)) error = true
  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(meta, node)
    throw new Error('Unmatched meta and node')
  }
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
      if (childMeta.type === 'element') {
        assertNodeType(childMeta, childNode)
        updateElement.call(this, childNode as HTMLElement, childMeta)
      } else if (childMeta.type === 'text') {
        assertNodeType(childMeta, childNode)
        if (typeof childMeta.text === 'function') {
          const oldText = childNode.textContent
          const newText = childMeta.text.call(this)
          if (oldText !== newText) childNode.textContent = newText
        }
      } else if (childMeta.type === 'component') {
        assertNodeType(childMeta, childNode)
        updateComponent.call(this, childNode as HTMLElement, childMeta)
      } else if (childMeta.type === 'condition') {
        assertNodeType(childMeta, childNode)
        updateCondition.call(this, childNode, childMeta)
      } else if (childMeta.type === 'loop') {
        assertNodeType(childMeta, childNode)
        const len = updateLoop.call(this, childNode, childMeta)
        console.log(len)
        j += len - 1
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
  components.forEach((el) => {
    const vmid = el.dataset.vmid
    if (!vmid || !VMap.has(vmid)) throw new Error(`vmid ${vmid} in document but not in vmmap`)
    const vm = VMap.get(vmid) as VM
    if (typeof vm.BeforeRemove === 'function') {
      vm.BeforeRemove()
    }
  })
  listeners.forEach((el) => {
    const listenersMap: Record<string, (e: Event) => any> = (el as any)._listeners
    Object.entries(listenersMap).forEach(([action, handler]) => {
      el.removeEventListener(action, handler)
    })
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
  if (!vm) {
    throw new Error(`Can not find vm instance of ${vmid}`)
  }
  const newProps = meta.props.call(this)
  if (typeof vm.PropsUpdate === 'function') {
    vm.PropsUpdate(newProps)
  }
}

function renderElementOrComponent(this: VM, meta: ElementMeta | ComponentMeta): HTMLElement {
  if (meta.type === 'element') {
    return renderElement.call(this, meta)
  }
  return renderComponent.call(this, meta)
}

function updateELementOrComponent(this: VM, element: HTMLElement, meta: ElementMeta | ComponentMeta) {
  if (meta.type === 'element') {
    updateElement.call(this, element, meta)
  } else {
    updateComponent.call(this, element, meta)
  }
}

function updateCondition(this: VM, childNode: ChildNode, childMeta: ConditionMeta) {
  const targetIndex = childMeta.conditions.findIndex(({ condition }) => condition.call(this))
  if (targetIndex === -1) {
    if (isComment(childNode)) return
    cleanElement(childNode as HTMLElement, document.createComment('if'))
  } else {
    const conditionBlock = childMeta.conditions[targetIndex]
    const conditionMeta = conditionBlock.node
    if (isComment(childNode)) {
      const element = renderElementOrComponent.call(this, conditionMeta)
        ; (element as any)._if = targetIndex
      childNode.replaceWith(element)
    } else {
      const element = childNode as HTMLElement
      if ((element as any)._if === targetIndex) {
        updateELementOrComponent.call(this, element, conditionMeta)
      } else {
        const newElement = renderElementOrComponent.call(this, conditionMeta)
          ; (newElement as any)._if = targetIndex
        cleanElement(element, newElement)
      }
    }
  }
}

function updateLoop(this: VM, childNode: ChildNode, childMeta: LoopMeta): number {
  const list = childMeta.loop.call(this)
  if (list.length === 0) {
    if (isComment(childNode)) return 1
    const element = childNode as HTMLElement
    const prevLen = (element as any)._for as number
    let i = prevLen
    while (--i) {
      const el = element.nextElementSibling
      if (!el) throw new Error('Error in #for update')
      cleanElement(el as HTMLElement, true)
    }
    cleanElement(element, document.createComment('for'))
    return prevLen
  }
  if (isComment(childNode)) {
    const frag = document.createDocumentFragment()
    list.forEach((val, index) => {
      const ctx = createLoopCtx.call(this, childMeta, val, index)
      const element = renderElementOrComponent.call(ctx, childMeta.node)
      if (index === 0) (element as any)._for = list.length
      frag.appendChild(element)
    })
    childNode.insertBefore(frag, childNode)
    childNode.remove()
    return 1
  }
  if (!isElement(childNode)) throw new Error('#for node must be element')
  const prevLen = (childNode as any)._for as number
  const updateLen = Math.min(prevLen, list.length)
  let element = childNode, i = 0, parent = childNode.parentElement
  for (; i < updateLen; i++) {
    if (!element) throw new Error('error in #for update')
    const ctx = createLoopCtx.call(this, childMeta, list[i], i)
    updateELementOrComponent.call(ctx, element, childMeta.node)
    if (i === 0) (element as any)._for = list.length
    element = element.nextElementSibling as HTMLElement
  }
  if (prevLen < list.length) { // need to add new element
    const frag = document.createDocumentFragment()
    for (; i < list.length; i++) {
      const ctx = createLoopCtx.call(this, childMeta, list[i], i)
      const el = renderElementOrComponent.call(ctx, childMeta.node)
      frag.appendChild(el)
    }
    if (element) {
      element.insertBefore(frag, element)
    } else {
      parent?.appendChild(frag)
    }
  } else if (prevLen > list.length) { // need to remove element
    if (!element) throw new Error('Error in #for update')
    for (; i < prevLen - 1; i++) {
      const el = element.nextElementSibling as HTMLElement
      if (!el) throw new Error('Error in #for update')
      cleanElement(el, true)
    }
    cleanElement(element, true)
  }
  return prevLen
}

export default function update(vm: VM, newState?: { [k: string]: any }) {
  const newVm = Object.assign(vm, newState)
  const vmid = vm[vmidSymbol as any] as string
  const element = document.querySelector(`[data-vmid="${vmid}"]`)
  if (!element) {
    throw new Error('Failed to update ' + vmid)
  }
  const component = vm.constructor as CompiledComponentClass
  const meta = component.meta

  updateElement.call(newVm, element as HTMLElement, meta)
}
