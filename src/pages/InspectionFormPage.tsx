import { useAppStore } from '@/store';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileCheck, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import {
  SOUND_OPTIONS,
  LIGHT_OPTIONS,
  VENTILATION_OPTIONS,
  HOSE_OPTIONS,
  VALVE_OPTIONS,
  BATTERY_OPTIONS,
} from '@/constants';
import { todayStr } from '@/utils/dateUtils';

export default function InspectionFormPage() {
  const { id } = useParams<{ id: string }>();
  const { getDevice, addInspection } = useAppStore();
  const device = getDevice(id!);

  const [form, setForm] = useState({
    inspect_date: todayStr(),
    sound_status: 'normal' as const,
    light_status: 'normal' as const,
    ventilation: 'good' as const,
    hose_status: 'normal' as const,
    valve_status: 'normal' as const,
    battery_level: 'good' as const,
    photo: '',
    remark: '',
  });

  const [showResult, setShowResult] = useState<null | { hasAnomaly: boolean; newTasks: number }>(null);

  if (!device) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Link
            to="/devices"
            className="w-10 h-10 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-gray-600 hover:bg-cream-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">设备不存在</h1>
            <p className="text-sm text-gray-500 mt-1">请返回设备列表</p>
          </div>
        </div>
      </div>
    );
  }

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addInspection({
      device_id: id!,
      inspect_date: form.inspect_date,
      sound_status: form.sound_status,
      light_status: form.light_status,
      ventilation: form.ventilation,
      hose_status: form.hose_status,
      valve_status: form.valve_status,
      battery_level: form.battery_level,
      photo: form.photo || undefined,
      remark: form.remark,
    });
    setShowResult({ hasAnomaly: result.inspection.has_anomaly, newTasks: result.newTasks.length });
  };

  const renderOptions = (
    options: { value: string; label: string; level: 'success' | 'warning' | 'danger' }[],
    value: string,
    onChange: (v: string) => void
  ) => (
    <div className="grid grid-cols-3 gap-2">
      {options.map(opt => {
        const active = value === opt.value;
        const colorMap = {
          success: active ? 'border-success-500 bg-success-50 text-success-700 ring-2 ring-success-200' : 'border-gray-200 hover:border-success-300 hover:bg-success-50/50',
          warning: active ? 'border-warning-500 bg-warning-50 text-warning-700 ring-2 ring-warning-200' : 'border-gray-200 hover:border-warning-300 hover:bg-warning-50/50',
          danger: active ? 'border-danger-500 bg-danger-50 text-danger-700 ring-2 ring-danger-200' : 'border-gray-200 hover:border-danger-300 hover:bg-danger-50/50',
        };
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${colorMap[opt.level]}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link
          to={`/devices/${id}`}
          className="w-10 h-10 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-gray-600 hover:bg-cream-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">设备巡检</h1>
          <p className="text-sm text-gray-500 mt-1">{device.location} · {device.model}</p>
        </div>
      </div>

      {showResult ? (
        <div className="max-w-2xl">
          <div className={`card p-8 text-center ${showResult.hasAnomaly ? 'border-danger-200' : 'border-success-200'}`}>
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center ${showResult.hasAnomaly ? 'bg-danger-50' : 'bg-success-50'}`}>
              {showResult.hasAnomaly ? (
                <AlertTriangle className="w-10 h-10 text-danger-500" />
              ) : (
                <FileCheck className="w-10 h-10 text-success-500" />
              )}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${showResult.hasAnomaly ? 'text-danger-600' : 'text-success-600'}`}>
              {showResult.hasAnomaly ? '发现异常' : '巡检完成'}
            </h2>
            <p className="text-gray-600 mb-6">
              {showResult.hasAnomaly
                ? `已生成 ${showResult.newTasks} 个维修任务，请及时处理`
                : '设备运行正常，继续保持'}
            </p>
            <div className="flex gap-3">
              <Link to={`/devices/${id}`} className="btn-secondary flex-1">
                返回详情
              </Link>
              <Link to="/alerts" className="btn-primary flex-1">
                查看维修任务
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-cream-200">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-brand-500" />
              </div>
              <h2 className="font-bold text-gray-800">巡检信息</h2>
            </div>

            <div>
              <label className="label-text">巡检日期</label>
              <input
                type="date"
                value={form.inspect_date}
                onChange={e => setField('inspect_date', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text mb-2 block">声响测试</label>
              {renderOptions(SOUND_OPTIONS, form.sound_status, v => setField('sound_status', v as typeof form.sound_status))}
            </div>

            <div>
              <label className="label-text mb-2 block">指示灯状态</label>
              {renderOptions(LIGHT_OPTIONS, form.light_status, v => setField('light_status', v as typeof form.light_status))}
            </div>

            <div>
              <label className="label-text mb-2 block">通风情况</label>
              {renderOptions(VENTILATION_OPTIONS, form.ventilation, v => setField('ventilation', v as typeof form.ventilation))}
            </div>

            <div>
              <label className="label-text mb-2 block">灶具软管</label>
              {renderOptions(HOSE_OPTIONS, form.hose_status, v => setField('hose_status', v as typeof form.hose_status))}
            </div>

            <div>
              <label className="label-text mb-2 block">阀门状态</label>
              {renderOptions(VALVE_OPTIONS, form.valve_status, v => setField('valve_status', v as typeof form.valve_status))}
            </div>

            <div>
              <label className="label-text mb-2 block">电池电量</label>
              {renderOptions(BATTERY_OPTIONS, form.battery_level, v => setField('battery_level', v as typeof form.battery_level))}
            </div>

            <div>
              <label className="label-text">巡检照片（可选）</label>
              <input
                type="text"
                value={form.photo}
                onChange={e => setField('photo', e.target.value)}
                placeholder="输入图片 URL"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">备注</label>
              <textarea
                value={form.remark}
                onChange={e => setField('remark', e.target.value)}
                placeholder="其他需要说明的情况..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Link to={`/devices/${id}`} className="btn-secondary flex-1">
              取消
            </Link>
            <button type="submit" className="btn-primary flex-1">
              <Save className="w-4 h-4" />
              提交巡检
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
