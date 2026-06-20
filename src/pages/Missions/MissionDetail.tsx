import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, User, Package, UserPlus, X } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import {
  missionStatusLabels,
  getStatusColor,
  getUserName,
  formatDate,
  equipmentTypeLabels,
} from '../../utils/helpers';
import { EquipmentTypeIcon } from '../../components/ui/EquipmentTypeIcon';
import { missionStatusLabels as msLabels } from '../../types';
import type { MissionStatus } from '../../types';

export function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { missions, updateMissionStatus, deleteMission, updateEquipmentAssignment, removeEquipmentFromMission } = useMissionStore();
  const { equipment, users } = useEquipmentStore();

  const mission = missions.find(m => m.id === id);

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

  const leader = getUserName(mission.leaderId, users);

  const handleDelete = () => {
    if (window.confirm('确定要删除这个任务吗？此操作不可撤销。')) {
      deleteMission(mission.id);
      navigate('/missions');
    }
  };

  const handleStatusChange = (status: MissionStatus) => {
    updateMissionStatus(mission.id, status);
  };

  const getEquipmentInfo = (equipmentId: string) => {
    return equipment.find(e => e.id === equipmentId);
  };

  const statusFlow: { status: MissionStatus; label: string; color: string }[] = [
    { status: 'draft', label: msLabels.draft, color: 'bg-neutral-700' },
    { status: 'packing', label: msLabels.packing, color: 'bg-warning' },
    { status: 'shooting', label: msLabels.shooting, color: 'bg-primary' },
    { status: 'returning', label: msLabels.returning, color: 'bg-success' },
    { status: 'completed', label: msLabels.completed, color: 'bg-success' },
  ];

  const currentStatusIndex = statusFlow.findIndex(s => s.status === mission.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/missions')}
          className="p-2 rounded-lg bg-background-lighter hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-neutral-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{mission.name}</h1>
            <span className={`status-badge ${getStatusColor(mission.status)}`}>
              {missionStatusLabels[mission.status]}
            </span>
          </div>
          <p className="text-neutral-400">{mission.location}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/missions/${mission.id}/edit`)}
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

      <div className="card p-6">
        <div className="mb-8">
          <h3 className="text-sm font-medium text-neutral-400 mb-3">任务进度</h3>
          <div className="flex items-center justify-between">
            {statusFlow.map((step, idx) => (
              <div key={step.status} className="flex flex-col items-center flex-1">
                <div className="relative w-full flex items-center">
                  {idx > 0 && (
                    <div className={`absolute left-0 right-0 h-1 top-1/2 -translate-y-1/2 -z-10 ${
                      idx <= currentStatusIndex ? 'bg-primary' : 'bg-neutral-700'
                    }`} />
                  )}
                  <button
                    onClick={() => handleStatusChange(step.status)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors mx-auto ${
                      idx <= currentStatusIndex
                        ? `${step.color} text-white`
                        : 'bg-neutral-700 text-neutral-500 hover:bg-neutral-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                </div>
                <p className={`text-xs mt-2 ${
                  idx <= currentStatusIndex ? 'text-white font-medium' : 'text-neutral-500'
                }`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 bg-background-lighter rounded-lg">
            <MapPin size={20} className="text-primary" />
            <div>
              <p className="text-xs text-neutral-500">拍摄地点</p>
              <p className="font-medium text-white">{mission.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background-lighter rounded-lg">
            <Calendar size={20} className="text-primary" />
            <div>
              <p className="text-xs text-neutral-500">拍摄时间</p>
              <p className="font-medium text-white">
                {formatDate(mission.startDate)}
                {mission.startDate !== mission.endDate && ` - ${formatDate(mission.endDate)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background-lighter rounded-lg">
            <User size={20} className="text-primary" />
            <div>
              <p className="text-xs text-neutral-500">负责人</p>
              <p className="font-medium text-white">{leader}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background-lighter rounded-lg">
            <Package size={20} className="text-primary" />
            <div>
              <p className="text-xs text-neutral-500">器材数量</p>
              <p className="font-medium text-white">{mission.equipmentList.length} 件</p>
            </div>
          </div>
        </div>

        {mission.notes && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-neutral-400 mb-2">任务备注</h3>
            <p className="p-4 bg-background-lighter rounded-lg text-neutral-300">{mission.notes}</p>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">器材清单</h2>
          <button
            onClick={() => navigate(`/missions/${mission.id}/edit`)}
            className="text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
          >
            <UserPlus size={14} />
            管理器材
          </button>
        </div>

        {mission.equipmentList.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            暂无器材分配
          </div>
        ) : (
          <div className="space-y-3">
            {mission.equipmentList.map((me, idx) => {
              const eq = getEquipmentInfo(me.equipmentId);
              if (!eq) return null;
              const assignedTo = me.assignedTo ? getUserName(me.assignedTo, users) : '未分配';

              return (
                <div
                  key={me.id}
                  className="flex items-center gap-4 p-4 bg-background-lighter rounded-lg group animate-slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <EquipmentTypeIcon type={eq.type} size={24} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white truncate">
                        {eq.brand} {eq.model}
                      </h4>
                      <span className="text-xs px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">
                        {equipmentTypeLabels[eq.type]}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400">
                      拥有者: {getUserName(eq.ownerId, users)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={me.assignedTo || ''}
                      onChange={(e) => updateEquipmentAssignment(mission.id, me.id, e.target.value)}
                      className="input text-sm py-1 w-32"
                    >
                      <option value="">未分配</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeEquipmentFromMission(mission.id, me.id)}
                      className="p-1.5 text-neutral-500 hover:text-danger hover:bg-danger/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        {mission.status === 'draft' && (
          <button
            onClick={() => navigate(`/missions/${mission.id}/pack`)}
            className="btn-primary px-8"
          >
            开始打包确认
          </button>
        )}
        {mission.status === 'packing' && (
          <button
            onClick={() => navigate(`/missions/${mission.id}/shooting`)}
            className="btn-primary px-8"
          >
            进入拍摄阶段
          </button>
        )}
        {mission.status === 'shooting' && (
          <button
            onClick={() => navigate(`/missions/${mission.id}/return`)}
            className="btn-primary px-8"
          >
            开始归还检查
          </button>
        )}
        {mission.status === 'returning' && (
          <button
            onClick={() => handleStatusChange('completed')}
            className="btn-success px-8"
          >
            标记为已完成
          </button>
        )}
      </div>
    </div>
  );
}
