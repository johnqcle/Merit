// Merit offline cache. Built by tools/bank-build/pwa_build.py; do not edit by hand.
const CACHE = "merit-63ea2b57d5a3";
const FILES = [
 "./",
 "favicon.svg",
 "index.html",
 "manifest.webmanifest",
 "assets/logo.svg",
 "css/app.css",
 "css/fonts.css",
 "fonts/nunito-latin.woff2",
 "fonts/patrickhand-latin.woff2",
 "icons/apple-touch-180.png",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/maskable-512.png",
 "js/app.js",
 "js/art.js",
 "js/astronomy.js",
 "js/bank.js",
 "js/catalog.js",
 "js/engine.js",
 "js/math_mix.js",
 "js/physics_topics.js",
 "js/questions.js",
 "js/scenes.js",
 "js/sci_animals.js",
 "js/sci_art.js",
 "js/sci_living.js",
 "js/sci_topics.js",
 "js/selftest.js",
 "js/sightwords.js",
 "js/speech.js",
 "js/wordmatch.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("merit-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
