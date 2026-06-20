import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Clock, Battery, HardDrive, User,
  Camera, Check, AlertTriangle, RefreshCcw
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { useRecordStore } from '../../store/recordStore';
import { useEquipmentStore as eqStore } from '../../store/equipmentStore';
import { equipmentTypeLabels, getUserName, formatDateTime } from '../../utils/helpers';
import { EquipmentTypeIcon } from '../../components/ui/EquipmentTypeIcon';
import { BatteryStatus } from '../../components/ui/BatteryStatus';
import { CardCapacity } from '../../components/ui/CardCapacity';
import type { BatteryChange, CardFull } from '../../types';

export function ShootingRecord() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { missions, updateMissionStatus } = useMissionStore();
  const { equipment, users } = useEquipmentStore();
  const { shootingRecords, createBatteryChange, createCardFull } = useRecordStore();
  const { updateBatteryChargeLevel, updateCardUsedCapacity } = eqStore();

  const mission = missions.find(m => m.id === id);
  const record = shootingRecords.find(r => r.missionId === id);

  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [selectedBattery, setSelectedBattery] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [newBattery, setNewBattery] = useState('');
  const [operator, setOperator] = useState(mission?.leaderId || '');
  const [notes, setNotes] = useState('');

  if (!mission) {
    return (
      <div className="card p-12 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">任务不存在</h3>
        <button onClick={() => navigate('/missions')} className="btn-primary">
          返回任务列表
        </button>
      </div>
    );
  }

  const getEquipmentInfo = (equipmentId: string) => {
    return equipment.find(e => e.id === equipmentId);
  };

  const handleBatteryChange = () => {
    if (!selectedEquipment || !selectedBattery || !newBattery || !operator) {
      alert('请填写完整信息');
      return;
    }

    const eq = getEquipmentInfo(selectedEquipment);
    if (!eq) return;

    const battery = eq.batteries?.find(b => b.id === selectedBattery);
    const newBatteryObj = eq.batteries?.find(b => b.id === newBattery);

    const changeData: BatteryChange = {
      id: `bc_${Date.now()}`,
      equipmentId: selectedEquipment,
      oldBatteryId: selectedBattery,
      newBatteryId: newBattery,
      oldBatteryLevel: battery?.chargeLevel || 0,
      newBatteryLevel: newBatteryObj?.chargeLevel || 100,
      timestamp: new Date().toISOString(),
      operatorId: operator,
      location: mission.location,
      notes,
    };

    createBatteryChange(mission.id, changeData);
    updateBatteryChargeLevel(selectedEquipment, selectedBattery, battery?.chargeLevel || 0);

    setShowBatteryModal(false);
    setSelectedEquipment('');
    setSelectedBattery('');
    setNewBattery('');
    setNotes('');
  };

  const handleCardFull = () => {
    if (!selectedEquipment || !selectedCard || !operator) {
      alert('请填写完整信息');
      return;
    }

    const eq = getEquipmentInfo(selectedEquipment);
    if (!eq) return;

    const card = eq.memoryCards?.find(c => c.id === selectedCard);

    const cardFullData: CardFull = {
      id: `cf_${Date.now()}`,
      equipmentId: selectedEquipment,
      cardId: selectedCard,
      timestamp: new Date().toISOString(),
      operatorId: operator,
      photosCount: Math.floor(Math.random() * 500) + 500,
      videoMinutes: Math.floor(Math.random() * 60),
      notes,
    };

    createCardFull(mission.id, cardFullData);
    updateCardUsedCapacity(selectedEquipment, selectedCard, card?.totalCapacity || 64);

    setShowCardModal(false);
    setSelectedEquipment('');
    setSelectedCard('');
    setNotes('');
  };

  const batteryChanges = record?.batteryChanges || [];
  const cardFulls = record?.cardFulls || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/missions/${mission.id}`)}
          className="p-2 rounded-lg bg-background-lighter hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-neutral-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">拍摄记录</h1>
          <p className="text-neutral-400">{mission.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBatteryModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            记录换电池
          </button>
          <button
            onClick={() => setShowCardModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <HardDrive size={16} />
            记录卡满
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Battery size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{batteryChanges.length}</p>
            <p className="text-sm text-neutral-500">电池更换次数</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
            <HardDrive size={24} className="text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{cardFulls.length}</p>
            <p className="text-sm text-neutral-500">存储卡满次数</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
            <Camera size={24} className="text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{mission.equipmentList.length}</p>
            <p className="text-sm text-neutral-500">使用器材数</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">器材实时状态</h2>
        <div className="space-y-4">
          {mission.equipmentList.map((me, idx) => {
            const eq = getEquipmentInfo(me.equipmentId);
            if (!eq) return null;
            const batteryChangesForEq = batteryChanges.filter(b => b.equipmentId === eq.id);
            const cardFullsForEq = cardFulls.filter(c => c.equipmentId === eq.id);

            return (
              <div
                key={me.id}
                className="p-4 bg-background-lighter rounded-lg animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <EquipmentTypeIcon type={eq.type} size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{eq.brand} {eq.model}</h4>
                      <span className="text-xs px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">
                        {equipmentTypeLabels[eq.type]}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">
                      使用人: {getUserName(me.assignedTo, users) || '未分配'}
                      {batteryChangesForEq.length > 0 && ` · 换电池 ${batteryChangesForEq.length} 次`}
                      {cardFullsForEq.length > 0 && ` · 卡满 ${cardFullsForEq.length} 次`}
                    </p>
                  </div>
                </div>

                {eq.batteries && eq.batteries.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-neutral-500 mb-2">电池状态</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {eq.batteries.map(battery => (
                        <BatteryStatus
                          key={battery.id}
                          battery={battery}
                          showChargeButton={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {eq.memoryCards && eq.memoryCards.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">存储卡状态</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {eq.memoryCards.map(card => (
                        <CardCapacity key={card.id} card={card} showFormatButton={false} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">电池更换记录</h2>
        {batteryChanges.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            暂无电池更换记录
          </div>
        ) : (
          <div className="space-y-3">
            {batteryChanges.map((change, idx) => {
              const eq = getEquipmentInfo(change.equipmentId);
              const eqUser = users.find(u => u.id === change.operatorId);
              return (
                <div
                  key={change.id}
                  className="flex items-center gap-4 p-4 bg-background-lighter rounded-lg animate-slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <RefreshCcw size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{eq?.brand} {eq?.model}</span>
                      <span className="text-xs text-neutral-500">
                        电量 {change.oldBatteryLevel}% → {change.newBatteryLevel}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {eqUser?.name || '未知'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDateTime(change.timestamp)}
                      </span>
                    </div>
                    {change.notes && (
                      <p className="text-xs text-neutral-400 mt-1">{change.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">存储卡满记录</h2>
        {cardFulls.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            暂无存储卡满记录
          </div>
        ) : (
          <div className="space-y-3">
            {cardFulls.map((full, idx) => {
              const eq = getEquipmentInfo(full.equipmentId);
              const eqUser = users.find(u => u.id === full.operatorId);
              const card = eq?.memoryCards?.find(c => c.id === full.cardId);
              return (
                <div
                  key={full.id}
                  className="flex items-center gap-4 p-4 bg-background-lighter rounded-lg animate-slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <HardDrive size={20} className="text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{eq?.brand} {eq?.model}</span>
                      <span className="text-xs px-2 py-0.5 bg-warning/20 text-warning rounded">
                        卡满
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400">
                      存储卡 {card?.brand} {card?.model} ({card?.capacity})
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-500 mt-1">
                      <span>照片 {full.photosCount} 张</span>
                      {full.videoMinutes > 0 && <span>视频 {full.videoMinutes} 分钟</span>}
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {eqUser?.name || '未知'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDateTime(full.timestamp)}
                      </span>
                    </div>
                    {full.notes && (
                      <p className="text-xs text-neutral-400 mt-1">{full.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => {
            updateMissionStatus(mission.id, 'shooting');
            navigate(`/missions/${mission.id}/return`);
          }}
          className="btn-success px-8"
        >
          <Check size={16} className="mr-2" />
          拍摄完成，进入归还检查
        </button>
      </div>

      {showBatteryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md animate-bounce-in">
            <h3 className="text-xl font-semibold text-white mb-4">记录电池更换</h3>

            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">器材 *</label>
                <select
                  value={selectedEquipment}
                  onChange={(e) => {
                    setSelectedEquipment(e.target.value);
                    setSelectedBattery('');
                    setNewBattery('');
                  }}
                  className="input"
                >
                  <option value="">请选择器材</option>
                  {mission.equipmentList.map(me => {
                    const eq = getEquipmentInfo(me.equipmentId);
                    if (!eq || !eq.batteries || eq.batteries.length < 2) return null;
                    return (
                      <option key={me.equipmentId} value={me.equipmentId}>
                        {eq.brand} {eq.model}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedEquipment && (() => {
                const eq = getEquipmentInfo(selectedEquipment);
                if (!eq) return null;
                return (
                  <>
                    <div className="form-group">
                      <label className="form-label">换下的电池 *</label>
                      <select
                        value={selectedBattery}
                        onChange={(e) => setSelectedBattery(e.target.value)}
                        className="input"
                      >
                        <option value="">请选择</option>
                        {eq.batteries?.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.model} ({b.chargeLevel}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">换上的电池 *</label>
                      <select
                        value={newBattery}
                        onChange={(e) => setNewBattery(e.target.value)}
                        className="input"
                      >
                        <option value="">请选择</option>
                        {eq.batteries?.filter(b => b.id !== selectedBattery).map(b => (
                          <option key={b.id} value={b.id}>
                            {b.model} ({b.chargeLevel}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                );
              })()}

              <div className="form-group">
                <label className="form-label">操作人 *</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="input"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">备注</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                  placeholder="记录更换原因等..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBatteryModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleBatteryChange} className="btn-primary">
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}

      {showCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md animate-bounce-in">
            <h3 className="text-xl font-semibold text-white mb-4">记录存储卡满</h3>

            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">器材 *</label>
                <select
                  value={selectedEquipment}
                  onChange={(e) => {
                    setSelectedEquipment(e.target.value);
                    setSelectedCard('');
                  }}
                  className="input"
                >
                  <option value="">请选择器材</option>
                  {mission.equipmentList.map(me => {
                    const eq = getEquipmentInfo(me.equipmentId);
                    if (!eq || !eq.memoryCards || eq.memoryCards.length === 0) return null;
                    return (
                      <option key={me.equipmentId} value={me.equipmentId}>
                        {eq.brand} {eq.model}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedEquipment && (() => {
                const eq = getEquipmentInfo(selectedEquipment);
                if (!eq) return null;
                return (
                  <div className="form-group">
                    <label className="form-label">存储卡 *</label>
                    <select
                      value={selectedCard}
                      onChange={(e) => setSelectedCard(e.target.value)}
                      className="input"
                    >
                      <option value="">请选择</option>
                      {eq.memoryCards?.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.brand} {c.model} ({c.capacity}) - {c.usedCapacity/c.totalCapacity*100|0}%
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div className="form-group">
                <label className="form-label">操作人 *</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="input"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">备注</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                  placeholder="记录卡满时的情况..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCardModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleCardFull} className="btn-primary">
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
