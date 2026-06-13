import { useState } from 'react';
import { ParkingZone } from '../types';
import { generateId } from '../utils';

interface ZoneManagementProps {
  zones: ParkingZone[];
  onAddZone: (zone: ParkingZone) => void;
  onUpdateZone: (zone: ParkingZone) => void;
  onDeleteZone: (zoneId: string) => void;
}

const emptyZone: Omit<ParkingZone, 'id'> = {
  name: '',
  capacity: 0,
  feeRule: '',
  feePerHour: 5,
  freeMinutes: 30,
  maxDailyFee: 30,
  visitorAvailable: true,
  entrancePhoto: '',
};

const ZoneManagement = ({ zones, onAddZone, onUpdateZone, onDeleteZone }: ZoneManagementProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<ParkingZone | null>(null);
  const [formData, setFormData] = useState<Omit<ParkingZone, 'id'>>(emptyZone);

  const handleAdd = () => {
    setEditingZone(null);
    setFormData(emptyZone);
    setShowModal(true);
  };

  const handleEdit = (zone: ParkingZone) => {
    setEditingZone(zone);
    setFormData(zone);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请输入车位区域名称');
      return;
    }
    if (formData.capacity <= 0) {
      alert('请输入有效的车位容量');
      return;
    }
    if (!formData.feeRule.trim()) {
      alert('请输入收费规则说明');
      return;
    }

    if (editingZone) {
      onUpdateZone({ ...formData, id: editingZone.id });
    } else {
      onAddZone({ ...formData, id: generateId() });
    }
    setShowModal(false);
  };

  const handleDelete = (zoneId: string) => {
    if (confirm('确定要删除这个车位区域吗？')) {
      onDeleteZone(zoneId);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, entrancePhoto: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>车位区域管理</h2>
          <button className="btn btn-primary" onClick={handleAdd}>
            + 添加区域
          </button>
        </div>

        {zones.length === 0 ? (
          <div className="empty-state">暂无车位区域，请先添加</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
            {zones.map(zone => (
              <div key={zone.id} className="zone-card">
                <div className="zone-card-header">
                  <h3>{zone.name}</h3>
                  <span className={`status-tag ${zone.visitorAvailable ? 'status-normal' : 'status-unpaid'}`}>
                    {zone.visitorAvailable ? '访客可用' : '业主专用'}
                  </span>
                </div>

                {zone.entrancePhoto && (
                  <img
                    src={zone.entrancePhoto}
                    alt="入口照片"
                    className="photo-preview"
                    style={{ marginBottom: 12, maxHeight: 150 }}
                  />
                )}

                <div className="zone-card-info">
                  <div>车位容量：{zone.capacity} 个</div>
                  <div>每小时费用：{zone.feePerHour} 元</div>
                  <div>免费时长：{zone.freeMinutes} 分钟</div>
                </div>

                <div style={{ marginTop: 8, fontSize: 13, color: '#595959' }}>
                  <strong>收费规则：</strong>{zone.feeRule}
                </div>
                <div style={{ fontSize: 13, color: '#595959', marginTop: 4 }}>
                  <strong>每日封顶：</strong>{zone.maxDailyFee} 元
                </div>

                <div className="zone-card-actions">
                  <button className="btn btn-default btn-sm" onClick={() => handleEdit(zone)}>
                    编辑
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(zone.id)}>
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              {editingZone ? '编辑车位区域' : '添加车位区域'}
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>区域名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：A区访客停车场"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>车位容量 *</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>每小时费用 (元)</label>
                  <input
                    type="number"
                    value={formData.feePerHour}
                    onChange={e => setFormData({ ...formData, feePerHour: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>免费时长 (分钟)</label>
                  <input
                    type="number"
                    value={formData.freeMinutes}
                    onChange={e => setFormData({ ...formData, freeMinutes: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>每日封顶 (元)</label>
                  <input
                    type="number"
                    value={formData.maxDailyFee}
                    onChange={e => setFormData({ ...formData, maxDailyFee: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>收费规则说明 *</label>
                <textarea
                  value={formData.feeRule}
                  onChange={e => setFormData({ ...formData, feeRule: e.target.value })}
                  placeholder="如：首小时免费，之后5元/小时，每天封顶30元"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="visitorAvailable"
                    checked={formData.visitorAvailable}
                    onChange={e => setFormData({ ...formData, visitorAvailable: e.target.checked })}
                  />
                  <label htmlFor="visitorAvailable" style={{ marginBottom: 0 }}>访客可用</label>
                </div>
              </div>

              <div className="form-group">
                <label>入口照片</label>
                {formData.entrancePhoto ? (
                  <div>
                    <img
                      src={formData.entrancePhoto}
                      alt="入口照片预览"
                      className="photo-preview"
                    />
                    <button
                      className="btn btn-default btn-sm"
                      style={{ marginTop: 8 }}
                      onClick={() => setFormData({ ...formData, entrancePhoto: '' })}
                    >
                      移除照片
                    </button>
                  </div>
                ) : (
                  <label className="photo-upload">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    <span style={{ color: '#8c8c8c' }}>点击上传入口照片</span>
                  </label>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneManagement;
