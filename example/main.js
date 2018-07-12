var test = function(Component, render) {
  @Component({
    name: 'list-item',
    props: {
      text: String,
      id: Number
    },
    template: `
      <li :style="{'text-decoration': done ? 'line-through' : ''}" style="margin-top: 10px;">
        <span @click="changeStatus"> {$props.text} </span>
        <i style="cursor: pointer" @click="onRemove">❌</i>
      </li>
    `
  })
  class ListItem {
    constructor(props) {
      this.done = !!props.done;
    }
    changeStatus() {
      this.done = !this.done;
      this.$render();
    }
    onRemove() {
      this.$emit('remove', this.$props.id);
    }
  }

  @Component({
    name: 'my-comp',
    template: `
    <div style="padding: 50px;">
      <span>Event List({events.length}): </span>
      <input type="text" autofocus>
      <input type="button" value="add" @click="addEvent">
      <ol>
        <list-item #for="event of events" @remove="removeEvent" :id="event.id" :text="event.text"></list-item>
      </ol>
    </div>
    `,
    components: { ListItem }
  })
  class MyComp {
    events = [{
      text: 'first event',
      id: 0
    }, {
      text: '2222222222',
      id: 1
    }, {
      text: '33333333333333333',
      id: 2
    }, {
      text: '44444444444444444444',
      id: 3
    }, {
      text: '5555555555555',
      id: 4
    }, {
      text: '6666666666666666',
      id: 5
    }];
    removeEvent(id) {
      console.log(1111111111111, this.events);
      this.events = this.events.filter(v => v.id !== id);
      // const index = this.events.findIndex(v => v.id == id);
      // this.events.splice(index, 1);
      this.$render();
      console.log(22222222222, this.events);
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
  }
  console.log(MyComp);
  render(MyComp, document.getElementById('app'));
};
