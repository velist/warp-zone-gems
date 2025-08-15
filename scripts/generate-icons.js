import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建简单的 SVG 图标作为 PWA 图标的基础
const createSVGIcon = (size, bgColor = '#2563eb', textColor = '#ffffff') => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="15"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.floor(size * 0.4)}" 
        font-weight="bold" text-anchor="middle" dy="0.3em" fill="${textColor}">M</text>
  <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.08}" fill="#ffd700"/>
</svg>`;
};

// 不同尺寸的图标配置
const iconSizes = [
  { size: 72, type: 'icon' },
  { size: 96, type: 'icon' },
  { size: 128, type: 'icon' },
  { size: 144, type: 'icon' },
  { size: 152, type: 'icon' },
  { size: 192, type: 'icon' },
  { size: 384, type: 'icon' },
  { size: 512, type: 'icon' },
  { size: 180, type: 'apple-touch-icon' }
];

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// 确保图标目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 生成 SVG 图标文件
iconSizes.forEach(({ size, type }) => {
  const svgContent = createSVGIcon(size);
  const filename = type === 'apple-touch-icon' ? 
    `apple-touch-icon-${size}x${size}.svg` : 
    `icon-${size}x${size}.svg`;
  
  const filePath = path.join(iconsDir, filename);
  fs.writeFileSync(filePath, svgContent);
  console.log(`✓ 已生成 ${filename}`);
});

// 生成 favicon.ico 的 SVG 版本
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSVG);
console.log('✓ 已生成 favicon.svg');

// 创建一个基本的 favicon.ico 说明文件
const faviconInfo = `# Favicon 说明

由于技术限制，本脚本只能生成 SVG 格式的图标。
要获得真正的 .ico 文件，请：

1. 使用在线工具（如 favicon.io）转换 favicon.svg
2. 或使用 ImageMagick: convert favicon.svg favicon.ico
3. 将生成的 favicon.ico 放置在 public/ 目录下

生成的 SVG 图标可以直接在现代浏览器中使用。
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), faviconInfo);
console.log('✓ 已生成图标说明文件');

console.log('\n🎯 PWA 图标生成完成！');
console.log(`📁 图标保存位置: ${iconsDir}`);
console.log(`📊 共生成 ${iconSizes.length + 1} 个图标文件`);