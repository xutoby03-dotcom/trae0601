const path = require('path');

module.exports = {
  plugins: [
    require('/Users/xuzhengcai/Documents/Work/trae/auto-trae/trae0601-3.task135-backup-20260609-182659/node_modules/tailwindcss')({
      config: path.resolve(__dirname, 'tailwind.config.js'),
    }),
    require('/Users/xuzhengcai/Documents/Work/trae/auto-trae/trae0601-3.task135-backup-20260609-182659/node_modules/autoprefixer')(),
  ],
};
