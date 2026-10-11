// Lightweight service worker placeholder to satisfy browser worker queries cleanly
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
