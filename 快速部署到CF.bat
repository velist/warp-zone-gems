@echo off
echo 🚀 Warp Zone Gems - 快速部署脚本
echo.
echo ========================================
echo   Cloudflare 直接部署
echo ========================================
echo.

cd /d "D:\1-AI三号\游戏网站\warp-zone-gems"

echo 🔍 检查 Cloudflare API Token...
if "%CLOUDFLARE_API_TOKEN%"=="" (
    echo ❌ Cloudflare API Token 未设置
    echo.
    echo 请先运行 "设置CloudflareToken.bat" 设置 API Token
    echo 或手动设置环境变量 CLOUDFLARE_API_TOKEN
    echo.
    pause
    exit /b 1
)

echo ✅ API Token 已配置
echo.

echo 🔨 构建生产版本...
call npm run build
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 构建完成
echo.

echo ☁️ 部署到 Cloudflare Pages...
call wrangler pages deploy dist --project-name=aigame-lol
if errorlevel 1 (
    echo ❌ 部署失败
    pause
    exit /b 1
)

echo.
echo 🎉 部署成功！
echo.
echo 📍 您的网站地址:
echo   - https://aigame.lol (自定义域名)
echo   - https://aigame-lol.pages.dev (备用地址)
echo.
echo ✨ 部署完成时间: %date% %time%
echo.
pause