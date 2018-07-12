import updateElement from './updateElement.js';

const vms = new Map;
window.vms = vms;

function getId() {
  return String(Math.random()).substr(2);
}

function getProps(props, componentProps) {
  const newProps = {};
  props && Object.keys(props).forEach(name => {
    if (name in componentProps) {
      if (typeof props[name] === 'function') {
        newProps[name] = props[name].call(this);
      } else {
        newProps[name] = props[name];
      }
    }
  });
  return newProps;
}

function createComponent(meta, Component) {
  // if (meta.props) {
  //   if (meta.props.__proto__ === Object.prototype) {
  //     const defaultProps = {};
  //     const validProps = {};
  //     Object.keys(Component.props).forEach(name => {

  //     })

  //   }
  // }
  const props = getProps.call(this, meta && meta.props, Component.props);
  const newNode = Component.meta.element.cloneNode(true);
  const vm = new Component(props);
  const id = getId();
  vms.set(id, vm);
  newNode.__vmid__ = id;
  Object.defineProperties(vm, {
    $id: {
      value: id
    },
    $props: {
      value: props
    },
    $el: {
      value: newNode
    },
    $parent: {
      value: this
    },
    $events: {
      value: meta && meta.events
    }
  });
  updateElement.call(vm, newNode, Component.meta);
  return newNode;
}

function updateComponent(node, meta, Component) {
  const vm = vms.get(node.__vmid__);
  // TODO check props update
  const props = getProps.call(this, meta.props, Component.props);
  Object.assign(vm.$props, props);
  updateElement.call(vm, node, Component.meta);
}

function removeComponent(node) {
  const vm = vms.get(node.__vmid__);
  Object.defineProperty(vm, '$destroy', {value: true});
  vms.delete(node.__vmid__);
}

export {
  createComponent,
  updateComponent,
  removeComponent,
}
