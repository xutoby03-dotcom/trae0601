import { useState } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  Heart,
  Activity,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppStore } from '../store';
import { armLabels, postureLabels } from '../types';
import { cn, sortMeasurementsByDateTimeDesc } from '../lib/utils';
import MeasurementForm from '../components/MeasurementForm';
import AlertBanner from '../components/AlertBanner';

export default function Measurements() {
  const { measurements, deleteMeasurement, settings } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [filterAbnormal, setFilterAbnormal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedMeasurements = sortMeasurementsByDateTimeDesc(measurements);
  
  const displayedMeasurements = filterAbnormal
    ? sortedMeasurements.filter((m) => m.isAbnormal)
    : sortedMeasurements;

  const groupedByDate = displayedMeasurements.reduce((groups, measurement) => {
    const date = measurement.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(measurement);
    return groups;
  }, {} as Record<string, typeof measurements>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return '今天';
    if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天';
    
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getBloodPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic > settings.systolicHigh || diastolic > settings.diastolicHigh) {
      return { label: '偏高', color: 'text-red-500', bg: 'bg-red-50' };
    }
    if (systolic < settings.systolicLow || diastolic < settings.diastolicLow) {
      return { label: '偏低', color: 'text-blue-500', bg: 'bg-blue-50' };
    }
    return { label: '正常', color: 'text-emerald-500', bg: 'bg-emerald-50' };
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteMeasurement(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">测量记录</h1>
          <p className="text-gray-500">记录并追踪您的血压变化</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200',
            showForm
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
          )}
        >
          <Plus className={cn('w-5 h-5 transition-transform duration-200', showForm && 'rotate-45')} />
          {showForm ? '收起' : '新增记录'}
        </button>
      </div>

      <AlertBanner />

      {showForm && (
        <div className="mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
          <MeasurementForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setFilterAbnormal(!filterAbnormal)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
            filterAbnormal
              ? 'bg-red-100 text-red-700 border-2 border-red-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
          )}
        >
          <Filter className="w-4 h-4" />
          {filterAbnormal ? '显示全部' : '仅显示异常'}
          {filterAbnormal && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {measurements.filter((m) => m.isAbnormal).length}
            </span>
          )}
        </button>

        <div className="text-sm text-gray-500">
          共 {displayedMeasurements.length} 条记录
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, dayMeasurements]) => (
          <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm font-medium text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                {formatDate(date)}
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="space-y-3">
              {dayMeasurements.map((measurement) => {
                const status = getBloodPressureStatus(
                  measurement.systolic,
                  measurement.diastolic
                );
                const isExpanded = expandedId === measurement.id;
                const pulsePressure = measurement.systolic - measurement.diastolic;

                return (
                  <div
                    key={measurement.id}
                    className={cn(
                      'bg-white rounded-2xl border transition-all duration-200 overflow-hidden',
                      measurement.isAbnormal
                        ? 'border-red-200 hover:shadow-md hover:shadow-red-100'
                        : 'border-gray-100 hover:shadow-md'
                    )}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : measurement.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'w-14 h-14 rounded-xl flex items-center justify-center',
                            status.bg
                          )}>
                            <Activity className={cn('w-7 h-7', status.color)} />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-xl text-gray-900">
                                {measurement.systolic}
                                <span className="text-gray-400 text-lg mx-1">/</span>
                                {measurement.diastolic}
                              </span>
                              <span className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                status.bg,
                                status.color
                              )}>
                                {status.label}
                              </span>
                              {measurement.isAbnormal && (
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {measurement.time}
                              </span>
                              <span>{armLabels[measurement.arm]}</span>
                              <span>{postureLabels[measurement.posture]}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Heart className="w-4 h-4 text-pink-500" />
                              <span className="font-semibold">{measurement.heartRate}</span>
                              <span className="text-xs">bpm</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              脉压差 {pulsePressure}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(measurement.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">测前休息</p>
                            <p className="font-medium text-gray-900">{measurement.restMinutes} 分钟</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">测量姿势</p>
                            <p className="font-medium text-gray-900">{postureLabels[measurement.posture]}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">测量手臂</p>
                            <p className="font-medium text-gray-900">{armLabels[measurement.arm]}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">脉压差</p>
                            <p className={cn(
                              'font-medium',
                              pulsePressure > 60 || pulsePressure < 20 ? 'text-amber-500' : 'text-gray-900'
                            )}>
                              {pulsePressure} mmHg
                            </p>
                          </div>
                        </div>

                        {measurement.abnormalReason && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                            <p className="text-sm text-amber-800">
                              <span className="font-medium">异常原因：</span>
                              {measurement.abnormalReason}
                            </p>
                          </div>
                        )}

                        {measurement.notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">备注：</span>
                              {measurement.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {displayedMeasurements.length === 0 && (
        <div className="text-center py-16">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无测量记录</h3>
          <p className="text-gray-500 mb-6">点击上方按钮开始记录您的血压数据</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新增第一条记录
          </button>
        </div>
      )}
    </div>
  );
}
