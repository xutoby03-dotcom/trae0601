import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Breadcrumb } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Gauge,
  LayoutGrid,
  ClipboardList,
  BarChart3,
  Castle,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <Gauge size={18} />,
    label: '仪表盘',
  },
  {
    key: '/facilities',
    icon: <LayoutGrid size={18} />,
    label: '设施档案',
  },
  {
    key: '/repairs',
    icon: <ClipboardList size={18} />,
    label: '报修管理',
  },
  {
    key: '/statistics',
    icon: <BarChart3 size={18} />,
    label: '统计分析',
  },
];

const breadcrumbMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/facilities': '设施档案',
  '/repairs': '报修管理',
  '/statistics': '统计分析',
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = location.pathname === '/' ? '/dashboard' : location.pathname;

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const handleMenuSelect: MenuProps['onSelect'] = ({ key }) => {
    if (key !== location.pathname) {
      navigate(key);
    }
  };

  const userDropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: '个人设置',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: '退出登录',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        collapsedWidth={64}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0 12px' : '0 20px',
            borderBottom: '1px solid #f0f0f0',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#FF6B35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Castle size={20} color="#fff" />
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#FF6B35',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              儿童游乐设施管理
            </span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultSelectedKeys={['/dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
          onSelect={handleMenuSelect}
          style={{ borderRight: 0, padding: '8px 0' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 18,
                cursor: 'pointer',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <Breadcrumb
              style={{ margin: 0 }}
              items={[
                { title: <span style={{ color: '#999' }}>首页</span> },
                { title: <span style={{ color: '#333', fontWeight: 500 }}>{breadcrumbMap[selectedKey] || '仪表盘'}</span> },
              ]}
            />
          </div>
          <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '4px 12px',
                borderRadius: 8,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar
                size={36}
                style={{
                  background: '#FF6B35',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                icon={<User size={18} />}
              />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>物业管理员</div>
                <div style={{ fontSize: 12, color: '#999' }}>管理员</div>
              </div>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            padding: 24,
            background: '#f5f7fa',
            maxWidth: 'none',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
