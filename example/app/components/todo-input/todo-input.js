import { store } from '../../reducers/index.js';

@Component({
  name: 'todo-input',
  template: `
    <form @submit="onAddItem">
      <input type="text"/>
      <span>{list.length}</span>
    </form>
  `,
})
export default class TodoInput {
  @select('todoList')
  list;
  onAddItem(e) {
    const value = e.target.value.trim();
    if (!value) return;
    store.todoList.addItem(value);
    return false;
  }
}
