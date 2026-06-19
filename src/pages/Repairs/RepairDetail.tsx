import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  Building2,
  User,
  Calendar,
  DollarSign,
  FileText,
  Save,
  Play,
  CheckCircle,
  UserPlus,
  RotateCcw,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useRepairStore } from '@/store/useRepairStore';
import { useRoomStore } from '@/store/useRoomStore';
import {
  getRepairStatusLabel,
} from '@/utils/status';
import { mockRepairers } from '@/utils/mockData';
import { cn } from '@/lib/utils';
import type { Repair } from '@/types';

const RepairDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRepair, updateRepair } = useRepairStore();
  const { getRoom, setRoomStatus } = useRoomStore();

  const repair = getRepair(id || '');
  const room = repair ? getRoom(repair.roomId) : null;

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    assignee: repair?.assignee || '',
    scheduledDate: repair?.scheduledDate || '',
    cost: repair?.cost || 0,
    notes: repair?.notes || '',
  });

  if (!repair) {
    return (
      <div className="text-center py-16">
        <Wrench className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <p className="text-dark-400 mb-4">维修任务不存在</p>
        <button
          onClick={() => navigate('/repairs')}
          className="text-warning-400 hover:text-warning-300"
        >
          返回维修列表
        </button>
      </div>
    );
  }

  const progressMap = {
    pending: 10,
    assigned: 30,
    in_progress: 60,
    completed: 100,
    cancelled: 0,
  };

  const progress = progressMap[repair.status];

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      inspection: '巡检发现',
      complaint: '客人投诉',
      routine: '定期维护',
    };
    return labels[type] || type;
  };

  const handleStatusChange = (newStatus: Repair['status']) => {
    updateRepair(repair.id, { status: newStatus });

    if (newStatus === 'assigned' && !repair.assignee && formData.assignee) {
      updateRepair(repair.id, { assignee: formData.assignee });
    }

    if (newStatus === 'completed') {
      updateRepair(repair.id, {
        completedDate: new Date().toISOString().split('T')[0],
      });
      if (room) {
        setRoomStatus(room.id, 'active');
      }
    }

    if (newStatus === 'in_progress' && room) {
      setRoomStatus(room.id, 'maintenance');
    }
  };

  const handleSave = () => {
    updateRepair(repair.id, formData);
    setEditMode(false);
  };

  const statusActions = [
    {
      status: 'assigned' as const,
      label: '派单',
      icon: UserPlus,
      show: repair.status === 'pending',
      variant: 'info' as const,
    },
    {
      status: 'in_progress' as const,
      label: '开始维修',
      icon: Play,
      show: repair.status === 'assigned',
      variant: 'warning' as const,
    },
    {
      status: 'completed' as const,
      label: '完成维修',
      icon: CheckCircle,
      show: repair.status === 'in_progress',
      variant: 'success' as const,
    },
    {
      status: 'pending' as const,
      label: '重新派单',
      icon: RotateCcw,
      show: repair.status === 'cancelled' || repair.status === 'completed',
      variant: 'muted' as const,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/repairs')}
          className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:bg-dark-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">维修详情</h1>
          <p className="text-dark-400">{repair.id}</p>
        </div>
        <StatusBadge
          label={getRepairStatusLabel(repair.status)}
          variant={
            repair.status === 'completed'
              ? 'success'
              : repair.status === 'in_progress'
              ? 'warning'
              : repair.status === 'cancelled'
              ? 'muted'
              : 'info'
          }
        />
      </div>

      <div className="space-y-6">
        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-500/15 rounded-2xl flex items-center justify-center">
                <Wrench className="w-7 h-7 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{repair.title}</h2>
                <p className="text-dark-400 text-sm">
                  来源: {getSourceTypeLabel(repair.sourceType)}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-dark-400">维修进度</span>
              <span className="text-white font-medium">{progress}%</span>
            </div>
            <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  repair.status === 'completed'
                    ? 'bg-gradient-to-r from-success-500 to-success-400'
                    : 'bg-gradient-to-r from-primary-500 to-primary-400'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-400">房间</span>
              </div>
              {room && (
                <Link
                  to={`/rooms/${room.id}`}
                  className="text-white font-medium hover:text-warning-400 transition-colors"
                >
                  {room.roomNumber} 房 - {room.heaterModel}
                </Link>
              )}
            </div>
            <div className="bg-dark-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-400">负责人</span>
              </div>
              <p className="text-white font-medium">
                {repair.assignee || '待指派'}
              </p>
            </div>
            <div className="bg-dark-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-400">计划日期</span>
              </div>
              <p className="text-white font-medium">{repair.scheduledDate}</p>
            </div>
            <div className="bg-dark-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-400">维修费用</span>
              </div>
              <p className="text-white font-medium">
                {repair.cost > 0 ? `¥${repair.cost}` : '待结算'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-dark-400" />
            问题描述
          </h3>
          <p className="text-dark-200 leading-relaxed bg-dark-800/30 p-4 rounded-xl">
            {repair.description}
          </p>
        </div>

        {repair.notes && (
          <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">维修备注</h3>
            <p className="text-dark-200 leading-relaxed bg-dark-800/30 p-4 rounded-xl">
              {repair.notes}
            </p>
          </div>
        )}

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">状态操作</h3>
          <div className="flex flex-wrap gap-3">
            {statusActions.map(
              (action) =>
                action.show && (
                  <button
                    key={action.status}
                    onClick={() => handleStatusChange(action.status)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors',
                      action.variant === 'success' &&
                        'bg-success-500/20 text-success-400 hover:bg-success-500/30',
                      action.variant === 'warning' &&
                        'bg-warning-500/20 text-warning-400 hover:bg-warning-500/30',
                      action.variant === 'info' &&
                        'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30',
                      action.variant === 'muted' &&
                        'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    )}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </button>
                )
            )}
            <button
              onClick={() => {
                handleStatusChange('cancelled');
                if (room) {
                  setRoomStatus(room.id, 'active');
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-danger-500/20 text-danger-400 rounded-xl font-medium hover:bg-danger-500/30 transition-colors"
            >
              取消维修
            </button>
          </div>
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">维修信息</h3>
            <button
              onClick={() => {
                setFormData({
                  assignee: repair.assignee,
                  scheduledDate: repair.scheduledDate,
                  cost: repair.cost,
                  notes: repair.notes,
                });
                setEditMode(!editMode);
              }}
              className="text-sm text-warning-400 hover:text-warning-300"
            >
              {editMode ? '取消' : '编辑'}
            </button>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    负责人
                  </label>
                  <select
                    value={formData.assignee}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, assignee: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
                  >
                    <option value="">请选择</option>
                    {mockRepairers.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    计划日期
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  维修费用 (元)
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cost: Number(e.target.value) }))
                  }
                  min="0"
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  维修备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="记录维修详情、更换配件等..."
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-warning-500 text-white rounded-xl font-medium hover:bg-warning-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                保存修改
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">负责人</span>
                <span className="text-white">{repair.assignee || '待指派'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">计划日期</span>
                <span className="text-white">{repair.scheduledDate}</span>
              </div>
              {repair.completedDate && (
                <div className="flex justify-between">
                  <span className="text-dark-400">完成日期</span>
                  <span className="text-success-400">{repair.completedDate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-dark-400">维修费用</span>
                <span className="text-white">
                  {repair.cost > 0 ? `¥${repair.cost}` : '待结算'}
                </span>
              </div>
              {repair.notes && (
                <div className="pt-3 border-t border-dark-800">
                  <span className="text-dark-400 block mb-2">备注</span>
                  <p className="text-dark-200">{repair.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {room && room.status === 'maintenance' && (
          <div className="bg-warning-500/10 border border-warning-500/30 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-warning-400 font-medium">房间已暂停上架</h4>
                <p className="text-dark-400 text-sm mt-1">
                  维修完成后将自动恢复房间上架状态
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('确定要手动恢复房间上架吗？')) {
                    setRoomStatus(room.id, 'active');
                  }
                }}
                className="px-4 py-2 bg-warning-500/20 text-warning-400 rounded-xl text-sm font-medium hover:bg-warning-500/30 transition-colors"
              >
                手动恢复上架
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairDetail;
