const { chromium } = require('playwright');

(async () => {
  console.log('🚀 开始自动化功能测试...');
  
  const browser = await chromium.launch({ 
    headless: false, // 设为false以查看浏览器操作
    slowMo: 1000 // 每个操作间隔1秒，便于观察
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    console.log('📊 测试1: 访问主网站');
    await page.goto('https://aigame.lol');
    await page.waitForTimeout(3000);
    
    console.log('🎮 测试2: 检查游戏数量');
    const gameCards = await page.locator('[data-testid="game-card"], .game-card, .card').count();
    console.log(`发现 ${gameCards} 个游戏卡片`);
    
    console.log('🖼️ 测试3: 检查Banner显示');
    const banners = await page.locator('img[src*="unsplash"], .banner, [class*="banner"]').count();
    console.log(`发现 ${banners} 个Banner图片`);
    
    console.log('📱 测试4: 测试QR码弹窗功能');
    const downloadButtons = await page.locator('button:has-text("下载"), button[class*="download"], .download-btn');
    const downloadCount = await downloadButtons.count();
    console.log(`发现 ${downloadCount} 个下载按钮`);
    
    if (downloadCount > 0) {
      console.log('点击第一个下载按钮...');
      await downloadButtons.first().click();
      await page.waitForTimeout(2000);
      
      // 检查QR码模态框
      const modal = await page.locator('[role="dialog"], .modal, .popup').count();
      console.log(`QR码模态框: ${modal > 0 ? '✅ 显示正常' : '❌ 未找到'}`);
      
      if (modal > 0) {
        const qrCode = await page.locator('canvas, img[src*="qr"], [class*="qr"]').count();
        console.log(`QR码元素: ${qrCode > 0 ? '✅ 显示正常' : '❌ 未找到'}`);
        
        // 检查是否只显示QR码（没有多余的下载链接文本）
        const linkTexts = await page.locator('text="下载链接", text="提取码", text="立即下载"').count();
        console.log(`多余文本元素: ${linkTexts === 0 ? '✅ 已清理' : '⚠️ 仍存在'}`);
        
        // 关闭模态框
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    }
    
    console.log('📱 测试5: 响应式设计测试');
    await page.setViewportSize({ width: 768, height: 1024 }); // 平板尺寸
    await page.waitForTimeout(2000);
    console.log('✅ 平板尺寸测试完成');
    
    await page.setViewportSize({ width: 375, height: 667 }); // 手机尺寸
    await page.waitForTimeout(2000);
    console.log('✅ 手机尺寸测试完成');
    
    console.log('🔍 测试6: 搜索功能测试');
    await page.setViewportSize({ width: 1920, height: 1080 }); // 恢复桌面尺寸
    const searchInput = await page.locator('input[type="search"], input[placeholder*="搜索"], .search-input');
    const searchCount = await searchInput.count();
    
    if (searchCount > 0) {
      await searchInput.first().fill('马里奥');
      await page.waitForTimeout(2000);
      console.log('✅ 搜索功能测试完成');
    }
    
    console.log('📊 测试7: 性能和加载速度');
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    console.log(`页面加载时间: ${loadTime}ms ${loadTime < 3000 ? '✅ 良好' : '⚠️ 需优化'}`);

    // 截图保存
    await page.screenshot({ path: 'website-test-screenshot.png', fullPage: true });
    console.log('📸 已保存网站截图: website-test-screenshot.png');
    
    console.log('✅ 所有自动化测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  } finally {
    await browser.close();
  }
})();