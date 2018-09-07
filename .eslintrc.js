module.exports = {
  root: true,
  parser: 'babel-eslint',
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
