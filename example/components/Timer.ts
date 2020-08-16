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
    <h2> 
      timer: { time }
      <button @click="toggle">{ stop ? 'start' : 'stop' }</button>
      <span #if="!stop">
        <button @click="mark">mark</button>
        <button @click="clear">clear</button>
      </span>
      <ol>
        <li #for="(t, i) of markList">{t} <span style="cursor: pointer" @click="onDel(i)">×</span></li>
      </ol>
    </h2>
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

  onDel (i) {
    console.log('del' + i)
    // this.set(state => {
    //   state.markList.splice(i, 1)
    // })
  }
}

console.log(Timer)
