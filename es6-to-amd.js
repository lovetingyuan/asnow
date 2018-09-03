/* eslint-disable */
if (typeof importScripts === 'function' && typeof Babel === 'undefined') {
  importScripts('node_modules/@babel/standalone/babel.min.js');
}

function resolvePath(url, src) {
  const baseUrl = new URL(url, location.href);
  const { pathname } = new URL(src, baseUrl.href);
  if (/\.js$/.test(pathname)) {
    return `/es6-to-amd.js!${pathname}`;
  } else {
    return pathname;
  }
}

define({
  load(name, req, onload) {
    var url = req.toUrl(name);
    fetch(url).then(v => v.text()).then(data => {
      const { code } = Babel.transform(data, {
        plugins: [ 'transform-modules-amd', function() {
          return {
            visitor: {
              ImportDeclaration(path) {
                const node = path.node;
                const src = node.source.value;
                node.source.value = resolvePath(url, src);
              }
            }
          }
        }]
      });
      const text = `function _define(deps, callback) { 
        define(deps, function(_exports, ...args) {
          callback(_exports, ...args);
          return _exports;
        });
      }
      _${code.trim()}`;
      onload.fromText(name, text);
      //Give result to load. Need to wait until the module
      //is fully parse, which will happen after this
      //execution.
      req([name], function (value) {
        onload(value);
      });
    });
  }
});
