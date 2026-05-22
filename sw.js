// ── 木可的毛绒收藏工具 Service Worker ──────────────────────────────────────
// ⚠️ 每次更新 index.html 后，把下面的版本号 +1，手机会自动拉取新版本
const CACHE_VER = 'muke-v20';

// ── 安装：立即激活，绝不预缓存 ───────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

// ── 激活：清空所有旧缓存，立即接管 ──────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── 接收主线程指令 ────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── 不拦截任何 fetch 请求 ─────────────────────────────────────────────────
// 不注册 fetch 事件处理器，所有网络请求直接走浏览器正常通道
// 这样即使 SW 存在，也不会影响页面加载
