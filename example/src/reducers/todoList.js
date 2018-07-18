export class TodoListReducer {
  static state = [];
  setList(list, newList, append) {
    return append ? list.concat(newList) : newList;
  }
  addItem(list, payload) {
    return list.concat({
      text: payload,
      done: false
    });
  }
  removeItem(list, payload) {
    return list.filter(value => value.text !== payload);
  }
  switchItem(list, payload) {
    return list.map(value => {
      if (payload === value.text) {
        value.done = !value.done;
      }
      return value;
    });
  }
  // @effect
  async getList(url) {
    const list = await fetch(url).then(res => res.json());
    this.setList(list);
  }
}
