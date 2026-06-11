import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  FileText,
  AlertTriangle,
  UserCheck,
  Sparkles,
  Tent,
  Building2,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { toast } from '@/components/Toast';
import { AGE_RANGES, COVER_EMOJIS, PublishFormData, LocationType } from '@/types';
import { getLocalDateTimeInputValue, cn } from '@/utils/helpers';

export default function Publish() {
  const navigate = useNavigate();
  const publishActivity = useAppStore((s) => s.publishActivity);

  const today = new Date();
  today.setHours(today.getHours() + 1);
  const todayEnd = new Date(today);
  todayEnd.setHours(todayEnd.getHours() + 2);

  const [form, setForm] = useState<PublishFormData>({
    title: '',
    ageRange: '',
    location: '',
    locationType: 'outdoor',
    startTime: getLocalDateTimeInputValue(today.toISOString()),
    endTime: getLocalDateTimeInputValue(todayEnd.toISOString()),
    description: '',
    maxParticipants: 8,
    needParent: true,
    notes: '',
    coverEmoji: '🎮',
  });
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof PublishFormData>(key: K, value: PublishFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const ne = { ...e };
        delete ne[key as string];
        return ne;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = '请输入活动标题';
    if (!form.ageRange) errs.ageRange = '请选择年龄段';
    if (!form.location.trim()) errs.location = '请输入活动地点';
    if (!form.startTime) errs.startTime = '请选择开始时间';
    if (!form.endTime) errs.endTime = '请选择结束时间';
    if (form.startTime && form.endTime && new Date(form.startTime) >= new Date(form.endTime)) {
      errs.endTime = '结束时间必须晚于开始时间';
    }
    if (form.maxParticipants < 1) errs.maxParticipants = '人数至少为1人';
    if (!form.description.trim()) errs.description = '请输入活动内容描述';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const newActivity = publishActivity({
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      });
      toast.success('活动发布成功！');
      setTimeout(() => navigate(`/activity/${newActivity.id}`), 500);
    } catch {
      toast.error('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-ink-700 hover:text-primary-600 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回
      </button>

      <div className="card">
        <div className="bg-gradient-to-r from-primary-500 to-accent-400 p-6 md:p-8 text-white">
          <div className="flex items-center gap-2.5 mb-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">发布玩伴活动</h2>
          </div>
          <p className="text-white/90">填写活动信息，让小区家长一起约起来~</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-7">
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2.5">
              <FileText className="w-4 h-4 inline mr-1.5 text-primary-500" />
              活动标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="例如：周六沙池挖沙派对"
              className={cn('input-field', errors.title && 'border-red-400 focus:border-red-400')}
              maxLength={50}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2.5">
              <Sparkles className="w-4 h-4 inline mr-1.5 text-primary-500" />
              活动封面图标
            </label>
            <div className="flex flex-wrap gap-2">
              {COVER_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => update('coverEmoji', emoji)}
                  className={cn(
                    'w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all border-2',
                    form.coverEmoji === emoji
                      ? 'bg-primary-100 border-primary-400 scale-110 shadow-soft'
                      : 'bg-cream-100 border-transparent hover:bg-cream-200 hover:scale-105'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2.5">
              <Users className="w-4 h-4 inline mr-1.5 text-primary-500" />
              适合年龄段 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAgeDropdown(!showAgeDropdown)}
                className={cn(
                  'input-field flex items-center justify-between text-left',
                  errors.ageRange && 'border-red-400 focus:border-red-400'
                )}
              >
                <span className={form.ageRange ? 'text-ink-900' : 'text-ink-400'}>
                  {form.ageRange || '请选择年龄段'}
                </span>
                <ChevronDown className={cn('w-5 h-5 text-ink-400 transition-transform', showAgeDropdown && 'rotate-180')} />
              </button>
              {showAgeDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white rounded-2xl shadow-float border border-cream-300 overflow-hidden animate-pop">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => {
                        update('ageRange', age);
                        setShowAgeDropdown(false);
                      }}
                      className={cn(
                        'w-full px-4 py-3 flex items-center justify-between hover:bg-cream-100 transition-colors text-left',
                        form.ageRange === age && 'bg-primary-50 text-primary-700'
                      )}
                    >
                      <span>{age}</span>
                      {form.ageRange === age && <Check className="w-4 h-4 text-primary-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.ageRange && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.ageRange}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-2.5">
                <Calendar className="w-4 h-4 inline mr-1.5 text-primary-500" />
                开始时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => update('startTime', e.target.value)}
                className={cn('input-field', errors.startTime && 'border-red-400 focus:border-red-400')}
              />
              {errors.startTime && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-2.5">
                <Calendar className="w-4 h-4 inline mr-1.5 text-primary-500" />
                结束时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => update('endTime', e.target.value)}
                className={cn('input-field', errors.endTime && 'border-red-400 focus:border-red-400')}
              />
              {errors.endTime && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.endTime}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2.5">
              <MapPin className="w-4 h-4 inline mr-1.5 text-primary-500" />
              活动地点 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="例如：阳光小区中心花园沙池"
              className={cn('input-field', errors.location && 'border-red-400 focus:border-red-400')}
            />
            {errors.location && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2.5">
              场地类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['outdoor', 'indoor'] as LocationType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update('locationType', type)}
                  className={cn(
                    'p-4 rounded-2xl border-2 flex items-center gap-3 transition-all',
                    form.locationType === type
                      ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-soft'
                      : 'border-cream-300 bg-white hover:bg-cream-100 text-ink-700'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    form.locationType === type ? 'bg-primary-200' : 'bg-cream-200'
                  )}>
                    {type === 'outdoor' ? <Tent className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{type === 'outdoor' ? '户外' : '室内'}</div>
                    <div className="text-xs opacity-70">{type === 'outdoor' ? '公园、沙池、运动场' : '活动室、图书室'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2.5">
              <Users className="w-4 h-4 inline mr-1.5 text-primary-500" />
              最大参与人数（含陪同家长）
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="30"
                value={form.maxParticipants}
                onChange={(e) => update('maxParticipants', Number(e.target.value))}
                className="flex-1 accent-primary-500"
              />
              <div className="w-20 text-center">
                <span className="text-2xl font-bold text-primary-600">{form.maxParticipants}</span>
                <span className="text-sm text-ink-500">人</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2.5">
              <FileText className="w-4 h-4 inline mr-1.5 text-primary-500" />
              活动内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="描述活动内容，例如玩什么、带什么装备..."
              rows={4}
              className={cn('input-field resize-none', errors.description && 'border-red-400 focus:border-red-400')}
              maxLength={500}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2.5">
              <UserCheck className="w-4 h-4 inline mr-1.5 text-primary-500" />
              家长是否需要陪同
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => update('needParent', true)}
                className={cn(
                  'p-4 rounded-2xl border-2 transition-all text-left',
                  form.needParent
                    ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-soft'
                    : 'border-cream-300 bg-white hover:bg-cream-100 text-ink-700'
                )}
              >
                <div className="font-semibold">需要陪同</div>
                <div className="text-xs opacity-70 mt-1">每位孩子需1位家长陪同</div>
              </button>
              <button
                type="button"
                onClick={() => update('needParent', false)}
                className={cn(
                  'p-4 rounded-2xl border-2 transition-all text-left',
                  !form.needParent
                    ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-soft'
                    : 'border-cream-300 bg-white hover:bg-cream-100 text-ink-700'
                )}
              >
                <div className="font-semibold">无需陪同</div>
                <div className="text-xs opacity-70 mt-1">孩子可独立参与</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2.5">
              <AlertTriangle className="w-4 h-4 inline mr-1.5 text-primary-500" />
              注意事项
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="如：过敏提醒、着装要求、需要带的物品等"
              rows={3}
              className="input-field resize-none"
              maxLength={300}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-cream-300">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1"
              disabled={submitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  发布活动
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
