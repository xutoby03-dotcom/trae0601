import React, { useState, useEffect } from 'react'
import { Layout, Menu, Select, Button, theme } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FireOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AuditOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { getEmployees } from '@/api/employees'

const { Header, Sider, Content } = Layout

const roleMap = {
  master: '烘焙师',
  apprentice: '学徒',
  manager: '经理',
}

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '📈 趋势看板',
  },
  {
    key: '/ovens',
    icon: <FireOutlined />,
    label: '🔥 设备管理',
  },
  {
    key: '/calibration',
    icon: <BarChartOutlined />,
    label: '📊 校准记录',
  },
  {
    key: '/recipes',
    icon: <FileTextOutlined />,
    label: '📋 产品配方',
  },
  {
    key: '/batches',
    icon: <AuditOutlined />,
    label: '🍞 批次记录',
  },
  {
    key: '/employees',
    icon: <TeamOutlined />,
    label: '👥 员工管理',
  },
]

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [employees, setEmployees] = useState([])
  const [currentEmployeeId, setCurrentEmployeeId] = useState(
    localStorage.getItem('currentEmployeeId') || ''
  )
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees({ pageSize: 100 })
      setEmployees(res.list || [])
    } catch (err) {
      console.error('获取员工列表失败:', err)
    }
  }

  const handleEmployeeChange = (value) => {
    setCurrentEmployeeId(value)
    localStorage.setItem('currentEmployeeId', value)
  }

  const getCurrentEmployee = () => {
    return employees.find((emp) => String(emp.id) === String(currentEmployeeId))
  }

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const currentEmployee = getCurrentEmployee()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
            color: '#1890ff',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {collapsed ? '🍞' : '🍞 烤箱校准系统'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#666' }}>当前操作员：</span>
            <Select
              value={currentEmployeeId || undefined}
              onChange={handleEmployeeChange}
              placeholder="请选择操作员"
              style={{ width: 220 }}
              allowClear
              showSearch
              optionFilterProp="children"
              suffixIcon={<UserOutlined />}
            >
              {employees.map((emp) => (
                <Select.Option key={emp.id} value={String(emp.id)}>
                  {emp.name} - {roleMap[emp.role] || emp.role}
                </Select.Option>
              ))}
            </Select>
            {currentEmployee && !collapsed && (
              <span style={{ color: '#1890ff', fontSize: 12 }}>
                ID: {currentEmployee.id}
              </span>
            )}
          </div>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
