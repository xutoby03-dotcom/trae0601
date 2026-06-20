import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, PlusCircle, MinusCircle, Package, AlertTriangle, Clock, Ban } from 'lucide-react';
import { productApi } from '../services/api';
import { useStore } from '../store';
import type { Product, ProductCreate } from '../../shared/types';

export default function Products() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<ProductCreate>>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'lowStock' | 'expiring' | 'offline'>('all');

  const { products, setProducts, setAlerts } = useStore();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [products, alerts] = await Promise.all([
      productApi.getAll(),
      productApi.getAlerts(),
    ]);
    setProducts(products);
    setAlerts(alerts);
  }

  function handleAdd() {
    setEditingProduct(null);
    setFormData({
      name: '',
      spec: '',
      flavor: '',
      costPrice: 0,
      salePrice: 0,
      expiryDate: '',
      shelfPosition: '',
      photo: '',
      stock: 0,
      barcode: '',
    });
    setShowModal(true);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      spec: product.spec,
      flavor: product.flavor,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      expiryDate: product.expiryDate,
      shelfPosition: product.shelfPosition,
      photo: product.photo,
      stock: product.stock,
      barcode: product.barcode,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, formData as any);
      } else {
        await productApi.create(formData as ProductCreate);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定要删除这个商品吗？')) return;
    await productApi.delete(id);
    loadData();
  }

  async function handleRestock(id: number, quantity: number) {
    await productApi.restock(id, quantity);
    loadData();
  }

  async function handleToggleStatus(product: Product) {
    const newStatus = product.status === 'active' ? 'offline' : 'active';
    await productApi.update(product.id, { status: newStatus });
    loadData();
  }

  function getStatusBadge(product: Product) {
    const today = new Date();
    const expiry = new Date(product.expiryDate);
    const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (product.status === 'expired' || daysToExpiry < 0) {
      return { icon: Ban, text: '已过期', color: 'bg-danger-100 text-danger-600' };
    }
    if (product.status === 'damaged') {
      return { icon: AlertTriangle, text: '破损', color: 'bg-warning-100 text-warning-600' };
    }
    if (product.status === 'offline') {
      return { icon: Ban, text: '已下架', color: 'bg-gray-100 text-gray-500' };
    }
    if (product.stock < 5) {
      return { icon: AlertTriangle, text: '低库存', color: 'bg-danger-100 text-danger-600' };
    }
    if (daysToExpiry < 30) {
      return { icon: Clock, text: `临期${daysToExpiry}天`, color: 'bg-warning-100 text-warning-600' };
    }
    return { icon: Package, text: '正常', color: 'bg-success-100 text-success-600' };
  }

  const filteredProducts = products.filter(p => {
    const today = new Date();
    const expiry = new Date(p.expiryDate);
    const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (filter === 'active') return p.status === 'active';
    if (filter === 'lowStock') return p.stock < 5 && p.status === 'active';
    if (filter === 'expiring') return daysToExpiry < 30 && daysToExpiry >= 0 && p.status === 'active';
    if (filter === 'offline') return p.status !== 'active';
    return true;
  });

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '在售' },
    { key: 'lowStock', label: '低库存' },
    { key: 'expiring', label: '临期' },
    { key: 'offline', label: '已下架' },
  ];

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-gray-800 mb-2">商品管理</h1>
            <p className="text-gray-500">管理零食柜商品档案和库存</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-200 transition-all active:scale-98"
          >
            <Plus className="w-5 h-5" />
            添加商品
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === f.key
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                  : 'bg-white text-gray-600 hover:bg-orange-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">商品</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">规格/口味</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">进货价</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">售价</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">库存</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">保质期</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">柜格</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product, idx) => {
                const badge = getStatusBadge(product);
                const BadgeIcon = badge.icon;
                return (
                  <tr key={product.id} className="hover:bg-orange-50/50 transition-colors animate-slide-up" style={{ animationDelay: `${idx * 20}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.photo} alt={product.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.barcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p>{product.spec}</p>
                      <p className="text-gray-400">{product.flavor}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">¥{product.costPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium text-primary-600">¥{product.salePrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRestock(product.id, -1)} className="text-gray-400 hover:text-danger-500">
                          <MinusCircle className="w-4 h-4" />
                        </button>
                        <span className={`font-medium min-w-[40px] text-center ${product.stock < 5 ? 'text-danger-600' : 'text-gray-800'}`}>
                          {product.stock}
                        </span>
                        <button onClick={() => handleRestock(product.id, 1)} className="text-gray-400 hover:text-primary-500">
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.expiryDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.shelfPosition}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(product)} className="p-2 hover:bg-orange-100 rounded-lg text-gray-500 hover:text-primary-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleStatus(product)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors">
                          {product.status === 'active' ? <Ban className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-danger-50 rounded-lg text-gray-500 hover:text-danger-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <h2 className="font-display text-2xl text-gray-800 mb-6">
              {editingProduct ? '编辑商品' : '添加商品'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">商品名称 *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">条码</label>
                  <input
                    type="text"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">规格</label>
                  <input
                    type="text"
                    value={formData.spec || ''}
                    onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">口味</label>
                  <input
                    type="text"
                    value={formData.flavor || ''}
                    onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">进货价 *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice || ''}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">售价 *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice || ''}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">保质期</label>
                  <input
                    type="date"
                    value={formData.expiryDate || ''}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">柜格位置</label>
                  <input
                    type="text"
                    value={formData.shelfPosition || ''}
                    onChange={(e) => setFormData({ ...formData, shelfPosition: e.target.value })}
                    placeholder="如：A1-01"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">初始库存</label>
                  <input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">商品图片URL</label>
                  <input
                    type="text"
                    value={formData.photo || ''}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {formData.photo && (
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">图片预览</label>
                  <img src={formData.photo} alt="预览" className="w-32 h-32 object-cover rounded-xl bg-gray-100" />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-100 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-200 transition-all"
                >
                  {editingProduct ? '保存修改' : '添加商品'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
