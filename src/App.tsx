import { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Button, Modal } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  AlertOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Ingredients from './pages/Ingredients';
import OpenRecords from './pages/OpenRecords';
import UsageHistory from './pages/UsageHistory';
import Statistics from './pages/Statistics';
import { useStore } from './store/useStore';
import type { AlertItem } from './types';

const { Header, Sider, Content } = Layout;

type PageKey = 'dashboard' | 'ingredients' | 'openRecords' | 'usageHistory' | 'statistics';

function App() {
  const [activeKey, setActiveKey] = useState<PageKey>('dashboard');
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const alerts = useStore((s) => s.alerts);
  const acknowledgeAllAlerts = useStore((s) => s.acknowledgeAllAlerts);
  const refreshAlerts = useStore((s) => s.refreshAlerts);

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshAlerts();
    }, 60000);
    return () => clearInterval(timer);
  }, [refreshAlerts]);

  useEffect(() => {
    if (unacknowledgedAlerts.length > 0) {
      setAlertModalOpen(true);
    }
  }, [unacknowledgedAlerts.length]);

  const renderAlertLevelColor = (level: AlertItem['level']) => {
    if (level === 'danger') return '#cf1322';
    return '#d48806';
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'expired':
        return '⏰';
      case 'temp':
        return '🌡️';
      case 'lowStock':
        return '📦';
    }
  };

  const menuItems = [
    { key: 'dashboard', icon: <HomeOutlined />, label: '工作台' },
    { key: 'ingredients', icon: <AppstoreOutlined />, label: '原料档案' },
    { key: 'openRecords', icon: <UnorderedListOutlined />, label: '开封管理' },
    { key: 'usageHistory', icon: <FileTextOutlined />, label: '取用记录' },
    { key: 'statistics', icon: <FileTextOutlined />, label: '统计报表' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div className="logo">🍰 烘焙原料管理</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => setActiveKey(key as PageKey)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {menuItems.find((m) => m.key === activeKey)?.label}
          </div>
          <Badge count={unacknowledgedAlerts.length} offset={[-4, 0]}>
            <Button
              type="primary"
              icon={<AlertOutlined />}
              onClick={() => setAlertModalOpen(true)}
            >
              提醒中心
            </Button>
          </Badge>
        </Header>
        <Content>
          <div className="page-container">
            {activeKey === 'dashboard' && <Dashboard onNavigate={setActiveKey} />}
            {activeKey === 'ingredients' && <Ingredients />}
            {activeKey === 'openRecords' && <OpenRecords />}
            {activeKey === 'usageHistory' && <UsageHistory />}
            {activeKey === 'statistics' && <Statistics />}
          </div>
        </Content>
      </Layout>

      <Modal
        title={
          <span>
            <AlertOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
            提醒中心 ({unacknowledgedAlerts.length} 条未读)
          </span>
        }
        open={alertModalOpen}
        onCancel={() => setAlertModalOpen(false)}
        onOk={() => {
          acknowledgeAllAlerts();
          setAlertModalOpen(false);
        }}
        okText="全部已读"
        okButtonProps={{ icon: <CheckCircleOutlined /> }}
        width={720}
      >
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
              ✅ 暂无任何提醒
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '12px 16px',
                  marginBottom: 12,
                  borderRadius: 8,
                  borderLeft: `4px solid ${renderAlertLevelColor(alert.level)}`,
                  background: alert.acknowledged ? '#fafafa' : '#fff',
                  opacity: alert.acknowledged ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 15 }}>
                    {getAlertIcon(alert.type)} {alert.title}
                  </span>
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>{alert.timestamp}</span>
                </div>
                <div style={{ color: '#595959', fontSize: 13 }}>{alert.description}</div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </Layout>
  );
}

export default App;
