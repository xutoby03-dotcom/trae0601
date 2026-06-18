import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Package, Minus, Plus as PlusIcon, Droplets, Coffee } from 'lucide-react';
import { useSupplyStore } from '../store/useSupplyStore';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/Toast';
import type { SupplyItem, SupplyItemWithStatus, SupplyLog } from '../types';
import { formatDate, formatDateTime } from '../utils/date';

const categoryLabels = {
  cleaning: '清洁用品',
  descaler: '除垢剂',
  cups: '纸杯',
  other: '其他',
};

const categoryIcons = {
  cleaning: Droplets,
  descaler: Droplets,
  cups: Coffee,
  other: Package,
};

interface SupplyFormData {
  name: string;
  category: 'cleaning' | 'descaler' | 'cups' | 'other';
  quantity: number;
  unitPrice: number;
  safetyStock: number;
  expiryDate?: string;
}

const defaultFormData: SupplyFormData = {
  name: '',
  category: 'other',
  quantity: 0,
  unitPrice: 0,
  safetyStock: 10,
};

export function SuppliesManage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<SupplyItemWithStatus | null>(null);
  const [formData, setFormData] = useState<SupplyFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState<'all' | 'cleaning' | 'descaler' | 'cups' | 'other'>('all');
  const [selectedSupply, setSelectedSupply] = useState<SupplyItemWithStatus | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'consume' | 'restock'>('consume');
  const [actionQuantity, setActionQuantity] = useState(1);
  const [actionDepartment, setActionDepartment] = useState('');

  const supplies = useSupplyStore((state) => state.getAllSuppliesWithStatus());
  const logs = useSupplyStore((state) => state.logs);
  const departments = useSupplyStore((state) => state.departments);
  const addSupply = useSupplyStore((state) => state.addSupply);
  const updateSupply = useSupplyStore((state) => state.updateSupply);
  const deleteSupply = useSupplyStore((state) => state.deleteSupply);
  const consumeSupply = useSupplyStore((state) => state.consumeSupply);
  const restockSupply = useSupplyStore((state) => state.restockSupply);
  const autoGeneratePurchaseList = usePurchaseStore((state) => state.autoGeneratePurchaseList);
  const { showToast } = useToast();

  const filteredSupplies = useMemo(() => {
    if (activeTab === 'all') return supplies;
    return supplies.filter((s) => s.category === activeTab);
  }, [supplies, activeTab]);

  const recentLogs = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);
  }, [logs]);

  const handleOpenAdd = () => {
    setEditingSupply(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supply: SupplyItemWithStatus) => {
    setEditingSupply(supply);
    setFormData({
      name: supply.name,
      category: supply.category,
      quantity: supply.quantity,
      unitPrice: supply.unitPrice,
      safetyStock: supply.safetyStock,
      expiryDate: supply.expiryDate,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSupply) {
      updateSupply(editingSupply.id, formData);
      showToast('success', `已更新 ${formData.name}`);
    } else {
      addSupply(formData);
      showToast('success', `已添加 ${formData.name}`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (supply: SupplyItemWithStatus) => {
    if (confirm(`确定要删除 ${supply.name} 吗？`)) {
      deleteSupply(supply.id);
      showToast('success', `已删除 ${supply.name}`);
    }
  };

  const handleOpenAction = (supply: SupplyItemWithStatus, type: 'consume' | 'restock') => {
    setSelectedSupply(supply);
    setActionType(type);
    setActionQuantity(type === 'consume' ? 1 : 10);
    setActionDepartment('');
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupply) return;

    if (actionType === 'consume') {
      const result = consumeSupply(selectedSupply.id, actionQuantity, actionDepartment || undefined);
      if (result.success) {
        showToast('success', result.message);
        const updated = useSupplyStore.getState().getSupplyWithStatus(selectedSupply.id);
        if (updated && updated.stockStatus === 'low') {
          autoGeneratePurchaseList();
          showToast('info', '库存已低于安全线，已自动加入采购清单');
        }
      } else {
        showToast('error', result.message);
        return;
      }
    } else {
      const expiryDate = formData.expiryDate;
      const result = restockSupply(selectedSupply.id, actionQuantity, expiryDate);
      if (result.success) {
        showToast('success', result.message);
      } else {
        showToast('error', result.message);
        return;
      }
    }
    setIsActionModalOpen(false);
    setSelectedSupply(null);
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'cleaning', label: '清洁用品' },
    { key: 'descaler', label: '除垢剂' },
    { key: 'cups', label: '纸杯' },
    { key: 'other', label: '其他' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-coffee-900 mb-2">配套物品</h1>
          <p className="text-coffee-500">管理咖啡机清洁片、除垢剂、纸杯等配套物品</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-accent">
          <Plus className="w-5 h-5" />
          新增物品
        </button>
      </div>

      <div className="flex gap-2 border-b border-coffee-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-coffee-800 text-coffee-800'
                : 'border-transparent text-coffee-500 hover:text-coffee-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSupplies.map((supply, index) => {
          const IconComponent = categoryIcons[supply.category];
          return (
            <div
              key={supply.id}
              className="card p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cream-100 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-coffee-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-coffee-900">{supply.name}</h3>
                    <p className="text-xs text-coffee-500">{categoryLabels[supply.category]}</p>
                  </div>
                </div>
                <StatusBadge status={supply.stockStatus} />
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="font-display text-3xl font-bold text-coffee-900">
                    {supply.quantity}
                  </p>
                  <p className="text-xs text-coffee-500">当前库存</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-coffee-600">
                    单价: <span className="font-medium">¥{supply.unitPrice.toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-coffee-400">安全库存: {supply.safetyStock}</p>
                </div>
              </div>

              {supply.expiryDate && (
                <p className="text-xs text-coffee-400 mb-4">
                  过期日期: {formatDate(supply.expiryDate)}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenAction(supply, 'consume')}
                  disabled={supply.stockStatus === 'out_of_stock'}
                  className="btn-secondary flex-1 text-sm disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                  领用
                </button>
                <button
                  onClick={() => handleOpenAction(supply, 'restock')}
                  className="btn-success flex-1 text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  补充
                </button>
                <button
                  onClick={() => handleOpenEdit(supply)}
                  className="btn-ghost p-2"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(supply)}
                  className="btn-ghost p-2 text-accent-red hover:bg-red-50"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-coffee-900 mb-4">最近记录</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-coffee-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-coffee-700">时间</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-coffee-700">物品</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-coffee-700">类型</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-coffee-700">数量</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-coffee-700">部门</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-50">
                {recentLogs.map((log: SupplyLog) => {
                  const supply = supplies.find((s) => s.id === log.supplyId);
                  return (
                    <tr key={log.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-coffee-600">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-coffee-900">
                        {supply?.name || '未知物品'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`badge ${
                            log.type === 'consume'
                              ? 'bg-orange-100 text-accent-orange'
                              : 'bg-green-100 text-accent-green'
                          }`}
                        >
                          {log.type === 'consume' ? '领用' : '补充'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-coffee-600">{log.quantity}</td>
                      <td className="px-6 py-4 text-sm text-coffee-600">
                        {log.department || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {recentLogs.length === 0 && (
            <p className="text-center text-coffee-500 py-12">暂无记录</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupply ? '编辑物品' : '新增物品'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">物品名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="如：咖啡机清洁片"
              required
            />
          </div>

          <div>
            <label className="label">分类</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as SupplyFormData['category'] })}
              className="select"
            >
              <option value="cleaning">清洁用品</option>
              <option value="descaler">除垢剂</option>
              <option value="cups">纸杯</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">当前库存</label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">单价 (元)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">安全库存</label>
              <input
                type="number"
                min="0"
                value={formData.safetyStock}
                onChange={(e) => setFormData({ ...formData, safetyStock: parseInt(e.target.value) })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">过期日期 (可选)</label>
              <input
                type="date"
                value={formData.expiryDate || ''}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingSupply ? '保存修改' : '添加物品'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedSupply(null);
        }}
        title={actionType === 'consume' ? '领用物品' : '补充物品'}
        size="sm"
      >
        {selectedSupply && (
          <form onSubmit={handleActionSubmit} className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
                {(() => {
                  const IconComponent = categoryIcons[selectedSupply.category];
                  return <IconComponent className="w-7 h-7 text-coffee-600" />;
                })()}
              </div>
              <div>
                <p className="font-bold text-coffee-900">{selectedSupply.name}</p>
                <p className="text-sm text-coffee-500">
                  当前库存: <span className="font-medium">{selectedSupply.quantity}</span>
                </p>
              </div>
            </div>

            <div>
              <label className="label">{actionType === 'consume' ? '领用数量' : '补充数量'}</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setActionQuantity(Math.max(1, actionQuantity - 1))}
                  className="btn-secondary w-12 h-12 p-0 text-xl"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  value={actionQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    const max = actionType === 'consume' ? selectedSupply.quantity : 9999;
                    setActionQuantity(Math.max(1, Math.min(max, val)));
                  }}
                  className="input w-24 text-center text-xl font-bold"
                  min={1}
                  max={actionType === 'consume' ? selectedSupply.quantity : undefined}
                />
                <button
                  type="button"
                  onClick={() => {
                    const max = actionType === 'consume' ? selectedSupply.quantity : 9999;
                    setActionQuantity(Math.min(max, actionQuantity + 1));
                  }}
                  className="btn-secondary w-12 h-12 p-0 text-xl"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {actionType === 'consume' && (
              <div>
                <label className="label">领用部门</label>
                <select
                  value={actionDepartment}
                  onChange={(e) => setActionDepartment(e.target.value)}
                  className="select"
                  required
                >
                  <option value="">请选择部门</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsActionModalOpen(false);
                  setSelectedSupply(null);
                }}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                type="submit"
                className={actionType === 'consume' ? 'btn-accent flex-1' : 'btn-success flex-1'}
              >
                {actionType === 'consume' ? '确认领用' : '确认补充'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
