import updateElement from './updateElement.js';
import updateTextNode from './updateTextNode.js';
import updateIfNode from './updateIfNode.js';
import updateForNode from './updateForNode.js';
import { createComponent, updateComponent } from './updateComponent.js';

export default function updateNode(node, meta) {
  switch (meta.type) {
    case 'component': {
      const Component = this.constructor.components[meta.name];
      if (!Component) {
        throw new Error(`Not found sub component ${meta.name} in ${this.constructor.componentName}`);
      }
      if (meta.directives) {
        if (meta.directives.for) {
          return updateForNode.call(this, node, meta, Component);
        } else if (meta.directives.if) {
          updateIfNode.call(this, node, meta, Component);
        }
      } else {
        if (node.nodeType === 8) {
          const newNode = createComponent.call(this, meta, Component);
          node.parentNode.replaceChild(newNode, node);
        } else {
          updateComponent.call(this, node, meta, Component);
        }
      }
      break;
    }
    case 'element': {
      if (meta.directives) {
        if (meta.directives.for) {
          return updateForNode.call(this, node, meta);
        } else if (meta.directives.if) {
          updateIfNode.call(this, node, meta);
        }
      } else {
        updateElement.call(this, node, meta);
      }
      break;
    }
    case 'text': {
      updateTextNode.call(this, node, meta);
      break;
    }
  }
}
