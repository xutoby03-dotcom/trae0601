import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/lib/utils';

export const Inventory: React.FC = () => {
  const { showToast } = useToast();
  const { samples, inventoryLogs, addSample, updateStock, loadFromStorage } = useStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'logs'>('list');

  const [newSample, setNewSample] = useState({
    name: '',
    sku: '',
    category: '电子元器件',
    batch: '',
    stockQuantity: 0,
    warningThreshold: 20,
    unit: '个',
    description: '',
  });

  const [stockUpdate, setStockUpdate] = useState({
    quantity: 0,
    operator: '',
    remark: '',
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const filteredSamples = samples.filter(s =>
    s.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    s.sku.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    s.category.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleAddSample = () => {
    if (!newSample.name.trim()) {
      showToast('请输入样品名称', 'error');
      return;
    }
    if (!newSample.sku.trim()) {
      showToast('请输入SKU编码', 'error');
      return;
    }
    if (!newSample.batch.trim()) {
      showToast('请输入批次号', 'error');
      return;
    }

    addSample(newSample);
    showToast('样品添加成功', 'success');
    setAddModalOpen(false);
    setNewSample({
      name: '',
      sku: '',
      category: '电子元器件',
      batch: '',
      stockQuantity: 0,
      warningThreshold: 20,
      unit: '个',
      description: '',
    });
  };

  const handleUpdateStock = () => {
    if (!selectedSampleId) return;
    if (stockUpdate.quantity === 0) {
      showToast('请输入调整数量', 'error');
      return;
    }
    if (!stockUpdate.operator.trim()) {
      showToast('请输入操作人', 'error');
      return;
    }

    updateStock(selectedSampleId, stockUpdate.quantity, stockUpdate.operator, stockUpdate.remark);
    showToast(stockUpdate.quantity > 0 ? '入库成功' : '出库成功', 'success');
    setStockModalOpen(false);
    setStockUpdate({ quantity: 0, operator: '', remark: '' });
    setSelectedSampleId(null);
  };

  const openStockModal = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setStockUpdate({ quantity: 0, operator: '', remark: '' });
    setStockModalOpen(true);
  };

  const selectedSample = samples.find(s => s.id === selectedSampleId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">库存管理</h1>
          <p className="text-gray-500 mt-1">管理样品库存，追踪库存变动</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          新增样品
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">样品总数</p>
          <p className="text-3xl font-bold text-gray-800">{samples.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">库存预警</p>
          <p className="text-3xl font-bold text-amber-600">
            {samples.filter(s => s.stockQuantity <= s.warningThreshold).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">库存总量</p>
          <p className="text-3xl font-bold text-emerald-600">
            {samples.reduce((sum, s) => sum + s.stockQuantity, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">本月入库</p>
          <p className="text-3xl font-bold text-blue-600">
            {inventoryLogs
              .filter(l => l.operationType === 'in')
              .reduce((sum, l) => sum + l.quantityChange, 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('list')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              库存列表
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === 'logs' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              变动记录
            </button>
          </div>
          {activeTab === 'list' && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索样品..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {activeTab === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">样品信息</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">批次</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">当前库存</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">预警线</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">更新时间</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSamples.map((sample) => (
                  <tr key={sample.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          sample.stockQuantity <= sample.warningThreshold ? 'bg-amber-100' : 'bg-blue-100'
                        )}>
                          <Package className={cn(
                            'w-5 h-5',
                            sample.stockQuantity <= sample.warningThreshold ? 'text-amber-600' : 'text-blue-600'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{sample.name}</p>
                          <p className="text-xs text-gray-500">{sample.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sample.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{sample.batch}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'font-semibold',
                        sample.stockQuantity <= sample.warningThreshold ? 'text-red-600' : 'text-gray-800'
                      )}>
                        {sample.stockQuantity} {sample.unit}
                      </span>
                      {sample.stockQuantity <= sample.warningThreshold && (
                        <span className="ml-2 inline-flex items-center text-xs text-amber-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          库存不足
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sample.warningThreshold} {sample.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(sample.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openStockModal(sample.id)}
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        调整库存
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSamples.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      暂无样品数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">样品</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">变动数量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">变动后库存</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventoryLogs.slice(0, 50).map((log) => {
                  const sample = samples.find(s => s.id === log.sampleId);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(log.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{sample?.name || '未知样品'}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                          log.operationType === 'in' ? 'bg-emerald-100 text-emerald-700' : 
                          log.operationType === 'out' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        )}>
                          {log.operationType === 'in' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {log.operationType === 'in' ? '入库' : log.operationType === 'out' ? '出库' : '调整'}
                        </span>
                      </td>
                      <td className={cn(
                        'px-6 py-4 text-sm font-medium',
                        log.quantityChange > 0 ? 'text-emerald-600' : 'text-red-600'
                      )}>
                        {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{log.balanceAfter}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.operator}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="新增样品"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">样品名称 *</label>
              <input
                type="text"
                value={newSample.name}
                onChange={(e) => setNewSample({ ...newSample, name: e.target.value })}
                placeholder="请输入样品名称"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU编码 *</label>
              <input
                type="text"
                value={newSample.sku}
                onChange={(e) => setNewSample({ ...newSample, sku: e.target.value })}
                placeholder="请输入SKU编码"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select
                value={newSample.category}
                onChange={(e) => setNewSample({ ...newSample, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="电子元器件">电子元器件</option>
                <option value="包装材料">包装材料</option>
                <option value="成品样品">成品样品</option>
                <option value="零部件">零部件</option>
                <option value="原材料">原材料</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">批次号 *</label>
              <input
                type="text"
                value={newSample.batch}
                onChange={(e) => setNewSample({ ...newSample, batch: e.target.value })}
                placeholder="请输入批次号"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">初始库存</label>
              <input
                type="number"
                min="0"
                value={newSample.stockQuantity}
                onChange={(e) => setNewSample({ ...newSample, stockQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">预警阈值</label>
              <input
                type="number"
                min="0"
                value={newSample.warningThreshold}
                onChange={(e) => setNewSample({ ...newSample, warningThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
              <input
                type="text"
                value={newSample.unit}
                onChange={(e) => setNewSample({ ...newSample, unit: e.target.value })}
                placeholder="个/件/套/箱"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={newSample.description}
              onChange={(e) => setNewSample({ ...newSample, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddSample}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加样品
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title="调整库存"
        size="md"
      >
        {selectedSample && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-800">{selectedSample.name}</p>
              <p className="text-sm text-gray-500">当前库存：{selectedSample.stockQuantity} {selectedSample.unit}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                调整数量（正数入库，负数出库）*
              </label>
              <input
                type="number"
                value={stockUpdate.quantity}
                onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {stockUpdate.quantity !== 0 && (
                <p className={cn(
                  'mt-1 text-sm',
                  stockUpdate.quantity > 0 ? 'text-emerald-600' : 'text-red-600'
                )}>
                  调整后库存：{selectedSample.stockQuantity + stockUpdate.quantity} {selectedSample.unit}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">操作人 *</label>
              <input
                type="text"
                value={stockUpdate.operator}
                onChange={(e) => setStockUpdate({ ...stockUpdate, operator: e.target.value })}
                placeholder="请输入操作人姓名"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea
                value={stockUpdate.remark}
                onChange={(e) => setStockUpdate({ ...stockUpdate, remark: e.target.value })}
                rows={2}
                placeholder="请输入调整原因..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setStockModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpdateStock}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                确认调整
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
