import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { Product } from '@/types';
import { getProductStatus } from '@/utils/priceUtils';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'normal', label: '正常' },
  { value: 'near_expiry', label: '临期' },
  { value: 'clearance', label: '清仓' },
  { value: 'expired', label: '已过期' },
  { value: 'sold_out', label: '售罄' },
];

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, loadProducts } = useProductStore();
  const { batches, loadBatches, refreshBatchStatuses, getBatchesByProductId } = useInventoryStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadProducts();
    loadBatches();
  }, [loadProducts, loadBatches]);

  useEffect(() => {
    if (products.length > 0) {
      refreshBatchStatuses();
    }
  }, [products.length, refreshBatchStatuses]);

  const brands = [...new Set(products.map(p => p.brand))];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.brand.includes(searchTerm) ||
        p.flavor.includes(searchTerm) ||
        p.specification.includes(searchTerm);
      const matchBrand = !filterBrand || p.brand === filterBrand;
      const matchStatus = !filterStatus || getProductStatus(getBatchesByProductId(p.id)) === filterStatus;
      return matchSearch && matchBrand && matchStatus;
    });
  }, [products, searchTerm, filterBrand, filterStatus, batches]);

  const emptyStateText = (() => {
    if (filterStatus && filterBrand && searchTerm) {
      return `没有符合搜索条件、"${brands.find(b => b === filterBrand) || ''}"品牌和"${statusOptions.find(s => s.value === filterStatus)?.label}"状态的商品`;
    }
    if (filterStatus && filterBrand) {
      return `没有"${brands.find(b => b === filterBrand) || ''}"品牌且"${statusOptions.find(s => s.value === filterStatus)?.label}"状态的商品`;
    }
    if (filterStatus && searchTerm) {
      return `没有符合搜索条件且"${statusOptions.find(s => s.value === filterStatus)?.label}"状态的商品`;
    }
    if (filterBrand && searchTerm) {
      return `没有符合搜索条件的"${brands.find(b => b === filterBrand) || ''}"品牌商品`;
    }
    if (filterStatus) {
      return `没有"${statusOptions.find(s => s.value === filterStatus)?.label}"状态的商品`;
    }
    if (filterBrand) {
      return `没有"${brands.find(b => b === filterBrand) || ''}"品牌的商品`;
    }
    if (searchTerm) {
      return '没有匹配搜索条件的商品';
    }
    return '暂无商品数据';
  })();

  const handleAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个商品吗？')) {
      deleteProduct(id);
    }
  };

  const handleSubmit = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
  };

  const handleAddStock = (product: Product) => {
    window.location.href = `/inventory?productId=${product.id}`;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">商品档案</h1>
            <p className="text-gray-500 mt-1">管理所有酸奶商品信息</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-5 h-5" />
            新增商品
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索品牌、口味、规格..."
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
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部品牌</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">{emptyStateText}</p>
            {!filterStatus && !filterBrand && !searchTerm && (
              <button
                onClick={handleAdd}
                className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
              >
                立即添加
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddStock={handleAddStock}
              />
            ))}
          </div>
        )}
      </div>

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        product={editingProduct}
      />
    </>
  );
}
