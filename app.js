const Koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const commentRoutes = require('./routes/commentRoutes');
const path = require('path');
const fs = require('fs').promises;

// Creating a Koa Application
const app = new Koa();
const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
};

// Middleware
app.use(cors({
  origin: '*', 
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser());

// Routes
app.use(commentRoutes.routes());
app.use(commentRoutes.allowedMethods());

// Start the server
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
