// Test content with hide tags for verification
export const testHideContent = `
<h2>游戏介绍</h2>
<p>这是一个精彩的马里奥风格游戏！</p>

[hide]
这是隐藏的攻略内容：
- 第一关的秘密通道在右下角
- 按住跳跃键可以跳得更高
- 收集所有金币可以解锁隐藏角色
[/hide]

<p>游戏还包含以下特色：</p>

[hide]
特殊道具列表：
1. 火焰花 - 可以发射火球
2. 超级蘑菇 - 变身为超级马里奥
3. 星星 - 无敌状态10秒钟
[/hide]

<p>欢迎大家下载体验！</p>
`;

export const testGameData = {
  id: "test-game-1",
  title: "超级马里奥世界",
  description: "经典的横版跳跃游戏",
  content: testHideContent,
  cover_image: "",
  category: "平台跳跃",
  tags: ["马里奥", "经典", "跳跃"],
  author: "Nintendo",
  published_at: new Date().toISOString(),
  download_link: "#"
};