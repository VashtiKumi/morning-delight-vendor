// ─── Morning Delight Vendor Service Worker ────────────────────────────
const CACHE_NAME = 'md-vendor-v1';
const FONT_CACHE = 'md-vendor-fonts-v1';

const APP_SHELL = ['/', '/index.html', '/manifest.json', '/favicon.png', '/apple-touch-icon.png', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install',  evt => { evt.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener('activate', evt => { evt.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE_NAME&&k!==FONT_CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });

self.addEventListener('fetch', evt => {
  const { request } = evt;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    evt.respondWith(caches.open(FONT_CACHE).then(c => c.match(request).then(cached => { const fr=fetch(request).then(r=>{c.put(request,r.clone());return r;}).catch(()=>cached); return cached||fr; })));
    return;
  }
  if (url.origin === self.location.origin) {
    evt.respondWith(caches.open(CACHE_NAME).then(c => c.match(request).then(cached => { const fr=fetch(request).then(r=>{if(r.ok)c.put(request,r.clone());return r;}).catch(()=>cached||new Response('Offline',{status:503})); return cached||fr; })));
  }
});

self.addEventListener('push', evt => {
  const d = evt.data?.json()||{};
  evt.waitUntil(self.registration.showNotification(d.title||'MD Vendor — New Order!', { body:d.body||'You have a new order', icon:'/icons/icon-192.png', badge:'/icons/icon-72.png', tag:'md-vendor', vibrate:[300,100,300,100,300] }));
});
self.addEventListener('notificationclick', evt => {
  evt.notification.close();
  evt.waitUntil(clients.matchAll({type:'window'}).then(l => l.length ? l[0].focus() : clients.openWindow('/')));
});
