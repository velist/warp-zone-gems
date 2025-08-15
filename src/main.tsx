import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 性能监控初始化
import { initPerformanceMonitoring } from './lib/performance'
// PWA 初始化
import { initPWA } from './lib/pwa'

// 初始化性能监控
if (typeof window !== 'undefined') {
  initPerformanceMonitoring();
  
  // 初始化 PWA
  initPWA().catch(error => {
    console.error('PWA 初始化失败:', error);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
