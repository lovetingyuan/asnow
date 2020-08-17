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

export function toFunc (exp: string) {
  const func = new Function(`with(this) { return (${exp}) }`) as () => any // eslint-disable-line
  if (process.env.NODE_ENV === 'unit_test') {
    func.toString = () => exp
  }
  return func
}

export function isComponent (el: Node | string) {
  if (typeof el === 'string') {
    return el.indexOf('-') > 0
  }
  return isElement(el) && el.tagName.indexOf('-') > 0
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

function diffTwoLists (list1: string[], list2: string[]) {
  // 1,3,4,5 7
  // 1 3 5 6
}
