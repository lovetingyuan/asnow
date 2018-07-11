import renderComponent from './renderComponent.js';

export default function render(Component, container) {
  const node = document.createComment('');
  container.appendChild(node);
  const newNode = renderComponent.call(null, Component);
  container.replaceChild(newNode, node);
}
