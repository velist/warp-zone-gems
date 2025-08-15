import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Star, 
  Gamepad2, 
  Edit3, 
  Save,
  ArrowLeft,
  Settings,
  Download,
  Heart
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    bio: "",
    avatar: ""
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // 初始化用户数据
    setProfileData({
      username: user.user_metadata?.username || user.email?.split('@')[0] || '',
      email: user.email || '',
      bio: user.user_metadata?.bio || '',
      avatar: user.user_metadata?.avatar_url || ''
    });
  }, [user, navigate]);

  const handleSave = async () => {
    try {
      // 这里应该调用API更新用户信息
      // 暂时只是模拟保存
      setIsEditing(false);
      toast({
        title: "保存成功",
        description: "个人资料已更新",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* 个人信息卡片 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profileData.avatar} />
                    <AvatarFallback className="text-2xl">
                      {profileData.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{profileData.username}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <Mail className="w-4 h-4 mr-2" />
                      {profileData.email}
                    </CardDescription>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      加入时间: {new Date(user.created_at).toLocaleDateString('zh-CN')}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      编辑资料
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">个人简介</Label>
                    <Textarea
                      id="bio"
                      placeholder="介绍一下自己..."
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground">
                    {profileData.bio || "这个用户很懒，什么都没有留下..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">获得成就</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">45</div>
                <div className="text-sm text-muted-foreground">收藏游戏</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">128</div>
                <div className="text-sm text-muted-foreground">下载次数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm text-muted-foreground">获得点赞</div>
              </CardContent>
            </Card>
          </div>

          {/* 详细信息标签页 */}
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="achievements">成就</TabsTrigger>
              <TabsTrigger value="favorites">收藏</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>
            
            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>我的成就</CardTitle>
                  <CardDescription>
                    展示您在游戏资源库中获得的各种成就
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      <div>
                        <div className="font-medium">初来乍到</div>
                        <div className="text-sm text-muted-foreground">完成首次注册</div>
                      </div>
                      <Badge variant="secondary">已获得</Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Star className="w-8 h-8 text-blue-500" />
                      <div>
                        <div className="font-medium">收藏达人</div>
                        <div className="text-sm text-muted-foreground">收藏10个游戏</div>
                      </div>
                      <Badge variant="secondary">已获得</Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg opacity-50">
                      <Gamepad2 className="w-8 h-8 text-purple-500" />
                      <div>
                        <div className="font-medium">游戏专家</div>
                        <div className="text-sm text-muted-foreground">下载100个游戏</div>
                      </div>
                      <Badge variant="outline">未获得</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="favorites" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>我的收藏</CardTitle>
                  <CardDescription>
                    您收藏的游戏资源
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">暂无收藏的游戏</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/')}
                    >
                      去发现游戏
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>账户设置</CardTitle>
                  <CardDescription>
                    管理您的账户偏好设置
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">邮件通知</div>
                      <div className="text-sm text-muted-foreground">接收新游戏和更新通知</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      配置
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">隐私设置</div>
                      <div className="text-sm text-muted-foreground">控制个人信息的可见性</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      配置
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;