// import Cache from '../../utils/cache.js';
import updateNode from './render/updateNode.js';

// @Component({
//   name: 'component-name',
//   style: '',
//   template: '<div></div>',
//   props: {
//     a: 0,
//     b: null
//   },
//   components: {
//     subComponent
//   }
// })
// class MyComponent {}

function Component(meta) {
  let {name, style, props = {}, template: compileMeta, components = {}} = meta;
  // TODO check name and template required
  Object.keys(components).forEach(componentName => {
    const componentNames = componentName.split('').map((v, i) => {
      return v.toUpperCase() === v ? ((i ? '-' : '') + v.toLowerCase()) : v;
    }).join('');
    components[componentNames] = components[componentName];
    delete components[componentName];
  });
  if (typeof compileMeta === 'string') {
    let div = document.createElement('div');
    div.innerHTML = compileMeta;
    compileMeta = {
      type: 'element',
      static: compileMeta,
    };
    Object.defineProperty(compileMeta, 'element', {
      get() {
        return div.firstElementChild.cloneNode(true)
      }
    });
  }
  console.log('compileMeta', compileMeta); // eslint-disable-line
  return function (target) {
    Object.assign(target.prototype, {
      $render(newState) {
        if (newState) {
          Object.assign(this, newState);
        }
        if (!this.$destroy) {
          updateNode.call(this, this.$el, compileMeta);
        } else {
          console.warn('Can not update destroyed component', this);
        }
      },
      $emit(eventName, ...args) {
        const parentVm = this.$parent;
        const handlerName = this.$events[eventName][0];
        if (parentVm && typeof parentVm[handlerName] === 'function') {
          return parentVm[handlerName](...args);
        } else {
          throw new Error(`Not found custom event ${eventName}:${handlerName}`);
        }
      }
    });
    Object.defineProperties(target, {
      componentName: {
        value: name
      },
      meta: {
        value: compileMeta
      },
      props: {
        value: props
      },
      components: {
        value: components
      }
    });
  };
}

export default Component;
