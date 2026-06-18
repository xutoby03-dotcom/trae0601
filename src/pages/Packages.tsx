import { useState, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Camera,
  User,
  Phone,
  Search,
  Filter,
  ChevronDown,
  Upload,
  ImageIcon,
  CheckCircle2,
  QrCode,
  Boxes,
  MapPin,
  HandCoins,
  AlertTriangle,
} from 'lucide-react';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { useShelfStore } from '@/store/shelfStore';
import { usePackageStore } from '@/store/packageStore';
import { useExceptionStore } from '@/store/exceptionStore';
import { useReminderStore } from '@/store/reminderStore';
import {
  cn,
  getDelayLevel,
  getDelayLevelBgColor,
  getDelayLevelTextColor,
  getDelayLevelColor,
  formatDateTime,
  formatDelayTime,
  sizeLabel,
  getSlotLabel,
} from '@/utils';
import { COURIER_COMPANIES, EXCEPTION_TYPE_LABEL } from '@/types';
import type { PackageSize, DelayLevel, ExceptionType, PackageItem } from '@/types';

const SIZE_OPTIONS: Array<{ value: PackageSize; label: string; desc: string; color: string }> = [
  { value: 'S', label: '小件', desc: '手机/化妆品等', color: 'emerald' },
  { value: 'M', label: '中件', desc: '衣服/鞋包等', color: 'indigo' },
  { value: 'L', label: '大件', desc: '家电/家具等', color: 'amber' },
];

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1568057373531-6e8fd66a8db5?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1612392062186-4bb2eab4fb8b?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1606787997632-4464c8028742?w=300&h=300&fit=crop',
];

export function RegisterPage() {
  const [form, setForm] = useState({
    recipientName: '',
    phoneLast4: '',
    courierCompany: COURIER_COMPANIES[0],
    packageSize: 'M' as PackageSize,
    shelfId: '',
    shelfSlotId: '',
    floor: 1,
    slotNumber: 1,
    photoUrl: SAMPLE_PHOTOS[0],
  });
  const [error, setError] = useState('');
  const [successPkg, setSuccessPkg] = useState<PackageItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const shelves = useShelfStore((s) => s.shelves);
  const slots = useShelfStore((s) => s.slots);
  const packages = usePackageStore((s) => s.packages);
  const registerRef = useRef(usePackageStore.getState().registerPackage);

  if (form.shelfId === '' && shelves.length > 0 && !form.shelfId) {
    setForm({ ...form, shelfId: shelves[0].id });
  }

  const availableSlots = form.shelfId
    ? slots.filter((s) => s.shelfId === form.shelfId && !s.isOccupied && s.sizeLevel === form.packageSize)
    : [];
  const allSlots = form.shelfId ? slots.filter((s) => s.shelfId === form.shelfId) : [];

  const handleSubmit = () => {
    setError('');
    if (!form.recipientName.trim()) return setError('请填写收件人姓名');
    if (!/^\d{4}$/.test(form.phoneLast4)) return setError('手机号后四位必须为4位数字');
    if (!form.shelfId) return setError('请选择货架');
    if (!form.shelfSlotId) return setError('请选择存放格口');

    const selectedSlot = allSlots.find((s) => s.id === form.shelfSlotId);
    if (!selectedSlot) return setError('格口无效');

    const pkg = registerRef.current({
      recipientName: form.recipientName.trim(),
      phoneLast4: form.phoneLast4,
      courierCompany: form.courierCompany,
      packageSize: form.packageSize,
      shelfId: form.shelfId,
      shelfSlotId: form.shelfSlotId,
      floor: selectedSlot.floor,
      slotNumber: selectedSlot.slotNumber,
      photoUrl: form.photoUrl,
    });
    setSuccessPkg(pkg);
  };

  const handleReset = () => {
    setForm({
      recipientName: '',
      phoneLast4: '',
      courierCompany: COURIER_COMPANIES[0],
      packageSize: 'M',
      shelfId: shelves[0]?.id || '',
      shelfSlotId: '',
      floor: 1,
      slotNumber: 1,
      photoUrl: SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)],
    });
    setError('');
  };

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setForm({ ...form, photoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link to="/packages" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-2">
          返回包裹列表
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">📦 登记新包裹</h1>
        <p className="text-sm text-slate-500 mt-1">录入包裹信息，系统将自动分配格口并生成取件码</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card title="收件人信息" subtitle="用于身份验证和取件通知">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="收件人姓名"
                placeholder="如：张三"
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                prefixIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="手机号后四位"
                placeholder="如：1234"
                maxLength={4}
                value={form.phoneLast4}
                onChange={(e) => setForm({ ...form, phoneLast4: e.target.value.replace(/\D/g, '') })}
                prefixIcon={<Phone className="w-4 h-4" />}
                hint="取件时需验证此号码"
              />
            </div>
          </Card>

          <Card title="包裹信息" subtitle="快递公司和尺寸分类">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="快递公司"
                value={form.courierCompany}
                onChange={(e) => setForm({ ...form, courierCompany: e.target.value })}
                prefixIcon={<Boxes className="w-4 h-4" />}
              >
                {COURIER_COMPANIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">包裹尺寸</label>
                <div className="grid grid-cols-3 gap-2">
                  {SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm({ ...form, packageSize: opt.value, shelfSlotId: '' })}
                      className={cn(
                        'p-3 rounded-xl border-2 text-left transition-all',
                        form.packageSize === opt.value
                          ? opt.color === 'emerald' ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                            : opt.color === 'indigo' ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                            : 'border-amber-500 bg-amber-50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white',
                      )}
                    >
                      <div className={cn(
                        'text-sm font-bold',
                        form.packageSize === opt.value
                          ? opt.color === 'emerald' ? 'text-emerald-700'
                            : opt.color === 'indigo' ? 'text-indigo-700'
                            : 'text-amber-700'
                          : 'text-slate-700',
                      )}>
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="存放位置" subtitle="选择货架和空闲格口">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="快递架"
                value={form.shelfId}
                onChange={(e) => setForm({ ...form, shelfId: e.target.value, shelfSlotId: '' })}
                prefixIcon={<MapPin className="w-4 h-4" />}
              >
                {shelves.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} - {s.area}</option>
                ))}
              </Select>
              <div className="text-xs text-slate-500 flex items-end">
                {availableSlots.length > 0
                  ? `可用 ${sizeLabel(form.packageSize)} 格口：${availableSlots.length} 个`
                  : '⚠️ 当前货架没有匹配尺寸的空闲格口'}
              </div>
            </div>

            {form.shelfId && (
              <div className="mt-5">
                <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <span>选择格口</span>
                  <span className="text-slate-400">（高亮为可用）</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  {(() => {
                    const shelfSlots = allSlots;
                    const byFloor = new Map<number, typeof shelfSlots>();
                    shelfSlots.forEach((s) => {
                      if (!byFloor.has(s.floor)) byFloor.set(s.floor, []);
                      byFloor.get(s.floor)!.push(s);
                    });
                    return Array.from(byFloor.entries())
                      .sort((a, b) => a[0] - b[0])
                      .map(([floor, slots]) => (
                        <div key={floor} className="mb-3 last:mb-0 flex items-start gap-3">
                          <div className="w-12 shrink-0 pt-1 text-xs font-bold text-slate-500 text-right">
                            {floor}F
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 flex-1">
                            {slots
                              .sort((a, b) => a.slotNumber - b.slotNumber)
                              .map((slot) => {
                                const isAvail = !slot.isOccupied && slot.sizeLevel === form.packageSize;
                                const isOccupied = slot.isOccupied;
                                const isSelected = form.shelfSlotId === slot.id;
                                return (
                                  <button
                                    key={slot.id}
                                    disabled={isOccupied}
                                    onClick={() => setForm({
                                      ...form,
                                      shelfSlotId: slot.id,
                                      floor: slot.floor,
                                      slotNumber: slot.slotNumber,
                                    })}
                                    className={cn(
                                      'py-2 px-1 rounded-lg text-[11px] font-bold border-2 transition-all',
                                      isOccupied && 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed',
                                      !isOccupied && !isAvail && 'bg-white text-slate-400 border-slate-200 border-dashed cursor-not-allowed',
                                      isAvail && !isSelected && 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm cursor-pointer',
                                      isSelected && 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-indigo-600 shadow-md cursor-pointer scale-[1.02]',
                                    )}
                                  >
                                    {slot.slotNumber}
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="📷 包裹照片" subtitle="拍摄或上传包裹照片存档">
            <div className="space-y-3">
              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 flex items-center justify-center cursor-pointer group relative"
              >
                {form.photoUrl ? (
                  <>
                    <img src={form.photoUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <div className="text-white text-sm flex items-center gap-2">
                        <Camera className="w-4 h-4" /> 点击更换
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <div className="text-sm">点击上传照片</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">快速选择示例图</div>
                <div className="grid grid-cols-6 gap-1.5">
                  {SAMPLE_PHOTOS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setForm({ ...form, photoUrl: p })}
                      className={cn(
                        'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                        form.photoUrl === p ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300',
                      )}
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="📋 登记预览" subtitle="确认信息后提交">
            <div className="space-y-2.5 text-sm">
              <PreviewRow label="收件人" value={form.recipientName || '—'} />
              <PreviewRow label="手机尾号" value={form.phoneLast4 || '—'} />
              <PreviewRow label="快递公司" value={form.courierCompany} />
              <PreviewRow label="包裹尺寸" value={sizeLabel(form.packageSize)} />
              <PreviewRow
                label="存放格口"
                value={form.shelfSlotId ? getSlotLabel(form.floor, form.slotNumber) : '—'}
              />
            </div>
          </Card>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={handleReset}>
              重置表单
            </Button>
            <Button className="flex-1" onClick={handleSubmit} rightIcon={<CheckCircle2 className="w-4 h-4" />}>
              确认登记
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={!!successPkg}
        onClose={() => { setSuccessPkg(null); handleReset(); }}
        title="🎉 登记成功"
        subtitle="请将包裹放入指定格口"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setSuccessPkg(null); handleReset(); }}>
              继续登记
            </Button>
            <Link to="/packages">
              <Button onClick={() => setSuccessPkg(null)}>查看包裹列表</Button>
            </Link>
          </>
        }
      >
        {successPkg && (
          <div className="text-center space-y-5">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border border-indigo-100 space-y-3">
              <div>
                <div className="text-xs text-indigo-500 font-semibold mb-1">取件码（请告知收件人）</div>
                <div className="text-4xl font-black tracking-[0.3em] text-indigo-700 font-mono">
                  {successPkg.pickupCode}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-100">
                <div className="text-left">
                  <div className="text-[11px] text-slate-500">收件人</div>
                  <div className="text-sm font-bold text-slate-800">{successPkg.recipientName}</div>
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-slate-500">存放位置</div>
                  <div className="text-sm font-bold text-slate-800">{successPkg.slotLabel}</div>
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-slate-500">快递公司</div>
                  <div className="text-sm font-bold text-slate-800">{successPkg.courierCompany}</div>
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-slate-500">入架时间</div>
                  <div className="text-sm font-bold text-slate-800">{formatDateTime(successPkg.storedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-50">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-700">{value}</span>
    </div>
  );
}

// ---------------- 包裹列表页 ----------------

const FILTER_TABS = [
  { key: 'all', label: '全部' },
  { key: 'stored', label: '在架' },
  { key: 'delayed', label: '滞留' },
  { key: 'picked', label: '已取件' },
  { key: 'exception', label: '异常' },
] as const;

type FilterKey = typeof FILTER_TABS[number]['key'];

const levelVariant: Record<DelayLevel, 'success' | 'warning' | 'danger' | 'critical'> = {
  normal: 'success',
  warning: 'warning',
  danger: 'danger',
  critical: 'critical',
};

const levelLabel: Record<DelayLevel, string> = {
  normal: '正常',
  warning: '滞留24h+',
  danger: '滞留48h+',
  critical: '滞留72h+',
};

export function PackagesPage() {
  const [search, setSearch] = useState('');
  const [sp, setSp] = useSearchParams();
  const [pickupPkg, setPickupPkg] = useState<PackageItem | null>(null);
  const [exceptionPkg, setExceptionPkg] = useState<PackageItem | null>(null);

  const activeFilter = (sp.get('filter') as FilterKey) || 'stored';
  const searchRef = useRef(usePackageStore.getState().searchPackages);
  const packages = usePackageStore((s) => s.packages);
  const shelves = useShelfStore((s) => s.shelves);
  const pickupRef = useRef(usePackageStore.getState().pickupPackage);
  const addExceptionRef = useRef(useExceptionStore.getState().addException);
  const triggerManualRef = useRef(useReminderStore.getState().triggerManualReminder);

  const delayedIds = new Set(
    packages
      .filter((p) => p.status === 'stored' && Date.now() - new Date(p.storedAt).getTime() >= 24 * 3600 * 1000)
      .map((p) => p.id),
  );

  let list: PackageItem[] = [];
  if (search.trim()) {
    list = searchRef.current(search);
  } else {
    switch (activeFilter) {
      case 'all': list = packages; break;
      case 'stored': list = packages.filter((p) => p.status === 'stored'); break;
      case 'delayed':
        list = packages.filter(
          (p) => p.status === 'stored' && Date.now() - new Date(p.storedAt).getTime() >= 24 * 3600 * 1000,
        );
        break;
      case 'picked': list = packages.filter((p) => p.status === 'picked'); break;
      case 'exception': list = packages.filter((p) => p.status === 'exception' || p.status === 'transferred'); break;
    }
  }

  list = [...list].sort((a, b) => new Date(b.storedAt).getTime() - new Date(a.storedAt).getTime());

  const counts = {
    all: packages.length,
    stored: packages.filter((p) => p.status === 'stored').length,
    delayed: delayedIds.size,
    picked: packages.filter((p) => p.status === 'picked').length,
    exception: packages.filter((p) => p.status === 'exception').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">包裹管理</h1>
          <p className="text-sm text-slate-500 mt-1">查看、搜索和管理所有包裹记录</p>
        </div>
        <div className="flex gap-2">
          <Link to="/packages/register">
            <Button leftIcon={<Package className="w-4 h-4" />}>登记包裹</Button>
          </Link>
          <Link to="/pickup">
            <Button variant="success" leftIcon={<HandCoins className="w-4 h-4" />}>取件</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-sm">
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSp({ filter: t.key })}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold transition-all',
              activeFilter === t.key
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {t.label}
            <span className={cn(
              'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]',
              activeFilter === t.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500',
            )}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      <Card padded={false}>
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:bg-white focus:border-indigo-400 outline-none transition-all"
              placeholder="搜索收件人、手机号后四位、快递公司、取件码、格口..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 text-xs text-slate-500">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">包裹</th>
                <th className="py-3 px-4 text-left font-semibold">收件人</th>
                <th className="py-3 px-4 text-left font-semibold">快递</th>
                <th className="py-3 px-4 text-left font-semibold">格口</th>
                <th className="py-3 px-4 text-left font-semibold">入架时间</th>
                <th className="py-3 px-4 text-left font-semibold">状态</th>
                <th className="py-3 px-4 text-right font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="text-slate-400">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">暂无包裹数据</p>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((pkg) => {
                  const level = getDelayLevel(pkg.storedAt);
                  const isStored = pkg.status === 'stored';
                  return (
                    <tr
                      key={pkg.id}
                      className={cn(
                        'border-t border-slate-50 hover:bg-slate-50/60 transition-colors',
                        isStored && getDelayLevelBgColor(level).replace('border-', 'border-l-4 border-'),
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={pkg.photoUrl}
                            alt=""
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">{sizeLabel(pkg.packageSize)}</span>
                              <Badge variant="slate" size="sm">{pkg.pickupCode}</Badge>
                            </div>
                            <div className="text-[11px] text-slate-500">尾号 {pkg.phoneLast4}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{pkg.recipientName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{pkg.courierCompany}</td>
                      <td className="py-3 px-4">
                        <Badge variant="info" size="sm">📍 {pkg.slotLabel}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700">{formatDateTime(pkg.storedAt)}</div>
                        {isStored && (
                          <div className={cn('text-[11px] font-bold mt-0.5', getDelayLevelTextColor(level))}>
                            已{isStored ? '存放' : ''} {formatDelayTime(pkg.storedAt)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {pkg.status === 'stored' ? (
                          <Badge variant={levelVariant[level]} size="md">
                            {levelLabel[level]}
                          </Badge>
                        ) : pkg.status === 'picked' ? (
                          <Badge variant="success" size="md">已取件 · {pkg.pickupName}</Badge>
                        ) : pkg.status === 'exception' ? (
                          <Badge variant="critical" size="md">异常</Badge>
                        ) : (
                          <Badge variant="warning" size="md">已转移</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex gap-1">
                          {isStored && (
                            <>
                              <Button size="sm" variant="success" onClick={() => setPickupPkg(pkg)}>
                                取件
                              </Button>
                              {level !== 'normal' && (
                                <Button
                                  size="sm"
                                  variant="warning"
                                  onClick={() => triggerManualRef.current(pkg.id, '管理员', '已联系收件人')}
                                >
                                  催件
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setExceptionPkg(pkg)}
                              >
                                异常
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 取件弹窗 */}
      <PickupModal
        pkg={pickupPkg}
        onClose={() => setPickupPkg(null)}
        onConfirm={(name) => {
          if (pickupPkg) pickupRef.current(pickupPkg.id, name);
          setPickupPkg(null);
        }}
      />

      {/* 异常弹窗 */}
      <ExceptionModal
        pkg={exceptionPkg}
        onClose={() => setExceptionPkg(null)}
        onConfirm={(data) => {
          if (exceptionPkg) {
            addExceptionRef.current({
              packageId: exceptionPkg.id,
              recipientName: exceptionPkg.recipientName,
              slotLabel: exceptionPkg.slotLabel,
              type: data.type,
              description: data.description,
              handler: data.handler,
            });
          }
          setExceptionPkg(null);
        }}
      />
    </div>
  );
}

function PickupModal({
  pkg,
  onClose,
  onConfirm,
}: {
  pkg: PackageItem | null;
  onClose: () => void;
  onConfirm: (pickupName: string) => void;
}) {
  const [verifyLast4, setVerifyLast4] = useState('');
  const [pickupName, setPickupName] = useState('');
  const [err, setErr] = useState('');

  const handleConfirm = () => {
    if (!pkg) return;
    if (verifyLast4 !== pkg.phoneLast4) return setErr('手机号后四位验证失败');
    if (!pickupName.trim()) return setErr('请填写取件人姓名');
    onConfirm(pickupName.trim());
  };

  return (
    <Modal
      open={!!pkg}
      onClose={onClose}
      title="✋ 确认取件"
      subtitle="请验证取件人身份"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="success" onClick={handleConfirm} rightIcon={<HandCoins className="w-4 h-4" />}>
            确认取件
          </Button>
        </>
      }
    >
      {pkg && (
        <div className="space-y-4">
          <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <img src={pkg.photoUrl} alt="" className="w-20 h-20 rounded-xl object-cover border border-white shadow-sm" />
            <div className="flex-1 space-y-1 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-extrabold text-slate-800">{pkg.recipientName}</span>
                <Badge variant="info" size="sm">{pkg.courierCompany}</Badge>
              </div>
              <div className="text-slate-600">
                📍 {pkg.slotLabel} · 📦 {sizeLabel(pkg.packageSize)}
              </div>
              <div className="text-slate-600">
                🔑 取件码 {pkg.pickupCode}
              </div>
              <div className="text-slate-600">
                📱 手机尾号 ****{pkg.phoneLast4}
              </div>
            </div>
          </div>
          <Input
            label="验证手机号后四位"
            placeholder="请输入收件人手机号后四位"
            maxLength={4}
            value={verifyLast4}
            onChange={(e) => { setVerifyLast4(e.target.value.replace(/\D/g, '')); setErr(''); }}
            hint={`与登记的尾号 ${pkg.phoneLast4} 核对`}
            error={err && err.includes('验证') ? err : ''}
          />
          <Input
            label="取件人姓名"
            placeholder="请输入实际取件人姓名"
            value={pickupName}
            onChange={(e) => { setPickupName(e.target.value); setErr(''); }}
            error={err && err.includes('取件人') ? err : ''}
          />
        </div>
      )}
    </Modal>
  );
}

function ExceptionModal({
  pkg,
  onClose,
  onConfirm,
}: {
  pkg: PackageItem | null;
  onClose: () => void;
  onConfirm: (data: { type: ExceptionType; description: string; handler: string }) => void;
}) {
  const [type, setType] = useState<ExceptionType>('damaged');
  const [description, setDescription] = useState('');
  const [handler, setHandler] = useState('张建国');

  return (
    <Modal
      open={!!pkg}
      onClose={onClose}
      title="⚠️ 登记异常"
      subtitle="记录包裹异常情况"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button
            variant="danger"
            onClick={() => onConfirm({ type, description, handler })}
            disabled={!description.trim()}
          >
            提交异常
          </Button>
        </>
      }
    >
      {pkg && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="text-sm text-red-700">
              包裹 <strong>{pkg.recipientName}</strong> · {pkg.slotLabel} · {pkg.courierCompany}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">异常类型</label>
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
          <Textarea
            label="异常描述"
            rows={3}
            placeholder="请详细描述异常情况..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="处理人"
            value={handler}
            onChange={(e) => setHandler(e.target.value)}
          />
        </div>
      )}
    </Modal>
  );
}
