import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { getPerformanceReport, PerformanceReport } from "@/lib/performance";

interface PerformanceMonitorProps {
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ className }) => {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 完全禁用性能监控器 - 不在任何环境下显示
    // 原来的逻辑：只在开发环境显示
    // if (process.env.NODE_ENV === 'development') {
    //   setIsVisible(true);
    //   
    //   // 定期更新性能报告
    //   const interval = setInterval(() => {
    //     const newReport = getPerformanceReport();
    //     if (newReport) {
    //       setReport(newReport);
    //     }
    //   }, 5000);

    //   return () => clearInterval(interval);
    // }
    
    // 性能监控器已被隐藏以提供更清洁的用户界面
    setIsVisible(false);
  }, []);

  const getGradeColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4" />;
    if (score >= 50) return <TrendingUp className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  if (!isVisible || !report) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-80 shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" />
            性能监控
            <Badge variant="secondary" className={getGradeColor(report.overall)}>
              {getGradeIcon(report.overall)}
              {report.overall}分
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* 核心指标 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(report.metrics).map(([name, metric]) => {
              const score = report.scores[name] || 0;
              return (
                <div key={name} className="flex justify-between items-center">
                  <span className="font-medium">{name}:</span>
                  <div className="flex items-center gap-1">
                    <span>{metric.value.toFixed(name === 'CLS' ? 3 : 0)}{name === 'CLS' ? '' : 'ms'}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs h-5 ${getGradeColor(score)}`}
                    >
                      {score}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                const newReport = getPerformanceReport();
                if (newReport) setReport(newReport);
              }}
            >
              刷新
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                console.table(report.metrics);
                console.log('Performance Report:', report);
              }}
            >
              详情
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => setIsVisible(false)}
            >
              隐藏
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            更新时间: {new Date(report.timestamp).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};