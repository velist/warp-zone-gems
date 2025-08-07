import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';

const UserAuth = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('邮箱未确认，请检查邮箱并点击确认链接');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('邮箱或密码错误');
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        setSuccess('登录成功！');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      setError('登录过程中发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('密码确认不匹配');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('密码长度至少6位');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            username: registerData.username,
            role: 'user'
          }
        }
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess('注册成功！请检查邮箱并点击确认链接以完成注册。');
        setRegisterData({ email: '', password: '', confirmPassword: '', username: '' });
      }
    } catch (err) {
      setError('注册过程中发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('确认邮件已重新发送，请检查您的邮箱。');
      }
    } catch (err) {
      setError('发送确认邮件失败，请稍后重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">用户中心</CardTitle>
            <CardDescription className="text-center">
              登录或注册以获得更好的体验
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="register">注册</TabsTrigger>
              </TabsList>
              
              {(error || success) && (
                <Alert variant={error ? "destructive" : "default"} className="mt-4">
                  <AlertDescription>
                    {error || success}
                    {error && error.includes('邮箱未确认') && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleResendConfirmation(loginData.email)}
                        className="p-0 h-auto ml-2"
                      >
                        重新发送确认邮件
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="邮箱地址"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="密码"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '登录中...' : '登录'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="用户名"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="邮箱地址"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="密码 (至少6位)"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-10"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="确认密码"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="pl-10"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '注册中...' : '注册'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAuth;