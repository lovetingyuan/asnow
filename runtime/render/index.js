import updateNode from './updateNode.js';
import transformMeta from './transformMeta.js';
import State from './state.js';

export default function update(node, meta, state) {
  const newMeta = transformMeta(meta);
  const newState = new State(state);
  updateNode(node, newMeta, newState);
  return newMeta;
}
