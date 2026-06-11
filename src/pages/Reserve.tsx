import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/store';
import { useToast } from '@/components/Toast';
import { PURPOSES, Purpose } from '@/types';
import {
  ArrowLeft,
  User,
  Building2,
  CalendarClock,
  Phone,
  HandHelping,
  Lightbulb,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { formatDateTime, getDefaultStartTime, getDefaultEndTime } from '@/utils/helpers';

export default function ReservePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ladders, createReservation, checkTimeConflict } = useStore();
  const { showToast } = useToast();

  const preselectedLadderId = searchParams.get('ladderId') || undefined;
  const preStart = searchParams.get('start');
  const preEnd = searchParams.get('end');

  const [ladderId, setLadderId] = useState<string>(preselectedLadderId || (ladders[0]?.id ?? ''));
  const [borrowerName, setBorrowerName] = useState('');
  const [building, setBuilding] = useState('');
  const [startTime, setStartTime] = useState(
    preStart ? preStart.replace(' ', 'T') : getDefaultStartTime()
  );
  const [expectedEndTime, setExpectedEndTime] = useState(
    preEnd ? preEnd.replace(' ', 'T') : getDefaultEndTime()
  );
  const [purpose, setPurpose] = useState<Purpose | ''>('');
  const [needHelp, setNeedHelp] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedLadderId && ladders.some((l) => l.id === preselectedLadderId)) {
      setLadderId(preselectedLadderId);
    }
  }, [preselectedLadderId, ladders]);

  const conflictInfo = useMemo(() => {
    if (!ladderId || !startTime || !expectedEndTime) return null;
    return checkTimeConflict(ladderId, startTime, expectedEndTime);
  }, [ladderId, startTime, expectedEndTime, checkTimeConflict]);

  const selectedLadder = ladders.find((l) => l.id === ladderId);

  const isFormValid = useMemo(() => {
    if (!ladderId || !borrowerName.trim() || !building.trim() || !startTime || !expectedEndTime || !purpose || !phone.trim()) {
      return false;
    }
    if (new Date(expectedEndTime).getTime() <= new Date(startTime).getTime()) {
      return false;
    }
    if (conflictInfo?.hasConflict) return false;
    return true;
  }, [ladderId, borrowerName, building, startTime, expectedEndTime, purpose, phone, conflictInfo]);

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = createReservation({
      ladderId,
      borrowerName: borrowerName.trim(),
      building: building.trim(),
      startTime,
      expectedEndTime,
      purpose: purpose as Purpose,
      needHelp,
      phone: phone.trim(),
    });

    setSubmitting(false);

    if (result.success) {
      showToast('🎉 ' + result.message, 'success');
      setTimeout(() => navigate('/'), 800);
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost mb-4 -ml-2 text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" />
        返回看板
      </button>

      <div className="mb-8">
        <h2 className="section-title mb-2">
          预约登记<span className="gradient-text"> · 填写借用信息</span>
        </h2>
        <p className="text-sm text-slate-500">请如实填写以下信息，我们会根据预约时段为您保留梯子</p>
      </div>

      <div className="card p-6 sm:p-8 space-y-7">
        <FormSection title="选择梯子" icon={ArrowUpRight} desc="请选择您需要借用的梯子类型">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ladders.map((ladder) => {
              const isSelected = ladderId === ladder.id;
              const availableCount = ladders.filter((l) => l.status === 'available').length;
              return (
                <button
                  key={ladder.id}
                  type="button"
                  onClick={() => setLadderId(ladder.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50 shadow-[0_0_0_4px_rgba(245,158,11,0.1)]'
                      : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                          : 'bg-slate-100'
                      }`}
                    >
                      <ArrowUpRight
                        className={`w-4.5 h-4.5 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                      />
                    </div>
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        ladder.status === 'available'
                          ? 'bg-mint-500'
                          : ladder.status === 'reserved'
                          ? 'bg-amber-500'
                          : ladder.status === 'borrowed'
                          ? 'bg-sky-500'
                          : 'bg-danger-500 animate-blink'
                      }`}
                    />
                  </div>
                  <h4 className={`font-semibold text-sm ${isSelected ? 'text-amber-800' : 'text-slate-800'}`}>
                    {ladder.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{ladder.type}</p>
                  <div className="mt-2 text-[11px] font-medium">
                    {ladder.status === 'available' ? (
                      <span className="text-mint-600 bg-mint-50 px-1.5 py-0.5 rounded">● 可借</span>
                    ) : ladder.status === 'reserved' ? (
                      <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">● 已预约</span>
                    ) : ladder.status === 'borrowed' ? (
                      <span className="text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">● 借出中</span>
                    ) : (
                      <span className="text-danger-600 bg-danger-50 px-1.5 py-0.5 rounded">● 逾期</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </FormSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="借用人姓名"
            icon={User}
            required
          >
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="请输入您的姓名"
              className="input-field pl-11"
              maxLength={20}
            />
          </FormField>

          <FormField label="楼栋号" icon={Building2} required>
            <input
              type="text"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="例如：3 号楼 2 单元"
              className="input-field pl-11"
              maxLength={30}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="借用开始时间" icon={CalendarClock} required>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                const start = new Date(e.target.value);
                const end = new Date(start.getTime() + 4 * 3600000);
                setExpectedEndTime(end.toISOString().slice(0, 16));
              }}
              className="input-field pl-11"
            />
          </FormField>

          <FormField label="预计归还时间" icon={CalendarClock} required>
            <input
              type="datetime-local"
              value={expectedEndTime}
              onChange={(e) => setExpectedEndTime(e.target.value)}
              className="input-field pl-11"
              min={startTime}
            />
          </FormField>
        </div>

        {conflictInfo && conflictInfo.hasConflict && (
          <div className="rounded-2xl border-2 border-danger-200 bg-danger-50 p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-danger-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4.5 h-4.5 text-danger-600" />
              </div>
              <div>
                <h4 className="font-semibold text-danger-800 text-sm mb-1">⚠️ 时段冲突</h4>
                <p className="text-sm text-danger-700 mb-2">
                  您选择的 <span className="font-medium">{selectedLadder?.name}</span> 在该时段已被预约
                </p>
                {conflictInfo.conflictReservation && (
                  <div className="text-xs text-danger-600 bg-white/60 rounded-xl p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{conflictInfo.conflictReservation.borrowerName}</span>
                      <span className="text-danger-400">·</span>
                      <span>{conflictInfo.conflictReservation.building}</span>
                    </div>
                    <div>
                      {formatDateTime(conflictInfo.conflictReservation.startTime)} ~{' '}
                      {formatDateTime(conflictInfo.conflictReservation.expectedEndTime)}
                    </div>
                  </div>
                )}
                {conflictInfo.nextAvailableTime && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Info className="w-4 h-4" />
                    <span>
                      预计可取时间：
                      <span className="font-semibold">
                        {formatDateTime(conflictInfo.nextAvailableTime)}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <FormSection title="借用用途" icon={Lightbulb} desc="选择您借梯子的主要用途">
          <div className="flex flex-wrap gap-2.5">
            {PURPOSES.map((p) => {
              const isActive = purpose === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(isActive ? '' : p)}
                  className={`chip ${isActive ? 'chip-active' : 'chip-inactive'}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </FormSection>

        <FormField label="联系电话" icon={Phone} required>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9*-]/g, ''))}
            placeholder="请输入联系电话，方便联系"
            className="input-field pl-11"
            maxLength={15}
          />
        </FormField>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <HandHelping className="w-5 h-5 text-amber-700" strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">需要帮忙搬运？</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  梯子较重，老人或独居人士可申请物业协助搬运
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNeedHelp(!needHelp)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
                needHelp ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-glow-amber' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
                  needHelp ? 'left-7' : 'left-0.5'
                }`}
              >
                {needHelp && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
              </span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-slate-50">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div className="text-xs text-slate-500 leading-relaxed">
              <span className="font-medium text-slate-700">温馨提示：</span>
              提交后请准时到物业服务中心取用，使用完毕请及时归还。逾期未还将影响您后续的借用权限哦~
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              className="flex-[2] btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-soft"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  提交预约
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSection({
  title,
  icon: Icon,
  desc,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm leading-tight">{title}</h3>
          {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  required,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <Icon className="input-icon w-4.5 h-4.5" />
        {children}
      </div>
    </div>
  );
}
