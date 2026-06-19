import { ArrowLeft, Thermometer, User, Droplets, Clock, Package } from 'lucide-react';
import type { Teapot } from '@/types';
import { useTeaStore } from '@/store/useTeaStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Props {
  teapot: Teapot;
  onBack: () => void;
}

export default function TeapotDetail({ teapot, onBack }: Props) {
  const { getBatchesByTeapot, getInspectionsByBatch, checkBatchAbnormal } = useTeaStore();
  const batches = getBatchesByTeapot(teapot.id);

  const statusLabels: Record<string, { label: string; className: string }> = {
    active: { label: '售卖中', className: 'bg-matcha-100 text-matcha-700' },
    discarded: { label: '已报废', className: 'bg-danger-100 text-danger-600' },
    sold_out: { label: '已售罄', className: 'bg-gray-100 text-gray-600' },
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-tea-600 hover:text-tea-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        返回茶桶列表
      </button>

      <div className="bg-white rounded-2xl shadow-tea overflow-hidden mb-6">
        <div className="md:flex">
          <div className="md:w-1/3 h-64 md:h-auto relative">
            <img
              src={teapot.photo}
              alt={teapot.teaType}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r" />
          </div>
          <div className="p-6 md:p-8 md:w-2/3">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-tea-500 mb-1">{teapot.code}</p>
                <h1 className="text-3xl font-display font-bold text-tea-800">
                  {teapot.teaType}
                </h1>
              </div>
              <span className="px-4 py-1.5 bg-tea-100 text-tea-700 rounded-full text-sm font-medium">
                {teapot.capacity}ml
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-tea-50 rounded-xl">
                <div className="w-10 h-10 bg-tea-100 rounded-lg flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-tea-600" />
                </div>
                <div>
                  <p className="text-xs text-tea-500">保温目标</p>
                  <p className="font-semibold text-tea-800">
                    {teapot.targetTempMin}°C ~ {teapot.targetTempMax}°C
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-tea-50 rounded-xl">
                <div className="w-10 h-10 bg-tea-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-tea-600" />
                </div>
                <div>
                  <p className="text-xs text-tea-500">负责人</p>
                  <p className="font-semibold text-tea-800">{teapot.manager}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-tea-50 rounded-xl">
                <div className="w-10 h-10 bg-tea-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-tea-600" />
                </div>
                <div>
                  <p className="text-xs text-tea-500">历史批次</p>
                  <p className="font-semibold text-tea-800">{batches.length} 批</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-tea-50 rounded-xl">
                <div className="w-10 h-10 bg-tea-100 rounded-lg flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-tea-600" />
                </div>
                <div>
                  <p className="text-xs text-tea-500">容量</p>
                  <p className="font-semibold text-tea-800">{teapot.capacity}ml</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-tea p-6">
        <h2 className="text-xl font-display font-bold text-tea-800 mb-4">
          批次记录
        </h2>

        {batches.length === 0 ? (
          <p className="text-center text-tea-500 py-8">暂无批次记录</p>
        ) : (
          <div className="space-y-3">
            {batches.slice(0, 5).map((batch) => {
              const abnormal = checkBatchAbnormal(batch.id);
              const inspections = getInspectionsByBatch(batch.id);
              const latestTemp = inspections.length > 0 ? inspections[0].temperature : null;

              return (
                <div
                  key={batch.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    abnormal.isAbnormal
                      ? 'border-danger-200 bg-danger-50'
                      : 'border-tea-100 hover:border-tea-200 bg-tea-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        batch.status === 'active'
                          ? abnormal.isAbnormal
                            ? 'bg-danger-500 animate-pulse'
                            : 'bg-matcha-500'
                          : batch.status === 'discarded'
                          ? 'bg-danger-400'
                          : 'bg-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium text-tea-800">
                          {format(new Date(batch.brewTime), 'M月d日 HH:mm', { locale: zhCN })} 煮制
                        </p>
                        <p className="text-sm text-tea-500">
                          出汤 {batch.outputAmount}ml · 投茶 {batch.teaAmount}g
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        statusLabels[batch.status].className
                      }`}>
                        {statusLabels[batch.status].label}
                      </span>
                      {latestTemp !== null && (
                        <p className="text-sm text-tea-600 mt-1">
                          {latestTemp}°C
                        </p>
                      )}
                      {abnormal.isAbnormal && (
                        <p className="text-xs text-danger-600 mt-1">
                          {abnormal.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-tea-500">
                    <Clock className="w-3 h-3" />
                    <span>废弃时间: {format(new Date(batch.discardTime), 'HH:mm', { locale: zhCN })}</span>
                    <span className="mx-2">·</span>
                    <span>{batch.targetTimeSlot}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
