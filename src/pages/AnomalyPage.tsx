import { useState, useMemo } from 'react';
import { useStarterStore } from '@/store/useStarterStore';
import { StatusBadge } from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { 
  AlertTriangle, Clock, CheckCircle, Unlock, Trash2, 
  ChevronDown, ChevronUp, Calendar, User, FileText, X
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { AnomalyType, StarterStatus } from '@/types';
import { getAnomalyLabel, getStatusLabel } from '@/utils/format';

export default function AnomalyPage() {
  const { anomalyRecords, starters, unlockStarter, deleteStarter, productionOrders } = useStarterStore();
  const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStarterId, setSelectedStarterId] = useState<string | null>(null);
  const [unlockReason, setUnlockReason] = useState('');
  const [handlerName, setHandlerName] = useState('');

  const sortedAnomalies = useMemo(() => {
    return [...anomalyRecords].sort((a, b) => 
      new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    );
  }, [anomalyRecords]);

  const getAnomalyIcon = (type: AnomalyType) => {
    const icons: Record<AnomalyType, React.ReactNode> = {
      [AnomalyType.COLLAPSE]: <Trash2 className="w-6 h-6" />,
      [AnomalyType.ODOR]: <AlertTriangle className="w-6 h-6" />,
      [AnomalyType.MOLD]: <X className="w-6 h-6" />,
    };
    return icons[type];
  };

  const getAnomalyColor = (type: AnomalyType) => {
    const colors: Record<AnomalyType, string> = {
      [AnomalyType.COLLAPSE]: 'bg-orange-500',
      [AnomalyType.ODOR]: 'bg-yellow-500',
      [AnomalyType.MOLD]: 'bg-red-500',
    };
    return colors[type];
  };

  const getAnomalyBg = (type: AnomalyType) => {
    const bgs: Record<AnomalyType, string> = {
      [AnomalyType.COLLAPSE]: 'bg-orange-50 border-orange-200',
      [AnomalyType.ODOR]: 'bg-yellow-50 border-yellow-200',
      [AnomalyType.MOLD]: 'bg-red-50 border-red-200',
    };
    return bgs[type];
  };

  const handleUnlock = () => {
    if (!selectedStarterId || !handlerName || !unlockReason) return;
    unlockStarter(selectedStarterId, handlerName, unlockReason);
    setShowUnlockModal(false);
    setSelectedStarterId(null);
    setUnlockReason('');
    setHandlerName('');
  };

  const handleDelete = () => {
    if (!selectedStarterId) return;
    deleteStarter(selectedStarterId);
    setShowDeleteModal(false);
    setSelectedStarterId(null);
  };

  const getAffectedOrders = (orderIds: string[]) => {
    return productionOrders.filter(o => orderIds.includes(o.id));
  };

  const activeAnomalies = sortedAnomalies.filter(a => a.status === 'open');
  const resolvedAnomalies = sortedAnomalies.filter(a => a.status !== 'open');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-bread-800">异常管理</h1>
          <p className="text-bread-500 mt-1">处理异常酸种，追踪受影响订单</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0ms', opacity: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-bread-800 font-display">{activeAnomalies.length}</p>
              <p className="text-sm text-bread-500">待处理异常</p>
            </div>
          </div>
        </div>
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-bread-800 font-display">
                {sortedAnomalies.filter(a => a.status === 'discarded').length}
              </p>
              <p className="text-sm text-bread-500">已废弃</p>
            </div>
          </div>
        </div>
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-bread-800 font-display">
                {sortedAnomalies.filter(a => a.status === 'resolved').length}
              </p>
              <p className="text-sm text-bread-500">已恢复</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
          <h2 className="text-xl font-display font-bold text-bread-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            待处理异常
          </h2>

          {activeAnomalies.length === 0 ? (
            <div className="text-center py-12 text-bread-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p>没有待处理的异常</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAnomalies.map((anomaly, index) => {
                const starter = starters.find(s => s.id === anomaly.starterId);
                const isExpanded = expandedAnomaly === anomaly.id;
                const affectedOrders = getAffectedOrders(anomaly.affectedOrderIds);

                if (!starter) return null;

                return (
                  <div
                    key={anomaly.id}
                    className={`border rounded-xl overflow-hidden ${getAnomalyBg(anomaly.type)} animate-fade-in-up`}
                    style={{ animationDelay: `${index * 50 + 400}ms`, opacity: 0 }}
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-white/50 transition-colors"
                      onClick={() => setExpandedAnomaly(isExpanded ? null : anomaly.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${getAnomalyColor(anomaly.type)} flex items-center justify-center text-white`}>
                            {getAnomalyIcon(anomaly.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-bread-800">{starter.name}</span>
                              <StatusBadge status={StarterStatus.LOCKED} size="sm" />
                              <span className="badge bg-red-100 text-red-700">{getAnomalyLabel(anomaly.type)}</span>
                            </div>
                            <p className="text-sm text-bread-600">
                              发现于 {formatDistanceToNow(new Date(anomaly.detectedAt), { addSuffix: true, locale: zhCN })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {affectedOrders.length > 0 && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-red-600">{affectedOrders.length}个订单</p>
                              <p className="text-xs text-bread-500">受影响</p>
                            </div>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-bread-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-bread-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-inherit bg-white/70">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-bread-500 mb-1">异常类型</p>
                            <p className="font-medium text-bread-800">{getAnomalyLabel(anomaly.type)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-bread-500 mb-1">酸种状态</p>
                            <p className="font-medium text-bread-800">{getStatusLabel(StarterStatus.LOCKED)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-bread-500 mb-1">发现时间</p>
                            <p className="font-medium text-bread-800">
                              {format(new Date(anomaly.detectedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-bread-500 mb-1">操作员</p>
                            <p className="font-medium text-bread-800">{anomaly.reportedBy}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-bread-500 mb-1">异常描述</p>
                            <p className="text-bread-700 bg-white/50 p-3 rounded-lg">{anomaly.description}</p>
                          </div>
                        </div>

                        {affectedOrders.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-bread-500 mb-2">受影响订单</p>
                            <div className="space-y-2">
                              {affectedOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                  <div>
                                    <p className="font-medium text-bread-800">{order.productName}</p>
                                    <p className="text-xs text-bread-500">{order.orderNo} · {order.plannedQuantity}个</p>
                                  </div>
                                  <span className="badge bg-red-100 text-red-700">已取消</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStarterId(starter.id);
                              setShowUnlockModal(true);
                            }}
                            className="btn-secondary flex-1 flex items-center justify-center gap-2"
                          >
                            <Unlock className="w-4 h-4" />
                            解锁恢复
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStarterId(starter.id);
                              setShowDeleteModal(true);
                            }}
                            className="btn-danger flex-1 flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            废弃处理
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {resolvedAnomalies.length > 0 && (
          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '500ms', opacity: 0 }}>
            <h2 className="text-xl font-display font-bold text-bread-800 mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              已处理记录
            </h2>
            <div className="space-y-3">
              {resolvedAnomalies.map((anomaly, index) => {
                const starter = starters.find(s => s.id === anomaly.starterId);
                if (!starter) return null;

                return (
                  <div
                    key={anomaly.id}
                    className="p-4 border border-bread-100 rounded-xl bg-white/50 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50 + 600}ms`, opacity: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${getAnomalyColor(anomaly.type)} flex items-center justify-center text-white`}>
                          {getAnomalyIcon(anomaly.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-bread-700">{starter.name}</span>
                            <span className="badge bg-bread-100 text-bread-600">{getAnomalyLabel(anomaly.type)}</span>
                          </div>
                          <p className="text-xs text-bread-500">
                            {format(new Date(anomaly.detectedAt), 'yyyy-MM-dd', { locale: zhCN })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${anomaly.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {anomaly.status === 'resolved' ? '已恢复' : '已废弃'}
                        </span>
                        {anomaly.resolvedAt && (
                          <p className="text-xs text-bread-500 mt-1">
                            {format(new Date(anomaly.resolvedAt), 'yyyy-MM-dd', { locale: zhCN })}
                          </p>
                        )}
                      </div>
                    </div>
                    {anomaly.resolutionNotes && (
                      <p className="text-sm text-bread-600 mt-2 bg-white p-2 rounded-lg">
                        处理说明：{anomaly.resolutionNotes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showUnlockModal}
        onClose={() => {
          setShowUnlockModal(false);
          setSelectedStarterId(null);
          setUnlockReason('');
          setHandlerName('');
        }}
        title="解锁酸种"
        width="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-700 text-sm">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              解锁前请确保酸种状态已恢复正常。解锁后该酸种可重新用于生产。
            </p>
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
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowUnlockModal(false);
                setSelectedStarterId(null);
                setUnlockReason('');
                setHandlerName('');
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleUnlock}
              disabled={!handlerName || !unlockReason}
              className="btn-primary"
            >
              确认解锁
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStarterId(null);
        }}
        title="废弃酸种"
        width="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              此操作将永久删除该酸种及其所有喂养记录，不可撤销。请谨慎操作。
            </p>
          </div>
          <div className="text-center py-4">
            <p className="text-bread-800 font-medium">确定要废弃该酸种吗？</p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedStarterId(null);
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="btn-danger"
            >
              确认废弃
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
