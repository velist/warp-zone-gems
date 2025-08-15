// PWA 服务注册和管理

// Service Worker 注册
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('此浏览器不支持 Service Worker');
    return null;
  }

  try {
    console.log('正在注册 Service Worker...');
    
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // 始终检查更新
    });

    console.log('Service Worker 注册成功:', registration.scope);

    // 监听更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        console.log('发现 Service Worker 更新');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('新版本可用，等待激活');
            // 通知用户有更新可用
            notifyUpdate();
          }
        });
      }
    });

    // 检查是否有等待激活的 Service Worker
    if (registration.waiting) {
      console.log('检测到等待激活的 Service Worker');
      notifyUpdate();
    }

    return registration;
  } catch (error) {
    console.error('Service Worker 注册失败:', error);
    return null;
  }
}

// 通知用户更新可用
function notifyUpdate() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Warp Zone Gems', {
      body: '有新版本可用，点击更新以获得最新功能',
      icon: '/icons/icon-192x192.png',
      tag: 'update-available',
      requireInteraction: true,
      actions: [
        {
          action: 'update',
          title: '立即更新'
        },
        {
          action: 'dismiss',
          title: '稍后提醒'
        }
      ]
    });
  } else {
    // fallback: 在页面显示更新提示
    showUpdateBanner();
  }
}

// 显示更新横幅
function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 9999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <span style="margin-right: 16px;">🚀 新版本可用！</span>
      <button onclick="updateApp()" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 8px;
      ">立即更新</button>
      <button onclick="dismissUpdate()" style="
        background: transparent;
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
      ">稍后</button>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // 全局函数
  (window as any).updateApp = () => {
    skipWaiting();
    banner.remove();
  };
  
  (window as any).dismissUpdate = () => {
    banner.remove();
  };
}

// 跳过等待，立即激活新的 Service Worker
export async function skipWaiting() {
  const registration = await navigator.serviceWorker.ready;
  
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // 监听控制器变化
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
}

// 请求通知权限
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('此浏览器不支持通知');
    return 'denied';
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// 发送推送通知
export function sendNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options
    });
  }
}

// 注册推送通知
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('此浏览器不支持推送通知');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // 检查是否已订阅
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    // 请求通知权限
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('用户拒绝了通知权限');
      return null;
    }

    // 创建新订阅
    const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // 需要配置
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    console.log('推送通知订阅成功');
    
    // 将订阅信息发送到服务器
    // await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('推送通知订阅失败:', error);
    return null;
  }
}

// VAPID 密钥转换工具
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// 缓存管理
export class CacheManager {
  static async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;
    
    let totalSize = 0;
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  }

  static async clearCache(): Promise<void> {
    if (!('caches' in window)) return;
    
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('所有缓存已清理');
  }

  static async clearSpecificCache(cacheName: string): Promise<boolean> {
    if (!('caches' in window)) return false;
    
    return await caches.delete(cacheName);
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 离线状态管理
export class OfflineManager {
  private static onlineListeners: (() => void)[] = [];
  private static offlineListeners: (() => void)[] = [];
  
  static init() {
    window.addEventListener('online', () => {
      console.log('网络连接已恢复');
      this.onlineListeners.forEach(listener => listener());
    });
    
    window.addEventListener('offline', () => {
      console.log('网络连接已断开');
      this.offlineListeners.forEach(listener => listener());
    });
  }
  
  static onOnline(callback: () => void) {
    this.onlineListeners.push(callback);
  }
  
  static onOffline(callback: () => void) {
    this.offlineListeners.push(callback);
  }
  
  static isOnline(): boolean {
    return navigator.onLine;
  }
  
  static showOfflineMessage() {
    sendNotification('网络连接已断开', {
      body: '您现在处于离线模式，部分功能可能不可用',
      tag: 'offline-status'
    });
  }
  
  static showOnlineMessage() {
    sendNotification('网络连接已恢复', {
      body: '您现在可以访问所有功能',
      tag: 'online-status'
    });
  }
}

// 应用更新管理
export class UpdateManager {
  static async checkForUpdates(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false;
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return registration.waiting !== null;
      }
    } catch (error) {
      console.error('检查更新失败:', error);
    }
    
    return false;
  }
  
  static async applyUpdate(): Promise<void> {
    await skipWaiting();
  }
}

// PWA 安装统计
export class InstallAnalytics {
  static trackInstallPrompt() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install_prompt_shown', {
        event_category: 'PWA',
        event_label: 'Install Prompt'
      });
    }
  }
  
  static trackInstallAccepted() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install_accepted', {
        event_category: 'PWA',
        event_label: 'Install Accepted'
      });
    }
  }
  
  static trackInstallDismissed() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install_dismissed', {
        event_category: 'PWA',
        event_label: 'Install Dismissed'
      });
    }
  }
}

// 初始化 PWA
export async function initPWA() {
  console.log('初始化 PWA...');
  
  // 注册 Service Worker
  await registerServiceWorker();
  
  // 初始化离线管理
  OfflineManager.init();
  
  // 请求通知权限（可选）
  if (localStorage.getItem('notification-permission-requested') !== 'true') {
    setTimeout(async () => {
      await requestNotificationPermission();
      localStorage.setItem('notification-permission-requested', 'true');
    }, 30000); // 30秒后请求
  }
  
  console.log('PWA 初始化完成');
}