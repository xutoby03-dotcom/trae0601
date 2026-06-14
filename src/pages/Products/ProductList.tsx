import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Package, Calendar, Clock, Layers } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { getDaysUntil } from '@/utils/date';

export default function ProductList() {
  const navigate = useNavigate();
  const products = useProductStore((state) => state.products);
  const getBatchesByProductId = useProductStore((state) => state.getBatchesByProductId);
  const getBatchUrgency = useProductStore((state) => state.getBatchUrgency);
  const deleteProduct = useProductStore((state) => state.deleteProduct);

  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.flavor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">商品档案</h1>
          <p className="text-stone-500 mt-1">管理所有可试吃的商品信息</p>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-550 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          新增商品
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索商品名称或口味..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-stone-300" />
            </div>
            <p className="text-stone-500 text-lg">暂无商品</p>
            <p className="text-stone-400 text-sm mt-1">点击右上角按钮添加第一个商品</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredProducts.map((product) => {
              const productBatches = getBatchesByProductId(product.id);
              const totalStock = productBatches.reduce((sum, b) => sum + b.stock, 0);
              const nearExpiryCount = productBatches.filter(
                (b) => getBatchUrgency(b) !== 'normal' && getBatchUrgency(b) !== 'expired'
              ).length;

              const nearestBatch = [...productBatches].sort(
                (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
              )[0];
              const daysLeft = nearestBatch ? getDaysUntil(nearestBatch.expiryDate) : null;

              return (
                <div
                  key={product.id}
                  className="p-6 hover:bg-stone-50 transition-colors group"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-stone-100 rounded-2xl flex-shrink-0 overflow-hidden">
                      {product.photo ? (
                        <img
                          src={product.photo}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-stone-300 m-auto" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-stone-800">
                            {product.name}
                          </h3>
                          <span className="inline-block mt-1 px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm">
                            {product.flavor}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                            className="p-2 text-stone-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(product.id)}
                            className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-stone-400" />
                          <span className="text-stone-500">保质期:</span>
                          <span className="text-stone-700 font-medium">
                            {product.shelfLifeDays}天
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-stone-400" />
                          <span className="text-stone-500">开封后:</span>
                          <span className="text-stone-700 font-medium">
                            {product.openDurationHours}小时
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Layers className="w-4 h-4 text-stone-400" />
                          <span className="text-stone-500">批次:</span>
                          <span className="text-stone-700 font-medium">
                            {productBatches.length}个
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="w-4 h-4 text-stone-400" />
                          <span className="text-stone-500">总库存:</span>
                          <span className="text-stone-700 font-medium">{totalStock}</span>
                        </div>
                      </div>

                      {nearestBatch && (
                        <div className="mt-4 flex items-center gap-3">
                          <span className="text-sm text-stone-500">最近批次:</span>
                          <span className="text-sm text-stone-600">
                            {nearestBatch.batchNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              daysLeft !== null && daysLeft <= 3
                                ? 'bg-rose-100 text-rose-700'
                                : daysLeft !== null && daysLeft <= 7
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {daysLeft !== null && daysLeft > 0
                              ? `还有${daysLeft}天过期`
                              : daysLeft !== null && daysLeft === 0
                              ? '今天过期'
                              : '已过期'}
                          </span>
                          {nearExpiryCount > 0 && (
                            <span className="text-xs text-amber-600">
                              ({nearExpiryCount}个临期批次)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-stone-800">确认删除</h3>
            <p className="text-stone-500 mt-2">
              删除商品将同时删除所有相关批次数据，此操作不可撤销。
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
