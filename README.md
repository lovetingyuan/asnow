# asnow

A simple UI library(WIP).

example: 
```javascript
class Hello {
  static template = `
  <h2>Hello world</h2>
  `
}
class Counter {
  constructor (props) {
    this.count = props.init || 0
  }
  static components = {
    'hello-world': Hello
  }
  static template = `
    <div>
      <hello-world></hello-world>
      Counter: { count } <button @click="onAdd">add</button>
    </div>
  `
  onAdd () {
    this.set(state => {
      state.count++
    })
  }
}

render(Counter, '#app')
```
