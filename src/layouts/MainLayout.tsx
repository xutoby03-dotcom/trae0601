import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Badge, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  ToolOutlined,
  EnvironmentOutlined,
  BarChartOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useStore } from '@/store';

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orders } = useStore();
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/chairs', icon: <AppstoreOutlined />, label: '椅子管理' },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: (
        <Space size={4}>
          问题工单
          {pendingCount > 0 && <Badge count={pendingCount} color="#f59e0b" size="small" />}
        </Space>
      ),
    },
    { key: '/repairs', icon: <ToolOutlined />, label: '维修记录' },
    { key: '/seatmap', icon: <EnvironmentOutlined />, label: '座位图' },
    { key: '/statistics', icon: <BarChartOutlined />, label: '统计分析' },
  ];

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '个人资料' },
      { key: 'settings', icon: <SettingOutlined />, label: '设置' },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={230}
        theme="dark"
        style={{
          background: 'linear-gradient(180deg, #0f766e 0%, #115e59 100%)',
          boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div className="app-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ToolOutlined style={{ fontSize: 22 }} />
            工学椅调修中心
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            color: '#ccfbf1',
            borderRight: 'none',
            marginTop: 8,
            fontWeight: 500,
          }}
          theme="dark"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ color: '#6b7280', fontSize: 14 }}>
            让每一把椅子都成为护腰的好伙伴 ✨
          </div>
          <Space size={18}>
            <Badge count={pendingCount} size="small" offset={[-2, 2]}>
              <span style={{ color: '#6b7280', fontSize: 18, cursor: 'pointer' }}>
                <BellOutlined />
              </span>
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }} size={10}>
                <Avatar size={36} style={{ backgroundColor: '#0f766e' }} icon={<UserOutlined />} />
                <span style={{ color: '#374151', fontWeight: 500 }}>行政管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 0, padding: 28, background: '#f3f4f6', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
