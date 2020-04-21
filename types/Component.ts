import { ElementMeta } from "./Meta"

export default class Component {
  constructor (props: any) {
    return {} as any
  }
  static template: string
  static components?: {
    [k: string]: Component
  }
}

export class ParsedComponent extends Component {
  static meta: ElementMeta
  set (updater: (state: any) => any) {

  }
  [index: string]: any
}

export type ComponentsMap = {
  [k: string]: Component
}
