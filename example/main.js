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
        <span @click="changeStatus">⏰ {$props.text} </span>
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

  @Component({
    name: 'my-comp',
    template: `
    <div style="padding: 50px;">
      <span>Event List({displayEvents.length} of {events.length}): </span>
      <input type="text" autofocus>
      <input type="button" value="add" @click="addEvent">
      <span #for="type of filters">
        <input type="radio" :id="type" name="filter" :value="type" @click="onFilter">
        <label :for="type">{type}</label>
      </span>
      <ol>
        <list-item
          #for="event of displayEvents"
          @remove="removeEvent"
          @change-status="switchDone"
          :done="event.done"
          :id="event.id"
          :text="event.text">
        </list-item>
        <empty-str #if="!displayEvents.length"></empty-str>
      </ol>
    </div>
    `,
    components: { ListItem, EmptyStr }
  })
  class MyComp {
    get displayEvents() {
      switch(this.filterType) {
        case 'done': {
          return this.events.filter(v => v.done);
        }
        case 'todo': {
          return this.events.filter(v => !v.done);
        }
        default: {
          return this.events;
        }
      }
    }
    events = Array(10).fill().map((v, i) => {
      return {
        text: Array(10).fill(i + 1).join(''),
        id: Math.random()
      };
    });
    filters = ['all', 'todo', 'done'];
    filterType = 'all';
    removeEvent(id) {
      this.events = this.events.filter(v => v.id !== id);
      this.$render();
    }
    switchDone(id) {
      const index = this.events.findIndex(v => v.id === id);
      const event = this.events[index];
      this.events[index] = {
        ...event,
        done: !event.done
      };
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
    onFilter(e) {
      this.filterType = e.target.value;
      this.$render();
    }
  }
  render(MyComp, document.getElementById('app'));
};
