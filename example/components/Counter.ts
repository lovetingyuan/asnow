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

  collatz (num) {
    const list = [num]
    while (num !== 1) {
      if (num % 2) {
        num = num * 3 + 1
      } else {
        num = num / 2
      }
      list.push(num)
    }
    return list
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
