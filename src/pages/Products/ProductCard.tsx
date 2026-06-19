import { Product } from '@/types';
import { getBatchStatusLabel, getBatchStatusColor, getBatchPrice, getPriceType, getPriceTypeLabel } from '@/utils/priceUtils';
import { formatMoney, getDaysUntilExpiry } from '@/utils/dateUtils';
import { useInventoryStore } from '@/store/inventoryStore';
import { Package, MapPin, Calendar, Clock, Tag, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddStock: (product: Product) => void;
}

export default function ProductCard({ product, onEdit, onDelete, onAddStock }: ProductCardProps) {
  const batches = useInventoryStore((state) => state.getBatchesByProductId(product.id));
  const totalStock = batches.reduce((sum, b) => sum + b.remainingQuantity, 0);
  
  const availableBatches = batches.filter(b => b.remainingQuantity > 0);
  const earliestBatch = availableBatches.length > 0 ? availableBatches[0] : null;
  const earliestExpiry = earliestBatch?.expiryDate || null;
  const daysUntilExpiry = earliestExpiry ? getDaysUntilExpiry(earliestExpiry) : null;

  const nearExpiryCount = batches
    .filter(b => b.status === 'near_expiry')
    .reduce((sum, b) => sum + b.remainingQuantity, 0);
  
  const clearanceCount = batches
    .filter(b => b.status === 'clearance')
    .reduce((sum, b) => sum + b.remainingQuantity, 0);

  const currentPrice = earliestBatch ? getBatchPrice(product.salePrice, earliestBatch.expiryDate) : product.salePrice;
  const currentPriceType = earliestBatch ? getPriceType(earliestBatch.expiryDate) : 'normal';
  const hasDiscount = currentPriceType !== 'normal' && earliestBatch;

  const getWorstStatus = () => {
    if (availableBatches.length === 0) return 'sold_out';
    return availableBatches[0].status;
  };

  const status = getWorstStatus();
  const statusColor = getBatchStatusColor(status);
  const statusLabel = getBatchStatusLabel(status);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="relative h-40 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={`${product.brand} ${product.flavor}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
          {statusLabel}
        </div>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
          {product.brand}
        </div>
        {hasDiscount && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
              currentPriceType === 'discount' ? 'bg-orange-500' : 'bg-red-500'
            }`}>
              {getPriceTypeLabel(currentPriceType)} · {formatMoney(currentPrice)}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{product.flavor}</h3>
            <p className="text-gray-500 text-sm">{product.specification}</p>
          </div>
          <div className="text-right">
            {hasDiscount ? (
              <>
                <p className="text-xl font-bold text-blue-600">{formatMoney(currentPrice)}</p>
                <p className="text-xs text-gray-400 line-through">{formatMoney(product.salePrice)}</p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-blue-600">{formatMoney(product.salePrice)}</p>
                <p className="text-xs text-gray-400 line-through">{formatMoney(product.costPrice)}</p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>库存: {totalStock}</span>
          </div>
          {earliestExpiry && daysUntilExpiry !== null && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className={daysUntilExpiry <= 1 ? 'text-red-500 font-medium' : daysUntilExpiry <= 3 ? 'text-orange-500 font-medium' : ''}>
                {daysUntilExpiry < 0 ? '已过期' : `${daysUntilExpiry}天到期`}
              </span>
            </div>
          )}
        </div>

        {(nearExpiryCount > 0 || clearanceCount > 0) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {nearExpiryCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-xs">
                <AlertTriangle className="w-3 h-3" />
                <span>临期{nearExpiryCount}件</span>
              </div>
            )}
            {clearanceCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs">
                <Tag className="w-3 h-3" />
                <span>清仓{clearanceCount}件</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <MapPin className="w-4 h-4" />
          <span>{product.fridgeLocation}</span>
          {earliestExpiry && (
            <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {earliestExpiry}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onAddStock(product)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            入库
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="bg-red-50 hover:bg-red-100 text-red-500 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
