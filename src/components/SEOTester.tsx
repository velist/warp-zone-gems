import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Search, 
  Globe, 
  Zap, 
  Image as ImageIcon,
  FileText,
  BarChart3
} from 'lucide-react';
import { getPerformanceReport } from '@/lib/performance';

interface SEOCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  category: 'meta' | 'content' | 'structure' | 'performance' | 'images';
}

export const SEOTester: React.FC = () => {
  const [checks, setChecks] = useState<SEOCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState<number>(0);

  const runSEOAnalysis = () => {
    setIsRunning(true);
    const results: SEOCheck[] = [];

    // Meta标签检查
    results.push(...checkMetaTags());
    
    // 结构化数据检查
    results.push(...checkStructuredData());
    
    // 图片优化检查
    results.push(...checkImages());
    
    // 性能检查
    results.push(...checkPerformance());
    
    // 内容质量检查
    results.push(...checkContent());
    
    // 技术SEO检查
    results.push(...checkTechnicalSEO());

    setChecks(results);
    
    // 计算总分
    const passCount = results.filter(check => check.status === 'pass').length;
    const totalCount = results.length;
    const calculatedScore = Math.round((passCount / totalCount) * 100);
    setScore(calculatedScore);
    
    setIsRunning(false);
  };

  const checkMetaTags = (): SEOCheck[] => {
    const results: SEOCheck[] = [];

    // Title检查
    const title = document.title;
    if (title && title.length > 0 && title.length <= 60) {
      results.push({
        name: 'Page Title',
        status: 'pass',
        message: `标题长度合适: ${title.length}字符`,
        category: 'meta'
      });
    } else if (title.length > 60) {
      results.push({
        name: 'Page Title',
        status: 'warning',
        message: `标题过长: ${title.length}字符，建议60字符以内`,
        category: 'meta'
      });
    } else {
      results.push({
        name: 'Page Title',
        status: 'fail',
        message: '缺少页面标题',
        category: 'meta'
      });
    }

    // Description检查
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    if (description && description.length >= 120 && description.length <= 160) {
      results.push({
        name: 'Meta Description',
        status: 'pass',
        message: `描述长度合适: ${description.length}字符`,
        category: 'meta'
      });
    } else if (description && description.length > 160) {
      results.push({
        name: 'Meta Description',
        status: 'warning',
        message: `描述过长: ${description.length}字符，建议160字符以内`,
        category: 'meta'
      });
    } else {
      results.push({
        name: 'Meta Description',
        status: 'fail',
        message: '缺少或描述过短',
        category: 'meta'
      });
    }

    // Open Graph检查
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (ogTitle && ogDescription && ogImage) {
      results.push({
        name: 'Open Graph Tags',
        status: 'pass',
        message: '完整的社交媒体标签',
        category: 'meta'
      });
    } else {
      results.push({
        name: 'Open Graph Tags',
        status: 'warning',
        message: '社交媒体标签不完整',
        category: 'meta'
      });
    }

    return results;
  };

  const checkStructuredData = (): SEOCheck[] => {
    const results: SEOCheck[] = [];

    const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (structuredDataScript) {
      try {
        JSON.parse(structuredDataScript.textContent || '');
        results.push({
          name: 'Structured Data',
          status: 'pass',
          message: '包含有效的结构化数据',
          category: 'structure'
        });
      } catch {
        results.push({
          name: 'Structured Data',
          status: 'fail',
          message: '结构化数据格式错误',
          category: 'structure'
        });
      }
    } else {
      results.push({
        name: 'Structured Data',
        status: 'warning',
        message: '缺少结构化数据',
        category: 'structure'
      });
    }

    return results;
  };

  const checkImages = (): SEOCheck[] => {
    const results: SEOCheck[] = [];

    const images = document.querySelectorAll('img');
    let imagesWithAlt = 0;
    let totalImages = images.length;

    images.forEach(img => {
      if (img.alt && img.alt.trim() !== '') {
        imagesWithAlt++;
      }
    });

    const altPercentage = totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 100;

    if (altPercentage === 100) {
      results.push({
        name: 'Image Alt Tags',
        status: 'pass',
        message: `所有图片都有alt标签 (${totalImages}张)`,
        category: 'images'
      });
    } else if (altPercentage >= 80) {
      results.push({
        name: 'Image Alt Tags',
        status: 'warning',
        message: `${altPercentage.toFixed(1)}%的图片有alt标签`,
        category: 'images'
      });
    } else {
      results.push({
        name: 'Image Alt Tags',
        status: 'fail',
        message: `仅${altPercentage.toFixed(1)}%的图片有alt标签`,
        category: 'images'
      });
    }

    return results;
  };

  const checkPerformance = (): SEOCheck[] => {
    const results: SEOCheck[] = [];

    const performanceReport = getPerformanceReport();
    
    if (performanceReport) {
      if (performanceReport.overall >= 80) {
        results.push({
          name: 'Page Performance',
          status: 'pass',
          message: `性能评分: ${performanceReport.overall}/100`,
          category: 'performance'
        });
      } else if (performanceReport.overall >= 50) {
        results.push({
          name: 'Page Performance',
          status: 'warning',
          message: `性能评分: ${performanceReport.overall}/100 - 需要优化`,
          category: 'performance'
        });
      } else {
        results.push({
          name: 'Page Performance',
          status: 'fail',
          message: `性能评分: ${performanceReport.overall}/100 - 严重需要优化`,
          category: 'performance'
        });
      }
    } else {
      results.push({
        name: 'Page Performance',
        status: 'warning',
        message: '性能数据收集中...',
        category: 'performance'
      });
    }

    return results;
  };

  const checkContent = (): SEOCheck[] => {
    const results: SEOCheck[] = [];

    // H1标签检查
    const h1Tags = document.querySelectorAll('h1');
    if (h1Tags.length === 1) {
      results.push({
        name: 'H1 Tag',
        status: 'pass',
        message: '包含一个H1标签',
        category: 'content'
      });
    } else if (h1Tags.length === 0) {
      results.push({
        name: 'H1 Tag',
        status: 'fail',
        message: '缺少H1标签',
        category: 'content'
      });
    } else {
      results.push({
        name: 'H1 Tag',
        status: 'warning',
        message: `包含${h1Tags.length}个H1标签，建议只有一个`,
        category: 'content'
      });
    }

    // 标题层级检查
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length >= 3) {
      results.push({
        name: 'Heading Structure',
        status: 'pass',
        message: `良好的标题结构 (${headings.length}个标题)`,
        category: 'content'
      });
    } else {
      results.push({
        name: 'Heading Structure',
        status: 'warning',
        message: '标题层级较少，建议增加子标题',
        category: 'content'
      });
    }

    return results;
  };

  const checkTechnicalSEO = (): SEOCheck[] => {
    const results: SEOCheck[] = [];

    // Canonical链接检查
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      results.push({
        name: 'Canonical URL',
        status: 'pass',
        message: '设置了规范链接',
        category: 'structure'
      });
    } else {
      results.push({
        name: 'Canonical URL',
        status: 'warning',
        message: '缺少规范链接',
        category: 'structure'
      });
    }

    // Robots meta检查
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta || robotsMeta.getAttribute('content')?.includes('noindex')) {
      results.push({
        name: 'Robots Meta',
        status: 'warning',
        message: '页面可能被设置为不索引',
        category: 'structure'
      });
    } else {
      results.push({
        name: 'Robots Meta',
        status: 'pass',
        message: '允许搜索引擎索引',
        category: 'structure'
      });
    }

    // 语言声明检查
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      results.push({
        name: 'Language Declaration',
        status: 'pass',
        message: `页面语言: ${htmlLang}`,
        category: 'structure'
      });
    } else {
      results.push({
        name: 'Language Declaration',
        status: 'warning',
        message: '缺少页面语言声明',
        category: 'structure'
      });
    }

    return results;
  };

  const getStatusIcon = (status: SEOCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: SEOCheck['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">通过</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">警告</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">失败</Badge>;
    }
  };

  const getCategoryIcon = (category: SEOCheck['category']) => {
    switch (category) {
      case 'meta':
        return <Search className="w-4 h-4" />;
      case 'content':
        return <FileText className="w-4 h-4" />;
      case 'structure':
        return <Globe className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'images':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, SEOCheck[]>);

  useEffect(() => {
    // 页面加载后自动运行一次SEO检测
    setTimeout(() => {
      runSEOAnalysis();
    }, 2000);
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-6 h-6" />
          <span>SEO检测工具</span>
          {score > 0 && (
            <div className={`ml-auto text-2xl font-bold ${getScoreColor(score)}`}>
              {score}/100
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={runSEOAnalysis}
            disabled={isRunning}
            className="mario-button"
          >
            {isRunning ? '检测中...' : '重新检测'}
          </Button>
          
          {score > 0 && (
            <Alert className="flex-1">
              <AlertDescription>
                {score >= 80 ? '🎉 SEO表现优秀！' : 
                 score >= 60 ? '⚠️ SEO表现一般，需要改进' : 
                 '❌ SEO表现较差，需要大幅优化'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {checks.length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
              <Card key={category} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {getCategoryIcon(category as SEOCheck['category'])}
                    <span>
                      {category === 'meta' ? 'Meta标签' :
                       category === 'content' ? '内容质量' :
                       category === 'structure' ? '页面结构' :
                       category === 'performance' ? '性能优化' :
                       category === 'images' ? '图片优化' : '其他'}
                    </span>
                    <Badge variant="outline">
                      {categoryChecks.length}项检查
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {categoryChecks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(check.status)}
                          <div>
                            <div className="font-medium">{check.name}</div>
                            <div className="text-sm text-muted-foreground">{check.message}</div>
                          </div>
                        </div>
                        {getStatusBadge(check.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};