import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Package,
  Sun,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  PackageOpen,
  X,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import type { DryStatus } from '@/types';

export default function Recovery() {
  const {
    tasks,
    points,
    layingRecords,
    recoveryRecords,
    currentTaskId,
    setCurrentTask,
    addRecoveryRecord,
    updateDryStatus,
    updateTaskStatus,
  } = useAppStore();

  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [recoverer, setRecoverer] = useState('');

  const currentTask = tasks.find((t) => t.id === currentTaskId);
  const currentRecords = layingRecords.filter((r) => r.taskId === currentTaskId);
  const currentRecovery = recoveryRecords.filter((r) => r.taskId === currentTaskId);

  const getPointById = (id: string) => points.find((p) => p.id === id);

  const laidRecords = currentRecords.filter(
    (r) => r.status === 'laid' || r.status === 'checked'
  );

  const recoveredPointIds = currentRecovery.map((r) => r.pointId);
  const pendingRecovery = laidRecords.filter(
    (r) => !recoveredPointIds.includes(r.pointId)
  );

  const getDryStatusLabel = (status: DryStatus) => {
    const labels = {
      pending: '待晾干',
      drying: '晾干中',
      dry: '已晾干',
      stored: '已入库',
    };
    return labels[status];
  };

  const getDryStatusVariant = (status: DryStatus) => {
    const variants = {
      pending: 'pending' as const,
      drying: 'processing' as const,
      dry: 'info' as const,
      stored: 'success' as const,
    };
    return variants[status];
  };

  const handleRecover = (pointId: string) => {
    setSelectedPointId(pointId);
    const point = getPointById(pointId);
    setRecoverer(point?.cleaner || '');
    setShowRecoverModal(true);
  };

  const handleConfirmRecover = () => {
    if (selectedPointId && currentTaskId && recoverer) {
      addRecoveryRecord({
        taskId: currentTaskId,
        pointId: selectedPointId,
        recoverTime: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        recoverer,
        dryStatus: 'drying',
        status: 'recovered',
      });
      setShowRecoverModal(false);
      setSelectedPointId(null);
    }
  };

  const handleMarkAllRecovered = () => {
    if (confirm('确认所有垫子都已回收？')) {
      pendingRecovery.forEach((record) => {
        const point = getPointById(record.pointId);
        addRecoveryRecord({
          taskId: currentTaskId!,
          pointId: record.pointId,
          recoverTime: new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          recoverer: point?.cleaner || '保洁员',
          dryStatus: 'drying',
          status: 'recovered',
        });
      });
    }
  };

  const handleFinishTask = () => {
    if (confirm('确认本次雨天任务全部完成，垫子已全部入库？')) {
      currentRecovery.forEach((r) => {
        updateDryStatus(r.id, 'stored');
      });
      updateTaskStatus(currentTaskId!, 'recovered');
    }
  };

  const buildings = [...new Set(points.map((p) => p.building))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">回收管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            雨停后管理防滑垫回收和晾干状态
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentTask?.status === 'in_progress' && pendingRecovery.length > 0 && (
            <button
              onClick={handleMarkAllRecovered}
              className="px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              一键全部回收
            </button>
          )}
          {currentRecovery.length > 0 && currentTask?.status !== 'recovered' && (
            <button
              onClick={handleFinishTask}
              className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              完成全部入库
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">待回收</p>
              <p className="text-xl font-bold text-slate-800">
                {pendingRecovery.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Sun className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">晾干中</p>
              <p className="text-xl font-bold text-blue-600">
                {currentRecovery.filter((r) => r.dryStatus === 'drying').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600">已晾干</p>
              <p className="text-xl font-bold text-amber-600">
                {currentRecovery.filter((r) => r.dryStatus === 'dry').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <PackageOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">已入库</p>
              <p className="text-xl font-bold text-green-600">
                {currentRecovery.filter((r) => r.dryStatus === 'stored').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-amber-50/50">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-slate-800">待回收垫子</h3>
              <StatusBadge variant="warning">{pendingRecovery.length}个</StatusBadge>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {pendingRecovery.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">全部已回收</p>
              </div>
            ) : (
              pendingRecovery.map((record) => {
                const point = getPointById(record.pointId);
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">
                        {point?.name}
                      </p>
                      <p className="text-xs text-slate-400">{point?.building}</p>
                    </div>
                    <button
                      onClick={() => handleRecover(record.pointId)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      回收
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-green-50/50">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-slate-800">回收中 / 已入库</h3>
              <StatusBadge variant="success">{currentRecovery.length}个</StatusBadge>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {currentRecovery.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无回收记录</p>
              </div>
            ) : (
              currentRecovery.map((record) => {
                const point = getPointById(record.pointId);
                return (
                  <div
                    key={record.id}
                    className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">
                          {point?.name}
                        </p>
                        <p className="text-xs text-slate-400">{point?.building}</p>
                      </div>
                      <StatusBadge variant={getDryStatusVariant(record.dryStatus)}>
                        {getDryStatusLabel(record.dryStatus)}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pl-13">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        回收：{record.recoverTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {record.recoverer}
                      </span>
                    </div>
                    {record.dryStatus !== 'stored' && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                        {record.dryStatus === 'drying' && (
                          <button
                            onClick={() => updateDryStatus(record.id, 'dry')}
                            className="flex-1 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                          >
                            标记已晾干
                          </button>
                        )}
                        {record.dryStatus === 'dry' && (
                          <button
                            onClick={() => updateDryStatus(record.id, 'stored')}
                            className="flex-1 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                          >
                            标记已入库
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showRecoverModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">确认回收</h3>
              <button
                onClick={() => {
                  setShowRecoverModal(false);
                  setSelectedPointId(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700">
                  {getPointById(selectedPointId || '')?.name}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {getPointById(selectedPointId || '')?.building}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  回收人
                </label>
                <input
                  type="text"
                  value={recoverer}
                  onChange={(e) => setRecoverer(e.target.value)}
                  placeholder="请输入回收人姓名"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-medium mb-2">回收提示</p>
                <ul className="text-xs text-blue-500 space-y-1">
                  <li>• 将垫子卷起，避免水渍滴落</li>
                  <li>• 放置到指定晾干区域</li>
                  <li>• 记录回收时间和人员</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowRecoverModal(false);
                  setSelectedPointId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmRecover}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                确认回收
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
