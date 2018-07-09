import updateComponent from './updateComponent.js';

export default function render(component, container) {
  container.innerHTML = '<!---->';
  const vm = new component();
  updateComponent.call(container.childNodes[0]);
  // container.innerHTML = component.meta.template;
  
  const dom = container.firstElementChild;
  dom.setAttribute('data-component', component.componentName);
  vm.$dom = dom;
  vm.render();
}
