import { callUp, update, getRef } from 'asnow'

interface P {
  item: {
    content: string
    id: number
    done: boolean
  }
}

export default class TodoItem {
  static template = `
  <li>
    <input type=text #if="editing" value="{content}" ref="input">
   <span @click="mark(id)" #else style="{done ? 'text-decoration: line-through;' : ''}"> {content} </span> 
   <i @click="removeItem(id)">❌</i>
   <i @click="edit(id)">{ !editing ? '🖊' : '√' }</i>
  </li>
  `
  content: string
  id: number
  done: boolean
  editing: boolean
  constructor(props: P) {
    const item = props.item
    this.content = item.content
    this.id = item.id
    this.done = item.done
    this.editing = false
  }
  PropsUpdate(np: P): void {
    if (np.item.done !== this.done || np.item.content !== this.content) {
      update(this, {
        done: np.item.done,
        content: np.item.content
      })
    }
  }
  removeItem(id: number): void {
    callUp(this, 'remove', id)
  }
  mark(id: number): void {
    callUp(this, 'mark', id)
  }
  edit (id: number): void {
    if (this.editing) {
      const input = getRef(this, 'input') as HTMLInputElement
      const content = input.value.trim()
      update(this, {
        editing: false
      })
      callUp(this, 'edit', content, id)
    } else {
      update(this, {
        editing: true
      })
    }
  }
}
