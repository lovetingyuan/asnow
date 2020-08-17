import { update } from 'asnow'

export default class Counter {
  static template = `
    <div class="counter">
      <div>count: { count } 
        <button @click="handleAdd">add</button>
        <button @click="handleReset">reset</button>
      </div>
    </div>
  `
  count: 0
  list: []
  max: 1
  constructor (props) {
    this.count = props.count || 0
  }
  PropsUpdate(newProps, old) {
    console.log('update', newProps.count, old.count, newProps === old)
  }
  BeforeRemove() {
    console.log('remove')
  }

  handleAdd () {
    update(this, {
      count: this.count + 1
    })
  }

  handleReset () {
    update(this, { count: 0 })
  }
}
