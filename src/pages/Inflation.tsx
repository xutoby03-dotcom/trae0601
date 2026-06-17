import { useState, useMemo } from 'react';
import { ShoppingCart, Wind, User, Check, AlertTriangle, ChevronDown, Gauge } from 'lucide-react';
import { useCylinderStore } from '@/store/useCylinderStore';
import { useOrderStore } from '@/store/useOrderStore';
import { StatusBadge } from '@/components/StatusBadge';
import type { Cylinder } from '@/types';
import { calculateGasUsed, calculateRemainingPressure, calculatePressurePercentage } from '@/utils/calculator';

const operators = ['张师傅', '李师傅', '王师傅', '赵师傅'];

export default function Inflation() {
  const { cylinders, addInflation } = useCylinderStore();
  const { orders, balloonTypes, getOrderById, getBalloonTypeById } = useOrderStore();

  const [orderId, setOrderId] = useState('');
  const [balloonTypeId, setBalloonTypeId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [operator, setOperator] = useState(operators[0]);
  const [selectedCylinderId, setSelectedCylinderId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [pressureBeforeInflation, setPressureBeforeInflation] = useState<number | null>(null);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [showBalloonDropdown, setShowBalloonDropdown] = useState(false);
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);

  const availableCylinders = useMemo(() => {
    return cylinders
      .filter((c) => c.status !== 'expired' && c.status !== 'abnormal')
      .sort((a, b) => b.pressure - a.pressure);
  }, [cylinders]);

  const selectedOrder = orderId ? getOrderById(orderId) : null;
  const selectedBalloon = balloonTypeId ? getBalloonTypeById(balloonTypeId) : null;
  const selectedCylinder = selectedCylinderId
    ? availableCylinders.find((c) => c.id === selectedCylinderId)
    : null;

  const estimatedGas = selectedBalloon ? calculateGasUsed(selectedBalloon.gasPerUnit, quantity) : 0;

  const remainingPressure = selectedCylinder
    ? justSubmitted
      ? selectedCylinder.pressure
      : calculateRemainingPressure(
          selectedCylinder.pressure,
          selectedCylinder.ratedPressure,
          selectedCylinder.capacity,
          estimatedGas
        )
    : 0;

  const remainingPercent = selectedCylinder
    ? calculatePressurePercentage(remainingPressure, selectedCylinder.ratedPressure)
    : 0;

  const willBeLow = !justSubmitted && remainingPercent < 20 && remainingPercent > 0;
  const notEnoughGas = !justSubmitted && selectedCylinder && remainingPressure <= 0;
  const isCompletedSuccess = justSubmitted && remainingPressure > 0;

  const canSubmit = orderId && balloonTypeId && quantity > 0 && selectedCylinderId && operator && !notEnoughGas;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const currentCylinder = availableCylinders.find((c) => c.id === selectedCylinderId);
    if (currentCylinder) {
      setPressureBeforeInflation(currentCylinder.pressure);
    }

    addInflation({
      cylinderId: selectedCylinderId,
      orderId,
      balloonTypeId,
      quantity,
      gasUsed: estimatedGas,
      operator,
    });

    setJustSubmitted(true);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
    setTimeout(() => {
      setJustSubmitted(false);
      setPressureBeforeInflation(null);
      setOrderId('');
      setBalloonTypeId('');
      setQuantity(10);
      setSelectedCylinderId('');
    }, 2100);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-900">充气操作</h2>
        <p className="text-sm text-slate-500 mt-1">选择订单和气球规格，系统自动计算用气量并扣减库存</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
              充气信息
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">选择订单</label>
              <div className="relative">
                <button
                  onClick={() => setShowOrderDropdown(!showOrderDropdown)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-primary-300 transition-colors"
                >
                  {selectedOrder ? (
                    <div>
                      <p className="font-medium text-slate-900">{selectedOrder.orderNo}</p>
                      <p className="text-sm text-slate-500">{selectedOrder.customerName} · ¥{selectedOrder.totalAmount}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400">请选择订单</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showOrderDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showOrderDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {orders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => {
                          setOrderId(order.id);
                          setShowOrderDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0"
                      >
                        <p className="font-medium text-slate-900">{order.orderNo}</p>
                        <p className="text-sm text-slate-500">{order.customerName} · ¥{order.totalAmount}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">气球规格</label>
                <div className="relative">
                  <button
                    onClick={() => setShowBalloonDropdown(!showBalloonDropdown)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-primary-300 transition-colors"
                  >
                    {selectedBalloon ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: selectedBalloon.color }}
                        ></span>
                        <span className="font-medium text-slate-900">{selectedBalloon.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">请选择气球规格</span>
                    )}
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showBalloonDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showBalloonDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {balloonTypes.map((balloon) => (
                        <button
                          key={balloon.id}
                          onClick={() => {
                            setBalloonTypeId(balloon.id);
                            setShowBalloonDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: balloon.color }}
                            ></span>
                            <span className="font-medium text-slate-900">{balloon.name}</span>
                          </div>
                          <span className="text-sm text-slate-500">{balloon.gasPerUnit}L/只</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">气球数量</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 5))}
                    className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 5)}
                    className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">操作人</label>
              <div className="relative">
                <button
                  onClick={() => setShowOperatorDropdown(!showOperatorDropdown)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{operator}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showOperatorDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showOperatorDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                    {operators.map((op) => (
                      <button
                        key={op}
                        onClick={() => {
                          setOperator(op);
                          setShowOperatorDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-2 ${
                          operator === op ? 'bg-primary-50 text-primary-700' : ''
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span className="font-medium">{op}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Wind className="w-6 h-6" />
              <h3 className="font-display font-semibold text-lg">预计用气量</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-display font-bold">{estimatedGas.toFixed(1)}</span>
              <span className="text-lg text-primary-100 mb-1">升</span>
            </div>
            <p className="text-sm text-primary-100 mt-2">
              {selectedBalloon ? `${selectedBalloon.name} × ${quantity}只` : '请选择气球规格'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-display font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-primary-600" />
              选择气瓶
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {availableCylinders.map((cylinder) => (
                <CylinderOption
                  key={cylinder.id}
                  cylinder={cylinder}
                  selected={selectedCylinderId === cylinder.id}
                  onClick={() => setSelectedCylinderId(cylinder.id)}
                />
              ))}
            </div>

            {availableCylinders.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
                <p>暂无可用气瓶</p>
              </div>
            )}
          </div>

          {selectedCylinder && (
            <div className={`rounded-xl p-5 border ${
              notEnoughGas ? 'bg-red-50 border-red-200' : willBeLow ? 'bg-amber-50 border-amber-200' : isCompletedSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <h4 className={`font-medium mb-3 ${
                notEnoughGas ? 'text-red-700' : willBeLow ? 'text-amber-700' : isCompletedSuccess ? 'text-emerald-700' : 'text-emerald-700'
              }`}>
                {notEnoughGas ? '⚠️ 气量不足' : willBeLow ? '⚠️ 充气后将达低压' : isCompletedSuccess ? '✓ 充气完成' : '✓ 充气后状态'}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={notEnoughGas ? 'text-red-600' : 'text-slate-600'}>
                    {justSubmitted ? '充气前压力' : '当前压力'}
                  </span>
                  <span className="font-medium">
                    {justSubmitted && pressureBeforeInflation !== null
                      ? `${pressureBeforeInflation} → ${selectedCylinder.pressure}`
                      : `${selectedCylinder.pressure}`
                    } MPa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={notEnoughGas ? 'text-red-600' : 'text-slate-600'}>
                    {justSubmitted ? '实际剩余' : '预计剩余'}
                  </span>
                  <span className={`font-medium ${notEnoughGas ? 'text-red-600' : ''}`}>
                    {remainingPressure.toFixed(1)} MPa
                  </span>
                </div>
                <div className="h-2 bg-white/50 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      notEnoughGas ? 'bg-red-500' : willBeLow ? 'bg-amber-500' : isCompletedSuccess ? 'bg-emerald-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(0, remainingPercent)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-xl font-display font-semibold text-white transition-all duration-200 ${
              canSubmit
                ? 'bg-accent-500 hover:bg-accent-600 shadow-lg hover:shadow-xl active:scale-[0.98]'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            确认充气
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-up">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-emerald-200 min-w-[320px]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-slate-900 mb-1">充气完成</h3>
                <p className="text-sm text-slate-500 mb-3">已成功扣减库存并记录操作</p>
                {selectedCylinder && pressureBeforeInflation !== null && (
                  <div className="bg-emerald-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600">{selectedCylinder.cylinderNo}</span>
                      <span className="font-medium text-emerald-700">
                        {pressureBeforeInflation} → {selectedCylinder.pressure} MPa
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">用气量</span>
                      <span className="font-medium text-slate-700">-{estimatedGas.toFixed(1)} L</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CylinderOptionProps {
  cylinder: Cylinder;
  selected: boolean;
  onClick: () => void;
}

function CylinderOption({ cylinder, selected, onClick }: CylinderOptionProps) {
  const pressurePercent = calculatePressurePercentage(cylinder.pressure, cylinder.ratedPressure);

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${
        selected
          ? 'border-primary-500 bg-primary-50'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-slate-900 text-sm">{cylinder.cylinderNo}</span>
        <StatusBadge status={cylinder.status} size="sm" />
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
        <span>{cylinder.capacity}L</span>
        <span>·</span>
        <span>{cylinder.location}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            pressurePercent > 60 ? 'bg-emerald-500' : pressurePercent > 30 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${pressurePercent}%` }}
        ></div>
      </div>
      <p className="text-right text-xs text-slate-400 mt-1">{cylinder.pressure} MPa</p>
    </button>
  );
}
