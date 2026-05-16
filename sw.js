// ── 木可的毛绒收藏工具 Service Worker ──────────────────────────────────────
// ⚠️ 每次更新 index.html 后，把下面的版本号 +1，手机会自动拉取新版本
const CACHE_VER = 'muke-v11';

// ── 安装：直接激活，不预缓存（预缓存失败会导致 SW 永远装不上）──────────────
self.addEventListener('install', event => {
  self.skipWaiting();
});

// ── 激活：删除旧版本缓存，立即接管所有页面 ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VER).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── 接收主线程指令 ────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── 请求拦截：网络优先，成功后写入缓存，离线时用缓存兜底 ──────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VER).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
