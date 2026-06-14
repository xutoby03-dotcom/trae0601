import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calculator,
  Banknote,
  QrCode,
  ClipboardList,
  PenLine,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import SignaturePad from '@/components/SignaturePad';
import { formatCurrency, getShiftLabel, todayStr } from '@/utils/format';
import type { DenominationItem, Register, ScanCodeStatus } from '../../shared/types';
import { DENOMINATIONS } from '../../shared/types';

const STEPS = [
  { key: 'info', label: '基本信息', icon: Calculator },
  { key: 'denomination', label: '现金清点', icon: Banknote },
  { key: 'scan', label: '扫码&未结', icon: QrCode },
  { key: 'sign', label: '签名确认', icon: PenLine },
];

export default function HandoverCreate() {
  const navigate = useNavigate();
  const { registers, fetchRegisters, createHandover } = useAppStore();
  const [step, setStep] = useState(0);

  const [registerId, setRegisterId] = useState('');
  const [shift, setShift] = useState<'morning' | 'evening'>('morning');
  const [shiftDate, setShiftDate] = useState(todayStr());
  const [scheduledTime, setScheduledTime] = useState('');
  const [handoverPerson, setHandoverPerson] = useState('');
  const [successorPerson, setSuccessorPerson] = useState('');

  const [denominations, setDenominations] = useState<DenominationItem[]>(
    DENOMINATIONS.map((d) => ({ denomination: d, count: 0 }))
  );

  const [scanCodeStatus, setScanCodeStatus] = useState<ScanCodeStatus>('normal');
  const [scanCodeNote, setScanCodeNote] = useState('');
  const [pendingItems, setPendingItems] = useState('无');

  const [differenceReason, setDifferenceReason] = useState('');
  const [handoverSignature, setHandoverSignature] = useState('');
  const [successorSignature, setSuccessorSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRegisters();
  }, [fetchRegisters]);

  const selectedRegister: Register | undefined = useMemo(
    () => registers.find((r) => r.id === registerId),
    [registers, registerId]
  );

  const actualAmount = useMemo(
    () => denominations.reduce((sum, d) => sum + d.denomination * d.count, 0),
    [denominations]
  );

  const difference = useMemo(() => {
    if (!selectedRegister) return 0;
    return Number((actualAmount - selectedRegister.defaultAmount).toFixed(2));
  }, [actualAmount, selectedRegister]);

  const isDanger = selectedRegister ? Math.abs(difference) > selectedRegister.threshold : false;
  const isWarning = difference !== 0 && !isDanger;
  const hasDifference = difference !== 0;

  const updateDenomination = (denom: number, count: number) => {
    setDenominations((prev) =>
      prev.map((d) => (d.denomination === denom ? { ...d, count: Math.max(0, count) } : d))
    );
  };

  const validateCurrent = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!registerId) e.registerId = '请选择收银台';
      if (!handoverPerson.trim()) e.handoverPerson = '请输入交接人姓名';
      if (!successorPerson.trim()) e.successorPerson = '请输入接班人姓名';
      if (!scheduledTime) e.scheduledTime = '请输入规定交接时间';
    }
    if (step === 2) {
      if (hasDifference && !differenceReason.trim()) {
        e.differenceReason = '有差额时必须填写原因';
      }
    }
    if (step === 3) {
      if (!handoverSignature) e.handoverSignature = '请交接人签名';
      if (!successorSignature) e.successorSignature = '请接班人签名';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateCurrent()) return;
    setStep(Math.min(step + 1, STEPS.length - 1));
  };

  const prev = () => setStep(Math.max(step - 1, 0));

  const handleSubmit = async () => {
    if (!validateCurrent()) return;
    setSubmitting(true);
    try {
      const handoverTime = new Date().toISOString();
      const [datePart, timePart] = scheduledTime.split('T');
      const scheduledIso = new Date(
        `${datePart || shiftDate}T${timePart || '08:30'}:00`
      ).toISOString();

      await createHandover({
        registerId,
        shift,
        shiftDate,
        denominations,
        differenceReason: hasDifference ? differenceReason : undefined,
        scanCodeStatus,
        scanCodeNote: scanCodeNote || undefined,
        pendingItems,
        handoverPerson,
        handoverSignature,
        successorPerson,
        successorSignature,
        handoverTime,
        scheduledTime: scheduledIso,
      });
      navigate('/handovers');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/handovers')}
          className="p-2 rounded-lg text-gray-500 hover:bg-warm-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">新建交接</h1>
          <p className="text-sm text-gray-500 mt-1">请按步骤完成交接登记</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 p-6">
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-primary-600 text-white'
                        : isActive
                        ? 'bg-primary-100 text-primary-700 ring-4 ring-primary-50'
                        : 'bg-warm-100 text-gray-400'
                    }`}
                  >
                    {isDone ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <div
                    className={`mt-2 text-xs font-medium ${
                      isActive || isDone ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 -mt-6 ${
                      isDone ? 'bg-primary-400' : 'bg-warm-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {step === 0 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  收银台 <span className="text-red-500">*</span>
                </label>
                <select
                  value={registerId}
                  onChange={(e) => setRegisterId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 ${
                    errors.registerId ? 'border-red-400' : 'border-warm-200 focus:border-primary-400'
                  }`}
                >
                  <option value="">请选择收银台</option>
                  {registers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} - {r.managerName} (默认{formatCurrency(r.defaultAmount)})
                    </option>
                  ))}
                </select>
                {errors.registerId && <p className="text-xs text-red-500 mt-1">{errors.registerId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  班次 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['morning', 'evening'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShift(s)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        shift === s
                          ? 'bg-primary-50 border-primary-400 text-primary-700'
                          : 'border-warm-200 text-gray-600 hover:bg-warm-50'
                      }`}
                    >
                      {getShiftLabel(s)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  交接日期
                </label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  规定交接时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${
                    errors.scheduledTime ? 'border-red-400' : 'border-warm-200 focus:border-primary-400'
                  }`}
                />
                {errors.scheduledTime && (
                  <p className="text-xs text-red-500 mt-1">{errors.scheduledTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  交接人 <span className="text-red-500">*</span>
                </label>
                <input
                  value={handoverPerson}
                  onChange={(e) => setHandoverPerson(e.target.value)}
                  placeholder="请输入交接人姓名"
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${
                    errors.handoverPerson ? 'border-red-400' : 'border-warm-200 focus:border-primary-400'
                  }`}
                />
                {errors.handoverPerson && (
                  <p className="text-xs text-red-500 mt-1">{errors.handoverPerson}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  接班人 <span className="text-red-500">*</span>
                </label>
                <input
                  value={successorPerson}
                  onChange={(e) => setSuccessorPerson(e.target.value)}
                  placeholder="请输入接班人姓名"
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${
                    errors.successorPerson
                      ? 'border-red-400'
                      : 'border-warm-200 focus:border-primary-400'
                  }`}
                />
                {errors.successorPerson && (
                  <p className="text-xs text-red-500 mt-1">{errors.successorPerson}</p>
                )}
              </div>
            </div>

            {selectedRegister && (
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                <div className="text-sm text-primary-700">
                  <span className="font-medium">{selectedRegister.code}</span> 默认备用金：
                  <span className="font-bold">{formatCurrency(selectedRegister.defaultAmount)}</span>
                  ，差额阈值：{formatCurrency(selectedRegister.threshold)}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">请录入各面额现金数量</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {denominations.map((d) => (
                  <div key={d.denomination} className="bg-warm-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-2">¥{d.denomination}</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateDenomination(d.denomination, d.count - 1)}
                        className="w-9 h-9 rounded-lg bg-white border border-warm-200 text-gray-600 hover:bg-warm-100 text-lg font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={d.count}
                        onChange={(e) =>
                          updateDenomination(d.denomination, parseInt(e.target.value) || 0)
                        }
                        className="flex-1 w-full px-2 py-2 text-center font-bold text-lg rounded-lg border border-warm-200 bg-white focus:outline-none focus:border-primary-400"
                      />
                      <button
                        type="button"
                        onClick={() => updateDenomination(d.denomination, d.count + 1)}
                        className="w-9 h-9 rounded-lg bg-white border border-warm-200 text-gray-600 hover:bg-warm-100 text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs text-primary-600 mt-2 text-center">
                      小计 {formatCurrency(d.denomination * d.count)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-warm-100">
              <div>
                <div className="text-sm text-gray-500">默认备用金</div>
                <div className="text-lg font-semibold text-gray-700">
                  {selectedRegister ? formatCurrency(selectedRegister.defaultAmount) : '--'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">实点金额</div>
                <div className="text-2xl font-serif font-bold text-gray-900">
                  {formatCurrency(actualAmount)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">差额</div>
                <div
                  className={`text-2xl font-serif font-bold ${
                    difference > 0
                      ? 'text-emerald-600'
                      : difference < 0
                      ? 'text-red-600'
                      : 'text-gray-900'
                  }`}
                >
                  {difference > 0 ? '+' : ''}
                  {formatCurrency(difference)}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            {hasDifference && (
              <div
                className={`rounded-xl p-5 border flex items-start gap-3 ${
                  isDanger
                    ? 'bg-red-50 border-red-200 animate-pulse-danger'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <AlertTriangle
                  className={`shrink-0 mt-0.5 ${isDanger ? 'text-red-600' : 'text-amber-600'}`}
                  size={22}
                />
                <div className="flex-1">
                  <div className={`font-semibold ${isDanger ? 'text-red-800' : 'text-amber-800'}`}>
                    {isDanger ? '大额差额警告！' : '存在差额'}
                  </div>
                  <div className={`text-sm mt-1 ${isDanger ? 'text-red-700' : 'text-amber-700'}`}>
                    差额：
                    <span className="font-bold">
                      {difference > 0 ? '+' : ''}
                      {formatCurrency(difference)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {hasDifference && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  差额原因 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={differenceReason}
                  onChange={(e) => setDifferenceReason(e.target.value)}
                  rows={3}
                  placeholder="请详细说明差额产生的原因..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none ${
                    errors.differenceReason
                      ? 'border-red-400'
                      : 'border-warm-200 focus:border-primary-400'
                  }`}
                />
                {errors.differenceReason && (
                  <p className="text-xs text-red-500 mt-1">{errors.differenceReason}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <QrCode size={16} className="text-primary-600" />
                扫码备用码状态
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'damaged', 'missing'] as const).map((s) => {
                  const labels = { normal: '正常', damaged: '破损', missing: '缺失' };
                  const colors = {
                    normal: 'bg-green-100 border-green-300 text-green-700',
                    damaged: 'bg-amber-100 border-amber-300 text-amber-700',
                    missing: 'bg-red-100 border-red-300 text-red-700',
                  };
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScanCodeStatus(s)}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        scanCodeStatus === s
                          ? colors[s]
                          : 'border-warm-200 text-gray-600 hover:bg-warm-50'
                      }`}
                    >
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            {scanCodeStatus !== 'normal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  扫码状态备注
                </label>
                <input
                  value={scanCodeNote}
                  onChange={(e) => setScanCodeNote(e.target.value)}
                  placeholder="请说明扫码码的情况..."
                  className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <ClipboardList size={16} className="text-primary-600" />
                上一班未结事项
              </label>
              <textarea
                value={pendingItems}
                onChange={(e) => setPendingItems(e.target.value)}
                rows={3}
                placeholder="记录需要下一班跟进的事项..."
                className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">交接人</label>
                  <div className="text-lg font-semibold text-gray-900 mt-0.5">{handoverPerson}</div>
                </div>
                <SignaturePad
                  label=""
                  value={handoverSignature}
                  onChange={setHandoverSignature}
                />
                {errors.handoverSignature && (
                  <p className="text-xs text-red-500 mt-1">{errors.handoverSignature}</p>
                )}
              </div>

              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">接班人</label>
                  <div className="text-lg font-semibold text-gray-900 mt-0.5">{successorPerson}</div>
                </div>
                <SignaturePad
                  label=""
                  value={successorSignature}
                  onChange={setSuccessorSignature}
                />
                {errors.successorSignature && (
                  <p className="text-xs text-red-500 mt-1">{errors.successorSignature}</p>
                )}
              </div>
            </div>

            <div className="bg-warm-50 rounded-xl p-5 border border-warm-200">
              <div className="font-serif font-semibold text-gray-900 mb-3">交接摘要</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">收银台：</span>
                  <span className="text-gray-900 font-medium">
                    {selectedRegister?.code || '--'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">班次：</span>
                  <span className="text-gray-900 font-medium">{getShiftLabel(shift)}</span>
                </div>
                <div>
                  <span className="text-gray-500">默认备用金：</span>
                  <span className="text-gray-900 font-medium">
                    {selectedRegister ? formatCurrency(selectedRegister.defaultAmount) : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">实点金额：</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(actualAmount)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">差额：</span>
                  <span
                    className={`font-bold ${
                      difference > 0
                        ? 'text-emerald-600'
                        : difference < 0
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {difference > 0 ? '+' : ''}
                    {formatCurrency(difference)}
                    {isDanger && ' (超标)'}
                    {isWarning && ' (注意)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-warm-100">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg border transition-colors ${
              step === 0
                ? 'border-warm-100 text-gray-300 cursor-not-allowed'
                : 'border-warm-200 text-gray-600 hover:bg-warm-50'
            }`}
          >
            <ArrowLeft size={16} />
            上一步
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              下一步
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Check size={16} />
              {submitting ? '提交中...' : '完成交接'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
