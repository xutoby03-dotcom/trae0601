import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, X, Check } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSaleStore } from '@/store/saleStore';
import { Product, CartItem, SaleItem, PriceType } from '@/types';
import { formatMoney, generateId } from '@/utils/dateUtils';
import { getBatchPrice, getPriceTypeLabel, calculateSaleItems, getPriceType } from '@/utils/priceUtils';
import { isExpired } from '@/utils/dateUtils';

export default function POSPage() {
  const { products, loadProducts } = useProductStore();
  const { batches, getAvailableBatchesByProductId, decreaseBatchQuantity, loadBatches, refreshBatchStatuses } = useInventoryStore();
  const { addSale } = useSaleStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('微信支付');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadProducts();
    loadBatches();
    refreshBatchStatuses();
  }, []);

  const filteredProducts = products.filter(p => {
    const availableBatches = getAvailableBatchesByProductId(p.id);
    const hasStock = availableBatches.length > 0 && availableBatches.some(b => b.remainingQuantity > 0);
    const matchSearch = p.brand.includes(searchTerm) ||
      p.flavor.includes(searchTerm) ||
      p.specification.includes(searchTerm);
    return hasStock && matchSearch;
  });

  const getProductStock = (productId: string): number => {
    return getAvailableBatchesByProductId(productId)
      .reduce((sum, b) => sum + b.remainingQuantity, 0);
  };

  const getCurrentPrice = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    const batches = getAvailableBatchesByProductId(productId);
    if (!product || batches.length === 0) return 0;
    return getBatchPrice(product.salePrice, batches[0].expiryDate);
  };

  const addToCart = (product: Product) => {
    const stock = getProductStock(product.id);
    const existingItem = cart.find(item => item.productId === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    if (currentQty >= stock) return;
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { productId: product.id, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        const stock = getProductStock(productId);
        if (newQty > stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateCartTotal = (): { total: number; discount: number; actual: number } => {
    let total = 0;
    let actual = 0;
    
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;
      
      const productBatches = getAvailableBatchesByProductId(item.productId);
      const saleItems = calculateSaleItems(productBatches, product.salePrice, item.quantity);
      
      saleItems.forEach(si => {
        total += product.salePrice * si.quantity;
        actual += si.unitPrice * si.quantity;
      });
    });
    
    return {
      total,
      discount: total - actual,
      actual,
    };
  };

  const cartTotal = calculateCartTotal();

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const saleId = generateId();
    const saleItems: SaleItem[] = [];

    cart.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      if (!product) return;

      const productBatches = getAvailableBatchesByProductId(cartItem.productId);
      const calculatedItems = calculateSaleItems(productBatches, product.salePrice, cartItem.quantity);

      calculatedItems.forEach(item => {
        decreaseBatchQuantity(item.batchId, item.quantity);
        
        saleItems.push({
          id: generateId(),
          saleId,
          batchId: item.batchId,
          productId: cartItem.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
          priceType: item.priceType as PriceType,
        });
      });
    });

    addSale({
      totalAmount: cartTotal.total,
      discountAmount: cartTotal.discount,
      actualAmount: cartTotal.actual,
      saleTime: new Date().toISOString(),
      paymentMethod,
      items: saleItems,
    });

    setCart([]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const getCartItemDetail = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(c => c.productId === productId);
    if (!product || !cartItem) return null;

    const productBatches = getAvailableBatchesByProductId(productId);
    const calculatedItems = calculateSaleItems(productBatches, product.salePrice, cartItem.quantity);
    const subtotal = calculatedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const originalTotal = product.salePrice * cartItem.quantity;

    return {
      product,
      quantity: cartItem.quantity,
      subtotal,
      originalTotal,
      priceTypes: [...new Set(calculatedItems.map(i => i.priceType))],
    };
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索商品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              暂无可用商品
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => {
                const stock = getProductStock(product.id);
                const currentPrice = getCurrentPrice(product.id);
                const batches = getAvailableBatchesByProductId(product.id);
                const priceType = batches.length > 0 ? getPriceType(batches[0].expiryDate) : 'normal';
                const inCart = cart.find(c => c.productId === product.id)?.quantity || 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-blue-50 hover:shadow-md transition-all duration-200 active:scale-95"
                  >
                    <div className="relative mb-2">
                      <img
                        src={product.imageUrl}
                        alt={product.flavor}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {priceType !== 'normal' && (
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold text-white ${
                          priceType === 'discount' ? 'bg-orange-500' : 'bg-red-500'
                        }`}>
                          {getPriceTypeLabel(priceType)}
                        </div>
                      )}
                      {inCart > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {inCart}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {product.brand} {product.flavor}
                      </p>
                      <p className="text-xs text-gray-500">{product.specification}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-lg font-bold text-blue-600">
                          {formatMoney(currentPrice)}
                        </span>
                        <span className="text-xs text-gray-400">库存: {stock}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-96 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">购物车</h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              清空
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
              <p>购物车为空</p>
              <p className="text-sm">点击左侧商品添加</p>
            </div>
          ) : (
            <div className="divide-y">
              {cart.map(item => {
                const detail = getCartItemDetail(item.productId);
                if (!detail) return null;
                const { product, quantity, subtotal, originalTotal, priceTypes } = detail;

                return (
                  <div key={item.productId} className="p-4 hover:bg-gray-50">
                    <div className="flex gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.flavor}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {product.brand} {product.flavor}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {priceTypes.map(pt => (
                            <span key={pt} className={`text-xs px-2 py-0.5 rounded ${
                              pt === 'normal' ? 'bg-gray-100 text-gray-600' :
                              pt === 'discount' ? 'bg-orange-100 text-orange-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {getPriceTypeLabel(pt as PriceType)}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, -1); }}
                              className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                              className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">{formatMoney(subtotal)}</p>
                            {originalTotal > subtotal && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatMoney(originalTotal)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t p-4 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>商品原价</span>
              <span>{formatMoney(cartTotal.total)}</span>
            </div>
            {cartTotal.discount > 0 && (
              <div className="flex justify-between text-orange-500">
                <span>促销优惠</span>
                <span>-{formatMoney(cartTotal.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>应付金额</span>
              <span className="text-red-500">{formatMoney(cartTotal.actual)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod('微信支付')}
              className={`flex-1 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                paymentMethod === '微信支付'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              <span className="text-lg">💚</span>
              <span className="text-sm font-medium">微信</span>
            </button>
            <button
              onClick={() => setPaymentMethod('支付宝')}
              className={`flex-1 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                paymentMethod === '支付宝'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              <span className="text-lg">💙</span>
              <span className="text-sm font-medium">支付宝</span>
            </button>
            <button
              onClick={() => setPaymentMethod('现金')}
              className={`flex-1 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                paymentMethod === '现金'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span className="text-sm font-medium">现金</span>
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              cart.length > 0
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 active:scale-98'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            结算收款
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">收款成功</h3>
            <p className="text-gray-500">
              {paymentMethod} · {formatMoney(cartTotal.actual)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
