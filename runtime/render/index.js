import { createComponent } from './updateComponent.js';

export default function render(Component, container) {
  const node = document.createComment('');
  container.appendChild(node);
  const newNode = createComponent(void 0, Component);
  container.replaceChild(newNode, node);
}
