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
    [k: string]: [string, (() => any[])?]
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
  loop: () => any[]
  item: string
  index?: string
  node: ElementMeta | ComponentMeta
}

export interface ComponentMeta {
  type: 'component'
  component: CompiledComponentClass
  props: () => { [k: string]: any }
}

// export type StaticMeta = {
//   type: 'static'
//   node: HTMLElement | string
// }

type Meta = ElementMeta | TextMeta | ConditionMeta | LoopMeta | ComponentMeta

export default Meta
