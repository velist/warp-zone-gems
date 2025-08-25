@echo off
echo 🎮 启动 Warp Zone Gems 本地管理后台...
echo.
echo ========================================
echo   Warp Zone Gems 本地管理后台
echo ========================================
echo.

cd /d "D:\1-AI三号\游戏网站\warp-zone-gems\admin"

echo 正在启动管理后台服务器...
echo 管理界面地址: http://localhost:3008
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

node server.cjs

pause