export default function renderComponent(component, node) {
  container.innerHTML = component.template;
  const vm = new component();
  const dom = container.firstElementChild;
  if (node.nodeType === 8) {
    
  }
  dom.setAttribute('data-component', component.componentName);
  vm.$dom = dom;
  vm.render();
}