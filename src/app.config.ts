export default defineAppConfig({
  pages: [
    'pages/dashboard/index',
    'pages/entry/index',
    'pages/orders/index',
    'pages/stats/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E40AF',
    navigationBarTitleText: '雨天外卖预警看板',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/dashboard/index',
        text: '看板'
      },
      {
        pagePath: 'pages/entry/index',
        text: '录入'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计'
      }
    ]
  }
})
