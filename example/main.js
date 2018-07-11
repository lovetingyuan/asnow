var test = function(Component, render) {
  @Component({
    name: 'list-item',
    props: {
      text: String,
      index: Number
    },
    template: `
      <li :style="{'text-decoration': done ? 'line-through' : ''}" style="margin-top: 10px;">
        <span @click="changeStatus"> {$props.index + 1 }: {$props.text} </span>
        <i style="cursor: pointer" @click="remove">❌</i>
      </li>
    `
  })
  class ListItem {
    constructor(props) {
      this.done = !!props.done;
    }
    changeStatus() {
      this.done = !this.done;
      this.render();
    }
    remove() {

    }
  }

  @Component({
    name: 'my-comp',
    template: `
    <div style="padding: 50px;">
      <span>Event List({events.length}): </span>
      <input type="text" autofocus>
      <input type="button" value="add" @click="addEvent">
      <ul>
        <list-item #for="event, index of events by index" :index="index" :text="event.text"></list-item>
      </ul>
    </div>
    `,
    components: { ListItem }
  })
  class MyComp {
    events = [{
      text: 'first event',
    }];
    addEvent() {
      const input = this.$el.querySelector('input[type="text"]');
      const text = input.value.trim();
      if (text) {
        this.events.push({text});
        this.render();
        input.value = '';
      }
    }
  }
  console.log(MyComp);
  render(MyComp, document.getElementById('app'));
};
