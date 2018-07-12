import { createComponent } from './updateComponent.js';

export default function render(Component, container) {
  const node = document.createComment('');
  container.appendChild(node);
  const newNode = createComponent(null, Component);
  container.replaceChild(newNode, node);
}
