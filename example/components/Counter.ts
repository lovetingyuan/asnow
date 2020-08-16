import Timer from './Timer'
import { update } from 'asnow'

export default class Counter {
  static components = {
    'my-timer': Timer
  }

  static template = `
    <div class="counter">
      <my-timer></my-timer>
      <div>counter: { count } 
        <button @click="handleAdd">add</button>
        <button @click="handleReset">reset</button>
        <!-- <ul #if="list.length">
          <p>冰雹猜想 {max}, { list.length }</p>
          <li #for="(num) of list" data-num={num} style="float: left; margin: 0 20px;">{num}</li>
        </ul> -->
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
