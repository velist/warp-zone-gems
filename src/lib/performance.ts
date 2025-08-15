import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// 性能指标基准
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // 毫秒
  INP: { good: 200, needsImprovement: 500 },   // 毫秒
  CLS: { good: 0.1, needsImprovement: 0.25 },  // 分数
  FCP: { good: 1800, needsImprovement: 3000 }, // 毫秒
  TTFB: { good: 800, needsImprovement: 1800 }  // 毫秒
};

// 性能等级评定
export function getPerformanceGrade(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS];
  if (!threshold) return 'poor';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

// 性能数据收集器
class PerformanceCollector {
  private metrics: Map<string, Metric> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.setupVitalsCollection();
    this.setupCustomMetrics();
  }

  private setupVitalsCollection() {
    if (!this.isEnabled) return;

    onCLS(this.onMetric.bind(this));
    onINP(this.onMetric.bind(this));
    onFCP(this.onMetric.bind(this));
    onLCP(this.onMetric.bind(this));
    onTTFB(this.onMetric.bind(this));
  }

  private onMetric(metric: Metric) {
    this.metrics.set(metric.name, metric);
    
    // 性能评级
    const grade = getPerformanceGrade(metric.name, metric.value);
    
    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚀 Performance: ${metric.name}`);
      console.log(`Value: ${metric.value.toFixed(2)}${this.getUnit(metric.name)}`);
      console.log(`Grade: ${grade}`);
      console.log(`Rating: ${metric.rating}`);
      console.log(`Delta: ${metric.delta?.toFixed(2)}`);
      console.groupEnd();
    }

    // 发送到分析服务（生产环境）
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric, grade);
    }

    // 性能警告
    if (grade === 'poor') {
      console.warn(`⚠️ Poor ${metric.name} performance: ${metric.value.toFixed(2)}${this.getUnit(metric.name)}`);
    }
  }

  private getUnit(metricName: string): string {
    if (metricName === 'CLS') return '';
    return 'ms';
  }

  private sendToAnalytics(metric: Metric, grade: string) {
    // 这里可以集成 Google Analytics, Sentry, 或其他分析服务
    // 暂时使用 console.log 模拟
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: grade,
      });
    }
  }

  private setupCustomMetrics() {
    // 自定义性能指标
    this.trackRouteChanges();
    this.trackAPIPerformance();
    this.trackResourceLoading();
  }

  private trackRouteChanges() {
    // 跟踪路由切换性能
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const trackNavigation = () => {
      const startTime = performance.now();
      
      // 等待下一个渲染完成
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const navigationTime = endTime - startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Route change: ${navigationTime.toFixed(2)}ms`);
        }
      });
    };

    history.pushState = function(...args) {
      trackNavigation();
      return originalPushState.apply(this, args);
    };

    history.replaceState = function(...args) {
      trackNavigation();
      return originalReplaceState.apply(this, args);
    };
  }

  private trackAPIPerformance() {
    // 跟踪 API 请求性能
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      const startTime = performance.now();
      const url = args[0]?.toString() || 'unknown';
      
      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 记录 API 性能
        if (process.env.NODE_ENV === 'development') {
          console.log(`🌐 API ${url}: ${duration.toFixed(2)}ms (${response.status})`);
        }

        // 慢查询警告
        if (duration > 3000) {
          console.warn(`🐌 Slow API call: ${url} took ${duration.toFixed(2)}ms`);
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.error(`❌ API Error ${url}: ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    };
  }

  private trackResourceLoading() {
    // 跟踪资源加载性能
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          // 大文件加载警告
          if (resource.transferSize > 1024 * 1024) { // 1MB
            console.warn(`📦 Large resource: ${resource.name} (${(resource.transferSize / 1024 / 1024).toFixed(2)}MB)`);
          }
          
          // 慢加载警告
          if (resource.duration > 2000) {
            console.warn(`🐌 Slow resource: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  // 获取当前性能指标
  getMetrics(): Record<string, Metric> {
    const result: Record<string, Metric> = {};
    this.metrics.forEach((metric, name) => {
      result[name] = metric;
    });
    return result;
  }

  // 生成性能报告
  generateReport(): PerformanceReport {
    const metrics = this.getMetrics();
    const scores: Record<string, number> = {};
    let overallScore = 0;
    let totalMetrics = 0;

    Object.entries(metrics).forEach(([name, metric]) => {
      const grade = getPerformanceGrade(name, metric.value);
      let score = 0;
      
      switch (grade) {
        case 'good': score = 90; break;
        case 'needs-improvement': score = 50; break;
        case 'poor': score = 20; break;
      }
      
      scores[name] = score;
      overallScore += score;
      totalMetrics++;
    });

    overallScore = totalMetrics > 0 ? Math.round(overallScore / totalMetrics) : 0;

    return {
      overall: overallScore,
      metrics: metrics,
      scores: scores,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
  }
}

// 性能报告接口
export interface PerformanceReport {
  overall: number;
  metrics: Record<string, Metric>;
  scores: Record<string, number>;
  timestamp: string;
  url: string;
}

// 全局性能收集器实例
let performanceCollector: PerformanceCollector | null = null;

// 初始化性能监控
export function initPerformanceMonitoring(): PerformanceCollector {
  if (!performanceCollector && typeof window !== 'undefined') {
    performanceCollector = new PerformanceCollector();
  }
  return performanceCollector!;
}

// 获取性能报告
export function getPerformanceReport(): PerformanceReport | null {
  return performanceCollector?.generateReport() || null;
}

// 导出性能收集器类
export { PerformanceCollector };