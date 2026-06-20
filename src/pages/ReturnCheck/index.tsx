import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, X, Package, AlertTriangle, CheckCircle,
  XCircle, Clock, User, Camera
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { useRecordStore } from '../../store/recordStore';
import { useEquipmentStore as eqStore } from '../../store/equipmentStore';
import { equipmentTypeLabels, getUserName, formatDateTime } from '../../utils/helpers';
import { EquipmentTypeIcon } from '../../components/ui/EquipmentTypeIcon';
import { BatteryStatus } from '../../components/ui/BatteryStatus';
import { CardCapacity } from '../../components/ui/CardCapacity';
import type { ReturnCheck as ReturnCheckType, EquipmentCheck } from '../../types';

export function ReturnCheck() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { missions, updateMissionStatus } = useMissionStore();
  const { equipment, users, updateEquipment } = useEquipmentStore();
  const { returnChecks, createReturnCheck } = useRecordStore();
  const { updateBatteryChargeLevel } = eqStore();

  const mission = missions.find(m => m.id === id);
  const existingCheck = returnChecks.find(r => r.missionId === id);

  const [checks, setChecks] = useState<Map<string, EquipmentCheck>>(() => {
    const map = new Map<string, EquipmentCheck>();
    if (existingCheck) {
      existingCheck.equipmentChecks.forEach(ec => map.set(ec.equipmentId, ec));
    }
    return map;
  });

  const [notes, setNotes] = useState(existingCheck?.notes || '');
  const [operator, setOperator] = useState(mission?.leaderId || '');

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

  const updateCheck = (equipmentId: string, field: keyof EquipmentCheck, value: any) => {
    setChecks(prev => {
      const next = new Map(prev);
      const current = next.get(equipmentId) || {
        equipmentId,
        returned: false,
        condition: 'good',
        damage: false,
        missing: false,
        issues: [],
        notes: '',
      };
      next.set(equipmentId, { ...current, [field]: value });
      return next;
    });
  };

  const allReturned = mission.equipmentList.every(me => {
    const check = checks.get(me.equipmentId);
    return check?.returned && !check?.damage && !check?.missing;
  });

  const hasIssues = mission.equipmentList.some(me => {
    const check = checks.get(me.equipmentId);
    return check?.damage || check?.missing;
  });

  const handleComplete = () => {
    const equipmentChecks: EquipmentCheck[] = mission.equipmentList.map(me => {
      const check = checks.get(me.equipmentId) || {
        equipmentId: me.equipmentId,
        returned: false,
        condition: 'good',
        damage: false,
        missing: false,
        issues: [],
        notes: '',
      };

      if (check.damage) {
        updateEquipment(me.equipmentId, { status: 'damaged' });
      }
      if (check.missing) {
        updateEquipment(me.equipmentId, { status: 'lost' });
      }

      return check;
    });

    const checkData: Omit<ReturnCheckType, 'id' | 'createdAt'> = {
      missionId: mission.id,
      checkedBy: operator,
      checkedAt: new Date().toISOString(),
      equipmentChecks,
      notes,
      hasDamage: equipmentChecks.some(c => c.damage),
      hasMissing: equipmentChecks.some(c => c.missing),
    };

    createReturnCheck(checkData);
    updateMissionStatus(mission.id, 'returning');

    if (hasIssues) {
      alert('归还检查完成！存在损坏或丢失的器材，请及时处理。');
    } else {
      alert('归还检查完成！所有器材完好归还。');
    }

    navigate(`/missions/${mission.id}`);
  };

  const conditionOptions = [
    { value: 'good', label: '完好', color: 'text-success' },
    { value: 'minor', label: '轻微磨损', color: 'text-warning' },
    { value: 'damaged', label: '损坏', color: 'text-danger' },
  ];

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
          <h1 className="text-2xl font-bold text-white">归还检查</h1>
          <p className="text-neutral-400">{mission.name}</p>
        </div>
      </div>

      {hasIssues && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger">存在问题</p>
            <p className="text-sm text-danger/80">部分器材标记为损坏或丢失，请在备注中详细说明。</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{mission.equipmentList.length}</p>
            <p className="text-sm text-neutral-500">应归还器材</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
            <CheckCircle size={24} className="text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {Array.from(checks.values()).filter(c => c.returned).length}
            </p>
            <p className="text-sm text-neutral-500">已归还</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-danger/10 flex items-center justify-center">
            <XCircle size={24} className="text-danger" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {Array.from(checks.values()).filter(c => c.damage || c.missing).length}
            </p>
            <p className="text-sm text-neutral-500">有问题</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
            <Camera size={24} className="text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {mission.equipmentList.length - Array.from(checks.values()).filter(c => c.returned).length}
            </p>
            <p className="text-sm text-neutral-500">待归还</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">器材归还检查</h2>
        <div className="space-y-4">
          {mission.equipmentList.map((me, idx) => {
            const eq = getEquipmentInfo(me.equipmentId);
            if (!eq) return null;

            const check = checks.get(me.equipmentId) || {
              equipmentId: eq.id,
              returned: false,
              condition: 'good',
              damage: false,
              missing: false,
              issues: [],
              notes: '',
            };

            return (
              <div
                key={me.id}
                className={`p-4 rounded-lg border-2 transition-all animate-slide-up ${
                  check.returned
                    ? check.damage || check.missing
                      ? 'border-danger/50 bg-danger/5'
                      : 'border-success/50 bg-success/5'
                    : 'border-neutral-700 bg-background-lighter'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={check.returned}
                        onChange={(e) => updateCheck(eq.id, 'returned', e.target.checked)}
                        className="w-5 h-5 rounded border-neutral-600 text-primary focus:ring-primary"
                      />
                    </label>
                    <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
                      <EquipmentTypeIcon type={eq.type} size={24} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{eq.brand} {eq.model}</h4>
                        <span className="text-xs px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">
                          {equipmentTypeLabels[eq.type]}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        使用人: {getUserName(me.assignedTo, users) || '未分配'}
                      </p>
                    </div>
                  </div>

                  {check.returned && (
                    <div className="flex flex-wrap items-center gap-4 lg:gap-6 ml-9 lg:ml-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-400">状态:</span>
                        {conditionOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              updateCheck(eq.id, 'condition', opt.value);
                              updateCheck(eq.id, 'damage', opt.value === 'damaged');
                            }}
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                              check.condition === opt.value
                                ? `${opt.color} bg-current/10`
                                : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={check.missing}
                          onChange={(e) => updateCheck(eq.id, 'missing', e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-600 text-danger focus:ring-danger"
                        />
                        <span className="text-sm text-neutral-400">丢失</span>
                      </label>

                      <input
                        type="text"
                        value={check.notes}
                        onChange={(e) => updateCheck(eq.id, 'notes', e.target.value)}
                        placeholder="备注..."
                        className="input text-sm py-1 w-40"
                      />
                    </div>
                  )}
                </div>

                {check.returned && (eq.batteries?.length || eq.memoryCards?.length) && (
                  <div className="mt-4 pt-4 border-t border-neutral-700 ml-9 lg:ml-16">
                    {eq.batteries && eq.batteries.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-neutral-500 mb-2">电池归还状态</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {eq.batteries.map(battery => (
                            <BatteryStatus
                              key={battery.id}
                              battery={battery}
                              onMarkCharged={() => updateBatteryChargeLevel(eq.id, battery.id, 100)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {eq.memoryCards && eq.memoryCards.length > 0 && (
                      <div>
                        <p className="text-xs text-neutral-500 mb-2">存储卡归还状态</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {eq.memoryCards.map(card => (
                            <CardCapacity key={card.id} card={card} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">检查人 *</label>
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
        </div>
        <div className="form-group mt-4">
          <label className="form-label">总备注</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input min-h-[100px]"
            placeholder="记录整体归还情况、损坏详情、丢失说明等..."
          />
        </div>
      </div>

      {existingCheck && (
        <div className="card p-6 border-success/30">
          <h3 className="text-sm font-medium text-neutral-400 mb-2">上次检查</h3>
          <p className="text-sm text-neutral-300">
            {formatDateTime(existingCheck.checkedAt)} · {getUserName(existingCheck.checkedBy, users)}
          </p>
          {existingCheck.notes && (
            <p className="text-sm text-neutral-400 mt-2">{existingCheck.notes}</p>
          )}
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
          disabled={!allReturned || !operator}
          className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={16} className="mr-2" />
          确认归还完成
        </button>
      </div>
    </div>
  );
}
