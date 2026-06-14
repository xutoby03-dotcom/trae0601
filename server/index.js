import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initDb } from './db/index.js';
import ingredientsRouter from './routes/ingredients.js';
import openRecordsRouter from './routes/openRecords.js';
import usageRecordsRouter from './routes/usageRecords.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3001;

initDb();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ code: 0, msg: 'OK', data: { time: new Date().toISOString() } });
});

app.use('/api/ingredients', ingredientsRouter);
app.use('/api/open-records', openRecordsRouter);
app.use('/api/usage-records', usageRecordsRouter);
app.use('/api/stats', statsRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ code: 500, msg: err.message || '服务器错误' });
  next();
});

app.listen(PORT, () => {
  console.log(`\n🚀 烘焙原料管理后端启动成功`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`💾 数据库: SQLite (server/db/bakery.db)\n`);
});
