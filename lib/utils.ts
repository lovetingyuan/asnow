export function isElement(node: Node | null): node is HTMLElement {
  return !!node && (node instanceof HTMLElement || node.nodeType === 1)
}

export function isComment(node: Node): node is Comment {
  return node.nodeType === 8
}

export function isText(node: Node): node is Text {
  return node.nodeType === 3
}

export function toFunc <T>(exp: string): () => T {
  const func = new Function(`with(this) { return (${exp}) }`) as () => any // eslint-disable-line
  if (process.env.NODE_ENV === 'unit_test') {
    func.toString = () => exp
  }
  return func
}

export function isComponent (el: Node | string): boolean {
  if (typeof el === 'string') {
    return el.indexOf('-') > 0
  }
  return isElement(el) && el.tagName.indexOf('-') > 0
}

export function CamelToHyphen (name: string): string {
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
