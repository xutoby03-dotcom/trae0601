import { useState } from 'react'
import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  TeamOutlined,
  DatabaseOutlined,
  AlertOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '区域看板',
  },
  {
    key: '/today-tasks',
    icon: <CalendarOutlined />,
    label: '今日任务',
  },
  {
    key: '/plants',
    icon: <AppstoreOutlined />,
    label: '植物管理',
  },
  {
    key: '/duty',
    icon: <TeamOutlined />,
    label: '轮值表',
  },
  {
    key: '/water-records',
    icon: <DatabaseOutlined />,
    label: '浇水记录',
  },
  {
    key: '/pest-reports',
    icon: <AlertOutlined />,
    label: '病虫害上报',
  },
  {
    key: '/holidays',
    icon: <BellOutlined />,
    label: '节假日管理',
  },
  {
    key: '/employees',
    icon: <UserOutlined />,
    label: '员工管理',
  },
]

function MainLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const handleMenuClick = (e) => {
    navigate(e.key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? '绿化' : '绿化管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <h2 style={{ margin: 0 }}>
            {menuItems.find((item) => item.key === location.pathname)?.label ||
              '绿化管理系统'}
          </h2>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
