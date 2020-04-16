import Timer from './Timer.js'

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
        
        <ul>
          <p>冰雹猜想</p>
          <li #for="(num) of list" data-num={num} style="float: left; margin: 0 20px;">{num}</li>
        </ul>
      </div>
    </div>
  `
  constructor (props) {
    this.state = {
      count: props.count || 0,
      list: [1, 2, 3]
    }
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
    this.set(state => {
      state.count++
      state.list = this.collatz(state.count)
    })
  }

  handleReset () {
    this.set(state => {
      state.count = 0
      state.list = []
    })
  }
}
