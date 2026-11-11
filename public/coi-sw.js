// Cross-Origin Isolation service worker — फक्त /office पानासाठी (LibreOffice ला SharedArrayBuffer लागतो).
// GitHub Pages वर COOP/COEP headers लावता येत नाहीत, म्हणून हा worker ते same-origin प्रतिसादांवर जोडतो.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (new URL(req.url).origin !== self.location.origin) return; // बाहेरील (Firebase इ.) विनंत्यांना हात लावू नका
  if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;
  e.respondWith(
    fetch(req).then((res) => {
      if (!res || res.status === 0 || res.type === 'opaque') return res;
      const h = new Headers(res.headers);
      h.set('Cross-Origin-Opener-Policy', 'same-origin');
      h.set('Cross-Origin-Embedder-Policy', 'credentialless');
      h.set('Cross-Origin-Resource-Policy', 'same-origin');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    }),
  );
});
