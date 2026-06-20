import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import router from '@/router';
import '@/index.css';

const themeConfig = {
  token: {
    colorPrimary: '#722F37',
    colorSuccess: '#4CAF50',
    colorWarning: '#FF9800',
    colorError: '#E53935',
    colorInfo: '#722F37',
    colorLink: '#722F37',
    borderRadius: 8,
    fontFamily: "'Noto Sans SC', system-ui, sans-serif",
  },
  components: {
    Button: {
      colorPrimary: '#722F37',
      colorPrimaryHover: '#5C252C',
      algorithm: true,
    },
    Menu: {
      colorPrimary: '#722F37',
      itemSelectedBg: 'rgba(114, 47, 55, 0.08)',
      itemSelectedColor: '#722F37',
    },
    Card: {
      colorBorderSecondary: '#F5E6E7',
    },
    Input: {
      colorPrimary: '#722F37',
    },
    Tabs: {
      colorPrimary: '#722F37',
      itemSelectedColor: '#722F37',
      inkBarColor: '#C9A962',
    },
    Table: {
      colorPrimary: '#722F37',
      headerBg: '#FBF5F5',
      headerColor: '#5C252C',
    },
    Breadcrumb: {
      lastItemColor: '#722F37',
      linkColor: '#722F37',
    },
  },
};

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}
