self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(
    caches.open('op-qr').then(cache => cache.addAll([
      './index.html',
      './src/app.js',
      './src/data.js',
      './src/qr_icon.svg',
      './src/styles.css',
    ])),
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
    	.then(response => response || fetch(e.request)),
  )
})
