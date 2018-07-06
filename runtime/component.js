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
  const {name, style, props, template, components} = meta;
  // TODO check name and template required
  const compileMeta = compile(template);
  compileMeta.components = components;
  return function (target) {
    target.prototype.render = function render() {
      updateNode(this.$dom, compileMeta, this);
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
      }
    });
  };
}

export default Component;
