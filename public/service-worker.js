// Empty service worker — prevents 404 errors from browsers
// that previously registered a service worker on this origin.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
