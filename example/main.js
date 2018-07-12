var test = function(Component, render) {
  @Component({
    name: 'empty-str',
    template: '<p>no event</p>'
  })
  class EmptyStr {}

  @Component({
    name: 'list-item',
    props: {
      text: String,
      id: Number,
      done: Boolean
    },
    template: `
      <li :style="{'text-decoration': done ? 'line-through' : ''}" style="margin-top: 10px;">
        <span @click="changeStatus"> {$props.text} </span>
        <i style="cursor: pointer" @click="onRemove">❌</i>
        <ul>
          <li #for="detail of details" #if="detail.length > 4">{detail}</li>
        </ul>
      </li>
    `
  })
  class ListItem {
    get done() {
      return !!this.$props.done;
    }
    get details() {
      return this.$props.text.split(' ');
    }
    changeStatus() {
      this.$emit('change-status', this.$props.id);
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
        <list-item
          #for="event of events"
          @remove="removeEvent"
          @change-status="switchDone"
          :done="event.done"
          :id="event.id"
          :text="event.text">
        </list-item>
        <empty-str #if="!events.length"></empty-str>
      </ol>
    </div>
    `,
    components: { ListItem, EmptyStr }
  })
  class MyComp {
    events = [{
      text: '1111first event',
      id: 0
    }, {
      text: '222222 2222',
      id: 1
    }, {
      text: '33333333 3333 33333',
      id: 2
    }, {
      text: '444444 4444 444444 4444',
      id: 3
    }, {
      text: '5555555555555',
      id: 4
    }, {
      text: '6666666666666666',
      id: 5
    }];
    removeEvent(id) {
      this.events = this.events.filter(v => v.id !== id);
      this.$render();
    }
    switchDone(id) {
      const event = this.events.find(v => v.id === id);
      event.done = !event.done;
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
  }
  render(MyComp, document.getElementById('app'));
};
