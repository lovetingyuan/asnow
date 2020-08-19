import { ElementMeta } from './Meta'

export interface ComponentLifeCycles {
  PropsUpdate?<T>(n: T, o: T): void
  AfterMount?(el: HTMLElement): void
  BeforeRemove?(): void
}

export interface ComponentClass extends ComponentLifeCycles {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (p: any): VM
  template: string
  name?: string
  components?: Record<string, ComponentClass>
}

// export abstract class ComponentClass<P = Record<string, unknown>> {
//   static template: string
//   static components?: Record<string, ComponentClass>;
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   constructor (props: Readonly<P>) {}
//   PropsUpdate?(a: P, b: P): void
// }

export interface CompiledComponentClass extends ComponentClass {
  meta: ElementMeta
}

export interface VM {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any
}
