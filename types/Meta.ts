import {
  CompiledComponentClass
} from './Component'

export interface TextMeta {
  type: 'text'
  text: string | (() => string)
  static?: boolean
}

export interface ElementMeta {
  type: 'element'
  element: HTMLElement
  static?: boolean
  bindings?: {
    [k: string]: () => string
  }
  actions?: {
    [k: string]: [string, (() => unknown[])?]
  }
  children?: Meta[]
}

export interface ConditionMeta {
  type: 'condition'
  conditions: {
    type: 'else' | 'if' | 'elif'
    condition: () => boolean
    node: ElementMeta | ComponentMeta
  }[]
}

export interface LoopMeta {
  type: 'loop'
  loop: () => unknown[]
  item: string
  index?: string
  key?: () => string | number
  node: ElementMeta | ComponentMeta
}

export interface ComponentMeta {
  type: 'component'
  component: CompiledComponentClass
  props: () => { [k: string]: unknown }
}

// export type StaticMeta = {
//   type: 'static'
//   node: HTMLElement | string
// }

export interface MetaNode {
  'element': HTMLElement
  'component': HTMLElement
  'text': Text
  'condition': HTMLElement | Comment
  'loop': HTMLElement | Comment
}

export interface C_HTMLELement extends HTMLElement {
  _if: number
}
interface C_Comment extends Comment {
  _if: undefined
}

export interface L_HTMLELement extends HTMLElement {
  _for: (string | number)[]
}

interface L_Comment extends Comment {
  _for: undefined
}

export interface E_HTMLElement extends HTMLElement {
  _listeners: {
    [k: string]: (e: Event) => unknown
  }
}

export type LoopNode = L_HTMLELement | L_Comment
export type ConditionNode = C_HTMLELement | C_Comment

type Meta = ElementMeta | TextMeta | ConditionMeta | LoopMeta | ComponentMeta

export default Meta
