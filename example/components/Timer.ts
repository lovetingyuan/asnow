import { update } from 'asnow'

export default class Timer {
  time: string
  markList: string[]
  stop: boolean
  timer?: any
  constructor () {
    const date = new Date()
    this.time = date.toLocaleTimeString()
    this.markList = [
      'init 1', 'init 2'
    ]
    this.stop = true
  }

  static template = `
    <div> 
      time: { time }
      <button @click="toggle">{ stop ? 'start' : 'stop' }</button>
      <span #if="!stop">
        <button @click="mark">mark</button>
        <button @click="clear">clear</button>
      </span>
      <ol #if="markList.length">
        <li #for="(t, i) of markList" data-index="{i}">{t} <span style="cursor: pointer" @click="onDel(i)">×</span></li>
      </ol>
      <p #else><i>No time records.</i></p>
    </div>
  `
  toggle () {
    if (this.stop) {
      update(this, { stop: false })
      this.timer = setInterval(() => {
        const date = new Date()
        update(this, {
          time: date.toLocaleTimeString()
        })
      }, 999)
    } else {
      update(this, { stop: true })
      clearInterval(this.timer)
    }
  }

  mark () {
    update(this, {
      markList: this.markList.concat(this.time)
    })
  }

  clear () {
    update(this, {
      markList: []
    })
  }

  onDel (i: number) {
    this.markList.splice(i, 1)
    update(this, {
      markList: this.markList
    })
  }
}
