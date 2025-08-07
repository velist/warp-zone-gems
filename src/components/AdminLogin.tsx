import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNeedsConfirmation(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setNeedsConfirmation(true);
          setError('邮箱未确认。请检查您的邮箱并点击确认链接，或重新发送确认邮件。');
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        // 检查用户邮箱是否已确认
        if (!data.user.email_confirmed_at) {
          setNeedsConfirmation(true);
          setError('邮箱未确认。请检查您的邮箱并点击确认链接，或重新发送确认邮件。');
        } else {
          // 登录成功，跳转到管理后台
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      setError('登录过程中发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }

    setResendingConfirmation(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setError('');
        alert('确认邮件已重新发送，请检查您的邮箱。');
      }
    } catch (err) {
      setError('发送确认邮件失败，请稍后重试');
    } finally {
      setResendingConfirmation(false);
    }
  };

  const handleSkipEmailConfirmation = async () => {
    if (window.confirm('是否跳过邮箱验证？（仅用于开发测试）')) {
      try {
        // 对于开发环境，我们可以尝试直接使用管理员API
        // 注意：这仅适用于开发环境
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (data.user && !error) {
          navigate('/admin/dashboard');
        }
      } catch (err) {
        setError('跳过验证失败');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">管理员登录</CardTitle>
          <CardDescription className="text-center">
            请输入您的管理员凭据以访问后台系统
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant={needsConfirmation ? "default" : "destructive"}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
            
            {needsConfirmation && (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleResendConfirmation}
                  disabled={resendingConfirmation}
                >
                  {resendingConfirmation ? '发送中...' : '重新发送确认邮件'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-full"
                  onClick={handleSkipEmailConfirmation}
                >
                  跳过邮箱验证 (开发模式)
                </Button>
              </>
            )}
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/admin/register')}
            >
              创建管理员账户
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full text-xs text-gray-500"
              onClick={() => navigate('/admin/dev-setup')}
            >
              开发环境快速设置
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;