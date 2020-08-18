/* eslint-env node */
const { terser } = require('rollup-plugin-terser')
const rollupTypescript = require('@rollup/plugin-typescript')

module.exports = [
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/asnow.umd.js',
      format: 'umd',
      name: 'Asnow'
    },
    plugins: [
      terser(),
      rollupTypescript({
        target: 'es5'
      })
    ]
  },
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/asnow.esm.js',
      format: 'es'
    },
    plugins: [
      rollupTypescript({
        target: 'es6'
      })
    ]
  }
]
