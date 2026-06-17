const { error } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'SqliteError') {
    if (err.message.includes('FOREIGN KEY constraint failed')) {
      return res.status(400).json(error('存在关联数据，无法删除', 400));
    }
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json(error('数据已存在', 400));
    }
    if (err.message.includes('CHECK constraint failed')) {
      return res.status(400).json(error('参数值不合法', 400));
    }
    return res.status(500).json(error('数据库操作失败', 500));
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json(error(err.message, 400));
  }

  res.status(500).json(error('服务器内部错误', 500));
}

function notFoundHandler(req, res) {
  res.status(404).json(error('接口不存在', 404));
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
