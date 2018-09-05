module.exports = {
  root: true,
  parser: 'babel-eslint',
  globals: {
    parse5: true
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  extends: 'eslint:recommended',
  env: {
    'es6': true,
    'browser': true,
    'node': true
  },
};
