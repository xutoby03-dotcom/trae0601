import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import {
  MapPin,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  User,
  LogOut,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { isOverdue } from '../../utils/helpers';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { points, currentUser } = useStore();

  const overdueCount = points.filter(isOverdue).length;

  const menuItems = [
    {
      key: '/',
      icon: <MapPin size={18} />,
      label: '点位档案',
    },
    {
      key: '/inspection',
      icon: <ClipboardList size={18} />,
      label: '巡检记录',
    },
    {
      key: '/anomaly',
      icon: (
        <Badge count={overdueCount} size="small" offset={[8, -4]} color="#DC2626">
          <AlertTriangle size={18} />
        </Badge>
      ),
      label: '异常管理',
    },
    {
      key: '/statistics',
      icon: <BarChart3 size={18} />,
      label: '统计分析',
    },
  ];

  const userMenuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: currentUser,
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: '2',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className="bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-700">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            消
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">消防巡检</span>
              <span className="text-gray-400 text-xs">Fire Inspection</span>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="mt-4 border-none bg-transparent"
          style={{ background: 'transparent' }}
        />
      </Sider>

      <Layout className="bg-gray-50">
        <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {menuItems.find((m) => m.key === location.pathname)?.label}
              </h1>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('zh-CN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <Avatar
                className="bg-red-600"
                icon={<UserOutlined />}
              />
              <span className="text-gray-700 font-medium">{currentUser}</span>
            </div>
          </Dropdown>
        </Header>

        <Content className="p-6 overflow-auto">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
