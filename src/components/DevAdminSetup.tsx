import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, AlertCircle } from 'lucide-react';

const DevAdminSetup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleCreateDevAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('密码确认不匹配');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6位');
      setLoading(false);
      return;
    }

    try {
      // 创建用户并立即确认邮箱（仅用于开发环境）
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin',
            dev_account: true
          },
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      }
    } catch (err) {
      setError('创建管理员账户失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data.user && !error) {
        navigate('/admin/dashboard');
      } else {
        setError(error?.message || '登录失败');
      }
    } catch (err) {
      setError('登录失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-amber-600 mr-2" />
            <h1 className="text-2xl font-bold">开发环境设置</h1>
          </div>
          <CardTitle className="text-xl font-bold text-center">创建开发管理员</CardTitle>
          <CardDescription className="text-center">
            快速创建开发环境管理员账户（无需邮箱验证）
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              此功能仅适用于开发环境，请勿在生产环境使用
            </AlertDescription>
          </Alert>
        </CardContent>

        <form onSubmit={handleCreateDevAdmin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  开发管理员账户创建成功！即将跳转到登录页面...
                  <br />
                  <small>如果收到确认邮件，请点击链接完成验证</small>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                管理员邮箱
              </label>
              <Input
                id="email"
                type="email"
                placeholder="dev-admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                type="password"
                placeholder="至少6位密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                确认密码
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="重复输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700" 
              disabled={loading || success}
            >
              {loading ? '创建中...' : '创建开发管理员'}
            </Button>
            
            {email && password && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleDirectSignIn}
              >
                直接登录 (如果账户已存在)
              </Button>
            )}
            
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/admin/login')}
            >
              返回登录页面
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default DevAdminSetup;