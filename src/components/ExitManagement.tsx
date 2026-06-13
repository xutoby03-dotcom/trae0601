import { useState, useMemo } from 'react';
import { ParkingZone, VisitorRecord, PaymentStatus } from '../types';
import {
  formatDateTime,
  formatDuration,
  calculateFee,
  getDurationMinutes,
  getPaymentStatusText,
  getActiveRecords,
  isOverdue,
} from '../utils';

interface ExitManagementProps {
  zones: ParkingZone[];
  records: VisitorRecord[];
  onExit: (recordId: string, exitTime: string, fee: number, paymentStatus: PaymentStatus) => void;
}

const ExitManagement = ({ zones, records, onExit }: ExitManagementProps) => {
  const [searchPlate, setSearchPlate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<VisitorRecord | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const activeRecords = useMemo(() => getActiveRecords(records), [records]);
  const historyRecords = useMemo(
    () => records.filter(r => r.exitTime).sort((a, b) => new Date(b.exitTime!).getTime() - new Date(a.exitTime!).getTime()),
    [records]
  );

  const filteredActiveRecords = useMemo(() => {
    if (!searchPlate.trim()) return activeRecords;
    return activeRecords.filter(r =>
      r.plateNumber.toLowerCase().includes(searchPlate.toLowerCase())
    );
  }, [activeRecords, searchPlate]);

  const exitTime = new Date().toISOString();

  const getZoneName = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone?.name || '未知区域';
  };

  const getZone = (zoneId: string) => {
    return zones.find(z => z.id === zoneId);
  };

  const handleSelectRecord = (record: VisitorRecord) => {
    setSelectedRecord(record);
    setPaymentStatus('paid');
  };

  const handleConfirmExit = () => {
    if (!selectedRecord) return;

    const zone = getZone(selectedRecord.zoneId);
    if (!zone) return;

    const fee = calculateFee(zone, selectedRecord.entryTime, exitTime);

    onExit(selectedRecord.id, exitTime, fee, paymentStatus);

    setSelectedRecord(null);
    setSearchPlate('');
  };

  const selectedFee = selectedRecord && getZone(selectedRecord.zoneId)
    ? calculateFee(getZone(selectedRecord.zoneId)!, selectedRecord.entryTime, exitTime)
    : 0;

  const selectedDuration = selectedRecord
    ? getDurationMinutes(selectedRecord.entryTime, exitTime)
    : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <div className="card">
        <div className="card-header">
          <h2>离场登记</h2>
        </div>

        <div className="tabs">
          <div
            className={`tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            在场车辆 ({activeRecords.length})
          </div>
          <div
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            离场记录
          </div>
        </div>

        {activeTab === 'active' && (
          <>
            <div className="form-group">
              <input
                type="text"
                value={searchPlate}
                onChange={e => setSearchPlate(e.target.value)}
                placeholder="🔍 输入车牌号搜索..."
                style={{ fontSize: 16, padding: '10px 14px' }}
              />
            </div>

            {filteredActiveRecords.length === 0 ? (
              <div className="empty-state">
                {searchPlate ? '未找到匹配的车辆' : '暂无在场车辆'}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>车牌号</th>
                    <th>停车区域</th>
                    <th>入场时间</th>
                    <th>预计离开</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActiveRecords.map(record => {
                    const overdue = isOverdue(record.estimatedLeaveTime);
                    return (
                      <tr key={record.id}>
                        <td><strong>{record.plateNumber}</strong></td>
                        <td>{getZoneName(record.zoneId)}</td>
                        <td>{formatDateTime(record.entryTime)}</td>
                        <td>{formatDateTime(record.estimatedLeaveTime)}</td>
                        <td>
                          <span className={`status-tag ${overdue ? 'status-overdue' : 'status-normal'}`}>
                            {overdue ? '已超时' : '正常'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSelectRecord(record)}
                          >
                            离场结算
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {historyRecords.length === 0 ? (
              <div className="empty-state">暂无离场记录</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>车牌号</th>
                    <th>停车区域</th>
                    <th>入场时间</th>
                    <th>离场时间</th>
                    <th>时长</th>
                    <th>费用</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.map(record => (
                    <tr key={record.id}>
                      <td><strong>{record.plateNumber}</strong></td>
                      <td>{getZoneName(record.zoneId)}</td>
                      <td>{formatDateTime(record.entryTime)}</td>
                      <td>{record.exitTime ? formatDateTime(record.exitTime) : '-'}</td>
                      <td>{record.actualDuration ? formatDuration(record.actualDuration) : '-'}</td>
                      <td>
                        <strong style={{ color: '#1890ff' }}>
                          ¥{record.fee?.toFixed(2) || '0.00'}
                        </strong>
                      </td>
                      <td>
                        <span className={`status-tag status-${record.paymentStatus}`}>
                          {getPaymentStatusText(record.paymentStatus)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>结算详情</h2>
        </div>

        {!selectedRecord ? (
          <div className="empty-state">请选择车辆进行结算</div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 32, fontWeight: 600, color: '#1890ff' }}>
                {selectedRecord.plateNumber}
              </div>
              <div style={{ color: '#8c8c8c', marginTop: 4 }}>
                {getZoneName(selectedRecord.zoneId)}
              </div>
            </div>

            {selectedRecord.carPhoto && (
              <img
                src={selectedRecord.carPhoto}
                alt="车辆照片"
                className="photo-preview"
                style={{ marginBottom: 16 }}
              />
            )}

            <div className="fee-calc">
              <div className="fee-row">
                <span>入场时间：</span>
                <span>{formatDateTime(selectedRecord.entryTime)}</span>
              </div>
              <div className="fee-row">
                <span>离场时间：</span>
                <span>{formatDateTime(exitTime)}</span>
              </div>
              <div className="fee-row">
                <span>停放时长：</span>
                <span><strong>{formatDuration(selectedDuration)}</strong></span>
              </div>
              <div className="fee-total" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>应付费用：</span>
                <span>¥{selectedFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label>缴费状态</label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
              >
                <option value="paid">已付</option>
                <option value="unpaid">未付</option>
                <option value="waived">减免</option>
              </select>
            </div>

            <div style={{ fontSize: 13, color: '#595959', marginBottom: 12 }}>
              <div>来访楼栋：{selectedRecord.building}</div>
              <div>联系人：{selectedRecord.contactPerson}</div>
              <div>手机号：{selectedRecord.phone}</div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 16 }}
              onClick={handleConfirmExit}
            >
              确认离场
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExitManagement;
