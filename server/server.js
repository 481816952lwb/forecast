const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fortuneController = require('./controllers/fortuneController');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// API路由
app.post('/api/fortune', fortuneController.getFortunePredict);

// 生产环境下提供静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '服务器发生错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请联系管理员'
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 