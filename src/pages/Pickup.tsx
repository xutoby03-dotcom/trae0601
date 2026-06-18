import { useState, useMemo, useRef } from 'react';
import {
  Search,
  HandCoins,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  QrCode,
} from 'lucide-react';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Field';
import { usePackageStore } from '@/store/packageStore';
import { useReminderStore } from '@/store/reminderStore';
import { useExceptionStore } from '@/store/exceptionStore';
import {
  cn,
  getDelayLevel,
  getDelayLevelBgColor,
  getDelayLevelTextColor,
  getDelayLevelColor,
  formatDateTime,
  formatDelayTime,
  sizeLabel,
} from '@/utils';
import { REMINDER_TYPE_LABEL, EXCEPTION_TYPE_LABEL } from '@/types';
import type { PackageItem, DelayLevel, ExceptionType } from '@/types';

const levelLabel: Record<DelayLevel, string> = {
  normal: '正常存放',
  warning: '滞留24h+',
  danger: '滞留48h+',
  critical: '滞留72h+',
};

const levelVariant: Record<DelayLevel, 'success' | 'warning' | 'danger' | 'critical'> = {
  normal: 'success',
  warning: 'warning',
  danger: 'danger',
  critical: 'critical',
};

export default function PickupPage() {
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<PackageItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showException, setShowException] = useState(false);
  const [verifyLast4, setVerifyLast4] = useState('');
  const [pickupName, setPickupName] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const packages = usePackageStore((s) => s.packages);
  const logs = useReminderStore((s) => s.logs);
  const allStored = useMemo(() => packages.filter((p) => p.status === 'stored'), [packages]);
  const searchPkgsRef = useRef(usePackageStore.getState().searchPackages);
  const pickupRef = useRef(usePackageStore.getState().pickupPackage);
  const addExceptionRef = useRef(useExceptionStore.getState().addException);
  const triggerManualRef = useRef(useReminderStore.getState().triggerManualReminder);

  const handleSearch = () => {
    if (!keyword.trim()) {
      setResult(null);
      setNotFound(false);
      return;
    }
    const results = searchPkgsRef.current(keyword);
    if (results.length > 0) {
      setResult(results[0]);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handlePickup = () => {
    if (!result) return;
    if (verifyLast4 !== result.phoneLast4) {
      setVerifyError('手机号后四位不正确');
      return;
    }
    if (!pickupName.trim()) {
      setVerifyError('请填写取件人姓名');
      return;
    }
    pickupRef.current(result.id, pickupName.trim());
    setShowConfirm(false);
    showToast('✅ 取件成功！格口已释放');
    setTimeout(() => {
      setResult(null);
      setKeyword('');
      setVerifyLast4('');
      setPickupName('');
      setVerifyError('');
    }, 600);
  };

  const handleExceptionSubmit = (type: ExceptionType, description: string) => {
    if (!result) return;
    addExceptionRef.current({
      packageId: result.id,
      recipientName: result.recipientName,
      slotLabel: result.slotLabel,
      type,
      description,
      handler: '张建国',
    });
    setShowException(false);
    showToast('⚠️ 异常已记录');
    setTimeout(() => {
      setResult(null);
      setKeyword('');
    }, 600);
  };

  const recentDelayed = allStored
    .filter((p) => getDelayLevel(p.storedAt) !== 'normal')
    .sort((a, b) => new Date(a.storedAt).getTime() - new Date(b.storedAt).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">✋ 取件操作</h1>
        <p className="text-sm text-slate-500 mt-1">搜索并确认取件，验证身份后完成操作</p>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border-b border-indigo-100">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center space-y-1 mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 mb-2">
                <Search className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">查找包裹</h2>
              <p className="text-sm text-slate-500">输入取件码 / 手机尾号 / 收件人 / 格口号</p>
            </div>
            <div className="relative">
              <Input
                placeholder="输入 6位取件码、尾号4位、收件人姓名 或 如：2层-03格"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setNotFound(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="!py-4 !text-base !pl-12 !rounded-2xl"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2 !py-2.5"
                onClick={handleSearch}
                rightIcon={<HandCoins className="w-4 h-4" />}
              >
                查询取件
              </Button>
            </div>
            {notFound && (
              <div className="text-center p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                未找到匹配的在架包裹，请检查输入是否正确
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <PackageDetailCard
              pkg={result}
              onPickup={() => { setShowConfirm(true); setVerifyError(''); setVerifyLast4(''); setPickupName(''); }}
              onException={() => setShowException(true)}
              onRemind={() => {
                triggerManualRef.current(result.id, '张建国', '取件现场提醒收件人');
                showToast('📢 已记录人工提醒');
              }}
              logs={logs.filter((l) => l.packageId === result.id)}
            />
          </div>
        )}

        {!result && !notFound && (
          <div className="p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                待关注包裹
                <Badge variant="warning" size="sm">{recentDelayed.length}</Badge>
              </h3>
              <span className="text-xs text-slate-500">滞留时间从长到短排列</span>
            </div>
            {recentDelayed.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm">暂无滞留包裹，状态良好</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentDelayed.map((p) => {
                  const level = getDelayLevel(p.storedAt);
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setResult(p); setKeyword(p.pickupCode); }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5',
                        getDelayLevelBgColor(level),
                      )}
                    >
                      <img src={p.photoUrl} alt="" className="w-14 h-14 rounded-lg object-cover border border-white/60 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800">{p.recipientName}</span>
                          <Badge variant={levelVariant[level]} size="sm">{levelLabel[level]}</Badge>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>📍 {p.slotLabel}</span>
                          <span>📦 {sizeLabel(p.packageSize)}</span>
                          <span>🏷️ {p.courierCompany.slice(0, 4)}</span>
                        </div>
                        <div className={cn('text-xs font-bold mt-0.5', getDelayLevelTextColor(level))}>
                          ⏱ 已滞留 {formatDelayTime(p.storedAt)}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] text-slate-500">取件码</div>
                        <div className="text-sm font-black text-indigo-600 font-mono">{p.pickupCode}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 确认取件弹窗 */}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="✋ 确认取件"
        subtitle="请验证取件人身份信息"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>取消</Button>
            <Button variant="success" onClick={handlePickup} rightIcon={<HandCoins className="w-4 h-4" />}>
              确认完成取件
            </Button>
          </>
        }
      >
        {result && (
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <img src={result.photoUrl} alt="" className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-sm" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-extrabold text-slate-800">{result.recipientName}</span>
                  <Badge variant="info" size="sm">{result.courierCompany}</Badge>
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {result.slotLabel}
                  <span className="mx-1">·</span>
                  <QrCode className="w-3.5 h-3.5" /> {result.pickupCode}
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 入架 {formatDateTime(result.storedAt)}
                </div>
                <div className="text-sm text-rose-600 font-semibold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> 请验证尾号 ****{result.phoneLast4}
                </div>
              </div>
            </div>
            <Input
              label="手机号后四位验证"
              placeholder="输入收件人手机号后4位"
              maxLength={4}
              value={verifyLast4}
              onChange={(e) => { setVerifyLast4(e.target.value.replace(/\D/g, '')); setVerifyError(''); }}
              error={verifyError.includes('后四位') ? verifyError : ''}
            />
            <Input
              label="实际取件人姓名"
              placeholder="取件人签名姓名"
              value={pickupName}
              onChange={(e) => { setPickupName(e.target.value); setVerifyError(''); }}
              error={verifyError.includes('取件人') ? verifyError : ''}
            />
            {verifyError && !verifyError.includes('后四位') && !verifyError.includes('取件人') && (
              <div className="text-xs text-red-600">{verifyError}</div>
            )}
          </div>
        )}
      </Modal>

      {/* 异常登记弹窗 */}
      <ExceptionDialog
        open={showException}
        onClose={() => setShowException(false)}
        pkg={result}
        onSubmit={handleExceptionSubmit}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold shadow-2xl shadow-slate-900/40 flex items-center gap-2">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function PackageDetailCard({
  pkg,
  onPickup,
  onException,
  onRemind,
  logs,
}: {
  pkg: PackageItem;
  onPickup: () => void;
  onException: () => void;
  onRemind: () => void;
  logs: any[];
}) {
  const level = getDelayLevel(pkg.storedAt);
  return (
    <div className={cn(
      'rounded-2xl border p-6 space-y-5',
      getDelayLevelBgColor(level),
    )}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className={cn('px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm', getDelayLevelColor(level))}>
            {levelLabel[level]}
          </span>
          <span className="flex items-center gap-1 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            滞留 {formatDelayTime(pkg.storedAt)}
          </span>
          <span className="flex items-center gap-1 text-sm text-slate-600">
            <Package className="w-4 h-4" />
            入架 {formatDateTime(pkg.storedAt)}
          </span>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white border border-indigo-100 shadow-sm">
          <span className="text-[10px] text-indigo-500 font-bold mr-1.5">取件码</span>
          <span className="text-xl font-black tracking-wider text-indigo-700 font-mono">{pkg.pickupCode}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="sm:col-span-1">
          <div className="aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-md">
            <img src={pkg.photoUrl} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="sm:col-span-2 space-y-3">
          <div className="p-4 rounded-xl bg-white border border-slate-100 space-y-2.5">
            <InfoRow icon={<User className="w-4 h-4" />} label="收件人" value={pkg.recipientName} strong />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="手机尾号" value={`****${pkg.phoneLast4}`} />
            <InfoRow icon={<Package className="w-4 h-4" />} label="快递/尺寸" value={`${pkg.courierCompany} · ${sizeLabel(pkg.packageSize)}`} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="存放位置" value={pkg.slotLabel} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button className="flex-1 min-w-[120px]" variant="success" onClick={onPickup} leftIcon={<HandCoins className="w-4 h-4" />}>
              确认取件
            </Button>
            {level !== 'normal' && (
              <Button variant="warning" onClick={onRemind} leftIcon={<AlertTriangle className="w-4 h-4" />}>
                人工催件
              </Button>
            )}
            <Button variant="danger" onClick={onException} leftIcon={<AlertCircle className="w-4 h-4" />}>
              异常登记
            </Button>
          </div>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="pt-4 border-t border-white/60">
          <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> 提醒历史
          </div>
          <div className="space-y-1.5">
            {logs.map((l) => (
              <div key={l.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/60 text-xs">
                <Badge
                  variant={
                    l.level === 'critical' ? 'critical' : l.level === 'danger' ? 'danger' : 'warning'
                  }
                  size="sm"
                >
                  {REMINDER_TYPE_LABEL[l.type]}
                </Badge>
                <span className="text-slate-500">{formatDateTime(l.remindedAt)}</span>
                {l.operator && <span className="text-slate-600">· {l.operator}</span>}
                {l.result && <span className="text-slate-700 flex-1">· {l.result}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, strong }: { icon: React.ReactNode; label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[11px] text-slate-500">{label}</div>
        <div className={cn('text-slate-700', strong ? 'font-bold text-base' : 'font-semibold text-sm')}>{value}</div>
      </div>
    </div>
  );
}

function ExceptionDialog({
  open,
  onClose,
  pkg,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  pkg: PackageItem | null;
  onSubmit: (type: ExceptionType, description: string) => void;
}) {
  const [type, setType] = useState<ExceptionType>('damaged');
  const [description, setDescription] = useState('');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="⚠️ 登记异常"
      subtitle="选择异常类型并填写说明"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="danger" onClick={() => onSubmit(type, description)} disabled={!description.trim()}>
            确认记录
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {pkg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            包裹：{pkg.recipientName} · {pkg.slotLabel} · {pkg.courierCompany}
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">异常类型</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(EXCEPTION_TYPE_LABEL) as ExceptionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'p-3 rounded-xl border-2 text-center transition-all',
                  type === t
                    ? 'border-red-400 bg-red-50 text-red-700 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300',
                )}
              >
                <div className="text-sm font-bold">{EXCEPTION_TYPE_LABEL[t]}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">情况说明</label>
          <textarea
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-y min-h-[90px]"
            placeholder="请详细描述异常情况，如破损位置、错拿经过等..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
