import template from './template.html';
import Component from '../../../../runtime/component.js';

@Component({
  name: 'list-item', // used as global component tag name.
  props: {
    text: String,
    id: Number,
    done: Boolean
  },
  template,
})
export default class ListItem {
  get done() {
    return !!this.$props.done;
  }
  get details() {
    return this.$props.text.split(' ');
  }
  set props(newProps) {
    // TODO
  }
  // onReceiveProps(newProps) {
  //   if (newProps.done !== this.$props.done) {
  //     this.$props.done = newProps.done;
  //     return true;
  //   }
  // }
  changeStatus() {
    this.$emit('change-status', this.$props.id);
  }
  onRemove() {
    this.$emit('remove', this.$props.id);
  }
}