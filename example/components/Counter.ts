import { update } from 'asnow'

interface Props {
  count?: number
}

export default class Counter {
  static template = `
    <div class="counter">
      <div>count: { count } 
        <button @click="handleAdd">add</button>
        <button @click="handleReset">reset</button>
      </div>
    </div>
  `
  count: number
  constructor (props: Props) {
    this.count = props.count || 0
  }
  PropsUpdate(newProps: Props, old: Props): void {
    if (newProps.count !== old.count) {
      update<Counter>(this, {
        count: newProps.count,
      })
    }
  }
  BeforeRemove(): void {
    console.log('remove')
  }

  handleAdd (): void {
    update<Counter>(this, {
      count: this.count + 1,
    })
  }

  handleReset (): void {
    update(this, { count: 0 })
  }
  AfterMount(el: HTMLElement): void {
    console.log(el)
  }
}
