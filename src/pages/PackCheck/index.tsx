import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Battery, HardDrive, Cpu, Plug, Cable, AlertTriangle } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useRecordStore } from '../../store/recordStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { BatteryStatus } from '../../components/ui/BatteryStatus';
import { CardCapacity } from '../../components/ui/CardCapacity';
import { equipmentTypeLabels, getUserName, formatDateTime } from '../../utils/helpers';
import { EquipmentTypeIcon } from '../../components/ui/EquipmentTypeIcon';
import type { PackCheck as PackCheckType } from '../../types';

const checkItems = [
  { key: 'charger', label: '充电器', icon: Plug },
  { key: 'spareCable', label: '备用线', icon: Cable },
  { key: 'firmware', label: '固件版本', icon: Cpu },
];

export function PackCheck() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { missions, updateMissionStatus } = useMissionStore();
  const { equipment, users, updateBattery, updateMemoryCard, updateBatteryChargeLevel, formatMemoryCard } = useEquipmentStore();
  const { packChecks, createPackCheck } = useRecordStore();

  const mission = missions.find(m => m.id === id);
  const existingCheck = packChecks.find(p => p.missionId === id);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    if (existingCheck) {
      return {
        charger: existingCheck.chargerReady,
        spareCable: existingCheck.spareCableReady,
        firmware: existingCheck.firmwareChecked,
      };
    }
    return { charger: false, spareCable: false, firmware: false };
  });

  const [notes, setNotes] = useState(existingCheck?.notes || '');

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

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getEquipmentInfo = (equipmentId: string) => {
    return equipment.find(e => e.id === equipmentId);
  };

  const allBatteriesCharged = mission.equipmentList.every(me => {
    const eq = getEquipmentInfo(me.equipmentId);
    if (!eq?.batteries || eq.batteries.length === 0) return true;
    return eq.batteries.every(b => b.chargeLevel >= 100);
  });

  const allCardsReady = mission.equipmentList.every(me => {
    const eq = getEquipmentInfo(me.equipmentId);
    if (!eq?.memoryCards || eq.memoryCards.length === 0) return true;
    return eq.memoryCards.every(c => c.usedCapacity < c.totalCapacity * 0.9);
  });

  const allChecksComplete = Object.values(checkedItems).every(v => v);
  const canComplete = allBatteriesCharged && allCardsReady && allChecksComplete;

  const handleComplete = () => {
    const checkData: Omit<PackCheckType, 'id' | 'createdAt'> = {
      missionId: mission.id,
      checkedBy: mission.leaderId,
      checkedAt: new Date().toISOString(),
      batteryChecked: allBatteriesCharged,
      cardCapacityChecked: allCardsReady,
      chargerReady: checkedItems.charger,
      spareCableReady: checkedItems.spareCable,
      firmwareChecked: checkedItems.firmware,
      notes,
      issues: [],
    };

    createPackCheck(checkData);
    updateMissionStatus(mission.id, 'packing');
    alert('打包确认完成！');
    navigate(`/missions/${mission.id}`);
  };

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
          <h1 className="text-2xl font-bold text-white">打包前确认</h1>
          <p className="text-neutral-400">{mission.name}</p>
        </div>
      </div>

      {!allBatteriesCharged && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger">电池未充满</p>
            <p className="text-sm text-danger/80">部分电池电量未达到 100%，请先充电后再确认。</p>
          </div>
        </div>
      )}

      {!allCardsReady && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">存储卡容量不足</p>
            <p className="text-sm text-warning/80">部分存储卡已使用超过 90%，请先格式化或更换。</p>
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Battery size={20} className="text-primary" />
          电池电量检查
          {allBatteriesCharged && (
            <span className="text-xs px-2 py-0.5 bg-success/20 text-success rounded-full ml-auto">
              全部充满
            </span>
          )}
        </h2>

        <div className="space-y-4">
          {mission.equipmentList.map((me, idx) => {
            const eq = getEquipmentInfo(me.equipmentId);
            if (!eq || !eq.batteries || eq.batteries.length === 0) return null;

            return (
              <div
                key={me.id}
                className="p-4 bg-background-lighter rounded-lg animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <EquipmentTypeIcon type={eq.type} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{eq.brand} {eq.model}</h4>
                    <p className="text-xs text-neutral-500">
                      {equipmentTypeLabels[eq.type]} · 使用人: {getUserName(me.assignedTo, users) || '未分配'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {eq.batteries.map((battery) => (
                    <BatteryStatus
                      key={battery.id}
                      battery={battery}
                      onMarkCharged={() => updateBatteryChargeLevel(eq.id, battery.id, 100)}
                      onUpdate={(updates) => updateBattery(eq.id, battery.id, updates)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <HardDrive size={20} className="text-primary" />
          存储卡容量检查
          {allCardsReady && (
            <span className="text-xs px-2 py-0.5 bg-success/20 text-success rounded-full ml-auto">
              全部就绪
            </span>
          )}
        </h2>

        <div className="space-y-4">
          {mission.equipmentList.map((me, idx) => {
            const eq = getEquipmentInfo(me.equipmentId);
            if (!eq || !eq.memoryCards || eq.memoryCards.length === 0) return null;

            return (
              <div
                key={me.id}
                className="p-4 bg-background-lighter rounded-lg animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <EquipmentTypeIcon type={eq.type} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{eq.brand} {eq.model}</h4>
                    <p className="text-xs text-neutral-500">
                      {equipmentTypeLabels[eq.type]} · 使用人: {getUserName(me.assignedTo, users) || '未分配'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eq.memoryCards.map((card) => (
                    <CardCapacity
                      key={card.id}
                      card={card}
                      onUpdate={(updates) => updateMemoryCard(eq.id, card.id, updates)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">配件检查</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {checkItems.map((item) => {
            const Icon = item.icon;
            const isChecked = checkedItems[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  isChecked
                    ? 'border-success bg-success/10'
                    : 'border-neutral-700 bg-background-lighter hover:border-neutral-600'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isChecked ? 'bg-success' : 'bg-neutral-800'
                }`}>
                  {isChecked ? (
                    <Check size={24} className="text-white" />
                  ) : (
                    <Icon size={24} className={isChecked ? 'text-white' : 'text-primary'} />
                  )}
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isChecked ? 'text-success' : 'text-white'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {isChecked ? '已确认' : '待确认'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">备注</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input min-h-[100px]"
          placeholder="记录打包时的问题或注意事项..."
        />
      </div>

      {existingCheck && (
        <div className="card p-6 border-success/30">
          <h3 className="text-sm font-medium text-neutral-400 mb-2">上次检查</h3>
          <p className="text-sm text-neutral-300">
            {formatDateTime(existingCheck.checkedAt)} · {getUserName(existingCheck.checkedBy, users)}
          </p>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate(`/missions/${mission.id}`)}
          className="btn-secondary"
        >
          返回
        </button>
        <button
          onClick={handleComplete}
          disabled={!canComplete}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={16} className="mr-2" />
          确认打包完成
        </button>
      </div>
    </div>
  );
}
