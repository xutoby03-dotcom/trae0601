export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/schedule/index',
    'pages/stats/index',
    'pages/mine/index',
    'pages/child-edit/index',
    'pages/school-edit/index',
    'pages/pickup-detail/index',
    'pages/swap-request/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF7A45',
    navigationBarTitleText: '接送排班',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF8F5'
  },
  tabBar: {
    color: '#B2BEC3',
    selectedColor: '#FF7A45',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/schedule/index',
        text: '排班'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
