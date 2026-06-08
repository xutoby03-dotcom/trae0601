export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/publish/index',
    'pages/orders/index',
    'pages/stats/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/exception/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B35',
    navigationBarTitleText: '邻帮取',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '任务大厅',
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布',
      },
      {
        pagePath: 'pages/orders/index',
        text: '接单',
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
      },
    ],
  },
});
