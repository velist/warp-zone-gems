# 本地Web管理后台使用指南

## 🎯 概述

本地Web管理后台提供了直观的图形界面来管理静态网站的游戏数据，支持AI批量导入、实时数据统计和Git版本控制。

## 🚀 快速启动

### 方法1：一键启动（推荐）
```bash
# 双击运行
admin/start.bat

# 或使用npm命令
npm run admin:start
```

### 方法2：命令行启动
```bash
# 启动管理后台服务器
npm run admin

# 或直接运行
cd admin && node server.js
```

启动后会自动打开浏览器访问：**http://localhost:3001**

## 🖥️ 界面功能

### 📊 仪表盘
- **游戏总数** - 当前数据库中的游戏数量
- **分类数量** - 游戏分类统计
- **总下载量** - 所有游戏的累计下载量
- **AI状态** - Silicon Flow API配置状态

### 🤖 AI批量导入
- **API Key配置** - 设置和测试Silicon Flow API Key
- **多种输入方式**：
  - 📝 直接文本输入
  - 📄 文件上传（支持.txt, .md, .csv）
- **智能解析** - 自动识别游戏信息格式
- **实时进度显示** - 处理进度和状态反馈
- **结果预览** - 处理成功后可预览结果

### ⚡ 快速操作
- **🌐 查看网站** - 打开本地开发服务器
- **📁 打开数据文件** - 直接访问数据文件位置  
- **🚀 部署到GitHub** - 提交更改并推送到远程仓库

### 📊 系统状态
- **Node.js版本** - 当前Node.js环境信息
- **数据文件状态** - 数据文件完整性检查
- **Git状态** - 版本控制状态
- **本地服务器** - 开发服务器运行状态

### 📝 活动记录
- 实时记录所有操作
- 包含时间戳的详细日志
- 成功/失败状态追踪

## 🔧 API接口

管理后台提供RESTful API接口：

### 获取系统状态
```
GET /api/status
```

### 获取数据
```
GET /api/data/games     # 获取游戏数据
GET /api/data/categories # 获取分类数据
```

### AI处理
```
POST /api/ai/test       # 测试API Key
POST /api/ai/process    # 批量处理游戏信息
```

### Git操作
```
POST /api/git/status    # 获取Git状态
POST /api/git/commit    # 提交更改
POST /api/git/push      # 推送到远程
```

## 💡 使用流程

### 1. 首次使用
1. 运行 `admin/start.bat` 启动服务器
2. 在浏览器中访问 http://localhost:3001
3. 配置Silicon Flow API Key
4. 测试API连接

### 2. 批量导入游戏
1. 选择输入方式（文本或文件）
2. 输入游戏信息，支持多种格式：
   ```
   # 简单列表
   Super Mario Bros.
   Mario Kart 8 Deluxe
   
   # 带描述
   Super Mario Bros. - 经典平台跳跃游戏
   Mario Kart 8 Deluxe - 最受欢迎的赛车游戏
   
   # 详细信息
   标题：Super Mario Odyssey
   分类：平台跳跃
   描述：3D马里奥冒险游戏
   ```
3. 点击"开始处理"
4. 查看处理结果
5. 确认后数据自动保存到本地文件

### 3. 部署更新
1. 在快速操作中点击"部署到GitHub"
2. 或手动执行Git命令：
   ```bash
   git add src/data/
   git commit -m "AI批量导入: 更新游戏数据"
   git push origin main
   ```

## 📁 文件结构

```
admin/
├── index.html          # 主界面
├── server.js           # Express服务器
├── start.bat          # 一键启动脚本
└── README.md          # 本文档

src/data/
├── games.json         # 游戏数据文件
└── categories.json    # 分类数据文件
```

## 🔒 安全说明

- **本地访问** - 管理后台只在本地运行，不暴露到公网
- **API Key保护** - API Key存储在浏览器本地存储中
- **数据备份** - 所有数据通过Git进行版本控制
- **权限控制** - 仅本地访问，无需用户认证

## 🐛 常见问题

### 1. 端口被占用
**错误**: `EADDRINUSE: address already in use :::3001`
**解决**: 
- 关闭已运行的管理后台实例
- 或修改 `admin/server.js` 中的端口号

### 2. API Key测试失败
**错误**: API Key无效或网络连接失败
**解决**:
- 检查API Key是否正确
- 确认网络连接正常
- 访问 [Silicon Flow官网](https://cloud.siliconflow.cn/) 检查账户状态

### 3. 数据文件保存失败  
**错误**: 权限不足或磁盘空间不够
**解决**:
- 检查文件写入权限
- 确认磁盘空间充足
- 手动创建 `src/data/` 目录

### 4. Git操作失败
**错误**: Git命令执行失败
**解决**:
- 确认Git已安装并配置
- 检查Git仓库状态
- 确认有提交和推送权限

## 🔄 更新日志

### v1.0.0
- ✅ 基础Web界面
- ✅ AI批量导入功能
- ✅ 实时数据统计
- ✅ Git版本控制集成
- ✅ 文件上传支持
- ✅ 系统状态监控

## 📞 技术支持

如遇问题：
1. 查看浏览器控制台错误信息
2. 检查命令行输出日志
3. 确认系统环境配置
4. 参考常见问题解决方案

---

**享受便捷的本地管理体验！** 🎮