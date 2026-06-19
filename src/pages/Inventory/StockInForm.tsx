import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X } from 'lucide-react';
import { addDaysToDate, getTodayString } from '@/utils/dateUtils';

interface StockInFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    productId: string;
    quantity: number;
    productionDate: string;
    expiryDate: string;
    supplier: string;
  }) => void;
  products: Product[];
  selectedProductId?: string;
}

export default function StockInForm({ isOpen, onClose, onSubmit, products, selectedProductId }: StockInFormProps) {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    productionDate: getTodayString(),
    expiryDate: '',
    supplier: '',
  });

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setFormData(prev => ({
          ...prev,
          productId: selectedProductId,
          expiryDate: addDaysToDate(getTodayString(), product.shelfLifeDays),
        }));
      }
    } else if (products.length > 0 && !formData.productId) {
      setFormData(prev => ({
        ...prev,
        productId: products[0].id,
        expiryDate: addDaysToDate(getTodayString(), products[0].shelfLifeDays),
      }));
    }
  }, [selectedProductId, products, isOpen]);

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const expiryDate = product
      ? addDaysToDate(formData.productionDate, product.shelfLifeDays)
      : '';
    setFormData({ ...formData, productId, expiryDate });
  };

  const handleProductionDateChange = (date: string) => {
    const product = products.find(p => p.id === formData.productId);
    const expiryDate = product
      ? addDaysToDate(date, product.shelfLifeDays)
      : '';
    setFormData({ ...formData, productionDate: date, expiryDate });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: formData.quantity,
      remainingQuantity: formData.quantity,
    } as any);
    onClose();
  };

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === formData.productId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">入库登记</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品
            </label>
            <select
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">请选择商品</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.brand} - {product.flavor} ({product.specification})
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                入库数量
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入数量"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                进货总价
              </label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                {selectedProduct ? `¥${(selectedProduct.costPrice * formData.quantity).toFixed(2)}` : '-'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                生产日期
              </label>
              <input
                type="date"
                value={formData.productionDate}
                onChange={(e) => handleProductionDateChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                到期日期
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {selectedProduct && (
                <p className="text-xs text-gray-400 mt-1">
                  保质期 {selectedProduct.shelfLifeDays} 天
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              供应商
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入供应商名称"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              确认入库
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
