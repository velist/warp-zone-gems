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

    const stepResults = [];

    try {
      // 方法1：通过插入数据来触发字段添加
      console.log('尝试方法1：通过数据插入测试字段是否存在...');
      
      const testGame = {
        id: 'field-test-' + Date.now(),
        title: '字段测试游戏',
        description: '用于测试数据库字段的临时数据',
        category: '测试',
        tags: ['测试'],
        author: 'DatabaseFixer',
        view_count: 100,
        download_count: 50,
        status: 'published'
      };

      // 尝试插入包含所有字段的数据
      const { data: insertTest, error: insertError } = await supabase
        .from('games')
        .insert(testGame)
        .select();

      if (insertError) {
        stepResults.push({
          name: '字段完整性测试',
          success: false,
          message: `字段缺失: ${insertError.message}`
        });

        // 如果插入失败，说明字段不存在，需要手动修复
        console.log('字段不存在，尝试方法2：通过Supabase客户端操作...');
        
        // 方法2：使用PostgreSQL REST API
        try {
          const supabaseUrl = supabase.supabaseUrl;
          const supabaseKey = supabase.supabaseKey;
          
          // 创建包含基础字段的备份数据
          const { data: existingGames } = await supabase
            .from('games')
            .select('*')
            .limit(5);

          stepResults.push({
            name: '读取现有数据',
            success: true,
            message: `成功读取 ${existingGames?.length || 0} 条现有游戏数据`
          });

          // 方法3：创建新表并迁移数据
          const backupTableName = `games_backup_${Date.now()}`;
          
          // 先从JSON文件获取完整数据结构
          const response = await fetch('/warp-zone-gems/data/games.json');
          const jsonGames = await response.json();
          
          if (jsonGames && jsonGames.length > 0) {
            stepResults.push({
              name: '读取JSON数据',
              success: true,
              message: `成功读取 ${jsonGames.length} 条JSON游戏数据`
            });

            // 方法4：最安全的字段同步（只包含绝对确定存在的字段）
            const ultraSafeGames = jsonGames.map(game => ({
              id: game.id,
              title: game.title,
              description: game.description || '',
              category: game.category
              // 只包含最基础的4个必需字段
            }));

            // 批量插入超级安全字段
            const { data: safeInsert, error: safeInsertError } = await supabase
              .from('games')
              .upsert(ultraSafeGames, { onConflict: 'id' })
              .select();

            if (safeInsertError) {
              stepResults.push({
                name: '安全字段同步',
                success: false,
                message: safeInsertError.message
              });
            } else {
              stepResults.push({
                name: '安全字段同步',
                success: true,
                message: `成功同步 ${safeInsert?.length || 0} 条游戏数据（超级安全模式：仅4个基础字段）`
              });
            }
          } else {
            stepResults.push({
              name: '读取JSON数据',
              success: false,
              message: '无法读取JSON游戏数据'
            });
          }

        } catch (restError) {
          stepResults.push({
            name: 'REST API操作',
            success: false,
            message: restError.message
          });
        }

      } else {
        // 插入成功，说明字段存在
        stepResults.push({
          name: '字段完整性测试',
          success: true,
          message: '所有字段都存在，数据库结构正常'
        });

        // 清理测试数据
        await supabase.from('games').delete().eq('id', testGame.id);
        
        stepResults.push({
          name: '清理测试数据',
          success: true,
          message: '测试数据已清理'
        });

        // 如果字段存在，直接进行完整同步
        try {
          const response = await fetch('/warp-zone-gems/data/games.json');
          const jsonGames = await response.json();
          
          const completeGames = jsonGames.map(game => ({
            id: game.id,
            title: game.title,
            description: game.description || '',
            content: game.content || game.description || '',
            cover_image: game.cover_image || '',
            category: game.category,
            tags: game.tags || [],
            author: game.author || 'System',
            download_link: game.download_link || '#',
            published_at: game.published_at || game.created_at || new Date().toISOString(),
            view_count: game.view_count || 0,
            download_count: game.download_count || 0,
            status: game.status || 'published'
          }));

          const { data: fullSync, error: fullSyncError } = await supabase
            .from('games')
            .upsert(completeGames, { onConflict: 'id' })
            .select();

          if (fullSyncError) {
            stepResults.push({
              name: '完整数据同步',
              success: false,
              message: fullSyncError.message
            });
          } else {
            stepResults.push({
              name: '完整数据同步',
              success: true,
              message: `成功同步 ${fullSync?.length || 0} 条游戏数据（包含所有字段）`
            });
          }
        } catch (syncError) {
          stepResults.push({
            name: '完整数据同步',
            success: false,
            message: syncError.message
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
                <h3 className="font-medium text-blue-800 mb-2">智能修复策略：</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 测试数据库字段完整性</li>
                  <li>• 如字段缺失，同步基础字段数据</li>
                  <li>• 如字段存在，同步完整数据（包含统计字段）</li>
                  <li>• 自动处理数据格式转换和兼容性</li>
                </ul>
              </div>

              <Button 
                onClick={fixDatabaseSchema}
                disabled={fixing || !user}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                {fixing ? '智能修复中...' : '智能诊断并修复'}
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