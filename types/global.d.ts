interface Window {
  immer: any
}

interface HTMLElement {
  _index: number
  _len: number
  _condition: number
  _actions: {
    [k: string]: (...a: any) => any
  }
}
