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
  const compileMeta = compile(name, template);
  return function (target) {
    target.prototype.render = function render() {
      updateNode.call(this, this.$dom, compileMeta);
    };
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
