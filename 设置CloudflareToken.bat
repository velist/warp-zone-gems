@echo off
echo 🌐 设置 Cloudflare API Token...
echo.
echo 请输入您的 Cloudflare API Token:
set /p CF_TOKEN=

echo.
echo 正在设置环境变量...
setx CLOUDFLARE_API_TOKEN "%CF_TOKEN%"

echo.
echo ✅ Cloudflare API Token 已设置完成！
echo.
echo 📋 使用说明:
echo 1. 重启命令行或重新打开后台管理
echo 2. 现在可以使用 Cloudflare 直接部署功能
echo 3. 访问 http://localhost:3008 管理内容
echo.
pause