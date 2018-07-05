import { store } from '../../reducers/index.js';

@Component({
  name: 'todo-input',
  template: `
    <form @submit="onAddItem">
      <input type="text" name="item_input"/>
      <span>{list.length} {list.length > 1 ? 'items' : 'item'}</span>
    </form>
  `,
  // selector: {
  //   todoList: 
  // }
})
export default class TodoInput {
  @select('todoList')
  list;
  onAddItem(e) {
    const value = e.target['item_input'].value.trim();
    if (!value) return;
    store.todoList.addItem(value);
    return false;
  }
}
