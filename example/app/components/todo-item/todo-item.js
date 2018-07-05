import { store } from '../../reducers/index.js';

@Component({
  name: 'todo-item',
  style: `
    .item {
      border-bottom: 1px solid gray;
      cursor: pointer;
    }
    .item--done {
      text-decoration: line-through;
    }
  `,
  template: `
    <li :class="{'item--done': props.done}" class="item">
      <span @click="onSwitchItem">{props.index}: {props.text}</span>
      <span @click="onDeleteItem">×</span>
    </li>
  `,
  props: {
    text: {
      type: String,
      required: true
    },
    done: {
      type: Boolean,
      default: false
    },
    index: Number
  }
})
export default class TodoItem {
  // constructor(props) {
  //   this.props = props;
  // }
  onDeleteItem() {
    if (window.prompt('are you sure to delete this item: ' + this.props.text)) {
      store.todoList.removeItem(this.props.index);
    }
  }
  onSwitchItem() {
    store.todoList.switchItem(this.props.index);
  }
}

// export const f = Component('asasd', function() {
//   return `<div>{props}</div>`;
// });