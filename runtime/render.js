/**
 * render(RootComponent, dom);
 */
export default function render(component, container) {
  container.innerHTML = component.meta.template;
  const vm = new component();
  const dom = container.firstElementChild;
  dom.setAttribute('data-component', component.componentName);
  console.log(component);
  vm.$dom = dom;
  vm.render();
}
