@echo off
title Warp Zone Gems - 本地管理后台

echo.
echo 🎮 Warp Zone Gems 本地管理后台
echo ================================
echo.

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js环境检查通过

REM 检查项目依赖
if not exist "..\node_modules" (
    echo 📦 正在安装项目依赖...
    cd ..
    call npm install
    cd admin
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
)

REM 检查数据目录
if not exist "..\src\data" (
    echo 📁 创建数据目录...
    mkdir "..\src\data"
)

REM 创建默认数据文件（如果不存在）
if not exist "..\src\data\games.json" (
    echo [] > "..\src\data\games.json"
    echo ✅ 创建默认游戏数据文件
)

if not exist "..\src\data\categories.json" (
    echo 📝 创建默认分类数据文件...
    echo [{"id":"platformer","name":"平台跳跃","slug":"platformer","description":"经典的马里奥平台跳跃游戏","color":"#ef4444","icon":"🏃","games_count":0},{"id":"racing","name":"赛车竞速","slug":"racing","description":"马里奥卡丁车系列游戏","color":"#3b82f6","icon":"🏎️","games_count":0},{"id":"rpg","name":"角色扮演","slug":"rpg","description":"马里奥RPG冒险游戏","color":"#8b5cf6","icon":"⚔️","games_count":0},{"id":"party","name":"派对游戏","slug":"party","description":"马里奥派对聚会游戏","color":"#f59e0b","icon":"🎉","games_count":0},{"id":"sports","name":"体感运动","slug":"sports","description":"马里奥体感运动游戏","color":"#10b981","icon":"⚽","games_count":0},{"id":"puzzle","name":"解谜益智","slug":"puzzle","description":"马里奥解谜益智游戏","color":"#06b6d4","icon":"🧩","games_count":0}] > "..\src\data\categories.json"
    echo ✅ 创建默认分类数据文件
)

if not exist "..\src\data\banners.json" (
    echo 🖼️ 创建默认Banner数据文件...
    echo [] > "..\src\data\banners.json"
    echo ✅ 创建默认Banner数据文件
)

if not exist "..\src\data\popups.json" (
    echo 💬 创建默认弹窗数据文件...
    echo [] > "..\src\data\popups.json"
    echo ✅ 创建默认弹窗数据文件
)

if not exist "..\src\data\floating-windows.json" (
    echo 🎈 创建默认悬浮窗数据文件...
    echo [] > "..\src\data\floating-windows.json"
    echo ✅ 创建默认悬浮窗数据文件
)

if not exist "..\src\data\site-settings.json" (
    echo ⚙️ 创建默认网站设置文件...
    echo {} > "..\src\data\site-settings.json"
    echo ✅ 创建默认网站设置文件
)

echo.
echo 🚀 正在启动本地管理后台...
echo.
echo 启动后将自动打开浏览器访问管理界面
echo 如果没有自动打开，请手动访问: http://localhost:3001
echo.
echo 按 Ctrl+C 可以停止服务器
echo.

REM 启动服务器
node server.cjs

pause