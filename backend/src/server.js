const express = require('express');
const cors = require('cors');
const path = require('path');

const plantsRouter = require('./routes/plants');
const employeesRouter = require('./routes/employees');
const dutyRouter = require('./routes/duty');
const waterRecordsRouter = require('./routes/waterRecords');
const pestReportsRouter = require('./routes/pestReports');
const holidaysRouter = require('./routes/holidays');
const leaveRouter = require('./routes/leave');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/plants', plantsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/duty', dutyRouter);
app.use('/api/water-records', waterRecordsRouter);
app.use('/api/pest-reports', pestReportsRouter);
app.use('/api/holidays', holidaysRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '绿植管理系统 API 运行正常' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
