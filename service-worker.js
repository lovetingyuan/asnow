/* eslint-disable */
importScripts('node_modules/@babel/standalone/babel.min.js');

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', function (evt) {
  console.log('postMessage received', evt.data);
});

const getScriptResponse = text => new Response(text, {
  status: 200,
  statusText: 'OK',
  headers: {
    'Content-Type': 'application/javascript; charset=UTF-8'
  }
});

const libMap = {
  buble: './lib/buble/dist/buble-browser-deps.umd.js',
  parse5: './lib/parse5-umd.js',
  mustache: ['./node_modules/mustache/mustache.min.js', 'Mustache'],
};

self.addEventListener('fetch', function (e) {
  // console.log('[ServiceWorker] Fetch: ', e.request.url);
  const { pathname } = new URL(e.request.url);
  if (/\/__third_modules__\/.+/.test(pathname)) {
    const lib = pathname.split('/').pop();
    const meta = libMap[lib];
    let url = meta, ns = lib;
    if (Array.isArray(meta)) {
      [url, ns] = meta;
    }
    e.respondWith(fetch(url).then(async response => {
      let script = await response.text();
      // fix `this => global` in strict mode and export the namespace as default
      return getScriptResponse(`(function(){${script}}).call(window);\nexport default ${ns}`);
    }));
  } else {
    const ext = pathname.split('.').pop();
    e.respondWith(fetch(e.request.clone()).then(async response => {
      if (ext === 'js') {
        let script = await response.text();
        if (/^\/example\//.test(pathname)) {
          script = Babel.transform(script, {
            plugins: [
              ['proposal-decorators', { legacy: true }],
              'proposal-class-properties',
              ['proposal-object-rest-spread', {useBuiltIns: true}],
              'proposal-export-default-from',
            ]
          }).code;
        } else if (/^\/compiler\//.test(pathname)) {
          script = Babel.transform(script, {
            plugins: [() => {
              return {
                visitor: {
                  ImportDeclaration(path) {
                    const src = path.node.source.value;
                    if (!/^(\.\/|\/|\.\.\/|https?:\/\/)/i.test(src)) {
                      path.node.source.value = '/__third_modules__/' + src;
                    }
                  }
                }
              }
            }]
          }).code;
        }
        return getScriptResponse(script);
      } else if (ext === 'html') {
        const template = await response.text();
        const html = `import compile from '/compiler/index.js';\nexport default compile(${JSON.stringify(template)})`;
        return getScriptResponse(html);
      } else {
        return response;
      }
    }));
  }
});
