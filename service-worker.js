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
  const ext = pathname.split('.').pop();
  e.respondWith(fetch(e.request.clone()).then(async response => {
    if (ext === 'js' && /example\//.test(pathname)) {
      console.log(pathname);
      let script = await response.text();
      script = Babel.transform(script, {
        plugins: [
          ['proposal-decorators', { legacy: true }],
          'proposal-class-properties',
          'proposal-object-rest-spread',
          'proposal-export-default-from',
        ]
      }).code;
      return getScriptResponse(script);
    } else if (ext === 'html') {
      const template = (await response.text()).trim();
      const html = `export default ${JSON.stringify(template)}`;
      return getScriptResponse(html);
    } else {
      return response;
    }
  }));
});
