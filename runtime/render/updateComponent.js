export default function updateComponent(node, meta, component, state) {
  const { bindings, props: staticProps, name: componentName } = meta;
  if (node.nodeType === 8) {
    const props = {};
    bindings && Object.keys(bindings).forEach(name => {
      if (name in component.props) {
        props[name] = bindings[name].call(state);
      } else {
        delete bindings[name];
      }
    });
    staticProps && Object.keys(staticProps).forEach(name => {
      if (name in component.props) {
        props[name] = staticProps[name];
      } else {
        delete staticProps[name];
      }
    });
    const newNode = component.meta.element.cloneNode(true);
    const vm = new component(props);
    updateElement(newNode, component.meta, vm);
    node.parentNode.replaceChild(newNode, node);
  } else {
    const props = {};
    bindings && Object.keys(bindings).forEach(name => {
      props[name] = bindings[name].call(state);
    });
  }
}