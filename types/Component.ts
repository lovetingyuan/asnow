import { ElementMeta } from './Meta'

export interface ComponentClass {
  new (p: any): any
  template: string
  name?: string
  components?: Record<string, ComponentClass>
}

export interface CompiledComponentClass extends ComponentClass {
  meta: ElementMeta
}

export interface VM {
  [k: string]: any
}
