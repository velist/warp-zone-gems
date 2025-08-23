import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, AlertCircle, Settings, Database } from 'lucide-react';

/**
 * 数据库修复工具页面
 * 用于修复同步功能的字段缺失问题
 */
const DatabaseFixer = () => {
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fixDatabaseSchema = async () => {
    if (!user) {
      setError('请先登录管理员账户');
      return;
    }

    setFixing(true);
    setResults([]);
    setError('');

    const sqlStatements = [
      {
        name: '添加view_count字段',
        sql: 'ALTER TABLE games ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0'
      },
      {
        name: '添加download_count字段', 
        sql: 'ALTER TABLE games ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0'
      },
      {
        name: '添加status字段',
        sql: 'ALTER TABLE games ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'published\''
      },
      {
        name: '更新现有数据默认值',
        sql: 'UPDATE games SET view_count = 0 WHERE view_count IS NULL'
      },
      {
        name: '更新现有数据默认值',
        sql: 'UPDATE games SET download_count = 0 WHERE download_count IS NULL'
      },
      {
        name: '更新现有数据默认值', 
        sql: 'UPDATE games SET status = \'published\' WHERE status IS NULL'
      }
    ];

    const stepResults = [];

    try {
      for (const statement of sqlStatements) {
        try {
          console.log(`执行SQL: ${statement.sql}`);
          
          // 使用 supabase.rpc 执行原生SQL
          const { data, error: sqlError } = await supabase.rpc('exec_sql', {
            sql: statement.sql
          });

          if (sqlError) {
            // 如果是"已存在"错误，视为成功
            if (sqlError.message.includes('already exists') || 
                sqlError.message.includes('duplicate column name')) {
              stepResults.push({
                name: statement.name,
                success: true,
                message: '字段已存在，跳过'
              });
            } else {
              throw sqlError;
            }
          } else {
            stepResults.push({
              name: statement.name,
              success: true,
              message: '执行成功'
            });
          }
        } catch (stepError) {
          stepResults.push({
            name: statement.name,
            success: false,
            message: stepError.message
          });
        }
      }

      // 验证修复结果
      try {
        const testData = {
          id: 'test-' + Date.now(),
          title: '测试游戏',
          description: '数据库修复测试',
          category: '测试',
          tags: ['测试'],
          author: 'Database Fixer',
          status: 'published',
          view_count: 100,
          download_count: 50
        };

        const { data: insertData, error: insertError } = await supabase
          .from('games')
          .insert(testData)
          .select();

        if (insertError) {
          stepResults.push({
            name: '插入测试',
            success: false,
            message: insertError.message
          });
        } else {
          stepResults.push({
            name: '插入测试',
            success: true,
            message: '字段完整性验证成功'
          });

          // 清理测试数据
          await supabase.from('games').delete().eq('id', testData.id);
        }
      } catch (testError) {
        stepResults.push({
          name: '验证测试',
          success: false,
          message: testError.message
        });
      }

      setResults(stepResults);

      const successCount = stepResults.filter(r => r.success).length;
      const totalCount = stepResults.length;

      if (successCount === totalCount) {
        setError('');
        console.log('✅ 数据库修复完成！现在可以重试同步功能。');
      } else {
        setError(`修复部分完成：${successCount}/${totalCount} 个步骤成功`);
      }

    } catch (error) {
      console.error('数据库修复失败:', error);
      setError(error.message);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <CardTitle>数据库修复工具</CardTitle>
            </div>
            <CardDescription>
              修复同步功能的字段缺失问题："Could not find the download_count column"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">修复内容：</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 添加 view_count 字段（游戏查看次数）</li>
                  <li>• 添加 download_count 字段（游戏下载次数）</li>
                  <li>• 添加 status 字段（游戏发布状态）</li>
                  <li>• 更新现有数据的默认值</li>
                </ul>
              </div>

              <Button 
                onClick={fixDatabaseSchema}
                disabled={fixing || !user}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                {fixing ? '修复中...' : '开始修复数据库'}
              </Button>

              {!user && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    请先登录管理员账户才能执行数据库修复操作
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>修复结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.message}
                    </span>
                  </div>
                ))}
              </div>

              {results.every(r => r.success) && (
                <Alert className="mt-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    🎉 数据库修复完成！现在可以返回内容管理页面重试同步功能。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DatabaseFixer;