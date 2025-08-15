// Warp Zone Gems - Service Worker
// 缓存策略: Stale While Revalidate + Cache First

const CACHE_NAME = 'warp-zone-gems-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';
const IMAGE_CACHE = 'images-v1.0.0';

// 需要预缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  // 其他静态资源将由构建工具自动添加
];

// 图片资源模式
const IMAGE_PATTERNS = [
  /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i,
  /^https:\/\/.*\.(png|jpg|jpeg|gif|webp|svg)$/i,
  /imgbb\.com/,
  /supabase\.co.*\/storage/
];

// API 缓存模式
const API_PATTERNS = [
  /\/api\//,
  /supabase\.co.*\/rest/,
  /siliconflow\.cn/
];

// 安装事件 - 预缓存静态资源
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// 请求拦截 - 实现缓存策略
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 忽略 Chrome 扩展请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // 根据资源类型选择缓存策略
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// 判断是否为图片请求
function isImageRequest(request) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(request.url));
}

// 判断是否为 API 请求
function isAPIRequest(request) {
  return API_PATTERNS.some(pattern => pattern.test(request.url));
}

// 判断是否为静态资源
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.origin === self.location.origin && 
         (url.pathname.includes('/assets/') || 
          url.pathname.includes('/static/') ||
          STATIC_ASSETS.includes(url.pathname));
}

// 处理图片请求 - Cache First
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Image cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Image cache miss, fetching:', request.url);
    const response = await fetch(request);
    
    // 只缓存成功的响应
    if (response.ok && response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Image request failed:', error);
    return new Response('Image not available', { 
      status: 404, 
      statusText: 'Not Found' 
    });
  }
}

// 处理 API 请求 - Network First with timeout
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    // 设置超时时间
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), 5000)
    );
    
    try {
      const response = await Promise.race([fetch(request), timeoutPromise]);
      
      if (response.ok) {
        // 缓存成功的响应（除了POST等修改操作）
        if (request.method === 'GET') {
          cache.put(request, response.clone());
        }
        return response;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (networkError) {
      console.log('[SW] Network failed, trying cache:', request.url);
      
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('[SW] API cache hit:', request.url);
        return cachedResponse;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('[SW] API request failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Service unavailable',
      message: '网络连接失败，请稍后重试'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理静态资源 - Cache First
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Static cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Static cache miss, fetching:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Static asset request failed:', error);
    return new Response('Asset not available', { 
      status: 404, 
      statusText: 'Not Found' 
    });
  }
}

// 处理页面请求 - Stale While Revalidate
async function handlePageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // 异步更新缓存
    const fetchPromise = fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(error => {
        console.error('[SW] Page fetch error:', error);
        return null;
      });
    
    // 如果有缓存，立即返回缓存内容
    if (cachedResponse) {
      console.log('[SW] Page cache hit:', request.url);
      // 后台更新缓存
      fetchPromise.catch(() => {}); // 忽略后台更新错误
      return cachedResponse;
    }
    
    // 没有缓存，等待网络响应
    console.log('[SW] Page cache miss, fetching:', request.url);
    const response = await fetchPromise;
    
    if (response) {
      return response;
    }
    
    // 网络失败，返回离线页面
    return getOfflinePage();
  } catch (error) {
    console.error('[SW] Page request failed:', error);
    return getOfflinePage();
  }
}

// 获取离线页面
function getOfflinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>离线模式 - Warp Zone Gems</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 40px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          max-width: 400px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        h1 {
          margin: 0 0 16px 0;
          font-size: 24px;
        }
        p {
          margin: 0 0 24px 0;
          opacity: 0.9;
          line-height: 1.5;
        }
        .button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }
        .button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🎮</div>
        <h1>离线模式</h1>
        <p>网络连接不可用，您正在浏览缓存的内容。请检查网络连接后重试。</p>
        <a href="/" class="button" onclick="window.location.reload()">重新加载</a>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// 推送通知事件
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: '发现新的马里奥游戏资源！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'new-game',
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: '查看详情',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: '忽略',
        icon: '/icons/action-dismiss.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification('Warp Zone Gems', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'dismiss') {
    // 用户选择忽略，不执行任何操作
  } else {
    // 点击通知本体
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 后台同步事件
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 执行后台同步
async function doBackgroundSync() {
  try {
    // 这里可以实现离线数据同步逻辑
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// 缓存清理 - 定期清理过期缓存
async function cleanupCaches() {
  const cacheNames = await caches.keys();
  const imageCache = await caches.open(IMAGE_CACHE);
  const keys = await imageCache.keys();
  
  // 清理超过 50 个图片缓存
  if (keys.length > 50) {
    const keysToDelete = keys.slice(0, keys.length - 50);
    await Promise.all(
      keysToDelete.map(key => imageCache.delete(key))
    );
    console.log(`[SW] Cleaned up ${keysToDelete.length} image caches`);
  }
}

// 每小时清理一次缓存
setInterval(cleanupCaches, 60 * 60 * 1000);

console.log('[SW] Service Worker loaded successfully');