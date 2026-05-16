// ── 木可的毛绒收藏工具 Service Worker ──────────────────────────────────────
// ⚠️ 每次更新 index.html 后，把下面的版本号 +1，手机会自动拉取新版本
const CACHE_VER  = 'muke-v9';
const CACHE_FILES = ['./index.html', './manifest.json', './icon.svg'];

// ── 安装：缓存核心文件 ─────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VER)
      .then(cache => cache.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

// ── 激活：删除旧版本缓存 ───────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VER).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── 接收主线程指令（用于立即激活新版本）────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── 请求拦截：网络优先，离线兜底 ──────────────────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // 只处理同源请求
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功拿到新内容 → 同时写入缓存
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VER).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 离线时从缓存返回
        return caches.match(event.request)
          .then(cached => cached || caches.match('./index.html'));
      })
  );
});
