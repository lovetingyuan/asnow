import {
  ParsedComponent
} from "./Component"

export interface TextMeta {
  (): string
}

export interface ElementMeta {
  template: HTMLElement
  bindings?: {
    [k: string]: () => string
  },
  actions?: {
    [k: string]: string | [string, () => any[]]
  },
  children?: Meta[]
}

export interface ConditionMeta extends ElementMeta {
  condition: () => boolean
  type: 'if' | 'elif' | 'else'
}

export interface LoopMeta extends ElementMeta {
  loop: () => any[]
  item: string
  index?: string
}

export interface ComponentMeta {
  component: ParsedComponent,
  props: { [k: string]: any } | (() => { [k: string]: any })
}

export type ConditionBlockMeta = ConditionMeta[]

export type StaticMeta = HTMLElement | string

type Meta = ElementMeta | TextMeta | StaticMeta | ConditionBlockMeta | LoopMeta | ComponentMeta

export default Meta
