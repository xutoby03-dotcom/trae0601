import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Calendar, Building2, Box } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Product, TempZone } from '@/types';
import { TEMP_ZONE_LABELS } from '@/types';
import { TempZoneBadge } from '@/components/Badges';
import Modal from '@/components/Modal';
import { classNames, formatDateTime } from '@/utils/helpers';

const emptyForm: Omit<Product, 'id' | 'createdAt'> = {
  name: '',
  spec: '',
  tempZone: 'frozen',
  arrivalTime: new Date().toISOString().slice(0, 16),
  supplier: '',
  boxNumber: '',
  photo: '',
};

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.boxNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      spec: product.spec,
      tempZone: product.tempZone,
      arrivalTime: product.arrivalTime.slice(0, 16),
      supplier: product.supplier,
      boxNumber: product.boxNumber,
      photo: product.photo,
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const data = {
      ...formData,
      arrivalTime: new Date(formData.arrivalTime).toISOString(),
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个团品吗？相关订单也会被删除。')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">团品档案</h1>
          <p className="text-sm text-slate-400 mt-1">管理所有冷冻品团品信息</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          新增团品
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="搜索团品名、供应商、保温箱编号..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
        />
      </div>

      {/* 团品列表 */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>暂无团品数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:border-sky-500/30 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300"
            >
              {/* 图片区域 */}
              <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                {product.photo ? (
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-slate-700" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <TempZoneBadge zone={product.tempZone} />
                </div>
                {/* 操作按钮 */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 rounded-lg bg-slate-900/80 text-slate-300 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{product.spec}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span className="truncate">{product.supplier}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Box className="w-4 h-4 text-slate-500" />
                    <span>{product.boxNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400 pt-2 border-t border-slate-800/60">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>到货: {formatDateTime(product.arrivalTime)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? '编辑团品' : '新增团品'}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
            >
              {editingProduct ? '保存修改' : '确认添加'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">品名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：厄瓜多尔白虾"
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">规格</label>
            <input
              type="text"
              value={formData.spec}
              onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
              placeholder="例如：2kg/盒 (40-50只)"
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">温区</label>
            <select
              value={formData.tempZone}
              onChange={(e) => setFormData({ ...formData, tempZone: e.target.value as TempZone })}
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
            >
              {Object.entries(TEMP_ZONE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">到货时间</label>
            <input
              type="datetime-local"
              value={formData.arrivalTime}
              onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">供应商</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="供应商名称"
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">保温箱编号</label>
            <input
              type="text"
              value={formData.boxNumber}
              onChange={(e) => setFormData({ ...formData, boxNumber: e.target.value })}
              placeholder="例如：BOX-A001"
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">商品照片URL</label>
            <input
              type="text"
              value={formData.photo || ''}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
            {formData.photo && (
              <div className="mt-3">
                <img
                  src={formData.photo}
                  alt="预览"
                  className="w-32 h-32 object-cover rounded-xl border border-slate-700"
                />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
