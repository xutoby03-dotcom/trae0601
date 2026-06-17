import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chairsRouter from './routes/chairs.js';
import ordersRouter from './routes/orders.js';
import repairsRouter from './routes/repairs.js';
import { initializeIfEmpty } from './db.js';
import { generateMockData } from './mock.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/chairs', chairsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/repairs', repairsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '工学椅调修后端服务运行中 🛠',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 初始化数据
const mock = generateMockData();
initializeIfEmpty(mock.chairs, mock.orders);

// 生产环境托管前端构建产物
const distDir = path.resolve(__dirname, '../dist');
import fs from 'node:fs';
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log(`
  🪑  工学椅调修后端服务已启动
  🚀 服务地址: http://localhost:${PORT}
  📡  API 前缀:  /api/*
  💾  数据存储: data/ 目录下 JSON 文件
  `);
});
