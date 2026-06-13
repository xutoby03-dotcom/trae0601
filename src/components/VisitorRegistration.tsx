import { useState, useMemo } from 'react';
import { ParkingZone, VisitorRecord } from '../types';
import { generateId, formatDateTime, getActiveRecords, isOverdue } from '../utils';

interface VisitorRegistrationProps {
  zones: ParkingZone[];
  records: VisitorRecord[];
  onAddRecord: (record: VisitorRecord) => void;
}

const VisitorRegistration = ({ zones, records, onAddRecord }: VisitorRegistrationProps) => {
  const visitorZones = useMemo(() => zones.filter(z => z.visitorAvailable), [zones]);
  const activeRecords = useMemo(() => getActiveRecords(records), [records]);

  const [formData, setFormData] = useState({
    plateNumber: '',
    building: '',
    contactPerson: '',
    phone: '',
    estimatedLeaveHours: 2,
    zoneId: visitorZones[0]?.id || '',
    carPhoto: '',
  });

  const [successMsg, setSuccessMsg] = useState('');

  const getZoneRemaining = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return 0;
    const used = activeRecords.filter(r => r.zoneId === zoneId).length;
    return zone.capacity - used;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, carPhoto: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.plateNumber.trim()) {
      alert('请输入车牌号');
      return;
    }
    if (!formData.building.trim()) {
      alert('请输入来访楼栋');
      return;
    }
    if (!formData.contactPerson.trim()) {
      alert('请输入联系人');
      return;
    }
    if (!formData.phone.trim()) {
      alert('请输入手机号');
      return;
    }
    if (!formData.zoneId) {
      alert('请选择停车区域');
      return;
    }

    const remaining = getZoneRemaining(formData.zoneId);
    if (remaining <= 0) {
      alert('该区域车位已满，请选择其他区域');
      return;
    }

    const estimatedLeaveTime = new Date(
      Date.now() + formData.estimatedLeaveHours * 60 * 60 * 1000
    ).toISOString();

    const newRecord: VisitorRecord = {
      id: generateId(),
      plateNumber: formData.plateNumber.toUpperCase(),
      building: formData.building,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      estimatedLeaveTime,
      zoneId: formData.zoneId,
      entryTime: new Date().toISOString(),
      paymentStatus: 'unpaid',
      isOverdue: false,
      carPhoto: formData.carPhoto || undefined,
    };

    onAddRecord(newRecord);

    setSuccessMsg(`登记成功！车牌号 ${newRecord.plateNumber} 已入场`);
    setFormData({
      plateNumber: '',
      building: '',
      contactPerson: '',
      phone: '',
      estimatedLeaveHours: 2,
      zoneId: visitorZones[0]?.id || '',
      carPhoto: '',
    });

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const selectedZone = zones.find(z => z.id === formData.zoneId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <div className="card">
        <div className="card-header">
          <h2>访客入场登记</h2>
        </div>

        {successMsg && (
          <div className="alert alert-warning" style={{ background: '#f6ffed', borderColor: '#b7eb8f', color: '#389e0d' }}>
            ✅ {successMsg}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>车牌号 *</label>
            <input
              type="text"
              value={formData.plateNumber}
              onChange={e => setFormData({ ...formData, plateNumber: e.target.value })}
              placeholder="如：京A12345"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div className="form-group">
            <label>来访楼栋 *</label>
            <input
              type="text"
              value={formData.building}
              onChange={e => setFormData({ ...formData, building: e.target.value })}
              placeholder="如：3号楼"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>联系人 *</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="车主姓名"
            />
          </div>
          <div className="form-group">
            <label>手机号 *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="联系电话"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>停车区域 *</label>
            <select
              value={formData.zoneId}
              onChange={e => setFormData({ ...formData, zoneId: e.target.value })}
            >
              <option value="">请选择</option>
              {visitorZones.map(zone => {
                const remaining = getZoneRemaining(zone.id);
                return (
                  <option key={zone.id} value={zone.id} disabled={remaining <= 0}>
                    {zone.name} (剩余 {remaining} 位)
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label>预计停放时长</label>
            <select
              value={formData.estimatedLeaveHours}
              onChange={e => setFormData({ ...formData, estimatedLeaveHours: parseFloat(e.target.value) })}
            >
              <option value={0.5}>30分钟</option>
              <option value={1}>1小时</option>
              <option value={2}>2小时</option>
              <option value={3}>3小时</option>
              <option value={4}>4小时</option>
              <option value={6}>6小时</option>
              <option value={8}>8小时</option>
              <option value={12}>12小时</option>
              <option value={24}>24小时</option>
            </select>
          </div>
        </div>

        {selectedZone && (
          <div className="fee-calc">
            <div className="fee-row">
              <span>收费规则：</span>
              <span>{selectedZone.feeRule}</span>
            </div>
            <div className="fee-row">
              <span>预计离开时间：</span>
              <span>{formatDateTime(new Date(Date.now() + formData.estimatedLeaveHours * 60 * 60 * 1000))}</span>
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginTop: 16 }}>
          <label>车辆照片</label>
          {formData.carPhoto ? (
            <div>
              <img
                src={formData.carPhoto}
                alt="车辆照片预览"
                className="photo-preview"
                style={{ maxHeight: 200 }}
              />
              <button
                className="btn btn-default btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => setFormData({ ...formData, carPhoto: '' })}
              >
                重新拍摄
              </button>
            </div>
          ) : (
            <label className="photo-upload">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              <span style={{ color: '#8c8c8c' }}>📷 点击拍摄/上传车辆照片</span>
            </label>
          )}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: 16, marginTop: 16 }}
          onClick={handleSubmit}
        >
          确认登记入场
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>今日入场记录</h2>
        </div>
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {activeRecords.length === 0 ? (
            <div className="empty-state">暂无入场记录</div>
          ) : (
            <div>
              {[...activeRecords]
                .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
                .map(record => {
                  const overdue = isOverdue(record.estimatedLeaveTime);
                  const zone = zones.find(z => z.id === record.zoneId);
                  return (
                    <div
                      key={record.id}
                      style={{
                        padding: 12,
                        borderBottom: '1px solid #f0f0f0',
                        background: overdue ? '#fffbe6' : 'white',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: 16 }}>{record.plateNumber}</strong>
                        <span className={`status-tag ${overdue ? 'status-overdue' : 'status-normal'}`}>
                          {overdue ? '已超时' : '正常'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        {zone?.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        入场：{formatDateTime(record.entryTime)}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        预计离开：{formatDateTime(record.estimatedLeaveTime)}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorRegistration;
