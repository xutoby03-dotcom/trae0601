import { useState } from 'react';
import { Plus, Edit2, Trash2, Package, AlertTriangle, CheckCircle, X, Minus, Plus as PlusIcon } from 'lucide-react';
import { useFilterStore } from '../store';
import { formatDateDisplay } from '../utils/dateUtils';

export default function Inventory() {
  const { inventory, devices, addInventory, updateInventory, deleteInventory } = useFilterStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    filterModel: '',
    quantity: 1,
    unitPrice: 0,
  });

  const getDeviceCount = (filterModel: string) => {
    return devices.filter((d) => d.filterModel === filterModel).length;
  };

  const handleOpenModal = (itemId?: string) => {
    if (itemId) {
      const item = inventory.find((i) => i.id === itemId);
      if (item) {
        setFormData({
          filterModel: item.filterModel,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
        setEditingItem(itemId);
      }
    } else {
      setFormData({ filterModel: '', quantity: 1, unitPrice: 0 });
      setEditingItem(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateInventory(editingItem, {
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
      });
    } else {
      addInventory({
        filterModel: formData.filterModel.trim(),
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
      });
    }
    handleCloseModal();
  };

  const handleDelete = (id: string, filterModel: string) => {
    if (window.confirm(`确定要删除滤芯型号 "${filterModel}" 的库存记录吗？`)) {
      deleteInventory(id);
    }
  };

  const adjustQuantity = (id: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 0) {
      updateInventory(id, { quantity: newQuantity });
    }
  };

  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const outOfStockCount = inventory.filter((i) => i.quantity === 0).length;
  const lowStockCount = inventory.filter((i) => i.quantity > 0 && i.quantity <= 1).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-800">库存管理</h1>
          <p className="text-gray-500 mt-1">管理各型号滤芯的库存情况</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          补充库存
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总库存数量</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalItems} 件</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-50">
              <Package className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">库存总价值</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">¥{totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50">
              <Package className="w-6 h-6 text-violet-500" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">库存不足</p>
              <p className="text-2xl font-bold text-warning-500 mt-1">{lowStockCount} 个型号</p>
            </div>
            <div className="p-3 rounded-xl bg-warning-50">
              <AlertTriangle className="w-6 h-6 text-warning-500" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已耗尽</p>
              <p className="text-2xl font-bold text-danger-500 mt-1">{outOfStockCount} 个型号</p>
            </div>
            <div className="p-3 rounded-xl bg-danger-50">
              <AlertTriangle className="w-6 h-6 text-danger-500" />
            </div>
          </div>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无库存记录</h3>
          <p className="text-gray-500 mb-6">点击上方按钮添加第一个滤芯型号的库存</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            补充库存
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {inventory.map((item) => {
            const deviceCount = getDeviceCount(item.filterModel);
            const isOutOfStock = item.quantity === 0;
            const isLowStock = item.quantity > 0 && item.quantity <= 1;

            return (
              <div
                key={item.id}
                className={`card-border ${
                  isOutOfStock ? 'border-danger-300' : isLowStock ? 'border-warning-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-800">{item.filterModel}</h3>
                      {isOutOfStock ? (
                        <span className="badge-danger">已耗尽</span>
                      ) : isLowStock ? (
                        <span className="badge-warning">库存不足</span>
                      ) : (
                        <span className="badge-success">库存充足</span>
                      )}
                    </div>
                    {deviceCount > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {deviceCount} 台设备使用此型号
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleOpenModal(item.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.filterModel)}
                      className="p-2 rounded-lg text-gray-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <span className="text-sm text-gray-500">当前库存</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustQuantity(item.id, item.quantity, -1)}
                        disabled={item.quantity <= 0}
                        className="p-1 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-primary-500 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={`text-xl font-bold min-w-[3rem] text-center ${
                        isOutOfStock ? 'text-danger-500' : isLowStock ? 'text-warning-500' : 'text-success-600'
                      }`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => adjustQuantity(item.id, item.quantity, 1)}
                        className="p-1 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-primary-500 hover:border-primary-300 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">单价</p>
                      <p className="font-medium text-gray-800">¥{item.unitPrice}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">总价值</p>
                      <p className="font-medium text-gray-800">¥{(item.quantity * item.unitPrice).toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">
                    最后更新：{formatDateDisplay(item.lastUpdated)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingItem ? '编辑库存' : '补充库存'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">滤芯型号 *</label>
                <input
                  type="text"
                  value={formData.filterModel}
                  onChange={(e) => setFormData({ ...formData, filterModel: e.target.value })}
                  placeholder="如：MR424-Z"
                  className="input-field"
                  required
                  disabled={!!editingItem}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">数量 *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">单价（元）*</label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-ghost">
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? '保存修改' : '添加库存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
