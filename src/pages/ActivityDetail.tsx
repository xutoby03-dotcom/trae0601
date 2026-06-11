import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Calendar,
  Tent,
  Building2,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  Phone,
  UserPlus,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
  Minus,
  Plus,
  MessageCircle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { RegisterFormData } from '@/types';
import {
  formatDateOnly,
  formatTimeOnly,
  formatDateTime,
  getConfirmedCount,
  getWaitlistCount,
  getActivityStatus,
  cn,
  isUpcoming,
} from '@/utils/helpers';
import { toast } from '@/components/Toast';
import Empty from '@/components/Empty';

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getActivityById = useAppStore((s) => s.getActivityById);
  const getActivityRegistrations = useAppStore((s) => s.getActivityRegistrations);
  const registerActivity = useAppStore((s) => s.registerActivity);
  const cancelRegistration = useAppStore((s) => s.cancelRegistration);

  const activity = id ? getActivityById(id) : undefined;
  const allRegistrations = id ? getActivityRegistrations(id) : [];

  const confirmedRegs = useMemo(
    () => allRegistrations.filter((r) => r.status === 'confirmed'),
    [allRegistrations]
  );
  const waitlistRegs = useMemo(
    () =>
      allRegistrations
        .filter((r) => r.status === 'waitlist')
        .sort((a, b) => (a.waitlistNumber || 0) - (b.waitlistNumber || 0)),
    [allRegistrations]
  );

  const confirmedCount = getConfirmedCount(allRegistrations);
  const waitlistCount = getWaitlistCount(allRegistrations);

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    childNickname: '',
    allergyInfo: '',
    attendeeCount: 1,
    parentPhone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedCancelId, setSelectedCancelId] = useState<string | null>(null);

  const progress = activity ? Math.min((confirmedCount / activity.maxParticipants) * 100, 100) : 0;
  const status = activity ? getActivityStatus(activity, allRegistrations) : null;
  const canRegister = activity && status && (status.type === 'success' || status.type === 'warning') && isUpcoming(activity.endTime);

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!registerData.childNickname.trim()) errs.childNickname = '请填写孩子昵称';
    if (!registerData.parentPhone.trim()) {
      errs.parentPhone = '请填写家长联系电话';
    } else if (!/^1\d{10}$/.test(registerData.parentPhone)) {
      errs.parentPhone = '请输入正确的11位手机号';
    }
    if (registerData.attendeeCount < 1) errs.attendeeCount = '人数至少为1';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !validateForm()) return;

    setSubmitting(true);
    try {
      const result = registerActivity(activity.id, registerData);
      if (result.success) {
        if (result.status === 'confirmed') {
          toast.success(result.message);
        } else {
          toast.info(result.message);
        }
        setShowRegisterForm(false);
        setRegisterData({
          childNickname: '',
          allergyInfo: '',
          attendeeCount: 1,
          parentPhone: '',
        });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('报名失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (regId: string) => {
    const result = cancelRegistration(regId);
    if (result.success) {
      setSelectedCancelId(null);
      if (result.promotedWaitlist) {
        toast.success(`已取消，候补小朋友「${result.promotedWaitlist}」已自动转正！`);
      } else {
        toast.success('已取消报名');
      }
    } else {
      toast.error('取消失败');
    }
  };

  if (!activity) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <Empty
          title="活动不存在"
          description="该活动可能已被删除或链接无效"
          action={
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              返回活动广场
            </Link>
          }
        />
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    success: 'bg-accent-100 text-accent-700 border-accent-300',
    warning: 'bg-primary-100 text-primary-700 border-primary-300',
    danger: 'bg-red-100 text-red-700 border-red-300',
    info: 'bg-blue-100 text-blue-700 border-blue-300',
    ended: 'bg-ink-400/20 text-ink-500 border-ink-400/30',
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-ink-700 hover:text-primary-600 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回活动列表
      </button>

      <div className="card mb-6">
        <div className="relative h-48 md:h-60 bg-gradient-to-br from-primary-100 via-cream-100 to-accent-100 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,140,66,0.2),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(78,205,196,0.2),transparent_50%)]" />
          <span className="relative text-7xl md:text-9xl drop-shadow-lg animate-pop">
            {activity.coverEmoji}
          </span>
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
            <span className={cn(
              'chip border font-medium',
              activity.locationType === 'outdoor'
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-purple-100 text-purple-700 border-purple-300'
            )}>
              {activity.locationType === 'outdoor' ? <Tent className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
              {activity.locationType === 'outdoor' ? '户外活动' : '室内活动'}
            </span>
            <span className="chip bg-white/80 backdrop-blur text-primary-700 border border-primary-200 font-medium">
              {activity.ageRange}
            </span>
            {status && (
              <span className={cn('chip border font-medium', statusStyles[status.type])}>
                {status.type === 'success' && <UserCheck className="w-3.5 h-3.5" />}
                {status.label}
              </span>
            )}
          </div>
          {activity.creatorName && (
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur rounded-full px-3 py-1.5 text-sm text-ink-700 font-medium">
              发布者：{activity.creatorName}
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-ink-900 mb-5">
            {activity.title}
          </h1>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-cream-100">
              <div className="w-10 h-10 rounded-xl bg-primary-200 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <div className="text-xs text-ink-500 mb-0.5">活动日期</div>
                <div className="font-semibold text-ink-900">{formatDateOnly(activity.startTime)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-cream-100">
              <div className="w-10 h-10 rounded-xl bg-accent-200 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-accent-700" />
              </div>
              <div>
                <div className="text-xs text-ink-500 mb-0.5">活动时间</div>
                <div className="font-semibold text-ink-900">
                  {formatTimeOnly(activity.startTime)} - {formatTimeOnly(activity.endTime)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-cream-100">
              <div className="w-10 h-10 rounded-xl bg-green-200 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <div className="text-xs text-ink-500 mb-0.5">活动地点</div>
                <div className="font-semibold text-ink-900">{activity.location}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-cream-100">
              <div className="w-10 h-10 rounded-xl bg-purple-200 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <div className="text-xs text-ink-500 mb-0.5">参与人数</div>
                <div className="font-semibold text-ink-900">
                  <span className="text-primary-600">{confirmedCount}</span> / {activity.maxParticipants} 人
                  {waitlistCount > 0 && <span className="text-sm text-ink-500 ml-1">（候补 {waitlistCount}）</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="font-medium text-ink-700">报名进度</span>
              <span className="font-bold text-primary-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  progress >= 100
                    ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                    : 'bg-gradient-to-r from-accent-400 to-accent-600'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {activity.needParent && (
            <div className="mb-6 p-4 rounded-2xl bg-primary-50 border-2 border-primary-200 flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-primary-800">需家长陪同参与</div>
                <div className="text-sm text-primary-700 mt-0.5">请家长全程陪同，确保孩子安全</div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-bold text-ink-900 mb-2.5 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary-500" />
              活动内容
            </h3>
            <p className="text-ink-700 leading-relaxed bg-cream-50 p-4 rounded-2xl">
              {activity.description}
            </p>
          </div>

          {activity.notes && (
            <div className="mb-6">
              <h3 className="font-bold text-ink-900 mb-2.5 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary-500" />
                注意事项
              </h3>
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800 leading-relaxed">{activity.notes}</p>
              </div>
            </div>
          )}

          <div className="text-xs text-ink-400 pb-2 border-b border-cream-200">
            发布于 {formatDateTime(activity.createdAt)}
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" />
              已报名名单
              <span className="chip bg-accent-100 text-accent-700 text-sm">
                {confirmedRegs.length} 组家庭
              </span>
            </h3>
          </div>

          {confirmedRegs.length === 0 ? (
            <div className="text-center py-8 text-ink-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-ink-400 opacity-50" />
              还没有小朋友报名，快来第一个吧~
            </div>
          ) : (
            <div className="space-y-3">
              {confirmedRegs.map((reg, idx) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-cream-50 hover:bg-cream-100 transition-colors animate-slide-up"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-lg shadow-soft">
                      {reg.childNickname.slice(0, 1)}
                    </div>
                    <div className="font-semibold text-ink-900">
                      {reg.childNickname}
                    </div>
                  </div>
                  {selectedCancelId === reg.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancel(reg.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        确认取消
                      </button>
                      <button
                        onClick={() => setSelectedCancelId(null)}
                        className="px-3 py-1.5 rounded-xl bg-cream-200 text-ink-700 text-sm font-medium hover:bg-cream-300 transition-colors"
                      >
                        不取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedCancelId(reg.id)}
                      className="p-2 rounded-xl text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="取消报名"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {waitlistRegs.length > 0 && (
        <div className="card mb-6">
          <div className="p-6 md:p-8">
            <button
              onClick={() => setShowWaitlist(!showWaitlist)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                候补队列
                <span className="chip bg-primary-100 text-primary-700 text-sm">
                  {waitlistRegs.length} 人等待
                </span>
              </h3>
              {showWaitlist ? (
                <ChevronUp className="w-5 h-5 text-ink-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-ink-500" />
              )}
            </button>

            {showWaitlist && (
              <div className="mt-5 space-y-3">
                {waitlistRegs.map((reg, idx) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-primary-50/60 border-2 border-dashed border-primary-200 animate-slide-up"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-300 to-primary-400 flex items-center justify-center text-white font-bold shadow-soft">
                        #{reg.waitlistNumber}
                      </div>
                      <div>
                        <div className="font-semibold text-ink-900">
                          {reg.childNickname}
                          <span className="text-xs font-normal text-ink-500 ml-1.5">
                            候补第 {reg.waitlistNumber} 位
                          </span>
                        </div>
                        <div className="text-xs text-primary-700 mt-0.5">
                          有人取消即可自动转正~
                        </div>
                      </div>
                    </div>
                    {selectedCancelId === reg.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCancel(reg.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setSelectedCancelId(null)}
                          className="px-3 py-1.5 rounded-xl bg-cream-200 text-ink-700 text-sm font-medium hover:bg-cream-300 transition-colors"
                        >
                          返回
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedCancelId(reg.id)}
                        className="p-2 rounded-xl text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {canRegister && (
        <div className="card sticky bottom-20 md:sticky-none md:mb-0">
          {!showRegisterForm ? (
            <div className="p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-ink-900 mb-1">
                  想参加这个活动？
                </h3>
                <p className="text-sm text-ink-500">
                  {confirmedCount >= activity.maxParticipants
                    ? '已满员，可加入候补队列等待空位'
                    : '还有空位，快来报名吧~'}
                </p>
              </div>
              <button
                onClick={() => setShowRegisterForm(true)}
                className={cn(
                  'btn-primary w-full md:w-auto flex items-center justify-center gap-2',
                  confirmedCount >= activity.maxParticipants && 'bg-gradient-to-r from-primary-500 to-primary-600'
                )}
              >
                <UserPlus className="w-5 h-5" />
                {confirmedCount >= activity.maxParticipants ? '加入候补' : '我要报名'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="p-5 md:p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  填写报名信息
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-accent-600 bg-accent-50 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  信息安全加密存储
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-2">
                    孩子昵称 <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-ink-400 ml-1">（公开显示）</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.childNickname}
                    onChange={(e) => {
                      setRegisterData((d) => ({ ...d, childNickname: e.target.value }));
                      if (formErrors.childNickname) {
                        setFormErrors((e) => { const n = { ...e }; delete n.childNickname; return n; });
                      }
                    }}
                    placeholder="例如：乐乐"
                    className={cn('input-field', formErrors.childNickname && 'border-red-400 focus:border-red-400')}
                    maxLength={20}
                  />
                  {formErrors.childNickname && <p className="text-red-500 text-xs mt-1.5">{formErrors.childNickname}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-2">
                    到场人数 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRegisterData((d) => ({ ...d, attendeeCount: Math.max(1, d.attendeeCount - 1) }))}
                      className="w-11 h-11 rounded-xl bg-cream-200 flex items-center justify-center text-ink-700 hover:bg-cream-300 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold text-ink-900">{registerData.attendeeCount}</span>
                      <span className="text-sm text-ink-500 ml-1">人</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRegisterData((d) => ({ ...d, attendeeCount: Math.min(10, d.attendeeCount + 1) }))}
                      className="w-11 h-11 rounded-xl bg-cream-200 flex items-center justify-center text-ink-700 hover:bg-cream-300 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-2">
                    过敏信息
                    <span className="text-xs font-normal text-ink-400 ml-1">（仅组织者可见）</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.allergyInfo}
                    onChange={(e) => setRegisterData((d) => ({ ...d, allergyInfo: e.target.value }))}
                    placeholder="如：花生、海鲜，无则不填"
                    className="input-field"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-2">
                    <Phone className="w-4 h-4 inline mr-1 text-primary-500" />
                    家长电话 <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-ink-400 ml-1">（保密不公开）</span>
                  </label>
                  <input
                    type="tel"
                    value={registerData.parentPhone}
                    onChange={(e) => {
                      setRegisterData((d) => ({ ...d, parentPhone: e.target.value }));
                      if (formErrors.parentPhone) {
                        setFormErrors((e) => { const n = { ...e }; delete n.parentPhone; return n; });
                      }
                    }}
                    placeholder="11位手机号"
                    className={cn('input-field', formErrors.parentPhone && 'border-red-400 focus:border-red-400')}
                    maxLength={11}
                  />
                  {formErrors.parentPhone && <p className="text-red-500 text-xs mt-1.5">{formErrors.parentPhone}</p>}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(false);
                    setFormErrors({});
                  }}
                  className="btn-secondary flex-1"
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
                      <UserPlus className="w-5 h-5" />
                      {confirmedCount >= activity.maxParticipants ? '加入候补' : '确认报名'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!canRegister && status?.type === 'ended' && (
        <div className="card text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ink-400/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-ink-400" />
          </div>
          <h3 className="font-bold text-ink-900 mb-1">活动已结束</h3>
          <p className="text-sm text-ink-500 mb-5">下次早点来报名哦~</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            浏览其他活动
          </Link>
        </div>
      )}
    </div>
  );
}
