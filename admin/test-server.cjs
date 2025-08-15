const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
    res.send('测试服务器运行正常！');
});

const server = app.listen(PORT, () => {
    console.log(`测试服务器在端口 ${PORT} 上运行`);
    console.log(`访问: http://localhost:${PORT}`);
});

// 保持服务器运行
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

console.log('测试服务器启动完成');