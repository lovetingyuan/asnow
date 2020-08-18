## asnow

A simple UI library(WIP).

example: 
```javascript
import { render, update } from 'asnow'

class HelloWorld {
  static template = `
  <h2>Hello world</h2>
  `
}

class Counter {
  constructor (props) {
    this.count = props.init || 0
  }
  static components = { HelloWorld }
  static template = `
    <div>
      <hello-world></hello-world>
      Counter: { count } <button @click="onAdd">add</button>
    </div>
  `
  onAdd () {
    update(this, {
      count: this.count + 1
    })
  }
}

render(Counter, '#app')
```
