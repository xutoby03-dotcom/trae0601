export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/stats/index',
    'pages/mine/index',
    'pages/add/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF7A45',
    navigationBarTitleText: '剩菜去向',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#636E72',
    selectedColor: '#FF7A45',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
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
