const express = require('express');
const cors = require('cors');
const path = require('path');
const { success } = require('./utils/response');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const employeesRouter = require('./routes/employees');
const ovensRouter = require('./routes/ovens');
const calibrationRouter = require('./routes/calibration');
const dashboardRouter = require('./routes/dashboard');
const recipesRouter = require('./routes/recipes');
const batchesRouter = require('./routes/batches');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json(success({ status: 'ok' }, '服务正常'));
});

app.use('/api/employees', employeesRouter);
app.use('/api/ovens', ovensRouter);
app.use('/api/calibration', calibrationRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/batches', batchesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 烘焙店烤箱校准系统后端服务已启动`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📡 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`👥 员工接口: http://localhost:${PORT}/api/employees`);
  console.log(`🔥 烤箱接口: http://localhost:${PORT}/api/ovens`);
  console.log(`📊 校准记录接口: http://localhost:${PORT}/api/calibration`);
  console.log(`📈 看板统计接口: http://localhost:${PORT}/api/dashboard`);
  console.log(`📋 配方接口: http://localhost:${PORT}/api/recipes`);
  console.log(`🍞 批次接口: http://localhost:${PORT}/api/batches`);
});