export default function getProps(bindings, staticProps, componentProps) {
  const props = {};
  bindings && Object.keys(bindings).forEach(name => {
    if (name in componentProps) {
      props[name] = bindings[name].call(this);
    }
  });
  staticProps && Object.keys(staticProps).forEach(name => {
    if (name in componentProps) {
      props[name] = staticProps[name];
    }
  });
  return props;
}
