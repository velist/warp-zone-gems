# 下载系统配置指南 | Download System Configuration Guide

## 概述 | Overview

本系统现已支持多个下载链接和QR码功能，让用户可以通过多种云存储服务下载游戏，并支持手机扫码下载。

The system now supports multiple download links and QR code functionality, allowing users to download games through various cloud storage services and mobile QR code scanning.

## 功能特点 | Features

### 1. 多链接支持 | Multiple Download Links
- 支持每个游戏配置多个下载链接
- 支持常见的云存储服务：百度网盘、天翼云盘、阿里云盘、115网盘、蓝奏云、微云等
- 每个链接可以配置提取密码和自定义标签

### 2. QR码生成 | QR Code Generation
- 自动为下载链接生成QR码
- 用户可以使用手机扫描下载
- 支持复制链接和密码到剪贴板

### 3. 智能下载逻辑 | Smart Download Logic
- 单个链接：直接跳转下载
- 多个链接：显示选择模态框和QR码
- 兼容旧的单链接格式

### 4. 性能监控隐藏 | Performance Monitor Hidden
- 性能监控器已完全隐藏，提供更清洁的用户界面

## 数据结构配置 | Data Structure Configuration

### 新的下载链接格式 | New Download Links Format

```json
{
  "id": "game-id",
  "title": "游戏标题",
  "download_links": [
    {
      "type": "百度网盘",
      "url": "https://pan.baidu.com/s/example",
      "password": "abc123",
      "label": "高速下载"
    },
    {
      "type": "天翼云盘", 
      "url": "https://cloud.189.cn/example",
      "password": "def456",
      "label": "稳定下载"
    },
    {
      "type": "阿里云盘",
      "url": "https://www.aliyundrive.com/s/example",
      "label": "免密下载"
    }
  ]
}
```

### 字段说明 | Field Description

- `type`: 云存储类型名称（必需）
- `url`: 下载链接地址（必需）
- `password`: 提取密码（可选）
- `label`: 自定义标签，如"高速下载"、"分包下载"等（可选）

### 兼容性 | Compatibility

系统仍然支持旧的 `download_link` 字段以保持向后兼容：

```json
{
  "download_link": "https://example.com/download"
}
```

## 管理后台配置 | Admin Panel Configuration

### 在games.json中配置下载链接 | Configure Download Links in games.json

1. **打开游戏数据文件**：
   - 开发环境：通过本地管理后台 `http://localhost:3008`
   - 生产环境：直接编辑 `public/data/games.json`

2. **添加下载链接**：
   ```json
   {
     "id": "your-game-id",
     "title": "游戏标题",
     "download_links": [
       {
         "type": "百度网盘",
         "url": "实际的百度网盘分享链接",
         "password": "提取密码",
         "label": "高速下载"
       }
     ]
   }
   ```

3. **保存并测试**：
   - 保存文件后刷新前端页面
   - 点击下载按钮测试功能

## 支持的云存储服务 | Supported Cloud Storage Services

| 服务名称 | 图标 | 示例URL |
|---------|------|---------|
| 百度网盘 | 🌐 | `https://pan.baidu.com/s/xxxxx` |
| 天翼云盘 | ☁️ | `https://cloud.189.cn/xxxxx` |
| 阿里云盘 | 📱 | `https://www.aliyundrive.com/s/xxxxx` |
| 微云网盘 | 💫 | `https://share.weiyun.com/xxxxx` |
| 115网盘 | 🔥 | `https://115.com/xxxxx` |
| 蓝奏云 | 💎 | `https://lanzoui.com/xxxxx` |
| 其他 | 📦 | 任何其他下载链接 |

## 用户界面说明 | User Interface Guide

### 游戏卡片 | Game Cards
- 下载按钮显示链接数量：`下载 (3)` 表示有3个下载选项
- 单个链接直接跳转，多个链接打开选择模态框

### 游戏详情页 | Game Detail Page
- 主下载按钮支持多链接选择
- 显示链接数量：`立即下载 (3 个选项)`

### QR码模态框 | QR Code Modal
- 显示所有可用的下载选项
- 自动生成选中链接的QR码
- 支持复制链接和密码
- 提供使用说明和建议

## 最佳实践 | Best Practices

### 1. 链接配置建议 | Link Configuration Recommendations
- **多样化选择**：为每个游戏提供2-3个不同云存储的链接
- **清晰标签**：使用"高速下载"、"稳定下载"、"免密下载"等描述性标签
- **密码管理**：为需要密码的链接提供简洁易记的密码

### 2. 用户体验优化 | User Experience Optimization
- **优先级排序**：将最稳定或最快的链接放在首位
- **测试有效性**：定期检查下载链接的有效性
- **移动适配**：QR码特别适合移动端用户

### 3. 维护建议 | Maintenance Recommendations
- **定期检查**：定期检查云存储链接是否失效
- **用户反馈**：收集用户对不同下载方式的反馈
- **性能监控**：关注下载成功率和用户偏好

## 故障排除 | Troubleshooting

### 常见问题 | Common Issues

1. **QR码不显示**
   - 检查链接URL格式是否正确
   - 确保qrcode依赖库已正确安装

2. **下载按钮不工作**
   - 验证download_links数组格式是否正确
   - 检查浏览器控制台是否有错误信息

3. **链接失效**
   - 更新云存储分享链接
   - 检查密码是否正确

### 技术支持 | Technical Support

如需技术支持，请检查：
- 浏览器开发者工具中的错误信息
- 网络连接状态
- 云存储服务的可用性

## 更新日志 | Update Log

### v2.0.0 (Current)
- ✅ 隐藏性能监控器组件
- ✅ 新增QRCodeModal组件
- ✅ 支持多下载链接配置
- ✅ 兼容旧的download_link格式
- ✅ 新增常见云存储服务图标支持
- ✅ 优化用户界面和体验

### v1.0.0 (Previous)
- 基础下载功能
- 单链接支持
- 性能监控显示

---

*本文档更新于 2025年8月24日*