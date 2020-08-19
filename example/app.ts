import MyTimer from './components/Timer'
import MyCounter from './components/Counter'
import TodoList from './components/TodoList'

export default class App {
  static components = {
    MyTimer, MyCounter, TodoList
  }
  static template = `
  <main>
    <h2>asnow example:</h2>
    <hr>
    <h3>Counter:</h3>
    <my-counter count="{3}"></my-counter>
    <hr>
    <h3>Timer:</h3>
    <my-timer></my-timer>
    <hr>
    <todo-list></todo-list>
  </main>
  `
}
