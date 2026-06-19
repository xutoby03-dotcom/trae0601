import { ArrowLeft, Thermometer, Leaf, Droplets, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import type { TeaBatch } from '@/types';
import { useTeaStore } from '@/store/useTeaStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Props {
  batch: TeaBatch;
  onBack: () => void;
}

const aromaLabels: Record<string, string> = {
  excellent: '优秀',
  good: '良好',
  fair: '一般',
  poor: '差',
};

const sedimentLabels: Record<string, string> = {
  none: '无',
  slight: '轻微',
  moderate: '中等',
  heavy: '严重',
};

const qualityColors: Record<string, string> = {
  excellent: 'text-matcha-600 bg-matcha-50',
  good: 'text-tea-600 bg-tea-50',
  fair: 'text-amber-600 bg-amber-50',
  poor: 'text-danger-600 bg-danger-50',
  none: 'text-matcha-600 bg-matcha-50',
  slight: 'text-tea-600 bg-tea-50',
  moderate: 'text-amber-600 bg-amber-50',
  heavy: 'text-danger-600 bg-danger-50',
};

export default function BatchDetail({ batch, onBack }: Props) {
  const { teapots, getInspectionsByBatch, checkBatchAbnormal, updateBatch } = useTeaStore();
  const teapot = teapots.find((t) => t.id === batch.teapotId);
  const inspections = getInspectionsByBatch(batch.id);
  const abnormal = checkBatchAbnormal(batch.id);

  const statusLabels: Record<string, { label: string; className: string }> = {
    active: { label: '售卖中', className: 'bg-matcha-100 text-matcha-700' },
    discarded: { label: '已报废', className: 'bg-danger-100 text-danger-600' },
    sold_out: { label: '已售罄', className: 'bg-gray-100 text-gray-600' },
  };

  const getAbnormalReason = () => {
    const abnormalInspection = inspections.find((i) => i.isAbnormal && i.abnormalReason);
    if (abnormalInspection?.abnormalReason) {
      return abnormalInspection.abnormalReason;
    }
    return abnormal.reason || '品质异常';
  };

  const handleDiscard = () => {
    if (confirm('确定要报废这批茶汤吗？')) {
      updateBatch(batch.id, { status: 'discarded' });
    }
  };

  const handleSoldOut = () => {
    if (confirm('确定这批茶汤已售罄吗？')) {
      updateBatch(batch.id, { status: 'sold_out' });
    }
  };

  const getDiscardTime = () => {
    const abnormalInspection = inspections.find((i) => i.isAbnormal);
    if (abnormalInspection) {
      return format(new Date(abnormalInspection.inspectTime), 'yyyy年M月d日 HH:mm', { locale: zhCN });
    }
    return null;
  };

  if (batch.status === 'discarded') {
    const discardTime = getDiscardTime();
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-tea-lg p-8 max-w-md w-full text-center ring-2 ring-danger-200">
          <div className="w-20 h-20 mx-auto mb-5 bg-danger-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-10 h-10 text-danger-500" />
          </div>

          <div className="inline-block px-4 py-1.5 mb-6 bg-danger-100 text-danger-600 rounded-full font-bold text-sm">
            已报废
          </div>

          <div className="bg-danger-50 border border-danger-200 rounded-xl p-5 mb-6 text-left">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-danger-500 mb-1">异常原因</p>
                <p className="text-danger-700 font-medium">{getAbnormalReason()}</p>
              </div>
              <div className="pt-3 border-t border-danger-200">
                <p className="text-xs text-danger-500 mb-1">报废时间</p>
                <p className="text-danger-700 font-medium">
                  {discardTime || '暂无报废时间'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 py-3 bg-tea-500 text-white rounded-xl font-medium hover:bg-tea-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回批次列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-tea-600 hover:text-tea-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        返回批次列表
      </button>

      <div className={`bg-white rounded-2xl shadow-tea overflow-hidden mb-6 ${
        abnormal.isAbnormal && batch.status === 'active' ? 'ring-2 ring-danger-400 ring-offset-2' : ''
      }`}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={teapot?.photo}
                  alt={teapot?.teaType}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-tea-500">{teapot?.code}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusLabels[batch.status].className}`}>
                    {statusLabels[batch.status].label}
                  </span>
                </div>
                <h1 className="text-2xl font-display font-bold text-tea-800">
                  {teapot?.teaType}
                </h1>
                <p className="text-tea-600 mt-1">
                  煮制时间: {format(new Date(batch.brewTime), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
                </p>
              </div>
            </div>

            {abnormal.isAbnormal && batch.status === 'active' && (
              <div className="flex items-center gap-2 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-danger-500" />
                <div>
                  <p className="font-medium text-danger-700">异常提醒</p>
                  <p className="text-sm text-danger-600">{abnormal.reason}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tea-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-matcha-500" />
                <span className="text-sm text-tea-600">投茶量</span>
              </div>
              <p className="text-2xl font-bold text-tea-800">{batch.teaAmount}<span className="text-sm font-normal">g</span></p>
            </div>
            <div className="p-4 bg-tea-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-tea-500" />
                <span className="text-sm text-tea-600">出汤量</span>
              </div>
              <p className="text-2xl font-bold text-tea-800">{batch.outputAmount}<span className="text-sm font-normal">ml</span></p>
            </div>
            <div className="p-4 bg-tea-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-tea-600">售卖时段</span>
              </div>
              <p className="text-lg font-bold text-tea-800">{batch.targetTimeSlot}</p>
            </div>
            <div className="p-4 bg-tea-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-tea-500" />
                <span className="text-sm text-tea-600">保温目标</span>
              </div>
              <p className="text-lg font-bold text-tea-800">
                {teapot?.targetTempMin}°C ~ {teapot?.targetTempMax}°C
              </p>
            </div>
          </div>

          {batch.status === 'active' && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-tea-100">
              <button
                onClick={handleSoldOut}
                className="flex-1 py-2.5 bg-matcha-500 text-white rounded-xl font-medium hover:bg-matcha-600 transition-colors"
              >
                标记售罄
              </button>
              <button
                onClick={handleDiscard}
                className="flex-1 py-2.5 bg-danger-500 text-white rounded-xl font-medium hover:bg-danger-600 transition-colors"
              >
                报废处理
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-tea p-6">
        <h2 className="text-xl font-display font-bold text-tea-800 mb-4">
          巡查记录
        </h2>

        {inspections.length === 0 ? (
          <p className="text-center text-tea-500 py-8">暂无巡查记录</p>
        ) : (
          <div className="space-y-4">
            {inspections.map((inspection, index) => (
              <div
                key={inspection.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  inspection.isAbnormal
                    ? 'border-danger-200 bg-danger-50'
                    : 'border-tea-100 bg-tea-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-tea-100 flex items-center justify-center text-tea-700 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-tea-800">
                        {format(new Date(inspection.inspectTime), 'M月d日 HH:mm', { locale: zhCN })}
                      </p>
                      {inspection.isAbnormal && (
                        <p className="text-xs text-danger-600">{inspection.abnormalReason}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      inspection.isAbnormal ? 'text-danger-600' : 'text-tea-700'
                    }`}>
                      {inspection.temperature}°C
                    </p>
                    <p className="text-xs text-tea-500">
                      剩余 {inspection.remainingAmount}ml
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-tea-500 mb-1">香气</p>
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${qualityColors[inspection.aroma]}`}>
                      {aromaLabels[inspection.aroma]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-tea-500 mb-1">颜色</p>
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${qualityColors[inspection.color]}`}>
                      {aromaLabels[inspection.color]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-tea-500 mb-1">沉淀</p>
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${qualityColors[inspection.sediment]}`}>
                      {sedimentLabels[inspection.sediment]}
                    </span>
                  </div>
                </div>

                {inspection.waterAdded && (
                  <div className="mt-3 pt-3 border-t border-tea-100">
                    <p className="text-sm text-tea-600">💧 已补水</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
