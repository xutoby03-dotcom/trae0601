import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus, Calendar, User, Info, Cpu, Package, X } from 'lucide-react';
import { BatteryStatus } from '../../components/ui/BatteryStatus';
import { CardCapacity } from '../../components/ui/CardCapacity';
import { EquipmentTypeIcon } from '../../components/ui/EquipmentTypeIcon';
import { useEquipmentStore } from '../../store/equipmentStore';
import { useRecordStore } from '../../store/recordStore';
import {
  equipmentTypeLabels,
  equipmentStatusLabels,
  getStatusColor,
  getUserName,
  formatDate,
  formatRelativeTime,
  shootingRecordTypeLabels,
} from '../../utils/helpers';

export function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { equipment, users, deleteEquipment, updateBatteryChargeLevel, formatMemoryCard, addBattery, addMemoryCard } = useEquipmentStore();
  const { getShootingRecordsForEquipment } = useRecordStore();

  const [activeTab, setActiveTab] = useState<'info' | 'batteries' | 'cards' | 'history'>('info');
  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [batteryForm, setBatteryForm] = useState({ model: '', capacity: '', chargeLevel: '' });
  const [cardForm, setCardForm] = useState({ brand: '', capacity: '', usedCapacity: '' });

  const eq = equipment.find(e => e.id === id);
  const shootingRecords = eq ? getShootingRecordsForEquipment(eq.id) : [];
  
  // 展平所有记录
  const records: Array<{
    id: string;
    type: 'battery_change' | 'card_full';
    recordedAt: string;
    recordedBy: string;
    notes?: string;
  }> = [];
  
  shootingRecords.forEach(sr => {
    sr.batteryChanges.forEach(bc => {
      if (bc.equipmentId === eq?.id) {
        records.push({
          id: `${sr.id}-bc-${bc.oldBatteryId}`,
          type: 'battery_change',
          recordedAt: bc.timestamp,
          recordedBy: bc.operatorId,
          notes: bc.notes,
        });
      }
    });
    sr.cardFulls.forEach(cf => {
      if (cf.equipmentId === eq?.id) {
        records.push({
          id: `${sr.id}-cf-${cf.cardId}`,
          type: 'card_full',
          recordedAt: cf.timestamp,
          recordedBy: cf.operatorId,
          notes: cf.notes,
        });
      }
    });
  });
  
  // 按时间排序
  records.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  // 处理添加电池
  const handleAddBattery = () => {
    if (!eq || !batteryForm.model || !batteryForm.capacity || !batteryForm.chargeLevel) {
      alert('请填写完整的电池信息');
      return;
    }
    addBattery(eq.id, {
      model: batteryForm.model,
      capacity: parseInt(batteryForm.capacity),
      chargeLevel: parseInt(batteryForm.chargeLevel),
      chargeCycles: 0,
      brand: '',
    });
    setBatteryForm({ model: '', capacity: '', chargeLevel: '' });
    setShowBatteryModal(false);
  };

  // 处理添加存储卡
  const handleAddCard = () => {
    if (!eq || !cardForm.brand || !cardForm.capacity || !cardForm.usedCapacity) {
      alert('请填写完整的存储卡信息');
      return;
    }
    const totalCapacity = parseInt(cardForm.capacity);
    const usedCapacity = parseInt(cardForm.usedCapacity);
    addMemoryCard(eq.id, {
      brand: cardForm.brand,
      model: '',
      capacity: `${totalCapacity}GB`,
      totalCapacity,
      usedCapacity,
      speed: '',
    });
    setCardForm({ brand: '', capacity: '', usedCapacity: '' });
    setShowCardModal(false);
  };

  if (!eq) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
          <Info size={32} className="text-neutral-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">器材不存在</h3>
        <p className="text-neutral-500 mb-4">该器材可能已被删除</p>
        <button onClick={() => navigate('/equipment')} className="btn-primary">
          返回器材列表
        </button>
      </div>
    );
  }

  const owner = getUserName(eq.ownerId, users);

  const handleDelete = () => {
    if (window.confirm('确定要删除这个器材吗？此操作不可撤销。')) {
      deleteEquipment(eq.id);
      navigate('/equipment');
    }
  };

  const tabs = [
    { id: 'info' as const, label: '基本信息', icon: Info },
    { id: 'batteries' as const, label: `电池 (${eq.batteries.length})`, icon: BatteryStatus },
    { id: 'cards' as const, label: `存储卡 (${eq.memoryCards.length})`, icon: CardCapacity },
    { id: 'history' as const, label: `使用记录 (${records.length})`, icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/equipment')}
          className="p-2 rounded-lg bg-background-lighter hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-neutral-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{eq.brand} {eq.model}</h1>
            <span className={`status-badge ${getStatusColor(eq.status)}`}>
              {equipmentStatusLabels[eq.status]}
            </span>
          </div>
          <p className="text-neutral-400">{equipmentTypeLabels[eq.type]}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/equipment/${eq.id}/edit`)}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit size={16} />
            编辑
          </button>
          <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
            <Trash2 size={16} />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-6">
            <div className="aspect-square rounded-lg overflow-hidden bg-neutral-800 mb-4">
              {eq.photo ? (
                <img src={eq.photo} alt={eq.model} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <EquipmentTypeIcon type={eq.type} size={64} className="text-neutral-600" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background-lighter rounded-lg">
                <User size={18} className="text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">拥有者</p>
                  <p className="font-medium text-white">{owner}</p>
                </div>
              </div>
              {eq.purchaseDate && (
                <div className="flex items-center gap-3 p-3 bg-background-lighter rounded-lg">
                  <Calendar size={18} className="text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">购买日期</p>
                    <p className="font-medium text-white">{formatDate(eq.purchaseDate)}</p>
                  </div>
                </div>
              )}
              {eq.firmwareVersion && (
                <div className="flex items-center gap-3 p-3 bg-background-lighter rounded-lg">
                  <Cpu size={18} className="text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">固件版本</p>
                    <p className="font-medium text-white">{eq.firmwareVersion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex gap-1 p-1 bg-background-lighter rounded-lg mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">品牌</p>
                    <p className="text-white">{eq.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">型号</p>
                    <p className="text-white">{eq.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">类型</p>
                    <p className="text-white">{equipmentTypeLabels[eq.type]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">状态</p>
                    <span className={`status-badge ${getStatusColor(eq.status)}`}>
                      {equipmentStatusLabels[eq.status]}
                    </span>
                  </div>
                </div>
              </div>

              {eq.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">备注</h3>
                  <p className="text-neutral-300 p-4 bg-background-lighter rounded-lg">{eq.notes}</p>
                </div>
              )}

              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Package size={16} className="text-primary" />
                  <span className="text-neutral-400">电池:</span>
                  <span className="text-white font-medium">{eq.batteries.length} 块</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package size={16} className="text-success" />
                  <span className="text-neutral-400">存储卡:</span>
                  <span className="text-white font-medium">{eq.memoryCards.length} 张</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'batteries' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">电池管理</h3>
                <button
                  onClick={() => setShowBatteryModal(true)}
                  className="btn-primary text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  添加电池
                </button>
              </div>

              {eq.batteries.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-neutral-500">暂无电池记录</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eq.batteries.map((bat) => (
                    <div key={bat.id} className="card p-4">
                      <BatteryStatus
                        battery={bat}
                        showDetails
                        onMarkCharged={() => updateBatteryChargeLevel(eq.id, bat.id, 100)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">存储卡管理</h3>
                <button
                  onClick={() => setShowCardModal(true)}
                  className="btn-primary text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  添加存储卡
                </button>
              </div>

              {eq.memoryCards.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-neutral-500">暂无存储卡记录</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eq.memoryCards.map((card) => (
                    <div key={card.id} className="card p-4">
                      <CardCapacity
                        card={card}
                        showDetails
                        onFormat={() => formatMemoryCard(eq.id, card.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">使用记录</h3>

              {records.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-neutral-500">暂无使用记录</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-neutral-700" />
                  <div className="space-y-4">
                    {records.map((record, idx) => (
                      <div key={record.id} className="relative pl-10">
                        <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                        <div className="card p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="status-badge bg-primary/20 text-primary mr-2">
                                {shootingRecordTypeLabels[record.type]}
                              </span>
                              <span className="text-sm text-neutral-400">
                                {formatRelativeTime(record.recordedAt)}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-500">
                              {formatDate(record.recordedAt)}
                            </span>
                          </div>
                          {record.notes && (
                            <p className="text-neutral-300 text-sm">{record.notes}</p>
                          )}
                          <p className="text-xs text-neutral-500 mt-2">
                            操作人: {getUserName(record.recordedBy, users)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 添加电池模态框 */}
      {showBatteryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-background-card rounded-xl p-6 w-full max-w-md mx-4 animate-bounce-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">添加电池</h3>
              <button
                onClick={() => setShowBatteryModal(false)}
                className="p-1 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <X size={20} className="text-neutral-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">电池型号</label>
                <input
                  type="text"
                  value={batteryForm.model}
                  onChange={(e) => setBatteryForm({ ...batteryForm, model: e.target.value })}
                  className="input"
                  placeholder="如: NP-FZ100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">容量 (mAh)</label>
                <input
                  type="number"
                  value={batteryForm.capacity}
                  onChange={(e) => setBatteryForm({ ...batteryForm, capacity: e.target.value })}
                  className="input"
                  placeholder="如: 2280"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">当前电量 (%)</label>
                <input
                  type="number"
                  value={batteryForm.chargeLevel}
                  onChange={(e) => setBatteryForm({ ...batteryForm, chargeLevel: e.target.value })}
                  className="input"
                  placeholder="如: 100"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBatteryModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleAddBattery}
                className="btn-primary flex-1"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加存储卡模态框 */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-background-card rounded-xl p-6 w-full max-w-md mx-4 animate-bounce-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">添加存储卡</h3>
              <button
                onClick={() => setShowCardModal(false)}
                className="p-1 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <X size={20} className="text-neutral-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">品牌</label>
                <input
                  type="text"
                  value={cardForm.brand}
                  onChange={(e) => setCardForm({ ...cardForm, brand: e.target.value })}
                  className="input"
                  placeholder="如: SanDisk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">总容量 (GB)</label>
                <input
                  type="number"
                  value={cardForm.capacity}
                  onChange={(e) => setCardForm({ ...cardForm, capacity: e.target.value })}
                  className="input"
                  placeholder="如: 128"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">已用空间 (GB)</label>
                <input
                  type="number"
                  value={cardForm.usedCapacity}
                  onChange={(e) => setCardForm({ ...cardForm, usedCapacity: e.target.value })}
                  className="input"
                  placeholder="如: 45"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCardModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleAddCard}
                className="btn-primary flex-1"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
