import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  CloudRain,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronDown,
  X,
  Camera,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import type { MatStatus } from '@/types';

export default function Tasks() {
  const {
    tasks,
    points,
    layingRecords,
    issues,
    currentTaskId,
    setCurrentTask,
    updateLayingRecord,
    markLaid,
    addIssue,
  } = useAppStore();

  const [showLayModal, setShowLayModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issuePointId, setIssuePointId] = useState<string | null>(null);
  const [issueType, setIssueType] = useState<'curled' | 'water' | 'dirty'>('curled');
  const [issueDesc, setIssueDesc] = useState('');
  const [layerName, setLayerName] = useState('');

  const currentTask = tasks.find((t) => t.id === currentTaskId);
  const currentRecords = layingRecords.filter((r) => r.taskId === currentTaskId);

  const buildings = [...new Set(points.map((p) => p.building))];

  const getPointById = (id: string) => points.find((p) => p.id === id);

  const getBuildingRecords = (building: string) => {
    const buildingPoints = points.filter(
      (p) => p.building === building && p.status === 'active'
    );
    return currentRecords.filter((r) =>
      buildingPoints.some((p) => p.id === r.pointId)
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待铺设',
      laid: '已铺设',
      checked: '已巡检',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'pending' | 'success' | 'info'> = {
      pending: 'pending',
      laid: 'success',
      checked: 'info',
    };
    return variants[status] || 'default';
  };

  const getMatStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      good: '完好',
      curled: '卷边',
      wet: '积水',
      dirty: '脏污',
    };
    return labels[status] || status;
  };

  const getMatStatusVariant = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      good: 'success',
      curled: 'warning',
      wet: 'danger',
      dirty: 'default',
    };
    return variants[status] || 'default';
  };

  const handleOpenLayModal = (recordId: string) => {
    setSelectedRecord(recordId);
    const record = currentRecords.find((r) => r.id === recordId);
    const point = getPointById(record?.pointId || '');
    setLayerName(point?.cleaner || '');
    setShowLayModal(true);
  };

  const handleConfirmLay = () => {
    if (selectedRecord && layerName) {
      markLaid(selectedRecord, layerName);
      setShowLayModal(false);
      setSelectedRecord(null);
    }
  };

  const handleOpenIssueModal = (pointId: string) => {
    setIssuePointId(pointId);
    setIssueType('curled');
    setIssueDesc('');
    setShowIssueModal(true);
  };

  const handleSubmitIssue = () => {
    if (issuePointId && currentTaskId && issueDesc) {
      addIssue({
        taskId: currentTaskId,
        pointId: issuePointId,
        type: issueType,
        description: issueDesc,
        photo: '',
      });
      setShowIssueModal(false);
      setIssuePointId(null);
    }
  };

  const getIssueCountForPoint = (pointId: string) => {
    return issues.filter(
      (i) => i.pointId === pointId && i.status !== 'resolved' && i.taskId === currentTaskId
    ).length;
  };

  const progressData = buildings.map((building) => {
    const records = getBuildingRecords(building);
    const total = records.length;
    const laid = records.filter((r) => r.status !== 'pending').length;
    return { building, total, laid, rate: total > 0 ? (laid / total) * 100 : 0 };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">雨天任务</h1>
          <p className="text-sm text-slate-500 mt-1">
            跟踪各点位防滑垫铺设进度和状态
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={currentTaskId || ''}
              onChange={(e) => setCurrentTask(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.date} - {task.weather}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {currentTask && (
            <StatusBadge
              variant={
                currentTask.status === 'in_progress'
                  ? 'processing'
                  : currentTask.status === 'recovered'
                  ? 'success'
                  : 'pending'
              }
            >
              {currentTask.status === 'pending'
                ? '待开始'
                : currentTask.status === 'in_progress'
                ? '进行中'
                : currentTask.status === 'completed'
                ? '已完成'
                : '已回收'}
            </StatusBadge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {progressData.map((item) => (
          <div
            key={item.building}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-800">{item.building}</span>
              <span className="text-sm text-slate-500">
                {item.laid}/{item.total}
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${item.rate}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              完成率 {item.rate.toFixed(0)}%
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {buildings.map((building) => {
          const buildingRecords = getBuildingRecords(building);
          return (
            <div
              key={building}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-slate-800">{building}</span>
                  <StatusBadge variant="info">
                    {buildingRecords.filter((r) => r.status !== 'pending').length}/
                    {buildingRecords.length} 已铺设
                  </StatusBadge>
                </div>
              </div>
              <div className="p-4 grid grid-cols-3 gap-4">
                {buildingRecords.map((record) => {
                  const point = getPointById(record.pointId);
                  const issueCount = getIssueCountForPoint(record.pointId);
                  return (
                    <div
                      key={record.id}
                      className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-slate-800 text-sm">
                            {point?.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {point?.location === 'hall' ? '大厅' : '电梯厅'}
                          </p>
                        </div>
                        <StatusBadge variant={getStatusVariant(record.status)}>
                          {getStatusLabel(record.status)}
                        </StatusBadge>
                      </div>

                      {record.status !== 'pending' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>铺设时间：{record.layTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <User className="w-3.5 h-3.5" />
                            <span>铺设人：{record.layer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">垫子状态：</span>
                            <StatusBadge variant={getMatStatusVariant(record.matStatus)}>
                              {getMatStatusLabel(record.matStatus)}
                            </StatusBadge>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {record.hasWarningSign ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                已放警示牌
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                无警示牌
                              </span>
                            )}
                          </div>
                          {issueCount > 0 && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{issueCount} 个待处理问题</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => handleOpenIssueModal(record.pointId)}
                              className="flex-1 py-1.5 text-xs text-amber-600 hover:bg-amber-50 rounded-md font-medium transition-colors"
                            >
                              上报问题
                            </button>
                            <button className="flex-1 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-md font-medium transition-colors">
                              查看详情
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CloudRain className="w-6 h-6 text-slate-400" />
                          </div>
                          <p className="text-xs text-slate-400 mb-3">待铺设</p>
                          <button
                            onClick={() => handleOpenLayModal(record.id)}
                            className="w-full py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
                          >
                            确认铺设
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showLayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">确认铺设</h3>
              <button
                onClick={() => {
                  setShowLayModal(false);
                  setSelectedRecord(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  铺设人
                </label>
                <input
                  type="text"
                  value={layerName}
                  onChange={(e) => setLayerName(e.target.value)}
                  placeholder="请输入铺设人姓名"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-2">提示</p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• 请确保垫子平铺整齐，无卷边</li>
                  <li>• 放置"小心地滑"警示牌</li>
                  <li>• 拍照记录铺设情况</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowLayModal(false);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmLay}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                确认铺设
              </button>
            </div>
          </div>
        </div>
      )}

      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">上报问题</h3>
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  setIssuePointId(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  问题类型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'curled', label: '卷边', variant: 'warning' },
                    { value: 'water', label: '积水', variant: 'danger' },
                    { value: 'dirty', label: '脏污', variant: 'default' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setIssueType(item.value as typeof issueType)}
                      className={`py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                        issueType === item.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  问题描述
                </label>
                <textarea
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="请详细描述问题情况..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">点击上传现场照片</p>
                <p className="text-xs text-slate-300 mt-1">支持 JPG、PNG 格式</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  setIssuePointId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitIssue}
                disabled={!issueDesc}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交问题
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
