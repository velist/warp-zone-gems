@echo off
echo ====================================
echo Cloudflare Pages Deployment Script
echo ====================================
echo.

echo Step 1: Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo Step 2: Checking Wrangler authentication...
call wrangler whoami
if %errorlevel% neq 0 (
    echo You need to authenticate with Cloudflare first.
    echo Run: wrangler auth login
    pause
    exit /b 1
)

echo.
echo Step 3: Creating/updating Cloudflare Pages project...
call wrangler pages project create warp-zone-gems --compatibility-date=2024-08-24
echo Note: If project already exists, this will show an error - that's normal.

echo.
echo Step 4: Deploying to Cloudflare Pages...
call wrangler pages deploy dist --project-name=warp-zone-gems --compatibility-date=2024-08-24

echo.
echo ====================================
echo Deployment completed!
echo ====================================
echo.
echo Next steps:
echo 1. Go to Cloudflare Dashboard -> Workers and Pages
echo 2. Find your 'warp-zone-gems' project
echo 3. Set up custom domain: aigame.lol
echo 4. Add environment variables (see .env.cloudflare.example)
echo.
echo Your site should be available at:
echo https://warp-zone-gems.pages.dev
echo.
pause