import update from '../../lib/update.js'

export default class Timer {
  constructor() {
    const date = new Date()
    this.time = date.toLocaleTimeString()
    this.markList = []
    this.stop = true
  }
  static template = `
    <h2> 
      timer: { time }
      <button @click="toggle">{ stop ? 'start' : 'stop' }</button>
      <span #if="!stop">
        <button @click="mark">mark</button>
      </span>
      <button @click="clear">clear</button>

      <ol>
        <li #for="(t, i) of markList">{t} <span style="cursor: pointer" @click="onDel(i)">×</span></li>
      </ol>
    </h2>
  `
  toggle () {
    if (this.stop) {
      this.stop = false
      this.timer = setInterval(() => {
        const date = new Date()
        this.time = date.toLocaleTimeString()
        update(this)
      }, 1000)
    } else {
      this.stop = true
      clearInterval(this.timer)
    }
    update(this)
  }
  mark () {
    this.markList.push(this.time)
    update(this)
  }
  clear () {
    this.markList = []
    update(this)
  }
  onDel (i) {
    this.markList.splice(i, 1)
    update(this)
  }
}
