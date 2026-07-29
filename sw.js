// Service worker — сеть в приоритете, кэш только как офлайн-резерв.
// (Раньше был «сначала кэш» — из-за него не подтягивались обновления.)
const CACHE = "trainer-v17";
// Аудио (audio/m|f|fr/*.mp3) кэшируется по мере проигрывания — не грузим всё при установке.
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("message", (e) => {
  if (e.data === "skip") self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Сначала сеть, МИМО HTTP-кэша ({cache:"reload"}) — всегда самая свежая версия.
// При отсутствии сети — из кэша (офлайн-режим сохраняется).
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req.url, { cache: "reload" })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
  );
});
