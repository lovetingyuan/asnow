'use babel';
import template from './todo-list.html';
import Component from '../../../../runtime/component.js';
import ListItem from '../list-item/index.js';
import EmptyStr from '../empty-str/index.js';

@Component({
  name: 'my-comp',
  template,
  components: { ListItem, EmptyStr }
})
export default class MyComp {
  get displayEvents() {
    switch(this.filterType) {
      case 'done': {
        return this.events.filter(v => v.done);
      }
      case 'todo': {
        return this.events.filter(v => !v.done);
      }
      default: {
        return this.events;
      }
    }
  }
  events = Array(10).fill().map((v, i) => {
    return {
      text: Array(10).fill(i + 1).join(''),
      id: Math.random()
    };
  });
  filters = ['all', 'todo', 'done'];
  filterType = 'all';
  removeEvent(id) {
    this.events = this.events.filter(v => v.id !== id);
    this.$render();
  }
  switchDone(id) {
    const index = this.events.findIndex(v => v.id === id);
    const event = this.events[index];
    this.events[index] = {
      ...event,
      done: !event.done
    };
    this.$render();
  }
  addEvent() {
    const input = this.$el.querySelector('input[type="text"]');
    const text = input.value.trim();
    if (text) {
      this.events.push({text, id: Math.random()});
      this.$render();
      input.value = '';
    }
  }
  onFilter(e) {
    this.filterType = e.target.value;
    this.$render();
  }
}
