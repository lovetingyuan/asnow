// import Cache from '../../utils/cache.js';
import compile from '../../compiler/browser/index.js';
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
  const {name, style, props = {}, template, components = {}} = meta;
  // TODO check name and template required
  Object.keys(components).forEach(componentName => {
    const componentNames = componentName.split('').map((v, i) => {
      return v.toUpperCase() === v ? ((i ? '-' : '') + v.toLowerCase()) : v;
    }).join('');
    components[componentNames] = components[componentName];
    delete components[componentName];
  });
  const compileMeta = compile(name, template);
  return function (target) {
    Object.assign(target.prototype, {
      $render() {
        if (!this.$destroy) {
          updateNode.call(this, this.$el, compileMeta);
        } else {
          console.warn('Can not update destroyed component', this);
        }
      },
      $emit(eventName, ...args) {
        const parentVm = this.$parent;
        const handlerName = this.$events[eventName].handler;
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
