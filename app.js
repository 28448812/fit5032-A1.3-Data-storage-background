const Koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const commentRoutes = require('./routes/commentRoutes');
const path = require('path');
const fs = require('fs').promises;

// 创建Koa应用
const app = new Koa();
const PORT = process.env.PORT || 3000;

// 确保数据目录存在
const ensureDataDir = async () => {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
};

// 中间件
app.use(cors({
  origin: '*', // 允许所有来源，生产环境中应指定具体域名
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser());

// 路由
app.use(commentRoutes.routes());
app.use(commentRoutes.allowedMethods());

// 启动服务器
const startServer = async () => {
  try {
    await ensureDataDir();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
