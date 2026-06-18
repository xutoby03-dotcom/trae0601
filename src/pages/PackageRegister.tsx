import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackagePlus, User, Phone, Building2, Hash, Box, CreditCard,
  AlertTriangle, Snowflake, DollarSign, Camera, Grid3x3,
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAppStore } from '../store/appStore';
import { COURIER_OPTIONS, SIZE_OPTIONS } from '../lib/utils';
import LockerGrid from '../components/LockerGrid';
import Modal from '../components/Modal';
import type { Locker, CreatePackagePayload } from 'shared/types.js';

export default function PackageRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addPackage } = useAppStore();

  const [form, setForm] = useState<CreatePackagePayload>({
    recipientName: '',
    phoneLast4: '',
    company: '顺丰',
    trackingNumber: '',
    lockerId: '',
    size: 'M',
    isCod: false,
    isFragile: false,
    isColdChain: false,
  });
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [availableLockers, setAvailableLockers] = useState<Locker[]>([]);
  const [showLockerPicker, setShowLockerPicker] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLockers();
  }, []);

  async function loadLockers() {
    try {
      const [all, avail] = await Promise.all([
        api.getLockers(),
        api.getAvailableLockers(),
      ]);
      setLockers(all);
      setAvailableLockers(avail);
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  }

  function updateField<K extends keyof CreatePackagePayload>(key: K, value: CreatePackagePayload[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target?.result as string || '');
    reader.readAsDataURL(file);
  }

  function selectLocker(l: Locker) {
    setSelectedLocker(l);
    updateField('lockerId', l.id);
    setShowLockerPicker(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.recipientName || !form.phoneLast4 || !form.trackingNumber || !form.lockerId) {
      showToast('请填写所有必填项', 'warning');
      return;
    }
    if (!/^\d{4}$/.test(form.phoneLast4)) {
      showToast('手机号后四位必须为4位数字', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      const payload = photoUrl ? { ...form, photoUrl } : form;
      const pkg = await api.createPackage(payload);
      addPackage(pkg);
      showToast('包裹登记成功！', 'success');
      navigate('/');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const isFull = availableLockers.length === 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <PackagePlus className="w-6 h-6 text-primary-500" />
          包裹登记
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">录入新到包裹信息并分配柜格</p>
      </div>

      {isFull && (
        <div className="mb-5 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-accent-rose shrink-0" />
          <div>
            <p className="font-semibold text-accent-rose">柜格已满</p>
            <p className="text-sm text-accent-rose/80">当前没有空闲柜格，请先安排腾挪</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              收件人 <span className="text-accent-rose">*</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="请输入收件人姓名"
              value={form.recipientName}
              onChange={e => updateField('recipientName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Phone className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              手机号后四位 <span className="text-accent-rose">*</span>
            </label>
            <input
              type="text"
              maxLength={4}
              className="input-field font-mono text-lg tracking-wider"
              placeholder="如 1234"
              value={form.phoneLast4}
              onChange={e => updateField('phoneLast4', e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Building2 className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              快递公司 <span className="text-accent-rose">*</span>
            </label>
            <select
              className="input-field"
              value={form.company}
              onChange={e => updateField('company', e.target.value as any)}
            >
              {COURIER_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Hash className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              快递单号 <span className="text-accent-rose">*</span>
            </label>
            <input
              type="text"
              className="input-field font-mono"
              placeholder="请输入快递单号"
              value={form.trackingNumber}
              onChange={e => updateField('trackingNumber', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <Grid3x3 className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
            选择柜格 <span className="text-accent-rose">*</span>
            <span className="ml-2 text-xs text-slate-400">空闲 {availableLockers.length} / {lockers.length}</span>
          </label>
          <button
            type="button"
            disabled={isFull}
            onClick={() => setShowLockerPicker(true)}
            className={`w-full input-field text-left flex items-center justify-between ${
              !selectedLocker ? 'text-slate-400' : ''
            }`}
          >
            <span>
              {selectedLocker
                ? `${selectedLocker.code} (${selectedLocker.size}号柜)`
                : '点击选择柜格'
              }
            </span>
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <Box className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
            包裹大小 <span className="text-accent-rose">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SIZE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField('size', opt.value)}
                className={`py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                  form.size === opt.value
                    ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">特殊标记</label>
          <div className="flex flex-wrap gap-2">
            <ToggleChip
              icon={AlertTriangle}
              label="易碎品"
              active={form.isFragile}
              color="amber"
              onClick={() => updateField('isFragile', !form.isFragile)}
            />
            <ToggleChip
              icon={Snowflake}
              label="冷链/生鲜"
              active={form.isColdChain}
              color="sky"
              onClick={() => updateField('isColdChain', !form.isColdChain)}
            />
            <ToggleChip
              icon={DollarSign}
              label="到付件"
              active={form.isCod}
              color="rose"
              onClick={() => updateField('isCod', !form.isCod)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <Camera className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
            包裹照片（可选）
          </label>
          <div className="flex gap-3 items-start">
            {photoUrl ? (
              <div className="relative">
                <img src={photoUrl} alt="包裹照片" className="w-28 h-28 object-cover rounded-lg border border-slate-200" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-accent-rose text-white rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="w-28 h-28 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-colors">
                <Camera className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500">点击上传</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            )}
            <p className="text-xs text-slate-400 flex-1 pt-1">
              建议拍摄包裹完整照片，方便核对和异常追溯
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting || isFull}
            className="btn-primary flex-1"
          >
            {submitting ? '登记中...' : '确认登记'}
          </button>
        </div>
      </form>

      <Modal open={showLockerPicker} onClose={() => setShowLockerPicker(false)} title="选择柜格" size="lg">
        <div className="mb-3 p-3 rounded-lg bg-slate-50 text-sm text-slate-600">
          绿色为空闲柜格，点击选择。已占用和禁用的柜格不可选择。
        </div>
        <LockerGrid
          lockers={lockers}
          showOnlyAvailable
          selectedId={selectedLocker?.id}
          onSelect={selectLocker}
        />
      </Modal>
    </div>
  );
}

function ToggleChip({
  icon: Icon, label, active, color, onClick,
}: {
  icon: any; label: string; active: boolean; color: 'amber' | 'sky' | 'rose'; onClick: () => void;
}) {
  const colorMap = {
    amber: active ? 'border-amber-500 bg-amber-50 text-amber-700' : '',
    sky: active ? 'border-sky-500 bg-sky-50 text-sky-700' : '',
    rose: active ? 'border-rose-500 bg-rose-50 text-rose-700' : '',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-lg border-2 text-sm font-medium flex items-center gap-1.5 transition-all ${
        active ? colorMap[color] : 'border-slate-200 text-slate-600 hover:border-slate-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
