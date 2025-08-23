import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database, CheckCircle, AlertCircle, Eye } from 'lucide-react';

/**
 * 数据库表结构检查器
 * 用于检查games表的真实字段结构
 */
const TableInspector = () => {
  const [checking, setChecking] = useState(false);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const inspectTable = async () => {
    if (!user) {
      setError('请先登录管理员账户');
      return;
    }

    setChecking(true);
    setTableInfo(null);
    setError('');

    try {
      // 方法1: 查询现有数据来推断表结构
      console.log('正在检查games表结构...');
      
      const { data: existingGames, error: selectError } = await supabase
        .from('games')
        .select('*')
        .limit(1);

      if (selectError) {
        throw new Error(`无法读取games表: ${selectError.message}`);
      }

      // 从返回的数据推断字段结构
      const actualFields = existingGames && existingGames.length > 0 
        ? Object.keys(existingGames[0])
        : [];

      // 测试各种可能的字段
      const testFields = [
        'id', 'title', 'description', 'content', 'cover_image', 
        'category', 'tags', 'author', 'published_at', 'created_at', 
        'updated_at', 'download_link', 'view_count', 'download_count', 'status'
      ];

      const fieldTests = [];

      for (const field of testFields) {
        try {
          // 尝试选择特定字段
          const { data, error } = await supabase
            .from('games')
            .select(field)
            .limit(1);

          fieldTests.push({
            field,
            exists: !error,
            error: error?.message
          });
        } catch (fieldError) {
          fieldTests.push({
            field,
            exists: false,
            error: fieldError.message
          });
        }
      }

      // 尝试插入测试数据来确定最安全的字段集
      const safeTestData = {
        id: 'safe-test-' + Date.now(),
        title: '安全测试游戏',
        description: '用于测试最小字段集的数据',
        category: '测试'
      };

      let safeFields = ['id', 'title', 'description', 'category'];
      const insertTests = [];

      // 测试基础字段插入
      try {
        const { data: basicInsert, error: basicError } = await supabase
          .from('games')
          .insert(safeTestData)
          .select();

        if (basicError) {
          insertTests.push({
            test: '基础字段插入',
            success: false,
            message: basicError.message
          });
        } else {
          insertTests.push({
            test: '基础字段插入',
            success: true,
            message: '成功插入基础字段数据'
          });

          // 清理测试数据
          await supabase.from('games').delete().eq('id', safeTestData.id);
        }
      } catch (testError) {
        insertTests.push({
          test: '基础字段插入',
          success: false,
          message: testError.message
        });
      }

      // 读取JSON数据结构进行对比
      const response = await fetch('/warp-zone-gems/data/games.json');
      const jsonGames = await response.json();
      const jsonFields = jsonGames.length > 0 ? Object.keys(jsonGames[0]) : [];

      setTableInfo({
        actualFields,
        fieldTests: fieldTests.filter(test => test.exists),
        missingFields: fieldTests.filter(test => !test.exists),
        insertTests,
        jsonFields,
        compatibility: {
          safeFields: actualFields.filter(field => jsonFields.includes(field)),
          jsonOnlyFields: jsonFields.filter(field => !actualFields.includes(field)),
          dbOnlyFields: actualFields.filter(field => !jsonFields.includes(field))
        }
      });

    } catch (error) {
      console.error('表结构检查失败:', error);
      setError(error.message);
    } finally {
      setChecking(false);
    }
  };

  const generateSafeSync = () => {
    if (!tableInfo) return;

    const safeFields = tableInfo.compatibility.safeFields;
    const syncCode = `
// 安全同步代码 (仅包含数据库实际存在的字段)
const safeGames = jsonGames.map(game => ({
${safeFields.map(field => `  ${field}: game.${field} || ${getDefaultValue(field)}`).join(',\n')}
}));

await supabase
  .from('games')
  .upsert(safeGames, { onConflict: 'id' });
`;

    navigator.clipboard.writeText(syncCode);
    alert('安全同步代码已复制到剪贴板！');
  };

  const getDefaultValue = (field: string) => {
    const defaults: Record<string, string> = {
      'id': "''",
      'title': "''",
      'description': "''",
      'content': "''",
      'cover_image': "''",
      'category': "'未分类'",
      'tags': '[]',
      'author': "'System'",
      'published_at': 'new Date().toISOString()',
      'created_at': 'new Date().toISOString()',
      'updated_at': 'new Date().toISOString()',
      'download_link': "'#'",
      'view_count': '0',
      'download_count': '0',
      'status': "'published'"
    };
    return defaults[field] || "''";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <CardTitle>数据库表结构检查器</CardTitle>
            </div>
            <CardDescription>
              检查games表的真实字段结构，生成安全的同步方案
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={inspectTable}
              disabled={checking || !user}
              className="w-full mb-4"
            >
              <Database className="h-4 w-4 mr-2" />
              {checking ? '检查中...' : '检查表结构'}
            </Button>

            {!user && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  请先登录管理员账户才能检查数据库表结构
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tableInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 数据库字段 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">数据库实际字段</CardTitle>
                <CardDescription>games表中实际存在的字段</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tableInfo.actualFields.map((field: string) => (
                    <div key={field} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-mono text-sm">{field}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 缺失字段 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">缺失字段</CardTitle>
                <CardDescription>JSON数据中有但数据库中没有的字段</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tableInfo.compatibility.jsonOnlyFields.map((field: string) => (
                    <div key={field} className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="font-mono text-sm">{field}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 兼容性分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">兼容性分析</CardTitle>
                <CardDescription>可安全同步的字段</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">安全字段 ({tableInfo.compatibility.safeFields.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {tableInfo.compatibility.safeFields.map((field: string) => (
                        <span key={field} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={generateSafeSync} variant="outline" size="sm">
                    生成安全同步代码
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* JSON数据字段 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-700">JSON数据字段</CardTitle>
                <CardDescription>前端JSON文件中的字段</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tableInfo.jsonFields.map((field: string) => (
                    <div key={field} className="flex items-center space-x-2">
                      <div className={`h-4 w-4 rounded ${
                        tableInfo.compatibility.safeFields.includes(field) 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`} />
                      <span className="font-mono text-sm">{field}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableInspector;