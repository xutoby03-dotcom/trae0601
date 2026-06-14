import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, Clock, MapPin, User, AlertTriangle, ChevronDown } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useTastingStore } from '@/store/tastingStore';
import { getDaysUntil, addHours } from '@/utils/date';
import type { BatchUrgency } from '@/types';

export default function TastingForm() {
  const navigate = useNavigate();
  const products = useProductStore((state) => state.products);
  const getSortedBatchesByProductId = useProductStore((state) => state.getSortedBatchesByProductId);
  const getBatchUrgency = useProductStore((state) => state.getBatchUrgency);
  const getProductById = useProductStore((state) => state.getProductById);
  const getBatchById = useProductStore((state) => state.getBatchById);
  const createTasting = useTastingStore((state) => state.createTasting);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [stationLocation, setStationLocation] = useState('');
  const [portion, setPortion] = useState(0.3);
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState('');

  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null;
  const selectedBatch = selectedBatchId ? getBatchById(selectedBatchId) : null;

  const availableBatches = useMemo(() => {
    if (!selectedProductId) return [];
    return getSortedBatchesByProductId(selectedProductId).filter(
      (b) => b.stock > 0 && getBatchUrgency(b) !== 'expired'
    );
  }, [selectedProductId, getSortedBatchesByProductId, getBatchUrgency]);

  const filteredProducts = useMemo(() => {
    if (!searchProductQuery) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
        p.flavor.toLowerCase().includes(searchProductQuery.toLowerCase())
    );
  }, [products, searchProductQuery]);

  const expectedEndTime = useMemo(() => {
    if (!selectedProduct || !startTime) return '';
    const start = new Date(startTime);
    const end = addHours(start, selectedProduct.openDurationHours);
    return end.toISOString().slice(0, 16);
  }, [selectedProduct, startTime]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setSelectedBatchId('');
    setShowProductDropdown(false);
    setSearchProductQuery('');
  };

  const handleBatchSelect = (batchId: string) => {
    setSelectedBatchId(batchId);
    setShowBatchDropdown(false);
  };

  const getUrgencyColor = (urgency: BatchUrgency) => {
    switch (urgency) {
      case 'urgent':
        return 'text-rose-600 bg-rose-100';
      case 'near':
        return 'text-amber-600 bg-amber-100';
      default:
        return 'text-emerald-600 bg-emerald-100';
    }
  };

  const getUrgencyText = (urgency: BatchUrgency, daysLeft: number) => {
    switch (urgency) {
      case 'urgent':
        return `紧急 (${daysLeft}天)`;
      case 'near':
        return `临期 (${daysLeft}天)`;
      default:
        return '正常';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId || !selectedBatchId) {
      alert('请选择商品和批次');
      return;
    }
    if (!operatorName.trim()) {
      alert('请填写领用人');
      return;
    }
    if (!stationLocation.trim()) {
      alert('请填写试吃台位置');
      return;
    }

    createTasting({
      batchId: selectedBatchId,
      operatorName: operatorName.trim(),
      stationLocation: stationLocation.trim(),
      portion,
      startTime: new Date(startTime).toISOString(),
      expectedEndTime: new Date(expectedEndTime).toISOString(),
      note: note.trim() || undefined,
    });

    navigate('/tasting');
  };

  const stationOptions = ['入口试吃台A', '入口试吃台B', '收银台旁', '零食区入口', '饮料区旁', '出口处'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/tasting')}
          className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">试吃领用登记</h1>
          <p className="text-stone-500 mt-1">登记新的试吃样品</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            选择商品
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                商品 <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowProductDropdown(!showProductDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                {selectedProduct ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-200 rounded-lg overflow-hidden">
                      {selectedProduct.photo ? (
                        <img src={selectedProduct.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-stone-400 m-auto" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{selectedProduct.name}</p>
                      <p className="text-xs text-stone-500">{selectedProduct.flavor}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-stone-400">请选择商品</span>
                )}
                <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${showProductDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showProductDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                  <div className="p-2 border-b border-stone-100">
                    <input
                      type="text"
                      placeholder="搜索商品..."
                      value={searchProductQuery}
                      onChange={(e) => setSearchProductQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      autoFocus
                    />
                  </div>
                  <div className="p-1">
                    {filteredProducts.length === 0 ? (
                      <p className="text-center py-6 text-stone-400 text-sm">未找到商品</p>
                    ) : (
                      filteredProducts.map((product) => {
                        const batches = getSortedBatchesByProductId(product.id);
                        const hasStock = batches.some(
                          (b) => b.stock > 0 && getBatchUrgency(b) !== 'expired'
                        );
                        const nearExpiryCount = batches.filter(
                          (b) => getBatchUrgency(b) === 'near' || getBatchUrgency(b) === 'urgent'
                        ).length;

                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => hasStock && handleProductSelect(product.id)}
                            disabled={!hasStock}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                              hasStock
                                ? 'hover:bg-stone-50 cursor-pointer'
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.photo ? (
                                <img src={product.photo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-6 h-6 text-stone-400 m-auto" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-stone-800 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-stone-500">
                                {product.flavor} · {batches.length}个批次
                              </p>
                            </div>
                            {nearExpiryCount > 0 && hasStock && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium">
                                {nearExpiryCount}个临期
                              </span>
                            )}
                            {!hasStock && (
                              <span className="text-xs text-stone-400">无库存</span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedProductId && (
              <div className="relative">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  批次 <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowBatchDropdown(!showBatchDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  {selectedBatch ? (
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-stone-800">{selectedBatch.batchNumber}</p>
                        <p className="text-xs text-stone-500">
                          生产日期: {selectedBatch.productionDate} · 库存: {selectedBatch.stock}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${getUrgencyColor(
                          getBatchUrgency(selectedBatch)
                        )}`}
                      >
                        {getUrgencyText(
                          getBatchUrgency(selectedBatch),
                          getDaysUntil(selectedBatch.expiryDate)
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-stone-400">请选择批次</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${showBatchDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showBatchDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {availableBatches.length === 0 ? (
                      <p className="text-center py-6 text-stone-400 text-sm">无可选批次</p>
                    ) : (
                      <div className="p-1">
                        {availableBatches.map((batch) => {
                          const urgency = getBatchUrgency(batch);
                          const daysLeft = getDaysUntil(batch.expiryDate);

                          return (
                            <button
                              key={batch.id}
                              type="button"
                              onClick={() => handleBatchSelect(batch.id)}
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 text-left transition-colors"
                            >
                              <div>
                                <p className="font-medium text-stone-800">
                                  {batch.batchNumber}
                                </p>
                                <p className="text-xs text-stone-500">
                                  生产: {batch.productionDate} · 到期: {batch.expiryDate}
                                </p>
                                <p className="text-xs text-stone-500">
                                  库存: {batch.stock} / {batch.initialStock}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-md text-xs font-medium ${getUrgencyColor(
                                  urgency
                                )}`}
                              >
                                {getUrgencyText(urgency, daysLeft)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedProductId && availableBatches.length > 0 && availableBatches[0] && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">临期优先提示</p>
                    <p className="mt-1">
                      系统已按保质期远近排序批次，请优先使用临期批次进行试吃，减少浪费。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            领用信息
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                领用人 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="请输入领用人姓名"
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                试吃台位置 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <select
                  required
                  value={stationLocation}
                  onChange={(e) => setStationLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none"
                >
                  <option value="">请选择试吃台位置</option>
                  {stationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                份量（份）
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={portion}
                  onChange={(e) => setPortion(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="w-20 text-center">
                  <span className="text-2xl font-bold text-stone-800">{portion}</span>
                  <span className="text-sm text-stone-500 ml-1">份</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>0.1</span>
                <span>2.0</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  开始时间
                </label>
                <div className="relative">
                  <Clock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  预计撤台时间
                </label>
                <div className="relative">
                  <Clock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    readOnly
                    value={expectedEndTime ? expectedEndTime.replace('T', ' ') : ''}
                    className="w-full pl-12 pr-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {selectedProduct && (
              <p className="text-sm text-stone-500">
                根据商品开封后可摆放时长（{selectedProduct.openDurationHours}小时）自动计算
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                备注
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="选填，备注信息..."
                rows={3}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/tasting')}
            className="px-6 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-550 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all"
          >
            <Save className="w-5 h-5" />
            确认领用
          </button>
        </div>
      </form>
    </div>
  );
}
