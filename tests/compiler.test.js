import compile from '../lib/compiler'

function _compile (template, _meta) {
  const ret = compile(class {
    static template = template
  })
  expect(ret.meta).toBeDefined()
  const meta = JSON.parse(JSON.stringify(ret.meta, (k, v) => {
    if (v && v.nodeType === 1) return v.outerHTML
    if (typeof v === 'function') return v.toString()
    return v
  }))
  expect(meta).toEqual(JSON.parse(JSON.stringify(_meta)))
}

test('compile test 1', () => {
  _compile(`<div class="foo">foo</div>`, {
    type: 'element',
    element: `<div class="foo"></div>`,
    children: [
      {
        type: 'text',
        static: true,
        text: 'foo'
      }
    ]
  })
})

test('compile test 2', () => {
  _compile(`<div class="{foo + bar}" name="bar">foo</div>`, {
    type: 'element',
    element: `<div name="bar"></div>`,
    bindings: {
      class: 'foo + bar'
    },
    children: [
      {
        type: 'text',
        static: true,
        text: 'foo'
      }
    ]
  })
})
