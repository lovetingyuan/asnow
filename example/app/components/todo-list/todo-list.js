import todoItem from '../todo-item/todo-item.js';
import { store } from '../../reducers/index.js';

@Component({
  name: 'todo-list',
  style: `
    margin: 0;
    list-style: none;
    padding: 0;
  `,
  template: `
    <ul>
      <todo-item
        props="{
          text: item.text,
          index,
          done: item.done
        }"
        :for="(item, index) of todoList"
      />
    </ul>
  `,
  components: {
    'todo-item': todoItem
  },
})
export default class TodoList {
  @select('todoList')
  list
  @select('filterType')
  type
  get todoList() {
    const { type, list } = this;
    return type === 'all' ? list : list.filter(v => type === 'done' ? v.done : !v.done);
  }
}
