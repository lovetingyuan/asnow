import { ElementMeta } from './Meta'

export interface ComponentClass {
  new (p: {[k: string]: unknown}): VM
  template: string
  name?: string
  components?: Record<string, ComponentClass>
}

export interface ComponentLifeCycles {
  PropsUpdate?<T>(n: T, o: T): void
  BeforeRemove?(): void
}

export interface CompiledComponentClass extends ComponentClass {
  meta: ElementMeta
}

export interface VM {
  [k: string]: unknown
}
