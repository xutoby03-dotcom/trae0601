import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  MapPin,
  Droplets,
  Waves,
  DoorOpen,
  Flower2,
  StickyNote,
  Image as ImageIcon,
  Wrench,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAreaStore } from '../../store/useAreaStore';
import { useInspectionStore } from '../../store/useInspectionStore';
import { useRainEventStore } from '../../store/useRainEventStore';
import { useTaskStore } from '../../store/useTaskStore';
import { hasAnomaly as checkHasAnomaly, checkRepeatedAnomaly } from '../../utils/anomaly';
import { formatDate } from '../../utils/date';
import PhotoUpload from '../../components/PhotoUpload';
import AnomalyCard from '../../components/AnomalyCard';
import type { DampLevel, DrainStatus } from '../../types';

const dampLevelOptions: { value: DampLevel; label: string; desc: string }[] = [
  { value: 'none', label: '无潮痕', desc: '墙面干燥，无任何水渍' },
  { value: 'light', label: '轻微潮痕', desc: '有隐约水印，触摸不潮湿' },
  { value: 'medium', label: '明显潮痕', desc: '水印清晰，触摸有潮湿感' },
  { value: 'severe', label: '严重渗水', desc: '墙面湿润，有滴水或积水' },
];

const drainStatusOptions: { value: DrainStatus; label: string; desc: string }[] = [
  { value: 'normal', label: '排水正常', desc: '积水在5分钟内排完' },
  { value: 'slow', label: '排水较慢', desc: '积水5-30分钟排完' },
  { value: 'blocked', label: '堵塞', desc: '积水超过30分钟未排完或完全不排水' },
];

const presetWaterPoints = [
  '东北角',
  '东南角',
  '西南角',
  '西北角',
  '地漏A周围',
  '地漏B周围',
  '门槛内侧',
  '门槛外侧',
  '花盆底部',
];

export default function InspectionForm() {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();

  const { getAreaById } = useAreaStore();
  const { addInspection, inspections } = useInspectionStore();
  const { getLatestRainEvent, rainEvents } = useRainEventStore();
  const { tasks } = useTaskStore();

  const area = areaId ? getAreaById(areaId) : undefined;

  const latestRain = getLatestRainEvent();
  const isRepeated = areaId ? checkRepeatedAnomaly(areaId, inspections) : false;

  const areaTasks = areaId
    ? tasks.filter((t) => t.areaId === areaId && t.status !== 'completed')
    : [];

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    inspectionDate: formatDate(new Date()),
    rainEventId: latestRain?.id || '',
    waterPoints: [] as string[],
    customWaterPoint: '',
    wallDampLevel: 'none' as DampLevel,
    drainStatus: 'normal' as DrainStatus,
    thresholdLeak: false,
    flowerPotLayout: '',
    notes: '',
    photos: [] as string[],
  });

  const hasAnomaly = useMemo(
    () =>
      checkHasAnomaly(
        formData.waterPoints,
        formData.wallDampLevel,
        formData.drainStatus,
        formData.thresholdLeak
      ),
    [formData.waterPoints, formData.wallDampLevel, formData.drainStatus, formData.thresholdLeak]
  );

  const steps = [
    { key: 'water', label: '积水点', icon: Waves },
    { key: 'wall', label: '墙角潮痕', icon: Droplets },
    { key: 'drain', label: '地漏排水', icon: Droplets },
    { key: 'threshold', label: '门槛渗水', icon: DoorOpen },
    { key: 'flower', label: '花盆摆放', icon: Flower2 },
    { key: 'photo', label: '照片记录', icon: ImageIcon },
  ];

  const toggleWaterPoint = (point: string) => {
    setFormData((prev) => ({
      ...prev,
      waterPoints: prev.waterPoints.includes(point)
        ? prev.waterPoints.filter((p) => p !== point)
        : [...prev.waterPoints, point],
    }));
  };

  const addCustomWaterPoint = () => {
    if (formData.customWaterPoint.trim() && !formData.waterPoints.includes(formData.customWaterPoint.trim())) {
      setFormData((prev) => ({
        ...prev,
        waterPoints: [...prev.waterPoints, prev.customWaterPoint.trim()],
        customWaterPoint: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaId) return;

    addInspection({
      areaId,
      inspectionDate: formData.inspectionDate,
      rainEventId: formData.rainEventId,
      waterPoints: formData.waterPoints,
      wallDampLevel: formData.wallDampLevel,
      drainStatus: formData.drainStatus,
      thresholdLeak: formData.thresholdLeak,
      flowerPotLayout: formData.flowerPotLayout,
      notes: formData.notes,
      photos: formData.photos,
      hasAnomaly,
    });

    if (hasAnomaly) {
      if (confirm('检查发现异常，是否立即创建维修任务？')) {
        navigate(`/tasks/new?areaId=${areaId}&hasAnomaly=true`);
      } else {
        navigate('/inspections');
      }
    } else {
      navigate('/inspections');
    }
  };

  if (!area) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">请先选择要检查的区域</p>
        <Link to="/inspections" className="text-primary-500 hover:text-primary-600">
          返回检查列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/inspections"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回检查列表
      </Link>

      {(isRepeated || areaTasks.length > 0) && (
        <AnomalyCard
          title={`${area.name} - 历史异常提醒`}
          description={
            isRepeated
              ? '该区域连续两次检查出现异常，请重点关注'
              : `该区域有 ${areaTasks.length} 个未完成的维修任务`
          }
        />
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-primary-500" />
              <h2 className="font-serif text-xl font-bold text-gray-800">{area.name}</h2>
            </div>
            <p className="text-sm text-gray-500">
              朝向 {area.orientation} · {area.areaSize}㎡ · 地漏 {area.drainCount} 个
            </p>
          </div>
          {hasAnomaly ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-danger-100 text-danger-600 rounded-full text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              本次检查有异常
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success-100 text-success-600 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              目前正常
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">检查日期</label>
              <input
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">对应暴雨</label>
              <select
                value={formData.rainEventId}
                onChange={(e) => setFormData({ ...formData, rainEventId: e.target.value })}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              >
                {rainEvents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatDate(r.date)} · {r.intensity === 'storm' ? '暴雨' : r.intensity === 'heavy' ? '大雨' : r.intensity === 'moderate' ? '中雨' : '小雨'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = index === step;
              const isDone = index < step;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : isDone
                      ? 'bg-success-100 text-success-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {index + 1}. {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 0 && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Waves className="w-5 h-5 text-primary-500" />
                记录积水点位置
                <span className="text-sm font-normal text-gray-500">（点击选择，可多选）</span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {presetWaterPoints.map((point) => {
                  const isSelected = formData.waterPoints.includes(point);
                  return (
                    <button
                      key={point}
                      type="button"
                      onClick={() => toggleWaterPoint(point)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {point}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.customWaterPoint}
                  onChange={(e) => setFormData({ ...formData, customWaterPoint: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomWaterPoint())}
                  placeholder="输入其他积水位置..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomWaterPoint}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  添加
                </button>
              </div>
              {formData.waterPoints.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700">
                    已选择 {formData.waterPoints.length} 处积水点：
                    {formData.waterPoints.join('、')}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary-500" />
                墙角潮痕程度
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dampLevelOptions.map((opt) => {
                  const isSelected = formData.wallDampLevel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, wallDampLevel: opt.value })}
                      className={`p-4 rounded-xl text-left transition-all border-2 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <p className={`font-bold mb-1 ${isSelected ? 'text-primary-600' : 'text-gray-800'}`}>
                        {opt.label}
                      </p>
                      <p className="text-sm text-gray-500">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary-500" />
                地漏排水状况
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {drainStatusOptions.map((opt) => {
                  const isSelected = formData.drainStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, drainStatus: opt.value })}
                      className={`p-4 rounded-xl text-center transition-all border-2 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <p className={`font-bold mb-1 ${isSelected ? 'text-primary-600' : 'text-gray-800'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-primary-500" />
                门槛是否渗水
              </h3>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, thresholdLeak: true })}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    formData.thresholdLeak
                      ? 'border-danger-500 bg-danger-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className={`text-lg font-bold ${formData.thresholdLeak ? 'text-danger-600' : 'text-gray-800'}`}>
                    是，有渗水
                  </p>
                  <p className="text-xs text-gray-500 mt-1">水渗入室内侧</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, thresholdLeak: false })}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    !formData.thresholdLeak
                      ? 'border-success-500 bg-success-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className={`text-lg font-bold ${!formData.thresholdLeak ? 'text-success-600' : 'text-gray-800'}`}>
                    否，正常
                  </p>
                  <p className="text-xs text-gray-500 mt-1">门槛内外干燥</p>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Flower2 className="w-5 h-5 text-primary-500" />
                花盆摆放位置
                <span className="text-sm font-normal text-gray-500">（记录花盆是否遮挡地漏等）</span>
              </h3>
              <textarea
                value={formData.flowerPotLayout}
                onChange={(e) => setFormData({ ...formData, flowerPotLayout: e.target.value })}
                placeholder="例如：东侧靠墙3盆大花盆，西侧2盆小花架，北侧花盆靠近地漏B..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary-500" />
                现场照片记录
              </h3>
              <PhotoUpload photos={formData.photos} onChange={(photos) => setFormData({ ...formData, photos })} />

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-primary-500" />
                  备注说明
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="其他需要记录的情况..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一步
            </button>
            <div className="flex gap-3">
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors text-sm"
                >
                  下一步
                </button>
              ) : (
                <div className="flex gap-3">
                  {hasAnomaly && (
                    <Link
                      to={`/tasks/new?areaId=${area.id}&hasAnomaly=true`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-warning-500 text-warning-600 rounded-xl hover:bg-warning-50 transition-colors text-sm font-medium"
                    >
                      <Wrench className="w-4 h-4" />
                      先创建维修任务
                    </Link>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all text-sm"
                  >
                    <Save className="w-4 h-4" />
                    保存检查记录
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
