import { VM } from 'types/Component'
import { LoopMeta } from 'types/Meta'

export function isElement(node: Node): node is HTMLElement {
  return node instanceof HTMLElement || node.nodeType === 1
}

export function isComment(node: Node) {
  return node.nodeType === 8
}

export function isText(node: Node): node is Text {
  return node.nodeType === 3
}

export function createLoopCtx(this: VM, meta: LoopMeta, item: any, index: number) {
  const ctx = Object.create(this)
  ctx[meta.item] = item
  if (meta.index) {
    ctx[meta.index] = index
  }
  return ctx
}

export function toFunc (expression: string) {
  return new Function(`with(this) { return (${expression}) }`) as () => any // eslint-disable-line
}

export function isComponent (el: HTMLElement) {
  return el.tagName.indexOf('-') > 0
}
