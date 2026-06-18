import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, FileText, Clock, User, AlertTriangle, ChevronRight } from 'lucide-react';
import { useRepairStore } from '../store/repairStore';
import { useFurnitureStore } from '../store/furnitureStore';
import { useMaintenanceStore } from '../store/maintenanceStore';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ISSUE_TYPE_LABELS, SEVERITY_LABELS, REPAIR_STATUS_LABELS } from '../types';
import type { IssueType, Severity } from '../types';

export function RepairList() {
  const repairOrders = useRepairStore((state) => state.repairOrders);
  const addRepairOrder = useRepairStore((state) => state.addRepairOrder);
  const updateStatus = useRepairStore((state) => state.updateStatus);
  const furnitureList = useFurnitureStore((state) => state.furnitureList);
  const addMaintenance = useMaintenanceStore((state) => state.addRecord);
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    furnitureId: '',
    reporter: '',
    issueType: 'wobble' as IssueType,
    description: '',
    severity: 'medium' as Severity,
    photos: [] as string[],
  });

  const filteredList = useMemo(() => {
    return repairOrders.filter((item) => {
      const furniture = furnitureList.find((f) => f.id === item.furnitureId);
      const matchSearch =
        !searchText ||
        item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item.reporter.includes(searchText) ||
        furniture?.room.includes(searchText);
      const matchStatus = !filterStatus || item.status === filterStatus;
      const matchSeverity = !filterSeverity || item.severity === filterSeverity;
      return matchSearch && matchStatus && matchSeverity;
    });
  }, [repairOrders, furnitureList, searchText, filterStatus, filterSeverity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.furnitureId || !formData.reporter || !formData.description) return;
    addRepairOrder(formData);
    setShowAddModal(false);
    setFormData({
      furnitureId: '',
      reporter: '',
      issueType: 'wobble',
      description: '',
      severity: 'medium',
      photos: [],
    });
  };

  const handleAssign = (orderId: string, furnitureId: string) => {
    updateStatus(orderId, 'assigned');
    addMaintenance({
      repairOrderId: orderId,
      furnitureId,
      handler: '',
      parts: '',
      cost: 0,
      reviewPhotos: [],
      finishDate: '',
    });
    setShowDetailModal(null);
  };

  const selectedOrder = showDetailModal
    ? repairOrders.find((o) => o.id === showDetailModal)
    : null;
  const selectedFurniture = selectedOrder
    ? furnitureList.find((f) => f.id === selectedOrder.furnitureId)
    : null;

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">报修管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {repairOrders.length} 条报修记录</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          提交报修
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索报修单号、报修人或房间..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select w-32"
              >
                <option value="">全部状态</option>
                {Object.entries(REPAIR_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="select w-28"
            >
              <option value="">全部紧急度</option>
              {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 报修列表 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  报修单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  桌椅信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  问题类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  报修人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  紧急程度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  报修时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.map((order) => {
                const furniture = furnitureList.find((f) => f.id === order.furnitureId);
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setShowDetailModal(order.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.furnitureId}</div>
                      <div className="text-xs text-gray-500">{furniture?.room}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{ISSUE_TYPE_LABELS[order.issueType]}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{order.reporter}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge type="severity" status={order.severity} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge type="repair" status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDetailModal(order.id);
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 ml-auto"
                      >
                        查看详情
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredList.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无符合条件的报修记录</p>
          </div>
        )}
      </div>

      {/* 新增报修弹窗 */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="提交报修" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">选择桌椅 <span className="text-red-500">*</span></label>
            <select
              value={formData.furnitureId}
              onChange={(e) => setFormData({ ...formData, furnitureId: e.target.value })}
              className="select"
            >
              <option value="">请选择桌椅</option>
              {furnitureList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} - {f.room}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">报修人 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.reporter}
                onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                placeholder="请输入您的姓名"
                className="input"
              />
            </div>
            <div>
              <label className="label">问题类型</label>
              <select
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value as IssueType })}
                className="select"
              >
                {Object.entries(ISSUE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">问题描述 <span className="text-red-500">*</span></label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请详细描述问题情况..."
              rows={4}
              className="input resize-none"
            />
          </div>
          <div>
            <label className="label">严重程度</label>
            <div className="flex gap-3">
              {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.severity === value
                      ? value === 'low'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : value === 'medium'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={value}
                    checked={formData.severity === value}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as Severity })}
                    className="sr-only"
                  />
                  {value === 'high' && <AlertTriangle className="w-4 h-4" />}
                  <span className="font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              提交报修
            </button>
          </div>
        </form>
      </Modal>

      {/* 详情弹窗 */}
      {selectedOrder && (
        <Modal
          isOpen={!!showDetailModal}
          onClose={() => setShowDetailModal(null)}
          title={`报修单详情 - ${selectedOrder.id}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">桌椅编号</p>
                <p className="text-sm font-medium text-gray-800">{selectedOrder.furnitureId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">所在房间</p>
                <p className="text-sm font-medium text-gray-800">{selectedFurniture?.room || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">报修人</p>
                <p className="text-sm font-medium text-gray-800">{selectedOrder.reporter}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">报修时间</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">问题类型</p>
                <p className="text-sm font-medium text-gray-800">
                  {ISSUE_TYPE_LABELS[selectedOrder.issueType]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">当前状态</p>
                <StatusBadge type="repair" status={selectedOrder.status} />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">严重程度</p>
              <StatusBadge type="severity" status={selectedOrder.severity} />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">问题描述</p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{selectedOrder.description}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setShowDetailModal(null)} className="btn btn-outline">
                关闭
              </button>
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <button
                  onClick={() => handleAssign(selectedOrder.id, selectedOrder.furnitureId)}
                  className="btn btn-primary"
                >
                  派单维修
                </button>
              )}
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => {
                    updateStatus(selectedOrder.id, 'processing');
                    setShowDetailModal(null);
                  }}
                  className="btn btn-secondary"
                >
                  标记处理中
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
