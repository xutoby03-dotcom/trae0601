import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Thermometer,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useFreezerStore } from '@/store/freezerStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { useLossReportStore } from '@/store/lossReportStore';
import { getCurrentShift, formatCurrency } from '@/utils/format';
import type { LossItem } from '@/types';

export default function InspectionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedFreezerId = searchParams.get('freezerId') || '';

  const { freezers } = useFreezerStore();
  const { addInspection, generateAffectedItems } = useInspectionStore();
  const { addLossReport } = useLossReportStore();

  const [formData, setFormData] = useState({
    freezerId: preselectedFreezerId,
    temperature: -18,
    doorSealStatus: 'good',
    frostStatus: 'none',
    softeningLevel: 'none',
    inspector: '',
    shift: getCurrentShift(),
    notes: '',
  });

  const [showLossDialog, setShowLossDialog] = useState(false);
  const [lossType, setLossType] = useState<'loss' | 'isolate'>('loss');
  const [affectedItems, setAffectedItems] = useState<LossItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedFreezer = freezers.find((f) => f.id === formData.freezerId);

  const isAbnormal = selectedFreezer
    ? formData.temperature > selectedFreezer.maxTemp ||
      formData.temperature < selectedFreezer.minTemp
    : false;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setFormData((prev) => ({ ...prev, temperature: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.freezerId || !formData.inspector) {
      alert('请填写必填项');
      return;
    }

    setIsSubmitting(true);

    addInspection({
      freezerId: formData.freezerId,
      temperature: formData.temperature,
      doorSealStatus: formData.doorSealStatus as any,
      frostStatus: formData.frostStatus as any,
      softeningLevel: formData.softeningLevel as any,
      photos: [],
      inspector: formData.inspector,
      shift: formData.shift as any,
      notes: formData.notes,
    });

    if (isAbnormal && formData.softeningLevel !== 'none') {
      const items = generateAffectedItems(
        formData.freezerId,
        formData.softeningLevel
      );
      setAffectedItems(items);
      setShowLossDialog(true);
    } else {
      navigate('/inspections');
    }

    setIsSubmitting(false);
  };

  const handleCreateLossReport = () => {
    if (affectedItems.length === 0) {
      alert('没有受影响的商品');
      return;
    }

    addLossReport({
      freezerId: formData.freezerId,
      type: lossType,
      submitter: formData.inspector,
      items: affectedItems.map((item) => ({
        productId: item.productId,
        brand: item.brand,
        flavor: item.flavor,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });

    navigate('/loss-reports');
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setAffectedItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity, subtotal: item.unitPrice * quantity }
          : item
      )
    );
  };

  const totalAmount = affectedItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/inspections')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回列表
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">新增巡查记录</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                选择冷柜 <span className="text-red-500">*</span>
              </label>
              <select
                name="freezerId"
                value={formData.freezerId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white"
                required
              >
                <option value="">请选择冷柜</option>
                {freezers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} - {f.location} (温度范围: {f.minTemp}°C ~ {f.maxTemp}°C)
                  </option>
                ))}
              </select>
              {selectedFreezer && (
                <p className="text-sm text-slate-500 mt-2">
                  温度范围: {selectedFreezer.minTemp}°C ~ {selectedFreezer.maxTemp}°C
                  ，负责人: {selectedFreezer.manager}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                当前温度 (°C) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleTemperatureChange}
                  step="0.5"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all ${
                    isAbnormal
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-200'
                  }`}
                />
              </div>
              {isAbnormal && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  温度超标！请检查冷柜门是否关严
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                巡查人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="inspector"
                value={formData.inspector}
                onChange={handleInputChange}
                placeholder="请输入巡查人姓名"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                班次
              </label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white"
              >
                <option value="morning">早班 (06:00-14:00)</option>
                <option value="afternoon">午班 (14:00-22:00)</option>
                <option value="night">晚班 (22:00-06:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                门封状态
              </label>
              <select
                name="doorSealStatus"
                value={formData.doorSealStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white"
              >
                <option value="good">良好</option>
                <option value="normal">一般</option>
                <option value="poor">较差</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                结霜情况
              </label>
              <select
                name="frostStatus"
                value={formData.frostStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white"
              >
                <option value="none">无霜</option>
                <option value="light">轻微</option>
                <option value="medium">中度</option>
                <option value="heavy">严重</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                商品软化程度
              </label>
              <select
                name="softeningLevel"
                value={formData.softeningLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white"
              >
                <option value="none">无软化</option>
                <option value="mild">轻微软化</option>
                <option value="moderate">中度软化</option>
                <option value="severe">严重软化</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                备注
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="请输入备注信息（可选）"
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/inspections')}
            className="px-6 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            提交巡查
          </button>
        </div>
      </form>

      {showLossDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-red-50 to-amber-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    温度异常，自动生成受影响商品清单
                  </h3>
                  <p className="text-sm text-slate-500">
                    请确认商品数量，选择报损或隔离处理
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-96">
              <div className="flex gap-3">
                <button
                  onClick={() => setLossType('loss')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    lossType === 'loss'
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-slate-100 text-slate-600 border-2 border-transparent'
                  }`}
                >
                  🗑️ 报损处理
                </button>
                <button
                  onClick={() => setLossType('isolate')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    lossType === 'isolate'
                      ? 'bg-sky-100 text-sky-700 border-2 border-sky-300'
                      : 'bg-slate-100 text-slate-600 border-2 border-transparent'
                  }`}
                >
                  📦 隔离观察
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-slate-600">
                      <th className="px-4 py-3 font-medium">品牌</th>
                      <th className="px-4 py-3 font-medium">口味</th>
                      <th className="px-4 py-3 font-medium">品类</th>
                      <th className="px-4 py-3 font-medium text-right">单价</th>
                      <th className="px-4 py-3 font-medium text-center">数量</th>
                      <th className="px-4 py-3 font-medium text-right">小计</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {affectedItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-slate-900">{item.brand}</td>
                        <td className="px-4 py-3 text-slate-600">{item.flavor}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{item.category}</td>
                        <td className="px-4 py-3 text-right text-slate-700">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(item.id, Number(e.target.value))
                            }
                            min="0"
                            className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-sky-500 mx-auto block"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-slate-600">共计 {affectedItems.length} 种商品</span>
                <div className="text-right">
                  <span className="text-slate-500 text-sm">预估金额</span>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowLossDialog(false);
                  navigate('/inspections');
                }}
                className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                暂不处理
              </button>
              <button
                onClick={handleCreateLossReport}
                className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-sm"
              >
                生成{lossType === 'loss' ? '报损' : '隔离'}单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
