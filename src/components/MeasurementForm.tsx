import { useState } from 'react';
import {
  Activity,
  Heart,
  Clock,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Check,
  X,
  Info,
} from 'lucide-react';
import { useAppStore } from '../store';
import type { Arm, Posture } from '../types';
import { armLabels, postureLabels } from '../types';
import { checkMeasurementAbnormal } from '../services/alertService';
import { cn, getRecentMeasurements } from '../lib/utils';

interface MeasurementFormProps {
  onSuccess?: () => void;
}

export default function MeasurementForm({ onSuccess }: MeasurementFormProps) {
  const { device, settings, measurements, addMeasurement } = useAppStore();
  const [step, setStep] = useState(1);
  const [showAbnormalWarning, setShowAbnormalWarning] = useState(false);
  const [abnormalCheckResult, setAbnormalCheckResult] = useState<{
    isAbnormal: boolean;
    abnormalReason: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    arm: 'left' as Arm,
    posture: 'sitting' as Posture,
    restMinutes: 5,
    systolic: '',
    diastolic: '',
    heartRate: '',
    notes: '',
  });

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const systolic = Number(formData.systolic);
      const diastolic = Number(formData.diastolic);
      const heartRate = Number(formData.heartRate);

      const recent3 = getRecentMeasurements(measurements, 3);
      
      const result = checkMeasurementAbnormal(
        systolic,
        diastolic,
        heartRate,
        settings,
        recent3
      );
      setAbnormalCheckResult(result);

      if (result.isAbnormal) {
        setShowAbnormalWarning(true);
      } else {
        submitMeasurement(false);
      }
    }
  };

  const submitMeasurement = (ignoreWarning: boolean) => {
    if (!device) return;

    addMeasurement({
      deviceId: device.id,
      date: formData.date,
      time: formData.time,
      arm: formData.arm,
      posture: formData.posture,
      restMinutes: formData.restMinutes,
      systolic: Number(formData.systolic),
      diastolic: Number(formData.diastolic),
      heartRate: Number(formData.heartRate),
      notes: formData.notes,
    });

    setShowAbnormalWarning(false);
    setStep(3);

    setTimeout(() => {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        arm: 'left',
        posture: 'sitting',
        restMinutes: 5,
        systolic: '',
        diastolic: '',
        heartRate: '',
        notes: '',
      });
      setStep(1);
      setAbnormalCheckResult(null);
      onSuccess?.();
    }, 2000);
  };

  const handleRetake = () => {
    setShowAbnormalWarning(false);
    setAbnormalCheckResult(null);
    setFormData((prev) => ({
      ...prev,
      systolic: '',
      diastolic: '',
      heartRate: '',
    }));
    setStep(2);
  };

  const canProceed = () => {
    if (step === 1) return true;
    return (
      formData.systolic &&
      formData.diastolic &&
      formData.heartRate &&
      Number(formData.systolic) > Number(formData.diastolic)
    );
  };

  const pulsePressure = formData.systolic && formData.diastolic
    ? Number(formData.systolic) - Number(formData.diastolic)
    : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">新增测量记录</h3>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                step === s
                  ? 'bg-blue-600 text-white'
                  : step > s
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 mb-1">测量前准备</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 测量前30分钟避免吸烟、饮酒或剧烈运动</li>
                  <li>• 排尿后休息至少5分钟再测量</li>
                  <li>• 保持坐姿，手臂与心脏同高</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                测量日期
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                测量时间
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测量手臂
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['left', 'right'] as Arm[]).map((arm) => (
                  <button
                    key={arm}
                    type="button"
                    onClick={() => handleChange('arm', arm)}
                    className={cn(
                      'px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200',
                      formData.arm === arm
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    )}
                  >
                    {armLabels[arm]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测量姿势
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['sitting', 'standing', 'lying'] as Posture[]).map((posture) => (
                  <button
                    key={posture}
                    type="button"
                    onClick={() => handleChange('posture', posture)}
                    className={cn(
                      'px-3 py-3 rounded-xl border-2 font-medium transition-all duration-200 text-sm',
                      formData.posture === posture
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    )}
                  >
                    {postureLabels[posture]}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测前休息时间（分钟）
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={formData.restMinutes}
                  onChange={(e) => handleChange('restMinutes', Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="w-16 text-center font-bold text-xl text-blue-600">
                  {formData.restMinutes} 分
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">建议至少休息 5 分钟后再测量</p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl text-center">
              <Activity className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <label className="block text-sm font-medium text-gray-700 mb-2">收缩压</label>
              <input
                type="number"
                value={formData.systolic}
                onChange={(e) => handleChange('systolic', e.target.value)}
                placeholder="120"
                className="w-full text-center text-4xl font-bold bg-transparent border-b-2 border-red-200 focus:border-red-500 outline-none py-2 text-red-600"
              />
              <p className="text-sm text-gray-500 mt-1">mmHg</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl text-center">
              <Heart className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <label className="block text-sm font-medium text-gray-700 mb-2">舒张压</label>
              <input
                type="number"
                value={formData.diastolic}
                onChange={(e) => handleChange('diastolic', e.target.value)}
                placeholder="80"
                className="w-full text-center text-4xl font-bold bg-transparent border-b-2 border-blue-200 focus:border-blue-500 outline-none py-2 text-blue-600"
              />
              <p className="text-sm text-gray-500 mt-1">mmHg</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl text-center">
              <Heart className="w-10 h-10 text-purple-500 mx-auto mb-3 animate-pulse" />
              <label className="block text-sm font-medium text-gray-700 mb-2">心率</label>
              <input
                type="number"
                value={formData.heartRate}
                onChange={(e) => handleChange('heartRate', e.target.value)}
                placeholder="72"
                className="w-full text-center text-4xl font-bold bg-transparent border-b-2 border-purple-200 focus:border-purple-500 outline-none py-2 text-purple-600"
              />
              <p className="text-sm text-gray-500 mt-1">次/分钟</p>
            </div>
          </div>

          {pulsePressure !== null && !isNaN(pulsePressure) && (
            <div className={cn(
              'p-4 rounded-xl',
              pulsePressure > 60 || pulsePressure < 20
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-gray-50'
            )}>
              <p className="text-center">
                <span className="text-gray-600">脉压差：</span>
                <span className={cn(
                  'font-bold ml-2',
                  pulsePressure > 60 || pulsePressure < 20 ? 'text-amber-600' : 'text-gray-900'
                )}>
                  {pulsePressure} mmHg
                </span>
                {(pulsePressure > 60 || pulsePressure < 20) && (
                  <span className="text-amber-600 text-sm ml-2">
                    （正常范围 20-60 mmHg）
                  </span>
                )}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">备注（选填）</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="如有不适或特殊情况请记录..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors resize-none"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">记录已保存！</h3>
          <p className="text-gray-500">您的血压数据已成功记录</p>
        </div>
      )}

      {showAbnormalWarning && abnormalCheckResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">检测到异常读数</h4>
                <p className="text-sm text-gray-500">建议休息后复测</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl mb-6">
              <p className="text-amber-800 text-sm">
                {abnormalCheckResult.abnormalReason}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                休息后复测
              </button>
              <button
                onClick={() => submitMeasurement(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                忽略并保存
              </button>
            </div>
          </div>
        </div>
      )}

      {step < 3 && (
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              上一步
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200',
              canProceed()
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {step === 2 ? '保存记录' : '下一步'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
