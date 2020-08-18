import { update } from 'asnow'
import MyCounter from './Counter'

export default class Timer {
  time: string
  markList: {time: string, id: number}[]
  stop: boolean
  timer?: number
  constructor () {
    const date = new Date()
    this.time = date.toLocaleTimeString()
    this.markList = []
    this.stop = true
  }
  static components = { MyCounter }
  static template = `
    <div>
      time: { time }
      <button @click="toggle">{ stop ? 'start' : 'stop' }</button>
      <span #if="!stop">
        <button @click="mark">mark</button>
        <button @click="clear">clear</button>
      </span>
      <ol #if="markList.length">
        <li #for="(t, i) of markList by t.id" data-index="{i}">
          {t.time} <span style="cursor: pointer" @click="onDel(t.id)">×</span>
        </li>
      </ol>
      <p #else><i>No time records.</i></p>

      <my-counter #for="(t, i) of markList by t.id" count="{t.id}"></my-counter>
    </div>
  `
  toggle (): void {
    if (this.stop) {
      update(this, { stop: false })
      this.timer = window.setInterval(() => {
        const date = new Date()
        update(this, {
          time: date.toLocaleTimeString(),
        })
      }, 999)
    } else {
      update(this, { stop: true })
      clearInterval(this.timer)
    }
  }

  mark (): void {
    update(this, {
      markList: this.markList.concat({
        time: this.time,
        id: Math.random()
      })
    })
  }

  clear (): void {
    update(this, {
      markList: []
    })
  }

  onDel (id: number): void {
    console.log(id)
    const index = this.markList.findIndex(v => v.id === id)
    if (index === -1) {
      console.log('not find ' + id)
      return
    }
    this.markList.splice(index, 1)
    update(this, {
      markList: this.markList
    })
  }
}
