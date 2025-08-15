import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Gamepad2,
  Heart,
  Users,
  Download,
  Star,
  Shield,
  Zap,
  Globe,
  Mail,
  Github,
  Twitter,
  MessageCircle
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Gamepad2,
      title: "丰富的游戏资源",
      description: "收录了大量经典马里奥系列游戏，包括平台跳跃、竞速、益智等多种类型"
    },
    {
      icon: Download,
      title: "免费下载",
      description: "所有游戏资源完全免费，无需注册即可下载体验"
    },
    {
      icon: Shield,
      title: "安全可靠",
      description: "所有游戏文件经过严格检测，确保无病毒、无恶意代码"
    },
    {
      icon: Zap,
      title: "快速更新",
      description: "定期更新游戏资源，第一时间为您带来最新的马里奥游戏"
    },
    {
      icon: Users,
      title: "社区互动",
      description: "活跃的用户社区，分享游戏心得，交流游戏技巧"
    },
    {
      icon: Globe,
      title: "多平台支持",
      description: "支持多种游戏平台和设备，随时随地享受游戏乐趣"
    }
  ];

  const stats = [
    { label: "游戏总数", value: "200+", icon: Gamepad2 },
    { label: "用户数量", value: "10K+", icon: Users },
    { label: "总下载量", value: "50K+", icon: Download },
    { label: "用户评分", value: "4.8", icon: Star }
  ];

  const teamMembers = [
    {
      name: "马里奥",
      role: "首席游戏策划",
      avatar: "/placeholder.svg",
      description: "负责游戏资源的收集和整理工作"
    },
    {
      name: "路易吉",
      role: "技术总监",
      avatar: "/placeholder.svg",
      description: "负责网站的技术开发和维护"
    },
    {
      name: "耀西",
      role: "社区管理员",
      avatar: "/placeholder.svg",
      description: "负责用户社区的管理和运营"
    }
  ];

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

        <div className="max-w-6xl mx-auto space-y-12">
          {/* 页面标题 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <Heart className="w-10 h-10 mr-3 text-red-500" />
              关于我们
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Warp Zone Gems 是一个专注于马里奥系列游戏资源的分享平台，
              致力于为全球马里奥游戏爱好者提供最优质的游戏体验。
            </p>
          </div>

          {/* 网站介绍 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">我们的使命</CardTitle>
              <CardDescription>
                让每个人都能轻松享受经典马里奥游戏的乐趣
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                自1985年《超级马里奥兄弟》首次发布以来，马里奥系列游戏就成为了无数玩家心中的经典。
                我们深知这些游戏对于玩家的特殊意义，因此创建了 Warp Zone Gems 这个平台。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                我们的目标是建立一个完整、安全、易用的马里奥游戏资源库，让新老玩家都能在这里找到自己喜爱的游戏，
                重温童年回忆，或者发现新的游戏乐趣。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                无论您是马里奥系列的忠实粉丝，还是刚刚接触这个经典系列的新玩家，
                我们都希望能为您提供最好的游戏体验和服务。
              </p>
            </CardContent>
          </Card>

          {/* 网站特色 */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">网站特色</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 数据统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">平台数据</CardTitle>
              <CardDescription className="text-center">
                我们的成长历程和用户信任
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 团队介绍 */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">我们的团队</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <Badge variant="secondary" className="mb-3">{member.role}</Badge>
                    <p className="text-muted-foreground text-sm">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 联系我们 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">联系我们</CardTitle>
              <CardDescription className="text-center">
                有任何问题或建议，欢迎与我们联系
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">联系方式</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <span>contact@warpzonegems.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <span>在线客服（工作日 9:00-18:00）</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">关注我们</h3>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="icon">
                      <Github className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-muted-foreground">
                  感谢您选择 Warp Zone Gems，让我们一起重温经典，创造美好的游戏回忆！
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 免责声明 */}
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-800">免责声明</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-700 leading-relaxed">
                本网站提供的游戏资源仅供学习和研究使用。我们尊重知识产权，
                如果您是版权所有者并认为某些内容侵犯了您的权利，请联系我们，我们将及时处理。
                所有商标和版权归其各自所有者所有。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;