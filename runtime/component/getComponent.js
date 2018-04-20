import compile from '../../compiler/index.js';

export default function getComponent(/* name */) {
  const template = `<div>
    this is a sub component
  </div>`;
  const { meta, node } = compile(template, true);
  return {
    meta,
    node
  };
}
