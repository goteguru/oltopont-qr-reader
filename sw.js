const CACHE = 'op-qr-v4'
const precache = [
    './index.html',
    './src/app.js',
    './src/data.js',
    './src/qr_icon.svg',
    './src/styles.css',
]

self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(precache)),
  )
})

self.addEventListener('activate', async e => {
    console.log('Activating...', e);
    e.waitUntil(activate())
    return self.clients.claim()
});

async function activate() {
    const keys = await caches.keys()
    console.log('Current caches:', keys)
    const delproms = keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    return Promise.all(delproms)
}

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
        .then(response => response || fetch(e.request)),
  )

  // post update cache
  e.waitUntil(async () => {
    const cache = await caches.open(CACHE)
    const resp = await fetch(e.request)
    cache.put(e.request.url, resp)
  })
})
// vim: set et sw=4 ts=4 :
