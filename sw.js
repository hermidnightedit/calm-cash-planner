// Calm Cash Planner offline cache. Bump VERSION when you upload a new index.html.
// Only removes Calm Cash's own old copies, so the other Her Midnight Edit apps keep theirs.
const APP = "calmcash";
const VERSION = APP + "@v1.4";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith(APP + "@") || k.startsWith("calmcash-v")) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const keep = res => { if (res.ok && new URL(e.request.url).origin === location.origin) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return res; };
  // The page itself: newest version when online, saved copy when offline
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(keep).catch(() => caches.match(e.request).then(hit => hit || caches.match("./index.html"))));
    return;
  }
  // Icons, fonts and the rest: saved copy first, refreshed in the background
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(keep).catch(() => hit);
    return hit || net;
  }));
});
