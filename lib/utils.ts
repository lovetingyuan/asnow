import { VM } from 'types/Component'
import { LoopMeta } from 'types/Meta'

export function isElement(node: Node | null): node is HTMLElement {
  return !!node && (node instanceof HTMLElement || node.nodeType === 1)
}

export function isComment(node: Node): node is Comment {
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

export function isComponent (el: HTMLElement | string) {
  if (typeof el === 'string') {
    return el.indexOf('-') > 0
  }
  return el.tagName.indexOf('-') > 0
}

export function CamelToHyphen (name: string) {
  const cname = [name[0].toLowerCase()]
  for (let i = 1; i < name.length; i++) {
    if (/[A-Z]/.test(name[i])) {
      cname.push('-')
      cname.push(name[i].toLowerCase())
    } else {
      cname.push(name[i])
    }
  }
  return cname.join('')
}
