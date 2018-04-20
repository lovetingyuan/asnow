
// class Component {
//   constructor(template, container, data) {
//     // this.rawTemplate = template;
//     if (container && container.nodeType === 1) {
//       const element = templateToElement(template);
//       this.meta = handleNode(element);
//       this.el = element;
//       this.template = element.outerHTML;
//       this.mount(container);
//     }
//     console.log(this);
//     if (data && typeof data === 'object') {
//       this.data = data;
//       this.update(data);
//     }
//   }
//   mount(container) {
//     if (this.el) {
//       container.appendChild(this.el);
//     }
//   }
//   update(newData) {
//     if (!this.data) {
//       this.data = {};
//     }
//     updateNode(this.el, this.meta, Object.assign(this.data, newData));
//   }
// }
let instance;
window.handleInput = function(e) {
   instance.update({
      name: e.target.value
   });
}
import compile from './compiler/index.js';
import updateNode from './runtime/render/index.js';

window.onload = function() {
  const data = {
    color: 'red',
    hasClass: true,
    age: 32,
    name: 'ttt',
    link: 'https://tingyuan.me',
    siteName: 'tingyuan-site',
    list: [111, 333],
    list2: [{
      name: '111111',
    }, {
      name: '222'
    }, {
      name: 3432
    }, {
      name: 'dfsfdf'
    }],
    list3: ['rrr']
  };
  const templateStr = document.getElementById('template').innerHTML;
  const container = document.getElementById('app');
  const { meta, node } = compile(templateStr, true);
  const newMeta = updateNode(node, meta, data);
  console.log(meta);
  console.log(newMeta)
;  container.appendChild(node);
  
  // const component = new Component(templateStr, container, data);
  // instance = component;
  // setTimeout(function() {
  //   component.update({
  //     name: 'my-name',
  //     color: 'green',
  //     list: ['aaa', 333, 555, 666, 777],
  //     list2: [{
  //       name: 'tu'
  //     }, {
  //       name: 'jone'
  //     }, {
  //       name: 'ying'
  //     }],
  //     list3: ['rrr', 'ttt'],
  //     age: 2342,
  //     link: '123'
  //   });
  // }, 5000);
  // setTimeout(function() {
  //   component.update({
  //     // name: 'yingxue',
  //     list: [111, 222, 333, 444],
  //     list2: [{
  //       name: 'sdfsdf'
  //     }, {
  //       name: 'df'
  //     }],
  //     // age: 44,
  //     link: '1234'
  //   });
  // }, 8000);

}
