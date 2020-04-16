export default class Timer {
  constructor() {
    const date = new Date()
    this.state = {
      time: date.toLocaleTimeString(),
      markList: [],
      stop: true
    }
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
    if (this.state.stop) {
      this.set(state => {
        state.stop = false
      })
      this.timer = setInterval(() => {
        const date = new Date()
        this.set(state => {
          state.time = date.toLocaleTimeString()
        })
      }, 999)
    } else {
      this.set(state => {
        state.stop = true
      })
      clearInterval(this.timer)
    }
  }
  mark () {
    this.set(state => {
      state.markList.push(state.time)
    })
  }
  clear () {
    this.set(state => {
      state.markList = []
    })
  }
  onDel (i) {
    this.set(state => {
      state.markList.splice(i, 1)
    })
  }
}
