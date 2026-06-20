import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ClipboardCheck,
  ChevronRight,
  Play,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  LifeBuoy,
  Ruler,
  TriangleAlert,
  Heart,
  Camera,
  Package,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import StatusBadge, { TypeBadge, EmptyState } from '@/components/StatusBadge';
import {
  Equipment,
  EquipmentType,
  Inspection,
  InspectionItem,
  EquipmentTypeLabels,
} from '@/types';
import { formatDate, getTodayStr } from '@/utils/dateUtils';

const typeIcons: Record<EquipmentType, typeof LifeBuoy> = {
  lifebuoy: LifeBuoy,
  rescue_pole: Ruler,
  warning_sign: TriangleAlert,
  first_aid_kit: Heart,
  camera: Camera,
};

interface CheckFormConfig {
  title: string;
  fields: {
    key: string;
    label: string;
    type: 'select' | 'number' | 'boolean';
    options?: { value: string; label: string; isAbnormal?: boolean }[];
    unit?: string;
  }[];
}

const checkConfigs: Record<EquipmentType, CheckFormConfig> = {
  lifebuoy: {
    title: '救生圈点检项',
    fields: [
      {
        key: 'agingCondition',
        label: '老化情况',
        type: 'select',
        options: [
          { value: 'good', label: '良好 - 无明显老化' },
          { value: 'minor', label: '轻微 - 有少量裂纹但可用' },
          { value: 'severe', label: '严重 - 大面积老化开裂', isAbnormal: true },
        ],
      },
      {
        key: 'ropeLength',
        label: '绳索长度',
        type: 'number',
        unit: '米',
      },
      {
        key: 'ropeCondition',
        label: '绳索状态',
        type: 'select',
        options: [
          { value: 'good', label: '良好 - 无磨损' },
          { value: 'damaged', label: '磨损 - 有断丝', isAbnormal: true },
          { value: 'missing', label: '缺失', isAbnormal: true },
        ],
      },
    ],
  },
  rescue_pole: {
    title: '救生杆点检项',
    fields: [
      {
        key: 'crackCondition',
        label: '裂纹情况',
        type: 'select',
        options: [
          { value: 'none', label: '无裂纹' },
          { value: 'minor', label: '轻微裂纹', isAbnormal: true },
          { value: 'severe', label: '严重裂纹/断裂', isAbnormal: true },
        ],
      },
      {
        key: 'lengthOk',
        label: '长度是否达标(≥5米)',
        type: 'boolean',
      },
      {
        key: 'hookCondition',
        label: '挂钩状态',
        type: 'select',
        options: [
          { value: 'good', label: '良好' },
          { value: 'damaged', label: '变形/损坏', isAbnormal: true },
          { value: 'missing', label: '缺失', isAbnormal: true },
        ],
      },
    ],
  },
  warning_sign: {
    title: '警示牌点检项',
    fields: [
      {
        key: 'clarity',
        label: '清晰度',
        type: 'select',
        options: [
          { value: 'clear', label: '清晰可读' },
          { value: 'faded', label: '轻微褪色', isAbnormal: true },
          { value: 'unreadable', label: '无法辨认', isAbnormal: true },
        ],
      },
      {
        key: 'fixation',
        label: '固定状态',
        type: 'select',
        options: [
          { value: 'firm', label: '牢固' },
          { value: 'loose', label: '松动', isAbnormal: true },
          { value: 'missing', label: '缺失', isAbnormal: true },
        ],
      },
    ],
  },
  first_aid_kit: {
    title: '急救箱点检项',
    fields: [
      {
        key: 'completeness',
        label: '物品完整性',
        type: 'select',
        options: [
          { value: 'complete', label: '齐全' },
          { value: 'partial', label: '部分缺失', isAbnormal: true },
          { value: 'empty', label: '大部分/全部缺失', isAbnormal: true },
        ],
      },
      {
        key: 'expiryOk',
        label: '药品是否在有效期内',
        type: 'boolean',
      },
      {
        key: 'sealCondition',
        label: '封条状态',
        type: 'select',
        options: [
          { value: 'good', label: '完好' },
          { value: 'damaged', label: '破损/已开封', isAbnormal: true },
        ],
      },
    ],
  },
  camera: {
    title: '监控摄像头点检项',
    fields: [
      {
        key: 'viewBlocked',
        label: '视线是否被遮挡',
        type: 'boolean',
      },
      {
        key: 'working',
        label: '设备是否正常工作',
        type: 'boolean',
      },
      {
        key: 'angleOk',
        label: '监控角度是否合适',
        type: 'boolean',
      },
    ],
  },
};

export default function InspectionList() {
  const navigate = useNavigate();
  const equipments = useAppStore((state) => state.equipments);
  const inspections = useAppStore((state) => state.inspections);
  const [filterZone, setFilterZone] = useState('');
  const today = getTodayStr();

  const todayInspections = useMemo(
    () => inspections.filter((ins) => ins.inspectionDate === today),
    [inspections, today]
  );

  const inspectedIds = new Set(todayInspections.map((i) => i.equipmentId));

  const pendingEquipments = equipments.filter((e) => !inspectedIds.has(e.id));
  const completedEquipments = equipments.filter((e) => inspectedIds.has(e.id));

  const filteredPending = filterZone
    ? pendingEquipments.filter((e) => e.zone === filterZone)
    : pendingEquipments;

  const zones = [...new Set(equipments.map((e) => e.zone))];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">今日待点检</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingEquipments.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">今日已完成</p>
              <p className="text-3xl font-bold text-green-600">{completedEquipments.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">点检完成率</p>
              <p className="text-3xl font-bold text-primary-600">
                {equipments.length > 0
                  ? Math.round((completedEquipments.length / equipments.length) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">待点检器材</h3>
            <p className="text-sm text-slate-500">共 {filteredPending.length} 件器材待点检</p>
          </div>
          <select
            className="select-field w-40"
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
          >
            <option value="">全部区域</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {filteredPending.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-10 h-10 text-green-400" />}
            title="今日点检已全部完成"
            description={filterZone ? '该区域器材已完成点检' : '所有器材点检任务已完成，干得漂亮！'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPending.map((eq) => {
              const Icon = typeIcons[eq.type];
              return (
                <div
                  key={eq.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-card-hover transition-all group cursor-pointer"
                  onClick={() => navigate(`/inspection/${eq.id}`)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {eq.photo ? (
                      <img src={eq.photo} alt={eq.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{eq.name}</p>
                      <p className="text-xs text-slate-500">{eq.code}</p>
                    </div>
                    <TypeBadge type={eq.type} />
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    <span className="text-slate-400">位置：</span>
                    {eq.location}
                  </p>
                  <p className="text-sm text-slate-600 mb-3">
                    <span className="text-slate-400">责任人：</span>
                    {eq.responsiblePerson}
                  </p>
                  <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2">
                    <Play className="w-4 h-4" />
                    开始点检
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-5">今日点检记录</h3>
        {todayInspections.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-10 h-10" />}
            title="暂无今日点检记录"
            description="开始执行点检后记录会显示在这里"
          />
        ) : (
          <div className="space-y-3">
            {todayInspections.map((ins) => (
              <div
                key={ins.id}
                className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <StatusBadge type="inspection" status={ins.status} />
                    <p className="font-semibold text-slate-800">{ins.equipmentName}</p>
                    <p className="text-sm text-slate-500">{ins.equipmentCode}</p>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {ins.inspector}
                  </p>
                </div>
                {ins.remark && (
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mt-2">
                    备注：{ins.remark}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {ins.items.map((item) => (
                    <span
                      key={item.id}
                      className={`text-xs px-2 py-1 rounded-lg ${
                        item.isAbnormal
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}
                    >
                      {item.itemName}: {item.itemValue}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function InspectionExecute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getEquipment = useAppStore((state) => state.getEquipment);
  const addInspection = useAppStore((state) => state.addInspection);
  const equipment = getEquipment(id || '');

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [remark, setRemark] = useState('');
  const [inspector, setInspector] = useState('张安全');

  const config = equipment ? checkConfigs[equipment.type] : null;

  const isFieldAbnormal = (field: CheckFormConfig['fields'][0], value: any): boolean => {
    if (field.type === 'select') {
      const opt = field.options?.find((o) => o.value === value);
      return !!opt?.isAbnormal;
    }
    if (field.type === 'boolean') {
      if (field.key === 'lengthOk' || field.key === 'expiryOk' || field.key === 'working' || field.key === 'angleOk') {
        return value === false;
      }
      if (field.key === 'viewBlocked') {
        return value === true;
      }
    }
    if (field.type === 'number') {
      if (field.key === 'ropeLength') {
        return typeof value === 'number' && value < 6;
      }
    }
    return false;
  };

  const handleSubmit = () => {
    if (!equipment || !config) return;

    const items: InspectionItem[] = config.fields.map((field, idx) => {
      const value = formValues[field.key];
      const abnormal = isFieldAbnormal(field, value);
      let displayValue = String(value);
      if (field.type === 'select') {
        const opt = field.options?.find((o) => o.value === value);
        displayValue = opt?.label?.split(' - ')[0] || String(value);
      }
      if (field.type === 'boolean') {
        displayValue = value ? '是' : '否';
      }
      if (field.type === 'number' && field.unit) {
        displayValue = `${value}${field.unit}`;
      }
      return {
        id: `item-${Date.now()}-${idx}`,
        itemName: field.label,
        itemKey: field.key,
        itemValue: displayValue,
        isAbnormal: abnormal,
        description: descriptions[field.key],
      };
    });

    const hasAbnormal = items.some((i) => i.isAbnormal);

    addInspection({
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      equipmentCode: equipment.code,
      inspectionDate: getTodayStr(),
      inspector,
      status: hasAbnormal ? 'fail' : 'pass',
      remark,
      items,
    });

    navigate('/inspection');
  };

  if (!equipment || !config) {
    return (
      <div className="card p-12 text-center">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">器材不存在</h3>
        <button onClick={() => navigate('/inspection')} className="btn-primary mt-4">
          返回点检列表
        </button>
      </div>
    );
  }

  const Icon = typeIcons[equipment.type];
  const hasAnyAbnormal = config.fields.some((f) => isFieldAbnormal(f, formValues[f.key]));

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/inspection')}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回点检列表
      </button>

      <div className="card p-6">
        <div className="flex items-start gap-5 pb-6 border-b border-slate-200">
          {equipment.photo ? (
            <img src={equipment.photo} alt={equipment.name} className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <div className="w-20 h-20 bg-primary-50 rounded-xl flex items-center justify-center">
              <Icon className="w-10 h-10 text-primary-600" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 mb-1">{equipment.name}</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-slate-500">{equipment.code}</span>
              <TypeBadge type={equipment.type} />
            </div>
            <p className="text-sm text-slate-600">
              位置：{equipment.zone} - {equipment.location}
            </p>
            <p className="text-sm text-slate-600">责任人：{equipment.responsiblePerson}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">点检日期</p>
            <p className="font-semibold text-slate-800">{formatDate(getTodayStr())}</p>
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary-600" />
            {config.title}
          </h3>

          <div className="space-y-5">
            {config.fields.map((field) => {
              const value = formValues[field.key];
              const abnormal = value !== undefined && isFieldAbnormal(field, value);
              return (
                <div
                  key={field.key}
                  className={`p-4 rounded-xl border transition-all ${
                    abnormal
                      ? 'border-red-300 bg-red-50/50'
                      : value !== undefined && !abnormal
                      ? 'border-green-300 bg-green-50/50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <label className="label-text flex items-center gap-2">
                      {abnormal ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : value !== undefined && !abnormal ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : null}
                      {field.label}
                      <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="mb-3">
                    {field.type === 'select' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {field.options?.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormValues({ ...formValues, [field.key]: opt.value })}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              value === opt.value
                                ? opt.isAbnormal
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-green-500 bg-green-50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <p className={`font-medium ${value === opt.value ? (opt.isAbnormal ? 'text-red-700' : 'text-green-700') : 'text-slate-700'}`}>
                              {opt.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                    {field.type === 'number' && (
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className="input-field w-40"
                          value={value ?? ''}
                          onChange={(e) =>
                            setFormValues({ ...formValues, [field.key]: parseFloat(e.target.value) || 0 })
                          }
                          placeholder="请输入"
                        />
                        {field.unit && <span className="text-slate-600">{field.unit}</span>}
                        {field.key === 'ropeLength' && (
                          <span className="text-xs text-slate-500">标准要求：≥6米</span>
                        )}
                      </div>
                    )}
                    {field.type === 'boolean' && (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFormValues({ ...formValues, [field.key]: true })}
                          className={`px-5 py-2.5 rounded-xl border-2 font-medium transition-all ${
                            value === true
                              ? (field.key === 'viewBlocked' ? 'border-red-500 bg-red-50 text-red-700' : 'border-green-500 bg-green-50 text-green-700')
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          是
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormValues({ ...formValues, [field.key]: false })}
                          className={`px-5 py-2.5 rounded-xl border-2 font-medium transition-all ${
                            value === false
                              ? (field.key === 'viewBlocked' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700')
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          否
                        </button>
                      </div>
                    )}
                  </div>

                  {abnormal && (
                    <div className="animate-slide-in">
                      <label className="label-text text-red-600">异常描述（请详细说明）</label>
                      <textarea
                        className="input-field bg-white"
                        rows={2}
                        value={descriptions[field.key] || ''}
                        onChange={(e) =>
                          setDescriptions({ ...descriptions, [field.key]: e.target.value })
                        }
                        placeholder="请描述具体的异常情况..."
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <label className="label-text">点检人</label>
            <input
              type="text"
              className="input-field mb-3"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
            />
            <label className="label-text">备注（可选）</label>
            <textarea
              className="input-field"
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="补充说明..."
            />
          </div>

          <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3">
              {hasAnyAbnormal ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">检测到异常项，将自动生成维修/补采任务</span>
                </div>
              ) : Object.keys(formValues).length === config.fields.length ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">所有项目检查正常</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    请完成所有检查项（{Object.keys(formValues).length}/{config.fields.length}）
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/inspection')} className="btn-secondary">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(formValues).length < config.fields.length}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                提交点检
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
