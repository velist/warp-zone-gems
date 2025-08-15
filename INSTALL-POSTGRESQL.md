# PostgreSQL 安装配置指南

## 🎯 Windows 系统安装步骤

### 方法一：官方安装程序（推荐新手）

1. **下载安装程序**
   ```
   访问：https://www.postgresql.org/download/windows/
   选择：PostgreSQL 16.x 版本
   下载：postgresql-16.x-x-windows-x64.exe
   ```

2. **运行安装向导**
   - 双击安装程序
   - 选择安装目录：`C:\Program Files\PostgreSQL\16`
   - 选择数据目录：`C:\Program Files\PostgreSQL\16\data`

3. **设置超级用户密码**
   ```
   用户名：postgres
   密码：[请设置一个强密码，比如：MyPostgres2024!]
   ⚠️ 请记住这个密码，后面配置需要用到！
   ```

4. **网络配置**
   ```
   端口：5432（默认）
   区域设置：Chinese (Simplified), China 或 Default locale
   ```

5. **完成安装**
   - 取消勾选 "Launch Stack Builder at exit"
   - 点击 "Finish"

### 方法二：使用 Chocolatey（推荐开发者）

```powershell
# 以管理员身份运行 PowerShell

# 安装 Chocolatey（如果没有）
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 PostgreSQL
choco install postgresql --params '/Password:MyPostgres2024!'

# 启动服务
net start postgresql-x64-16
```

### 方法三：使用 Scoop

```powershell
# 安装 Scoop（如果没有）
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 安装 PostgreSQL
scoop bucket add main
scoop install postgresql

# 初始化数据库
initdb -D $env:USERPROFILE\scoop\apps\postgresql\current\data -U postgres

# 启动服务
pg_ctl -D $env:USERPROFILE\scoop\apps\postgresql\current\data -l logfile start
```

## 🔧 安装后配置

### 1. 验证安装

打开命令提示符或 PowerShell：

```bash
# 检查 PostgreSQL 版本
psql --version

# 连接到数据库（会提示输入密码）
psql -U postgres -h localhost

# 在 psql 中执行（验证连接成功）
SELECT version();

# 退出 psql
\q
```

### 2. 配置环境变量（如果需要）

如果命令行无法识别 `psql` 命令：

1. 右键 "此电脑" → "属性" → "高级系统设置"
2. 点击 "环境变量"
3. 在 "系统变量" 中找到 "Path"
4. 添加 PostgreSQL 的 bin 目录：
   ```
   C:\Program Files\PostgreSQL\16\bin
   ```

### 3. 启动/停止服务

```bash
# 启动 PostgreSQL 服务
net start postgresql-x64-16

# 停止 PostgreSQL 服务
net stop postgresql-x64-16

# 查看服务状态
sc query postgresql-x64-16
```

## 📝 配置项目环境变量

安装完成后，更新项目的 `.env.local` 文件：

```env
# PostgreSQL 数据库配置
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/warp_zone_gems
DB_HOST=localhost
DB_PORT=5432
DB_NAME=warp_zone_gems
DB_USER=postgres
DB_PASSWORD=你的密码

# 其他配置保持不变...
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key-here
BCRYPT_ROUNDS=12
```

## 🚀 运行数据库设置

配置完成后，在项目目录中运行：

```bash
# 进入项目目录
cd "D:\1-AI三号\游戏网站\warp-zone-gems"

# 运行数据库设置脚本
npm run db:setup
```

## 🔍 常见问题解决

### 问题1：端口被占用
```
Error: listen EADDRINUSE :::5432
```
**解决方案**：
```bash
# 查看占用端口的进程
netstat -ano | findstr :5432

# 结束进程（替换 PID）
taskkill /PID 进程ID /F

# 或者修改 PostgreSQL 端口
# 编辑 postgresql.conf 文件，修改 port = 5433
```

### 问题2：密码认证失败
```
Error: password authentication failed for user "postgres"
```
**解决方案**：
1. 确认密码正确
2. 重置密码：
   ```bash
   # 以管理员身份运行
   psql -U postgres
   ALTER USER postgres PASSWORD '新密码';
   ```

### 问题3：服务无法启动
```
Error: could not start service postgresql-x64-16
```
**解决方案**：
```bash
# 检查日志文件
# 位置：C:\Program Files\PostgreSQL\16\data\log\

# 重新初始化数据目录
initdb -D "C:\Program Files\PostgreSQL\16\data" -U postgres
```

### 问题4：连接被拒绝
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**解决方案**：
1. 确认服务已启动：`net start postgresql-x64-16`
2. 检查防火墙设置
3. 验证 `postgresql.conf` 中的 `listen_addresses` 设置

## 🎯 下一步

PostgreSQL 安装配置完成后：

1. ✅ 验证数据库连接正常
2. ✅ 更新 `.env.local` 配置文件
3. ✅ 运行 `npm run db:setup` 初始化数据库
4. ✅ 使用默认管理员账户登录测试

## 📞 获取帮助

如果遇到问题：
1. 查看 PostgreSQL 日志文件
2. 检查 Windows 事件查看器
3. 参考官方文档：https://www.postgresql.org/docs/
4. 在项目 GitHub Issues 中报告问题

---

**准备好了吗？** 🚀

完成 PostgreSQL 安装后，告诉我你的安装结果，我们继续进行数据库初始化！