@echo off
chcp 65001 >nul
echo.
echo 🎮 Warp Zone Gems - 静态网站AI批量导入设置
echo =============================================
echo.

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安装

REM 检查npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到npm
    pause
    exit /b 1
)

echo ✅ npm 已安装

REM 安装依赖
echo.
echo 📦 安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

REM 创建环境变量文件
echo.
echo 🔑 配置API Key...
if not exist .env (
    echo # Silicon Flow API配置 > .env
    echo SILICON_FLOW_API_KEY=your_api_key_here >> .env
    echo AI_MODEL=Qwen/Qwen2.5-7B-Instruct >> .env
    echo.
    echo ℹ️  已创建 .env 文件，请编辑并填入你的API Key
) else (
    echo ℹ️  .env 文件已存在
)

REM 创建数据目录
echo.
echo 📁 创建数据目录...
if not exist src\data mkdir src\data

REM 检查数据文件
if not exist src\data\games.json (
    echo ℹ️  将创建示例游戏数据文件
)

if not exist src\data\categories.json (
    echo ℹ️  将创建示例分类数据文件  
)

REM 显示使用说明
echo.
echo 🚀 设置完成！使用方法：
echo.
echo 1. 编辑 .env 文件，填入你的 Silicon Flow API Key
echo 2. 运行 AI 批量导入:
echo    npm run ai-import
echo.
echo 3. 或直接使用:
echo    node scripts/ai-batch-import.js
echo.
echo 4. 导入完成后提交到Git:
echo    git add src/data/
echo    git commit -m "AI批量导入: 新增游戏数据"
echo    git push origin main
echo.

pause