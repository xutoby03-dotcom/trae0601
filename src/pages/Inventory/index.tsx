import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Package, TrendingDown } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { getBatchStatusLabel, getBatchStatusColor, getBatchPrice } from '@/utils/priceUtils';
import { formatMoney, formatDate, getDaysUntilExpiry } from '@/utils/dateUtils';
import StockInForm from './StockInForm';

export default function InventoryPage() {
  const { products, loadProducts } = useProductStore();
  const { batches, addBatch, loadBatches, getBatchesByProductId, refreshBatchStatuses } = useInventoryStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProduct, setFilterProduct] = useState('');

  useEffect(() => {
    loadProducts();
    loadBatches();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('productId');
    if (productId) {
      setSelectedProductId(productId);
      setIsFormOpen(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshBatchStatuses();
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshBatchStatuses]);

  const handleStockIn = (data: { productId: string; quantity: number; productionDate: string; expiryDate: string; supplier: string }) => {
    addBatch({
      productId: data.productId,
      quantity: data.quantity,
      remainingQuantity: data.quantity,
      productionDate: data.productionDate,
      expiryDate: data.expiryDate,
      supplier: data.supplier,
    });
  };

  const getProductById = (productId: string) => products.find(p => p.id === productId);

  const filteredBatches = batches.filter(b => {
    const product = getProductById(b.productId);
    if (!product) return false;
    
    const matchSearch = product.brand.includes(searchTerm) ||
      product.flavor.includes(searchTerm);
    const matchStatus = !filterStatus || b.status === filterStatus;
    const matchProduct = !filterProduct || b.productId === filterProduct;
    
    return matchSearch && matchStatus && matchProduct;
  }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'normal', label: '正常' },
    { value: 'near_expiry', label: '临期折扣' },
    { value: 'clearance', label: '清仓甩卖' },
    { value: 'expired', label: '已过期' },
    { value: 'sold_out', label: '已售罄' },
  ];

  const groupedByProduct = products.map(product => ({
    product,
    batches: getBatchesByProductId(product.id),
    totalStock: getBatchesByProductId(product.id).reduce((sum, b) => sum + b.remainingQuantity, 0),
  })).filter(item => {
    if (filterProduct && filterProduct !== item.product.id) return false;
    if (filterStatus || searchTerm) {
      return item.batches.some(b => {
        const matchSearch = item.product.brand.includes(searchTerm) || item.product.flavor.includes(searchTerm);
        const matchStatus = !filterStatus || b.status === filterStatus;
        return matchSearch && matchStatus;
      });
    }
    return item.batches.length > 0;
  }).sort((a, b) => b.totalStock - a.totalStock);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">批次库存</h1>
          <p className="text-gray-500 mt-1">管理所有批次的入库和库存状态</p>
        </div>
        <button
          onClick={() => { setSelectedProductId(undefined); setIsFormOpen(true); }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          新增入库
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">总库存量</p>
              <p className="text-2xl font-bold text-gray-800">
                {batches.reduce((sum, b) => sum + b.remainingQuantity, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">临期商品</p>
              <p className="text-2xl font-bold text-orange-600">
                {batches.filter(b => b.status === 'near_expiry' || b.status === 'clearance').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">已过期</p>
              <p className="text-2xl font-bold text-red-600">
                {batches.filter(b => b.status === 'expired').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">商品种类</p>
              <p className="text-2xl font-bold text-gray-800">{products.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索品牌、口味..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部商品</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.brand} - {p.flavor}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {groupedByProduct.map(({ product, batches: productBatches, totalStock }) => {
          const displayBatches = productBatches.filter(b => {
            const matchSearch = product.brand.includes(searchTerm) || product.flavor.includes(searchTerm);
            const matchStatus = !filterStatus || b.status === filterStatus;
            return matchSearch && matchStatus;
          });

          if (displayBatches.length === 0) return null;

          return (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={product.imageUrl}
                    alt={product.flavor}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-800">{product.brand} {product.flavor}</h3>
                    <p className="text-sm text-gray-500">{product.specification} · {product.fridgeLocation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">库存总量</p>
                  <p className="text-xl font-bold text-blue-600">{totalStock} 件</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm border-b">
                      <th className="px-4 py-3 font-medium">批次号</th>
                      <th className="px-4 py-3 font-medium">生产日期</th>
                      <th className="px-4 py-3 font-medium">到期日期</th>
                      <th className="px-4 py-3 font-medium">剩余天数</th>
                      <th className="px-4 py-3 font-medium">入库数量</th>
                      <th className="px-4 py-3 font-medium">剩余数量</th>
                      <th className="px-4 py-3 font-medium">当前售价</th>
                      <th className="px-4 py-3 font-medium">供应商</th>
                      <th className="px-4 py-3 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBatches.map(batch => {
                      const daysLeft = getDaysUntilExpiry(batch.expiryDate);
                      const currentPrice = getBatchPrice(product.salePrice, batch.expiryDate);

                      return (
                        <tr key={batch.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-sm text-gray-600">{batch.id.slice(0, 8)}</td>
                          <td className="px-4 py-3 text-gray-700">{formatDate(batch.productionDate)}</td>
                          <td className="px-4 py-3 text-gray-700">{formatDate(batch.expiryDate)}</td>
                          <td className="px-4 py-3">
                            <span className={`font-medium ${
                              daysLeft < 0 ? 'text-red-600' :
                              daysLeft <= 1 ? 'text-red-500' :
                              daysLeft <= 3 ? 'text-orange-500' : 'text-green-600'
                            }`}>
                              {daysLeft < 0 ? `已过期 ${Math.abs(daysLeft)} 天` : `${daysLeft} 天`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{batch.quantity}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{batch.remainingQuantity}</td>
                          <td className="px-4 py-3 font-bold text-blue-600">{formatMoney(currentPrice)}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{batch.supplier}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getBatchStatusColor(batch.status)}`}>
                              {getBatchStatusLabel(batch.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {groupedByProduct.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">暂无批次数据</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
            >
              立即入库
            </button>
          </div>
        )}
      </div>

      <StockInForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleStockIn}
        products={products}
        selectedProductId={selectedProductId}
      />
    </div>
  );
}
