import { useMemo } from 'react';
import { ParkingZone, VisitorRecord } from '../types';
import {
  getActiveRecords,
  getOverdueRecords,
  getTodayRevenue,
  formatDateTime,
  getPaymentStatusText,
} from '../utils';

interface DashboardProps {
  zones: ParkingZone[];
  records: VisitorRecord[];
}

const Dashboard = ({ zones, records }: DashboardProps) => {
  const activeRecords = useMemo(() => getActiveRecords(records), [records]);
  const overdueRecords = useMemo(() => getOverdueRecords(records), [records]);
  const todayRevenue = useMemo(() => getTodayRevenue(records), [records]);

  const visitorZoneStats = useMemo(() => {
    const visitorZones = zones.filter(z => z.visitorAvailable);
    const totalCapacity = visitorZones.reduce((sum, z) => sum + z.capacity, 0);
    const usedSpots = activeRecords.filter(r =>
      visitorZones.some(z => z.id === r.zoneId)
    ).length;
    return {
      total: totalCapacity,
      used: usedSpots,
      remaining: totalCapacity - usedSpots,
    };
  }, [zones, activeRecords]);

  const getZoneName = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone?.name || '未知区域';
  };

  return (
    <div>
      <div className="dashboard-grid">
        <div className="stat-card primary">
          <div className="stat-label">当前临停车辆</div>
          <div className="stat-value">{activeRecords.length}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">剩余访客车位</div>
          <div className="stat-value">{visitorZoneStats.remaining}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">超时未离场</div>
          <div className="stat-value">{overdueRecords.length}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">今日收费 (元)</div>
          <div className="stat-value">{todayRevenue.toFixed(2)}</div>
        </div>
      </div>

      {overdueRecords.length > 0 && (
        <div className="alert alert-warning">
          <strong>⚠️ 超时提醒：</strong>当前有 {overdueRecords.length} 辆车预计离场时间已过，请及时联系车主。
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>当前在场车辆</h2>
        </div>
        {activeRecords.length === 0 ? (
          <div className="empty-state">暂无在场车辆</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>车牌号</th>
                <th>停车区域</th>
                <th>来访楼栋</th>
                <th>联系人</th>
                <th>入场时间</th>
                <th>预计离开</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {activeRecords.map(record => (
                <tr key={record.id}>
                  <td><strong>{record.plateNumber}</strong></td>
                  <td>{getZoneName(record.zoneId)}</td>
                  <td>{record.building}</td>
                  <td>{record.contactPerson}</td>
                  <td>{formatDateTime(record.entryTime)}</td>
                  <td>{formatDateTime(record.estimatedLeaveTime)}</td>
                  <td>
                    <span className={`status-tag ${record.isOverdue ? 'status-overdue' : 'status-normal'}`}>
                      {record.isOverdue ? '已超时' : '正常'}
                    </span>
                    <span className={`status-tag status-${record.paymentStatus}`} style={{ marginLeft: 4 }}>
                      {getPaymentStatusText(record.paymentStatus)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>车位区域一览</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {zones.map(zone => {
            const zoneUsed = activeRecords.filter(r => r.zoneId === zone.id).length;
            const remaining = zone.capacity - zoneUsed;
            return (
              <div key={zone.id} className="zone-card">
                <div className="zone-card-header">
                  <h3>{zone.name}</h3>
                  <span className={`status-tag ${zone.visitorAvailable ? 'status-normal' : 'status-unpaid'}`}>
                    {zone.visitorAvailable ? '访客可用' : '业主专用'}
                  </span>
                </div>
                <div className="zone-card-info">
                  <div>总车位：{zone.capacity}</div>
                  <div>已用：{zoneUsed}</div>
                  <div>空余：<strong style={{ color: remaining > 0 ? '#52c41a' : '#ff4d4f' }}>{remaining}</strong></div>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                  {zone.feeRule}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
