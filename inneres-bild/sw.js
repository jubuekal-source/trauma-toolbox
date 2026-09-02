/* Service Worker für "Inneres Bild".
   WICHTIG: Nach jeder Änderung an index.html die Zahl in VERSION um eins erhöhen
   (z. B. v3 statt v2) und die Datei mit hochladen. Sonst sehen Handys,
   die die App schon einmal geöffnet haben, weiter die alte Fassung. */
const VERSION = 'inneres-bild-v4';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Erst das Netz versuchen, damit Aktualisierungen ankommen; offline aus dem Zwischenspeicher. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const kopie = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, kopie)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
