import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStarterStore } from '@/store/useStarterStore';
import { StatusBadge, AnomalyBadge } from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { 
  ArrowLeft, Edit, Trash2, ClipboardList, Lock, Unlock,
  Droplets, Package, Thermometer, Clock, Calendar, Cookie, Scale
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  getStorageLabel, getWaterRatioDisplay, getOdorLabel, formatDateTime 
} from '@/utils/format';
import { 
  getActivityScoreColor, getActivityScoreLabel, getNextFeedingTime 
} from '@/utils/calculations';
import { StarterStatus, AnomalyType } from '@/types';

export default function StarterDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getStarterById, getFeedingRecordsForStarter, updateStarter, unlockStarter, deleteStarter } = useStarterStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [handlerName, setHandlerName] = useState('');

  const starter = useMemo(() => id ? getStarterById(id) : undefined, [id, getStarterById]);
  const feedingRecords = useMemo(() => id ? getFeedingRecordsForStarter(id) : [], [id, getFeedingRecordsForStarter]);

  const weightMap = useMemo(() => {
    const map = new Map<string, { before: number; after: number }>();
    let cursor = starter?.currentWeight ?? 0;
    for (const r of feedingRecords) {
      const after = cursor;
      const before = cursor - r.flourAdded - r.waterAdded + r.discardAmount;
      map.set(r.id, { before: Math.round(before), after: Math.round(after) });
      cursor = Math.round(before);
    }
    return map;
  }, [feedingRecords, starter?.currentWeight]);

  if (!starter) {
    return (
      <div className="text-center py-20">
        <p className="text-bread-500 text-lg">酸种不存在</p>
        <button onClick={() => navigate('/starters')} className="btn-primary mt-4">
          返回列表
        </button>
      </div>
    );
  }

  const nextFeedingTime = starter.lastFedAt 
    ? getNextFeedingTime(starter.lastFedAt, starter.feedingInterval, starter.storageType)
    : null;

  const chartData = useMemo(() => {
    return feedingRecords.slice(0, 10).reverse().map(record => ({
      date: format(new Date(record.fedAt), 'MM-dd HH:mm', { locale: zhCN }),
      score: record.activityScore,
      rise: record.riseMultiplier,
    }));
  }, [feedingRecords]);

  const handleDelete = () => {
    if (id) {
      deleteStarter(id);
      navigate('/starters');
    }
  };

  const handleUnlock = () => {
    if (id && handlerName && unlockReason) {
      unlockStarter(id, handlerName, unlockReason);
      setShowUnlockModal(false);
      setUnlockReason('');
      setHandlerName('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/starters')}
          className="p-2 hover:bg-bread-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-bread-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-bread-800">{starter.name}</h1>
            <StatusBadge status={starter.status} />
          </div>
          <p className="text-bread-500 mt-1">{starter.flourType}</p>
        </div>
        <div className="flex gap-2">
          {starter.status === StarterStatus.LOCKED ? (
            <button
              onClick={() => setShowUnlockModal(true)}
              className="btn-success flex items-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              解除锁定
            </button>
          ) : (
            <button
              onClick={() => navigate(`/feeding/${starter.id}`)}
              className="btn-primary flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              记录喂养
            </button>
          )}
          <button
            onClick={() => navigate(`/starters/${starter.id}/edit`)}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn-danger flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '0ms', opacity: 0 }}>
          <div className="h-56 overflow-hidden">
            <img 
              src={starter.photoUrl} 
              alt={starter.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-wheat/20 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-wheat" />
                </div>
                <div>
                  <p className="text-xs text-bread-400">水粉比</p>
                  <p className="font-medium text-bread-800">{getWaterRatioDisplay(starter.waterRatio)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-wheat/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-wheat" />
                </div>
                <div>
                  <p className="text-xs text-bread-400">容器</p>
                  <p className="font-medium text-bread-800">{starter.container}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-wheat/20 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-wheat" />
                </div>
                <div>
                  <p className="text-xs text-bread-400">储存方式</p>
                  <p className="font-medium text-bread-800">{getStorageLabel(starter.storageType)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-wheat/20 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-wheat" />
                </div>
                <div>
                  <p className="text-xs text-bread-400">当前重量</p>
                  <p className="font-medium text-bread-800">{starter.currentWeight}g</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-wheat/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-wheat" />
                </div>
                <div>
                  <p className="text-xs text-bread-400">喂养间隔</p>
                  <p className="font-medium text-bread-800">{starter.feedingInterval}小时</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-wheat/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-wheat" />
                </div>
                <div>
                  <p className="text-xs text-bread-400">建立日期</p>
                  <p className="font-medium text-bread-800">{format(new Date(starter.createdAt), 'yyyy-MM-dd', { locale: zhCN })}</p>
                </div>
              </div>
            </div>

            {nextFeedingTime && (
              <div className="mt-6 p-4 bg-bread-50 rounded-xl border border-bread-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-bread-600">下次喂养时间</span>
                  <span className={`font-medium ${
                    new Date() > nextFeedingTime ? 'text-red-500' : 'text-bread-700'
                  }`}>
                    {format(nextFeedingTime, 'MM-dd HH:mm', { locale: zhCN })}
                  </span>
                </div>
              </div>
            )}

            {starter.notes && (
              <div className="mt-4 p-4 bg-bread-50 rounded-xl border border-bread-100">
                <p className="text-sm text-bread-500 mb-1">备注</p>
                <p className="text-bread-700">{starter.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
            <h2 className="text-xl font-display font-bold text-bread-800 mb-6">活性趋势</h2>
            {chartData.length === 0 ? (
              <div className="text-center py-12 text-bread-400">
                <p>暂无喂养记录</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5E6C8" />
                    <XAxis dataKey="date" stroke="#8B5A2B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#8B5A2B" fontSize={12} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFF8E7', 
                        border: '1px solid #E8D4A8',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8B5A2B"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#8B5A2B', strokeWidth: 2, stroke: '#FFF8E7' }}
                      name="活性评分"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
            <h2 className="text-xl font-display font-bold text-bread-800 mb-6">
              喂养记录历史
              <span className="ml-2 text-sm font-normal text-bread-400">
                共 {feedingRecords.length} 条记录
              </span>
            </h2>

            {feedingRecords.length === 0 ? (
              <div className="text-center py-12 text-bread-400">
                <p>暂无喂养记录</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {feedingRecords.map((record, index) => (
                  <div
                    key={record.id}
                    className="p-4 bg-bread-50 rounded-xl border border-bread-100"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-bread-200">
                          <Scale className="w-5 h-5 text-wheat" />
                        </div>
                        <div>
                          <p className="font-medium text-bread-800">
                            {formatDateTime(record.fedAt)}
                          </p>
                          <p className="text-sm text-bread-500">
                            丢弃 {record.discardAmount}g · 加粉 {record.flourAdded}g · 加水 {record.waterAdded}g
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {weightMap.get(record.id) && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-bread-800 font-display">{weightMap.get(record.id)!.after}g</p>
                            <p className="text-xs text-bread-400">喂后重量</p>
                          </div>
                        )}
                        <div 
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ 
                            backgroundColor: `${getActivityScoreColor(record.activityScore)}15`,
                            color: getActivityScoreColor(record.activityScore)
                          }}
                        >
                          {record.activityScore}分
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-bread-400">温度</span>
                        <p className="font-medium text-bread-700">{record.temperature}℃</p>
                      </div>
                      <div>
                        <span className="text-bread-400">气味</span>
                        <p className="font-medium text-bread-700">{getOdorLabel(record.odor)}</p>
                      </div>
                      <div>
                        <span className="text-bread-400">膨胀倍数</span>
                        <p className="font-medium text-bread-700">{record.riseMultiplier}x</p>
                      </div>
                      <div>
                        <span className="text-bread-400">峰值时间</span>
                        <p className="font-medium text-bread-700">{record.peakTime}h</p>
                      </div>
                    </div>

                    {record.anomalies.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-bread-200 flex items-center gap-2">
                        <span className="text-sm text-bread-400">异常标记：</span>
                        {record.anomalies.map(type => (
                          <AnomalyBadge key={type} type={type} size="sm" />
                        ))}
                      </div>
                    )}

                    {record.notes && (
                      <p className="mt-2 text-sm text-bread-600 italic">"{record.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
        width="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-bread-800 font-medium mb-2">确定要删除「{starter.name}」吗？</p>
          <p className="text-bread-500 text-sm mb-6">此操作将同时删除所有关联的喂养记录和异常记录，且无法恢复。</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 btn-danger"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showUnlockModal}
        onClose={() => {
          setShowUnlockModal(false);
          setUnlockReason('');
          setHandlerName('');
        }}
        title="解除锁定"
        width="lg"
      >
        <div className="space-y-4 py-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Unlock className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-bread-800 font-medium mb-2">确定要解除「{starter.name}」的锁定吗？</p>
            <p className="text-bread-500 text-sm">解除锁定后，该酸种将可以被用于生产排产。请确保异常问题已解决。</p>
          </div>
          <div>
            <label className="label">操作员姓名 *</label>
            <input
              value={handlerName}
              onChange={(e) => setHandlerName(e.target.value)}
              placeholder="请输入操作员姓名"
              className="input"
            />
          </div>
          <div>
            <label className="label">恢复说明 *</label>
            <textarea
              value={unlockReason}
              onChange={(e) => setUnlockReason(e.target.value)}
              rows={3}
              placeholder="请详细说明酸种状态恢复情况..."
              className="input resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowUnlockModal(false);
                setUnlockReason('');
                setHandlerName('');
              }}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleUnlock}
              disabled={!handlerName || !unlockReason}
              className="flex-1 btn-success"
            >
              确认解锁
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
