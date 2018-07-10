import renderComponent from './renderComponent.js';
import templateToElement from '../../compiler/browser/templateToElement.js';

export default function render(Component, container) {
  const node = document.createComment('');
  container.appendChild(node);
  renderComponent(node, Component);
}
