/**
 * render(RootComponent, dom);
 */
export default function render(component, container) {
  container.innerHTML = component.template;
  const vm = new component();
  const dom = container.firstElementChild;
  dom.setAttribute('data-component', component.componentName);
  vm.$dom = dom;
  vm.render();
}
