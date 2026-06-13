import { useState, useEffect, useCallback } from 'react';
import { ParkingZone, VisitorRecord, PaymentStatus } from './types';
import { saveToStorage, loadFromStorage, isOverdue, getDurationMinutes } from './utils';
import { mockZones, mockRecords } from './mockData';
import Dashboard from './components/Dashboard';
import ZoneManagement from './components/ZoneManagement';
import VisitorRegistration from './components/VisitorRegistration';
import ExitManagement from './components/ExitManagement';

type TabKey = 'dashboard' | 'register' | 'exit' | 'zones';

const STORAGE_KEY_ZONES = 'parking_zones';
const STORAGE_KEY_RECORDS = 'visitor_records';

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [zones, setZones] = useState<ParkingZone[]>(() =>
    loadFromStorage(STORAGE_KEY_ZONES, mockZones)
  );
  const [records, setRecords] = useState<VisitorRecord[]>(() =>
    loadFromStorage(STORAGE_KEY_RECORDS, mockRecords)
  );
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_ZONES, zones);
  }, [zones]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_RECORDS, records);
  }, [records]);

  const updateOverdueStatus = useCallback(() => {
    setRecords(prev =>
      prev.map(record => {
        if (record.exitTime) return record;
        const overdue = isOverdue(record.estimatedLeaveTime);
        if (overdue && !record.isOverdue) {
          setNotifications(prev => [
            ...prev,
            `车辆 ${record.plateNumber} 预计离场时间已到，请及时联系车主`,
          ]);
          setTimeout(() => {
            setNotifications(prev => prev.slice(1));
          }, 5000);
        }
        return { ...record, isOverdue: overdue };
      })
    );
  }, []);

  useEffect(() => {
    updateOverdueStatus();
    const timer = setInterval(updateOverdueStatus, 60000);
    return () => clearInterval(timer);
  }, [updateOverdueStatus]);

  const handleAddZone = (zone: ParkingZone) => {
    setZones(prev => [...prev, zone]);
  };

  const handleUpdateZone = (zone: ParkingZone) => {
    setZones(prev => prev.map(z => (z.id === zone.id ? zone : z)));
  };

  const handleDeleteZone = (zoneId: string) => {
    const hasActiveRecords = records.some(r => r.zoneId === zoneId && !r.exitTime);
    if (hasActiveRecords) {
      alert('该区域还有在场车辆，无法删除');
      return;
    }
    setZones(prev => prev.filter(z => z.id !== zoneId));
  };

  const handleAddRecord = (record: VisitorRecord) => {
    setRecords(prev => [...prev, record]);
  };

  const handleExit = (recordId: string, exitTime: string, fee: number, paymentStatus: PaymentStatus) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        const duration = getDurationMinutes(r.entryTime, exitTime);
        return {
          ...r,
          exitTime,
          actualDuration: duration,
          fee,
          paymentStatus,
        };
      })
    );
  };

  const navItems: { key: TabKey; label: string; icon: string }[] = [
    { key: 'dashboard', label: '看板', icon: '📊' },
    { key: 'register', label: '入场登记', icon: '🚗' },
    { key: 'exit', label: '离场结算', icon: '✅' },
    { key: 'zones', label: '车位管理', icon: '🅿️' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏘️ 小区临停登记台</h1>
      </header>

      {notifications.length > 0 && (
        <div style={{ position: 'fixed', top: 70, right: 20, zIndex: 2000 }}>
          {notifications.map((msg, i) => (
            <div
              key={i}
              className="alert alert-warning"
              style={{
                marginBottom: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: 280,
              }}
            >
              ⏰ {msg}
            </div>
          ))}
        </div>
      )}

      <nav className="app-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-btn ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => setActiveTab(item.key)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard zones={zones} records={records} />
        )}
        {activeTab === 'register' && (
          <VisitorRegistration
            zones={zones}
            records={records}
            onAddRecord={handleAddRecord}
          />
        )}
        {activeTab === 'exit' && (
          <ExitManagement
            zones={zones}
            records={records}
            onExit={handleExit}
          />
        )}
        {activeTab === 'zones' && (
          <ZoneManagement
            zones={zones}
            onAddZone={handleAddZone}
            onUpdateZone={handleUpdateZone}
            onDeleteZone={handleDeleteZone}
          />
        )}
      </main>
    </div>
  );
}

export default App;
