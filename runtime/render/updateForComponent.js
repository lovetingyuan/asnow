export default function updateForComponent(node, meta, Component) {
  const { value: valueName, index: indexName, key } = meta.directives.for;
  const condition = meta.directives.if;
  let list = meta.directives.for.list.call(this);
  condition && (list = list.filter((v, i) => {
    newScope[valueName] = v;
    const newScope = {
      __proto__: this,
      [valueName]: v
    };
    indexName && (newScope[indexName] = i);
    return condition.call(newScope);
  }));
  const length = list.length;
  const keys = [];

}