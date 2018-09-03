/* eslint-disable */
importScripts('node_modules/@babel/standalone/babel.min.js');
importScripts('node_modules/requirejs/require.js');

require.config({
  baseUrl: '/',
});

self.addEventListener('install', function (event) {
  require(['./es6-to-amd.js!./compiler/browser/index.js'], function(foo) {
    self.compile = foo.default;
  });
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
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
    if (ext === 'js') {
      let script = await response.text();
      if (/^\s*"use babel"/.test(script) || /^\s*'use babel'/.test(script)) {
        script = Babel.transform(script, {
          plugins: [
            ['proposal-decorators', { legacy: true }],
            'proposal-class-properties',
            'proposal-object-rest-spread'
          ]
        }).code;
      }
      return getScriptResponse(script);
    } else if (ext === 'html') {
      const html = 'export default ' + JSON.stringify(await response.text())
        .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029').trim();
      return getScriptResponse(html);
    } else {
      return response;
    }
  }));
});
