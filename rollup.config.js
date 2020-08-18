/* eslint-env node */
const { terser } = require('rollup-plugin-terser')
const rollupTypescript = require('@rollup/plugin-typescript')
const replace = require('@rollup/plugin-replace')

module.exports = [
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/asnow.umd.js',
      format: 'umd',
      name: 'Asnow',
    },
    plugins: [
      terser(),
      rollupTypescript({
        target: 'es5'
      }),
      replace({
        'process.env.NODE_ENV': '"production"'
      }),
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
