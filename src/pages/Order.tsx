import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ShoppingCart, Minus, Plus, Clock, Phone, MessageSquare, Check, AlertTriangle } from 'lucide-react';
import type { OrderItem } from '@/types';

interface ConfigState {
  productId: string;
  productName: string;
  flavor: string;
  selectedAddOns: string[];
  quantity: number;
}

export default function Order() {
  const products = useStore((s) => s.products);
  const addOrder = useStore((s) => s.addOrder);

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [configModal, setConfigModal] = useState<ConfigState | null>(null);
  const [pickupTime, setPickupTime] = useState('');
  const [phoneLastFour, setPhoneLastFour] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [stockErrors, setStockErrors] = useState<string[]>([]);

  const categories = [...new Set(products.map((p) => p.category))];

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProductClick = (product: typeof products[0]) => {
    if (product.stock <= 0) return;
    if (product.flavor.length <= 1 && product.addOns.length === 0) {
      const existing = cart.find(
        (item) =>
          item.productId === product.id &&
          item.flavor === (product.flavor[0] || '') &&
          item.selectedAddOns.length === 0
      );
      if (existing) {
        setCart(
          cart.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
              : item
          )
        );
      } else {
        setCart([
          ...cart,
          {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            flavor: product.flavor[0] || '',
            selectedAddOns: [],
            quantity: 1,
          },
        ]);
      }
      return;
    }
    setConfigModal({
      productId: product.id,
      productName: product.name,
      flavor: product.flavor[0] || '',
      selectedAddOns: [],
      quantity: 1,
    });
  };

  const handleConfirmConfig = () => {
    if (!configModal) return;
    setCart([
      ...cart,
      {
        id: `${configModal.productId}-${Date.now()}`,
        productId: configModal.productId,
        productName: configModal.productName,
        flavor: configModal.flavor,
        selectedAddOns: configModal.selectedAddOns,
        quantity: configModal.quantity,
      },
    ]);
    setConfigModal(null);
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
    setStockErrors([]);
  };

  const handleSubmit = () => {
    setStockErrors([]);

    if (cart.length === 0) {
      showToast('请至少选择一件商品', 'error');
      return;
    }
    if (!pickupTime) {
      showToast('请选择取餐时间', 'error');
      return;
    }
    if (!/^\d{4}$/.test(phoneLastFour)) {
      showToast('请输入4位手机尾号', 'error');
      return;
    }

    const result = addOrder({
      items: cart,
      pickupTime,
      phoneLastFour,
      notes,
      paymentStatus,
      orderStatus: 'pending',
    });

    if (!result.success) {
      setStockErrors(result.insufficientProducts);
      return;
    }

    showToast('下单成功！', 'success');
    setCart([]);
    setPickupTime('');
    setPhoneLastFour('');
    setNotes('');
    setPaymentStatus('unpaid');
    setStockErrors([]);
  };

  return (
    <div className="flex h-full gap-6 p-6">
      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="section-title mb-4">{category}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products
                .filter((p) => p.category === category)
                .map((product) => (
                  <div
                    key={product.id}
                    className={`card p-3 cursor-pointer relative ${
                      product.stock <= 0 ? 'opacity-50 pointer-events-none' : ''
                    }`}
                    onClick={() => handleProductClick(product)}
                  >
                    <img
                      src={product.photoUrl}
                      alt={product.name}
                      className="h-24 w-full object-cover rounded-lg"
                    />
                    <div className="mt-2">
                      <div className="font-medium text-brown-800">{product.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {product.flavor.length > 1 && (
                          <span className="tag-orange">{product.flavor.length}种口味</span>
                        )}
                        {product.addOns.length > 0 && (
                          <span className="tag-green">{product.addOns.length}种加料</span>
                        )}
                      </div>
                      <div className="text-sm text-brown-500 mt-1">
                        库存: {product.stock}
                      </div>
                    </div>
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl">
                        <span className="text-red-500 font-bold text-lg">已售罄</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="w-96 flex-shrink-0">
        <div className="card p-5 h-full flex flex-col sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-brand-500" />
            <h2 className="section-title">订单摘要</h2>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
            {cart.length === 0 && (
              <p className="text-brown-400 text-sm text-center py-6">暂无商品，点击左侧添加</p>
            )}
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-brand-50 rounded-xl p-3 animate-slide-in"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-brown-800">{item.productName}</div>
                    {item.flavor && (
                      <div className="text-xs text-brown-500 mt-0.5">口味: {item.flavor}</div>
                    )}
                    {item.selectedAddOns.length > 0 && (
                      <div className="text-xs text-brown-500">
                        加料: {item.selectedAddOns.join('、')}
                      </div>
                    )}
                    <div className="text-xs text-brown-500 mt-0.5">数量: {item.quantity}</div>
                  </div>
                  <button
                    className="text-red-400 hover:text-red-600 text-sm ml-2 transition-colors"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    移除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {stockErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 animate-slide-in">
              <div className="flex items-center gap-1.5 text-red-600 font-medium text-sm mb-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                库存不足，以下商品无法满足：
              </div>
              <ul className="space-y-0.5">
                {stockErrors.map((err, i) => (
                  <li key={i} className="text-sm text-red-500 pl-6">· {err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3 border-t border-brand-100 pt-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-brown-700 mb-1.5">
                <Clock className="w-4 h-4" /> 取餐时间
              </label>
              <input
                type="time"
                className="input-field"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-brown-700 mb-1.5">
                <Phone className="w-4 h-4" /> 手机尾号
              </label>
              <input
                type="text"
                className="input-field"
                maxLength={4}
                pattern="\d{4}"
                placeholder="请输入4位数字"
                value={phoneLastFour}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPhoneLastFour(val);
                }}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-brown-700 mb-1.5">
                <MessageSquare className="w-4 h-4" /> 备注
              </label>
              <textarea
                className="input-field resize-none"
                rows={2}
                placeholder="如有特殊需求请备注"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-brown-700">支付状态:</span>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  paymentStatus === 'paid'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-600'
                }`}
                onClick={() =>
                  setPaymentStatus(paymentStatus === 'paid' ? 'unpaid' : 'paid')
                }
              >
                {paymentStatus === 'paid' ? '已支付' : '未支付'}
              </button>
            </div>

            <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={handleSubmit}>
              <Check className="w-4 h-4" />
              提交订单
            </button>
          </div>
        </div>
      </div>

      {configModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setConfigModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-96 shadow-xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="section-title mb-4">{configModal.productName}</h3>

            {(() => {
              const product = products.find((p) => p.id === configModal.productId);
              if (!product) return null;

              return (
                <>
                  {product.flavor.length > 1 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-brown-700 mb-2">口味</div>
                      <div className="flex flex-wrap gap-2">
                        {product.flavor.map((f) => (
                          <label
                            key={f}
                            className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all border ${
                              configModal.flavor === f
                                ? 'bg-brand-500 text-white border-brand-500'
                                : 'bg-white text-brown-700 border-brand-200 hover:border-brand-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="flavor"
                              className="sr-only"
                              checked={configModal.flavor === f}
                              onChange={() =>
                                setConfigModal({ ...configModal, flavor: f })
                              }
                            />
                            {f}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.addOns.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-brown-700 mb-2">加料</div>
                      <div className="flex flex-wrap gap-2">
                        {product.addOns.map((addon) => (
                          <label
                            key={addon}
                            className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all border ${
                              configModal.selectedAddOns.includes(addon)
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-white text-brown-700 border-brand-200 hover:border-brand-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={configModal.selectedAddOns.includes(addon)}
                              onChange={() => {
                                const addons = configModal.selectedAddOns.includes(addon)
                                  ? configModal.selectedAddOns.filter((a) => a !== addon)
                                  : [...configModal.selectedAddOns, addon];
                                setConfigModal({ ...configModal, selectedAddOns: addons });
                              }}
                            />
                            {addon}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="mb-6">
              <div className="text-sm font-medium text-brown-700 mb-2">数量</div>
              <div className="flex items-center gap-3">
                <button
                  className="btn-secondary p-2 rounded-lg"
                  onClick={() =>
                    setConfigModal({
                      ...configModal,
                      quantity: Math.max(1, configModal.quantity - 1),
                    })
                  }
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium text-brown-800 w-8 text-center">
                  {configModal.quantity}
                </span>
                <button
                  className="btn-secondary p-2 rounded-lg"
                  onClick={() =>
                    setConfigModal({
                      ...configModal,
                      quantity: Math.min(10, configModal.quantity + 1),
                    })
                  }
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => setConfigModal(null)}
              >
                取消
              </button>
              <button
                className="btn-primary flex-1"
                onClick={handleConfirmConfig}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium animate-slide-in ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
