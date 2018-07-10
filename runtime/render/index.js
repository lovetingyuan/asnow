import renderComponent from './renderComponent.js';

export default function render(Component, container) {
  const node = document.createComment('');
  container.appendChild(node);
  const newNode = renderComponent(Component);
  container.replaceChild(newNode, node);
}
