import { useState } from 'react';
import { Search, QrCode, User, Phone, Package, Clock, CheckCircle2, AlertTriangle, Camera, Snowflake } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Order } from '@/types';
import { OrderStatusBadge, TempZoneBadge } from '@/components/Badges';
import Modal from '@/components/Modal';
import { classNames, formatDateTime, getPickupSlotLabel, timeRemaining } from '@/utils/helpers';

export default function Pickup() {
  const { products, searchOrders, markOrderPicked, getProductInspection } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hasException, setHasException] = useState(false);
  const [exceptionNote, setExceptionNote] = useState('');
  const [exceptionPhotos, setExceptionPhotos] = useState<string[]>([]);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const results = searchQuery.trim() ? searchOrders(searchQuery) : [];
  const pendingResults = results.filter((o) => o.status === 'pending' || o.status === 'timeout');

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setConfirmModalOpen(true);
    setHasException(false);
    setExceptionNote('');
    setExceptionPhotos([]);
  };

  const handleConfirmPickup = () => {
    if (!selectedOrder) return;
    markOrderPicked(selectedOrder.id, hasException, exceptionNote, exceptionPhotos);
    setConfirmModalOpen(false);
    setSelectedOrder(null);
    setSearchQuery('');
    setSuccessModalOpen(true);
    setTimeout(() => setSuccessModalOpen(false), 2000);
  };

  const getProduct = (productId: string) => products.find((p) => p.id === productId);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div>
        <h1 className="text-2xl font-bold text-white">取货确认</h1>
        <p className="text-sm text-slate-400 mt-1">扫码或搜索订单，确认居民取货</p>
      </div>

      {/* 搜索区域 */}
      <div className="relative">
        <div className="relative">
          <QrCode className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-sky-400" />
          <input
            type="text"
            placeholder="输入姓名、手机号后四位或订单号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-20 pr-6 py-5 bg-slate-900/60 border-2 border-slate-800 rounded-2xl text-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/20 transition-all"
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Search className="w-6 h-6 text-slate-500" />
          </div>
        </div>

        {/* 搜索动画效果 */}
        {searchQuery && (
          <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent animate-pulse" />
        )}
      </div>

      {/* 搜索结果 */}
      {searchQuery && (
        <div className="space-y-3">
          {pendingResults.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-800">
              <Search className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="text-slate-500">未找到待取货订单</p>
              <p className="text-xs text-slate-600 mt-1">请检查姓名、手机号后四位是否正确</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400 px-1">
                找到 <span className="text-white font-medium">{pendingResults.length}</span> 个待取货订单
              </p>
              {pendingResults.map((order) => {
                const product = getProduct(order.productId);
                const inspection = product ? getProductInspection(product.id) : undefined;
                const remaining = product ? timeRemaining(order.pickupSlot, product.arrivalTime) : '';
                const isTimeout = order.status === 'timeout' || remaining === '已超时';

                return (
                  <div
                    key={order.id}
                    className={classNames(
                      'group relative overflow-hidden rounded-2xl border p-5 cursor-pointer transition-all duration-300',
                      isTimeout
                        ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
                        : 'border-slate-800 bg-slate-900/60 hover:border-sky-500/30 hover:bg-slate-800/60'
                    )}
                    onClick={() => handleSelectOrder(order)}
                  >
                    <div className="flex items-center gap-5">
                      {/* 头像/图标 */}
                      <div
                        className={classNames(
                          'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
                          isTimeout
                            ? 'bg-red-500/20'
                            : 'bg-gradient-to-br from-sky-500/30 to-cyan-500/20'
                        )}
                      >
                        <User
                          className={classNames(
                            'w-7 h-7',
                            isTimeout ? 'text-red-400' : 'text-sky-400'
                          )}
                        />
                      </div>

                      {/* 主要信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white">{order.customerName}</h3>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-4 h-4" />
                            ****{order.phoneLast4}
                          </span>
                          {product && (
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <Package className="w-4 h-4" />
                              {product.name} x{order.quantity}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-4 h-4" />
                            {getPickupSlotLabel(order.pickupSlot)}
                          </span>
                        </div>
                      </div>

                      {/* 右侧状态 */}
                      <div className="text-right flex-shrink-0">
                        {order.status !== 'picked' && (
                          <div>
                            <p
                              className={classNames(
                                'text-sm font-medium',
                                isTimeout ? 'text-red-400' : 'text-slate-400'
                              )}
                            >
                              {remaining}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-2 mt-2">
                          {product && <TempZoneBadge zone={product.tempZone} />}
                          {order.hasIceBag && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30">
                              <Snowflake className="w-3 h-3" />
                              自带冰袋
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 点击提示 */}
                      <div className="text-slate-500 group-hover:text-sky-400 transition-colors">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 空状态提示 */}
      {!searchQuery && (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-800">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 flex items-center justify-center">
            <QrCode className="w-10 h-10 text-sky-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">开始取货确认</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            在上方输入框中输入居民的姓名、手机号后四位或订单编号来查询订单
          </p>
        </div>
      )}

      {/* 确认取货弹窗 */}
      <Modal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="确认取货"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="px-5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmPickup}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              确认取货
            </button>
          </>
        }
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* 订单信息 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-sky-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-white">{selectedOrder.customerName}</h4>
                  <p className="text-slate-400 mt-0.5">****{selectedOrder.phoneLast4}</p>
                </div>
                <OrderStatusBadge status={selectedOrder.status} />
              </div>

              <div className="mt-5 pt-5 border-t border-slate-700/60 space-y-3">
                {(() => {
                  const product = getProduct(selectedOrder.productId);
                  return product ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          商品
                        </span>
                        <span className="text-white font-medium">
                          {product.name} x{selectedOrder.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">规格</span>
                        <span className="text-slate-300">{product.spec}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          取货时段
                        </span>
                        <span className="text-white">{getPickupSlotLabel(selectedOrder.pickupSlot)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-2">
                          <Snowflake className="w-4 h-4" />
                          冰袋
                        </span>
                        <span className={selectedOrder.hasIceBag ? 'text-sky-400' : 'text-slate-500'}>
                          {selectedOrder.hasIceBag ? '已自带' : '未携带'}
                        </span>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            </div>

            {/* 异常开关 */}
            <div className="p-4 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">取货异常</h4>
                    <p className="text-xs text-slate-400">如商品有问题请开启并记录</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasException}
                    onChange={(e) => setHasException(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {hasException && (
                <div className="mt-4 space-y-4">
                  <textarea
                    value={exceptionNote}
                    onChange={(e) => setExceptionNote(e.target.value)}
                    placeholder="请描述异常情况..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      拍照留证（输入图片URL）
                    </p>
                    {exceptionPhotos.map((photo, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={photo}
                          onChange={(e) => {
                            const newPhotos = [...exceptionPhotos];
                            newPhotos[idx] = e.target.value;
                            setExceptionPhotos(newPhotos);
                          }}
                          placeholder="https://..."
                          className="flex-1 px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
                        />
                        <button
                          onClick={() => setExceptionPhotos(exceptionPhotos.filter((_, i) => i !== idx))}
                          className="px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          移除
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setExceptionPhotos([...exceptionPhotos, ''])}
                      className="w-full py-2 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:border-amber-500/50 hover:text-amber-400 transition-colors text-sm"
                    >
                      + 添加图片
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 取货成功弹窗 */}
      <Modal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title=""
        size="sm"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-1">取货确认成功</h3>
          <p className="text-sm text-slate-400">订单已标记为已取货</p>
          <p className="text-xs text-slate-500 mt-2">{formatDateTime(new Date().toISOString())}</p>
        </div>
      </Modal>
    </div>
  );
}
