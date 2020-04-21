/* eslint-disable */
importScripts('https://cdn.jsdelivr.net/npm/typescript@3.8.3/lib/typescript.js');

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

self.addEventListener('fetch', function (e) {
  // console.log('[ServiceWorker] Fetch: ', e.request.url);
  let url = e.request.url
  if (e.request.destination !== 'script' || url.endsWith('.js')) return
  if (!url.endsWith('.ts')) {
    url = url + '.ts'
  }
  e.respondWith(
    fetch(url).then(r => r.text()).then(tsCode => {
      const jsCode = ts.transpile(tsCode, {
        target: 'ESNext'
      })
      return getScriptResponse(jsCode)
    }).catch(err => {
      console.error(err)
    })
  )
});
