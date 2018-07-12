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
        updateNode.call(this, this.$el, compileMeta);
      },
      $emit(eventName, ...args) {
        console.log(this, compileMeta);
        const parentVm = this.$parent;
        const handlerName = this.$events[eventName].handler;
        if (parentVm && typeof parentVm[handlerName] === 'function') {
          return parentVm[handlerName](...args);
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
