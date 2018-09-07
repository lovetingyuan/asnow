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
  headers: { 'Content-Type': 'application/javascript; charset=UTF-8' }
});

self.addEventListener('fetch', function (e) {
  // console.log('[ServiceWorker] Fetch: ', e.request.url);
  const { pathname } = new URL(e.request.url);
  if (/\/(parse5|buble)$/.test(pathname)) {
    const lib = pathname.split('/').pop();
    e.respondWith(fetch(`./${lib}.js`).then(async response => {
      let script = await response.text();
      return getScriptResponse(`(function(){${script}}).call(window);export default ${lib}`);
    }));
  } else {
    const ext = pathname.split('.').pop();
    e.respondWith(fetch(e.request.clone()).then(async response => {
      if (ext === 'js') {
        let script = await response.text();
        if (/example\//.test(pathname)) {
          script = Babel.transform(script, {
            plugins: [
              ['proposal-decorators', { legacy: true }],
              'proposal-class-properties',
              'proposal-object-rest-spread',
              'proposal-export-default-from',
            ]
          }).code;
        } else if (/compiler\//.test(pathname)) {
          script = Babel.transform(script, {
            plugins: [() => {
              return {
                visitor: {
                  ImportDeclaration(path) {
                    const src = path.node.source.value;
                    if (!/^(\.\/|\/|\.\.\/)/.test(src)) {
                      path.node.source.value = '/' + src;
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
        const html = `export default ${JSON.stringify(template)}`;
        return getScriptResponse(html);
      } else {
        return response;
      }
    }));
  }
});
