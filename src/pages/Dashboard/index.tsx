import { useNavigate } from 'react-router-dom';
import { Battery, HardDrive, AlertTriangle, RotateCcw, Briefcase, Plus, Calendar, MapPin, User } from 'lucide-react';
import { StatusCard } from '../../components/ui/StatusCard';
import { EquipmentTypeIcon } from '../../components/ui/EquipmentTypeIcon';
import { useEquipmentStore } from '../../store/equipmentStore';
import { useMissionStore } from '../../store/missionStore';
import { useRecordStore } from '../../store/recordStore';
import {
  countUnchargedBatteries,
  countMissingCards,
  countOverCapacityRisk,
  countPendingReturnChecks,
  getStatusColor,
  formatDate,
  getUserName,
  missionStatusLabels,
  equipmentTypeLabels,
} from '../../utils/helpers';
import { equipmentStatusLabels } from '../../types';

export function Dashboard() {
  const navigate = useNavigate();
  const { equipment, kits, users } = useEquipmentStore();
  const { getUpcomingMissions } = useMissionStore();
  const { getPendingReturnChecks } = useRecordStore();

  const unchargedBatteries = countUnchargedBatteries(equipment);
  const missingCards = countMissingCards(equipment);
  const overCapacityRisk = countOverCapacityRisk(equipment);
  const pendingReturns = countPendingReturnChecks(getPendingReturnChecks());
  const upcomingMissions = getUpcomingMissions();

  const getUnchargedBatteryDetails = () => {
    const details: string[] = [];
    equipment.forEach(eq => {
      eq.batteries.forEach(bat => {
        if (bat.chargeLevel < 100) {
          details.push(`${eq.brand} ${eq.model} - ${bat.model} (${bat.chargeLevel}%)`);
        }
      });
    });
    return details.slice(0, 3);
  };

  const getMissingCardDetails = () => {
    return equipment
      .filter(eq => ['camera', 'memory_card'].includes(eq.type) && eq.memoryCards.length === 0)
      .map(eq => `${eq.brand} ${eq.model}`)
      .slice(0, 3);
  };

  const getOverCapacityDetails = () => {
    const details: string[] = [];
    equipment.forEach(eq => {
      eq.memoryCards.forEach(card => {
        const usagePercent = (card.usedCapacity / card.totalCapacity) * 100;
        if (usagePercent >= 80) {
          details.push(`${eq.brand} ${eq.model} - ${card.brand} ${card.capacity} (${Math.round(usagePercent)}%)`);
        }
      });
    });
    return details.slice(0, 3);
  };

  const getPendingReturnDetails = () => {
    const details: string[] = [];
    getPendingReturnChecks().forEach(rc => {
      rc.equipmentChecks.forEach(ec => {
        if (!ec.returned || ec.damage || ec.missing) {
          const eq = equipment.find(e => e.id === ec.equipmentId);
          if (eq) details.push(`${eq.brand} ${eq.model}`);
        }
      });
    });
    return details.slice(0, 3);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">管理看板</h1>
          <p className="text-neutral-400">一目了然的器材状态和任务概览</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/equipment/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            添加器材
          </button>
          <button
            onClick={() => navigate('/missions/new')}
            className="btn-secondary flex items-center gap-2"
          >
            <Calendar size={18} />
            创建任务
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="未充电电池"
          count={unchargedBatteries}
          icon={<Battery size={24} />}
          color="danger"
          onClick={() => navigate('/equipment')}
        >
          <div className="space-y-1">
            {getUnchargedBatteryDetails().map((detail, idx) => (
              <p key={idx} className="text-xs text-neutral-400 truncate">
                {detail}
              </p>
            ))}
            {unchargedBatteries > 3 && (
              <p className="text-xs text-neutral-500">还有 {unchargedBatteries - 3} 块...</p>
            )}
          </div>
        </StatusCard>

        <StatusCard
          title="缺少存储卡"
          count={missingCards}
          icon={<HardDrive size={24} />}
          color="warning"
          onClick={() => navigate('/equipment')}
        >
          <div className="space-y-1">
            {getMissingCardDetails().map((detail, idx) => (
              <p key={idx} className="text-xs text-neutral-400 truncate">
                {detail}
              </p>
            ))}
            {missingCards > 3 && (
              <p className="text-xs text-neutral-500">还有 {missingCards - 3} 个...</p>
            )}
          </div>
        </StatusCard>

        <StatusCard
          title="超容量风险"
          count={overCapacityRisk}
          icon={<AlertTriangle size={24} />}
          color="warning"
          onClick={() => navigate('/equipment')}
        >
          <div className="space-y-1">
            {getOverCapacityDetails().map((detail, idx) => (
              <p key={idx} className="text-xs text-neutral-400 truncate">
                {detail}
              </p>
            ))}
            {overCapacityRisk > 3 && (
              <p className="text-xs text-neutral-500">还有 {overCapacityRisk - 3} 张...</p>
            )}
          </div>
        </StatusCard>

        <StatusCard
          title="归还待检"
          count={pendingReturns}
          icon={<RotateCcw size={24} />}
          color="primary"
          onClick={() => navigate('/missions')}
        >
          <div className="space-y-1">
            {getPendingReturnDetails().map((detail, idx) => (
              <p key={idx} className="text-xs text-neutral-400 truncate">
                {detail}
              </p>
            ))}
            {pendingReturns > 3 && (
              <p className="text-xs text-neutral-500">还有 {pendingReturns - 3} 件...</p>
            )}
          </div>
        </StatusCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">即将到来的任务</h2>
              <button
                onClick={() => navigate('/missions')}
                className="text-sm text-primary hover:text-primary-hover transition-colors"
              >
                查看全部 →
              </button>
            </div>

            {upcomingMissions.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Calendar size={48} className="mx-auto mb-3 opacity-30" />
                <p>暂无即将到来的任务</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMissions.slice(0, 3).map((mission, idx) => (
                  <div
                    key={mission.id}
                    className="flex items-center gap-4 p-4 bg-background-lighter rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer animate-slide-up"
                    onClick={() => navigate(`/missions/${mission.id}`)}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{mission.name}</h3>
                        <span className={`status-badge ${getStatusColor(mission.status)}`}>
                          {missionStatusLabels[mission.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {mission.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(mission.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {getUserName(mission.leaderId, users)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">器材数量</p>
                      <p className="text-lg font-bold text-white">
                        {mission.equipmentList.length}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">常用套装</h2>
            </div>

            <div className="space-y-3">
              {kits.map((kit, idx) => (
                <div
                  key={kit.id}
                  className="p-4 bg-background-lighter rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer animate-slide-up"
                  onClick={() => navigate('/missions/new')}
                  style={{ animationDelay: `${idx * 100 + 200}ms` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex -space-x-2">
                      {kit.equipmentIds.slice(0, 3).map((eqId, i) => {
                        const eq = equipment.find(e => e.id === eqId);
                        return eq ? (
                          <div
                            key={eqId}
                            className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center border-2 border-background-lighter"
                          >
                            <EquipmentTypeIcon type={eq.type} size={14} className="text-primary" />
                          </div>
                        ) : null;
                      })}
                      {kit.equipmentIds.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center border-2 border-background-lighter">
                          <span className="text-xs text-neutral-400">+{kit.equipmentIds.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-white">{kit.name}</h3>
                  </div>
                  <p className="text-sm text-neutral-400 mb-2">{kit.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {kit.equipmentIds.slice(0, 4).map(eqId => {
                      const eq = equipment.find(e => e.id === eqId);
                      return eq ? (
                        <span
                          key={eqId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-700/50 rounded text-xs text-neutral-300"
                        >
                          <EquipmentTypeIcon type={eq.type} size={10} />
                          {equipmentTypeLabels[eq.type]}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">器材统计</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-background-lighter rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{equipment.length}</p>
                <p className="text-xs text-neutral-400">总器材数</p>
              </div>
              <div className="p-3 bg-background-lighter rounded-lg text-center">
                <p className="text-2xl font-bold text-success">
                  {equipment.filter(e => e.status === 'available').length}
                </p>
                <p className="text-xs text-neutral-400">{equipmentStatusLabels.available}</p>
              </div>
              <div className="p-3 bg-background-lighter rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">
                  {equipment.filter(e => e.status === 'in_use').length}
                </p>
                <p className="text-xs text-neutral-400">{equipmentStatusLabels.in_use}</p>
              </div>
              <div className="p-3 bg-background-lighter rounded-lg text-center">
                <p className="text-2xl font-bold text-danger">
                  {equipment.filter(e => e.status === 'damaged' || e.status === 'lost').length}
                </p>
                <p className="text-xs text-neutral-400">异常</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
