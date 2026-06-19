import { useAppStore } from '@/store';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FileCheck,
  AlertTriangle,
  Battery,
  Volume2,
  Fuel,
  Wrench,
  ChevronDown,
  ChevronUp,
  Calendar,
  Camera,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import {
  SOUND_OPTIONS,
  LIGHT_OPTIONS,
  VENTILATION_OPTIONS,
  HOSE_OPTIONS,
  VALVE_OPTIONS,
  BATTERY_OPTIONS,
  TASK_TYPE_LABELS,
  type MaintenanceTask,
  type TaskType,
  type Inspection,
} from '@/constants';
import { todayStr, formatDate } from '@/utils/dateUtils';

const taskTypeIcons: Record<TaskType, typeof Battery> = {
  battery: Battery,
  sound: Volume2,
  hose: Fuel,
  valve: Wrench,
  other: Wrench,
};

const triggerFieldLabels: Record<string, string> = {
  sound_status: '声响测试',
  light_status: '指示灯状态',
  ventilation: '通风情况',
  hose_status: '灶具软管',
  valve_status: '阀门状态',
  battery_level: '电池电量',
};

const optionValueLabels: Record<string, Record<string, string>> = {
  sound_status: SOUND_OPTIONS.reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {}),
  light_status: LIGHT_OPTIONS.reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {}),
  ventilation: VENTILATION_OPTIONS.reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {}),
  hose_status: HOSE_OPTIONS.reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {}),
  valve_status: VALVE_OPTIONS.reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {}),
  battery_level: BATTERY_OPTIONS.reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {}),
};

const taskTypeToFields: Record<TaskType, string[]> = {
  battery: ['battery_level'],
  sound: ['sound_status', 'light_status'],
  hose: ['hose_status'],
  valve: ['valve_status'],
  other: [],
};

const levelDanger = (field: string, value: string): boolean => {
  const optMap = optionValueLabels[field] as any;
  const allOpts = [...SOUND_OPTIONS, ...LIGHT_OPTIONS, ...VENTILATION_OPTIONS, ...HOSE_OPTIONS, ...VALVE_OPTIONS, ...BATTERY_OPTIONS];
  const opt = allOpts.find(o => o.value === value);
  return opt?.level === 'danger';
};

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

  const [showResult, setShowResult] = useState<null | {
    hasAnomaly: boolean;
    newTasks: MaintenanceTask[];
    inspection: Inspection;
  }>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const getTriggerItems = (task: MaintenanceTask, inspection: Inspection) => {
    const fields = taskTypeToFields[task.task_type] || [];
    return fields
      .filter(f => inspection[f as keyof Inspection] !== undefined)
      .map(field => ({
        field,
        label: triggerFieldLabels[field] || field,
        value: inspection[field as keyof Inspection] as string,
        labelText: optionValueLabels[field]?.[inspection[field as keyof Inspection] as string] || inspection[field as keyof Inspection],
        isDanger: levelDanger(field, inspection[field as keyof Inspection] as string),
      }))
      .filter(item => levelDanger(item.field, item.value));
  };

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
    setShowResult({
      hasAnomaly: result.inspection.has_anomaly,
      newTasks: result.newTasks,
      inspection: result.inspection,
    });
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
          <div className={`card p-8 ${showResult.hasAnomaly ? 'border-danger-200' : 'border-success-200'}`}>
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center ${showResult.hasAnomaly ? 'bg-danger-50' : 'bg-success-50'}`}>
              {showResult.hasAnomaly ? (
                <AlertTriangle className="w-10 h-10 text-danger-500" />
              ) : (
                <FileCheck className="w-10 h-10 text-success-500" />
              )}
            </div>
            <h2 className={`text-2xl font-bold mb-2 text-center ${showResult.hasAnomaly ? 'text-danger-600' : 'text-success-600'}`}>
              {showResult.hasAnomaly ? '发现异常' : '巡检完成'}
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {showResult.hasAnomaly
                ? `检测到 ${showResult.newTasks.length} 项异常，已生成维修任务`
                : '设备运行正常，继续保持'}
            </p>

            {showResult.hasAnomaly && showResult.newTasks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 bg-danger-500 rounded-full" />
                  新增维修任务（点击查看详情）
                </h3>
                <div className="space-y-2">
                  {showResult.newTasks.map(task => {
                    const Icon = taskTypeIcons[task.task_type] || Wrench;
                    const expanded = expandedTasks.has(task.id);
                    const triggerItems = getTriggerItems(task, showResult.inspection);
                    const hasPhoto = !!showResult.inspection.photo;
                    const hasRemark = !!showResult.inspection.remark;
                    return (
                      <div key={task.id} className="rounded-xl overflow-hidden border border-danger-200 bg-danger-50">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className="w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-danger-100/50"
                        >
                          <div className="w-9 h-9 rounded-lg bg-danger-500 text-white flex items-center justify-center shrink-0">
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold text-danger-600">
                                {TASK_TYPE_LABELS[task.task_type]}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate">{task.description}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{device?.location}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-gray-400">{triggerItems.length} 项触发</span>
                            {expanded ? (
                              <ChevronUp className="w-4 h-4 text-danger-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-danger-400" />
                            )}
                          </div>
                        </button>

                        {expanded && (
                          <div className="px-3 pb-3 pt-0 border-t border-danger-200/50 bg-white/70">
                            <div className="pt-3 space-y-4">
                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-danger-500" />
                                  触发项
                                </div>
                                <div className="space-y-1.5">
                                  {triggerItems.map(item => (
                                    <div key={item.field} className="flex items-center gap-2 text-sm">
                                      <span className="text-gray-500">{item.label}：</span>
                                      <span className="text-danger-600 font-medium">{item.labelText}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                  巡检日期
                                </div>
                                <p className="text-sm text-gray-700 pl-5">
                                  {formatDate(showResult.inspection.inspect_date)}
                                </p>
                              </div>

                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                                  <Camera className="w-3.5 h-3.5 text-gray-400" />
                                  现场照片
                                </div>
                                {hasPhoto ? (
                                  <div className="pl-5">
                                    <img
                                      src={showResult.inspection.photo}
                                      alt="巡检现场照片"
                                      className="rounded-lg border border-gray-200 max-h-48 object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="ml-5 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-center">
                                    <Camera className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">本次巡检未拍摄照片</p>
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                                  备注说明
                                </div>
                                {hasRemark ? (
                                  <p className="text-sm text-gray-700 pl-5 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {showResult.inspection.remark}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400 pl-5 italic">无备注</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Link to={`/devices/${id}`} className="btn-secondary flex-1">
                返回详情
              </Link>
              <Link to="/alerts?status=pending" className="btn-danger flex-1">
                查看待处理任务
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
