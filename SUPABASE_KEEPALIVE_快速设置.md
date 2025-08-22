# Supabase 数据库保活 - 快速设置指南

## 🚀 一分钟完成设置

### 第一步：上传到GitHub
将你的项目推送到GitHub仓库。

### 第二步：设置GitHub Secrets
在GitHub仓库中设置以下两个环境变量：

1. 进入仓库 → `Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret` 添加：

```
名称: SUPABASE_URL
值：https://oiatqeymovnyubrnlmlu.supabase.co

名称: SUPABASE_ANON_KEY
值：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjM0MzYsImV4cCI6MjA2OTg5OTQzNn0.U-3p0SEVNOQUV4lYFWRiOfVmxgNSbMRWx0mE0DXZYuM
```

### 第三步：测试运行
1. 进入 `Actions` 标签页
2. 选择 `Keep Supabase Database Alive` workflow
3. 点击 `Run workflow` → `Run workflow` 测试

## ✅ 完成！

脚本将每12小时自动运行一次，保持你的Supabase数据库活跃。

### 运行时间
- 每天北京时间 10:00
- 每天北京时间 22:00

### 本地测试命令
```bash
# 测试数据库连接
npm run test-supabase

# 测试保活脚本
npm run keep-alive
```

### 支持的功能
✅ 自动访问数据库保持活跃  
✅ 多重检查确保连接成功  
✅ 详细日志记录执行状态  
✅ 错误重试机制  
✅ 手动触发支持  

---

## 📁 相关文件

- `.github/workflows/keep-alive.yml` - GitHub Actions配置
- `scripts/keep-alive.cjs` - 保活脚本
- `scripts/test-supabase.cjs` - 测试脚本
- `docs/GITHUB_KEEPALIVE_SETUP.md` - 详细配置文档

搞定！你的Supabase数据库现在不会因为不活跃而自动关停了。🎉