import { useState, useMemo } from 'react';
import { Search, Filter, Wrench, User, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { useMaintenanceStore } from '../store/maintenanceStore';
import { useFurnitureStore } from '../store/furnitureStore';
import { useRepairStore } from '../store/repairStore';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { MAINTENANCE_STATUS_LABELS, ISSUE_TYPE_LABELS } from '../types';

export function MaintenanceList() {
  const maintenanceRecords = useMaintenanceStore((state) => state.records);
  const completeMaintenance = useMaintenanceStore((state) => state.completeMaintenance);
  const updateStatus = useMaintenanceStore((state) => state.updateStatus);
  const furnitureList = useFurnitureStore((state) => state.furnitureList);
  const repairOrders = useRepairStore((state) => state.repairOrders);

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);

  const [completeForm, setCompleteForm] = useState({
    handler: '',
    parts: '',
    cost: 0,
    reviewPhotos: [] as string[],
  });

  const filteredList = useMemo(() => {
    return maintenanceRecords.filter((item) => {
      const furniture = furnitureList.find((f) => f.id === item.furnitureId);
      const matchSearch =
        !searchText ||
        item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item.furnitureId.toLowerCase().includes(searchText.toLowerCase()) ||
        item.handler.includes(searchText) ||
        furniture?.room.includes(searchText);
      const matchStatus = !filterStatus || item.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [maintenanceRecords, furnitureList, searchText, filterStatus]);

  const selectedRecord = showDetailModal
    ? maintenanceRecords.find((r) => r.id === showDetailModal)
    : null;
  const selectedFurniture = selectedRecord
    ? furnitureList.find((f) => f.id === selectedRecord.furnitureId)
    : null;
  const relatedRepairOrder = selectedRecord?.repairOrderId
    ? repairOrders.find((o) => o.id === selectedRecord.repairOrderId)
    : null;

  const handleStart = (id: string) => {
    updateStatus(id, 'in_progress');
    setShowDetailModal(null);
  };

  const handleComplete = (id: string) => {
    setShowCompleteModal(id);
    setCompleteForm({
      handler: '',
      parts: '',
      cost: 0,
      reviewPhotos: [],
    });
  };

  const handleConfirmComplete = () => {
    if (showCompleteModal) {
      completeMaintenance(showCompleteModal, completeForm);
      setShowCompleteModal(null);
      setShowDetailModal(null);
    }
  };

  // 统计
  const stats = useMemo(() => {
    const pending = maintenanceRecords.filter((r) => r.status === 'pending').length;
    const inProgress = maintenanceRecords.filter((r) => r.status === 'in_progress').length;
    const completed = maintenanceRecords.filter(
      (r) => r.status === 'completed' || r.status === 'verified'
    ).length;
    const totalCost = maintenanceRecords.reduce((sum, r) => sum + r.cost, 0);
    return { pending, inProgress, completed, totalCost };
  }, [maintenanceRecords]);

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">维修管理</h1>
        <p className="text-sm text-gray-500 mt-1">共 {maintenanceRecords.length} 条维修记录</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500 mb-1">待维修</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 mb-1">维修中</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 mb-1">已完成</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 mb-1">累计费用</p>
          <p className="text-2xl font-bold text-primary-600">¥{stats.totalCost}</p>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索维修单号、桌椅编号或处理人..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select w-32"
            >
              <option value="">全部状态</option>
              {Object.entries(MAINTENANCE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 维修列表 */}
      <div className="space-y-4">
        {filteredList.map((record) => {
          const furniture = furnitureList.find((f) => f.id === record.furnitureId);
          const repairOrder = record.repairOrderId
            ? repairOrders.find((o) => o.id === record.repairOrderId)
            : null;
          return (
            <div
              key={record.id}
              onClick={() => setShowDetailModal(record.id)}
              className="card card-hover cursor-pointer p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{record.id}</h3>
                      <StatusBadge type="maintenance" status={record.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      桌椅：{record.furnitureId}
                      <span className="text-gray-400 mx-2">·</span>
                      {furniture?.room}
                    </p>
                    {repairOrder && (
                      <p className="text-xs text-gray-500">
                        关联报修：{repairOrder.id} - {ISSUE_TYPE_LABELS[repairOrder.issueType]}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {record.handler ? (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      {record.handler}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">待指派</p>
                  )}
                  {record.cost > 0 && (
                    <p className="text-sm font-medium text-primary-600 mt-1">¥{record.cost}</p>
                  )}
                  {record.finishDate && (
                    <p className="text-xs text-gray-400 mt-1">完成：{record.finishDate}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredList.length === 0 && (
          <div className="card p-12 text-center">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无符合条件的维修记录</p>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedRecord && (
        <Modal
          isOpen={!!showDetailModal}
          onClose={() => setShowDetailModal(null)}
          title={`维修单详情 - ${selectedRecord.id}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">桌椅编号</p>
                <p className="text-sm font-medium text-gray-800">{selectedRecord.furnitureId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">所在房间</p>
                <p className="text-sm font-medium text-gray-800">{selectedFurniture?.room || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">处理人</p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedRecord.handler || '待指派'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">当前状态</p>
                <StatusBadge type="maintenance" status={selectedRecord.status} />
              </div>
            </div>

            {relatedRepairOrder && (
              <div>
                <p className="text-xs text-gray-500 mb-2">关联报修单</p>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {relatedRepairOrder.id}
                  </p>
                  <p className="text-xs text-gray-600">
                    问题类型：{ISSUE_TYPE_LABELS[relatedRepairOrder.issueType]}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {relatedRepairOrder.description}
                  </p>
                </div>
              </div>
            )}

            {selectedRecord.parts && (
              <div>
                <p className="text-xs text-gray-500 mb-1">使用配件</p>
                <p className="text-sm text-gray-700">{selectedRecord.parts}</p>
              </div>
            )}

            {selectedRecord.cost > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">维修费用</p>
                <p className="text-lg font-bold text-primary-600">¥{selectedRecord.cost}</p>
              </div>
            )}

            {selectedRecord.finishDate && (
              <div>
                <p className="text-xs text-gray-500 mb-1">完成日期</p>
                <p className="text-sm text-gray-700">{selectedRecord.finishDate}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setShowDetailModal(null)} className="btn btn-outline">
                关闭
              </button>
              {selectedRecord.status === 'pending' && (
                <button
                  onClick={() => handleStart(selectedRecord.id)}
                  className="btn btn-primary"
                >
                  开始维修
                </button>
              )}
              {selectedRecord.status === 'in_progress' && (
                <button
                  onClick={() => handleComplete(selectedRecord.id)}
                  className="btn btn-secondary"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    完成维修
                  </span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* 完成维修弹窗 */}
      <Modal
        isOpen={!!showCompleteModal}
        onClose={() => setShowCompleteModal(null)}
        title="完成维修"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">处理人 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={completeForm.handler}
              onChange={(e) => setCompleteForm({ ...completeForm, handler: e.target.value })}
              placeholder="请输入处理人姓名"
              className="input"
            />
          </div>
          <div>
            <label className="label">使用配件</label>
            <textarea
              value={completeForm.parts}
              onChange={(e) => setCompleteForm({ ...completeForm, parts: e.target.value })}
              placeholder="请列出使用的配件（可选）"
              rows={2}
              className="input resize-none"
            />
          </div>
          <div>
            <label className="label">维修费用 (元)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ¥
              </span>
              <input
                type="number"
                value={completeForm.cost}
                onChange={(e) =>
                  setCompleteForm({ ...completeForm, cost: Number(e.target.value) })
                }
                placeholder="0"
                className="input pl-8"
              />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              ✅ 完成维修后，桌椅状态将自动恢复为「正常使用」
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCompleteModal(null)} className="btn btn-outline">
              取消
            </button>
            <button
              onClick={handleConfirmComplete}
              disabled={!completeForm.handler}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认完成
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
