import TodoItem from './TodoItem'
import { update, getRef } from 'asnow'

interface RefMap {
  foo: HTMLInputElement
  [k: string]: HTMLElement
}

export default class TodoList {
  static components = { TodoItem }
  static template = `
  <div>
    Todo list:
    <input type="text" ref="foo">
    <input type="button" value="add" @click="onAdd">
    <ol #if="list.length">
      <todo-item #for="item of list by item.id" item="{item}" @remove="onRemove" @mark="onMark" @edit="onEdit"></todo-item>
    </ol>
    <p #else>empty list.</p>
  </div>
  `
  list: { content: string, id: number, done: boolean }[] = []

  onAdd (): void {
    const input = getRef<RefMap, 'foo'>(this, 'foo')
    const content = input.value.trim()
    if (!content) return
    this.list.push({
      id: Math.random(), content, done: false
    })
    input.value = ''
    update(this)
  }
  onRemove (id: number): void {
    const index = this.list.findIndex(v => v.id === id)
    if (index >= 0) {
      this.list.splice(index, 1)
      update(this)
    }
  }
  onMark (id: number): void {
    const item = this.list.find(v => v.id === id)
    if (item) {
      item.done = !item.done
      update(this)
    }
  }
  onEdit(newContent: string, id: number): void {
    const item = this.list.find(v => v.id === id)
    if (item) {
      item.content = newContent
      update(this)
    }
  }
}
