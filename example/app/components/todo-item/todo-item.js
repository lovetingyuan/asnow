import { store } from '../../reducers/index.js';

@Component({
  name: 'todo-item',
  template: `
    <li :class="{'item--done': props.done}" style="cursor: pointer;">
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
  constructor(props) {
    this.props = props;
  }
  onDeleteItem() {
    store.todoList.removeItem(this.props.index);
  }
  onSwitchItem() {
    store.todoList.switchItem(this.props.index);
  }
}
