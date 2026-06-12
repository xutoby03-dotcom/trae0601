import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, X, CheckCircle2, Package, User, FileText, Calendar } from 'lucide-react';
import { useAppStore } from '@/store';
import type { AccessoryItem } from '@/types';
import { DEVICE_STATUS_LABELS } from '@/types';

function generateAccId() {
  return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function BorrowForm() {
  const navigate = useNavigate();
  const { devices, addBorrow } = useAppStore();

  const availableDevices = useMemo(() => devices.filter((d) => d.status === 'available'), [devices]);

  const today = new Date().toISOString().split('T')[0];
  const defaultReturn = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    deviceId: '',
    purpose: '',
    borrower: '',
    borrowDate: today,
    expectedReturnDate: defaultReturn,
  });
  const [accessories, setAccessories] = useState<AccessoryItem[]>([
    { id: generateAccId(), name: '电源适配器', checked: true },
  ]);
  const [newAccessory, setNewAccessory] = useState('');

  const selectedDevice = devices.find((d) => d.id === form.deviceId);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAccessory = (id: string) => {
    setAccessories((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    );
  };

  const addAccessory = () => {
    if (!newAccessory.trim()) return;
    setAccessories((prev) => [
      ...prev,
      { id: generateAccId(), name: newAccessory.trim(), checked: true },
    ]);
    setNewAccessory('');
  };

  const removeAccessory = (id: string) => {
    setAccessories((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.deviceId) {
      alert('请选择借用设备');
      return;
    }
    if (!form.borrower.trim()) {
      alert('请填写借用人');
      return;
    }
    if (!form.purpose.trim()) {
      alert('请填写借用用途');
      return;
    }
    const checkedAccessories = accessories.filter((a) => a.checked);
    if (checkedAccessories.length === 0) {
      if (!window.confirm('未勾选任何配件，确认继续？')) return;
    }

    addBorrow({
      ...form,
      borrower: form.borrower.trim(),
      purpose: form.purpose.trim(),
      accessories: checkedAccessories,
    });
    navigate('/borrows');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/borrows"
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">发起借用申请</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Package className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-800">选择设备</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <label className="label">借用设备 *</label>
            {availableDevices.length === 0 ? (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                暂无可借用的设备，请先到设备档案中添加或等待设备归还。
              </div>
            ) : (
              <select
                value={form.deviceId}
                onChange={(e) => updateField('deviceId', e.target.value)}
                className="input"
                required
              >
                <option value="">请选择设备...</option>
                {availableDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.category} ({d.custodian} 保管)
                  </option>
                ))}
              </select>
            )}
            {selectedDevice && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 mt-2">
                <img
                  src={selectedDevice.photo}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{selectedDevice.code}</span>
                    <span className="badge bg-emerald-100 text-emerald-700">
                      {DEVICE_STATUS_LABELS[selectedDevice.status]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {selectedDevice.description || selectedDevice.category}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    保管人：{selectedDevice.custodian} · 价值：¥{selectedDevice.value.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-800">借用信息</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                借用人 *
              </label>
              <input
                type="text"
                value={form.borrower}
                onChange={(e) => updateField('borrower', e.target.value)}
                placeholder="请输入借用人姓名"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                借用日期
              </label>
              <input
                type="date"
                value={form.borrowDate}
                onChange={(e) => updateField('borrowDate', e.target.value)}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">借用用途 *</label>
              <textarea
                value={form.purpose}
                onChange={(e) => updateField('purpose', e.target.value)}
                rows={2}
                placeholder="请描述借用用途，如：客户演示、会议记录等"
                className="input resize-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">预计归还日期</label>
              <input
                type="date"
                value={form.expectedReturnDate}
                onChange={(e) => updateField('expectedReturnDate', e.target.value)}
                className="input"
                min={form.borrowDate}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
              <h2 className="font-semibold text-slate-800">配件清单（借出时）</h2>
            </div>
            <span className="text-xs text-slate-400">勾选借出的配件</span>
          </div>
          <div className="space-y-2 mb-4">
            {accessories.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-lg">
                暂无配件，可在下方添加
              </p>
            ) : (
              accessories.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={acc.checked}
                    onChange={() => toggleAccessory(acc.id)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span className={`flex-1 text-sm ${acc.checked ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                    {acc.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAccessory(acc.id)}
                    className="p-1.5 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAccessory}
              onChange={(e) => setNewAccessory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAccessory();
                }
              }}
              placeholder="输入配件名称，回车添加"
              className="input flex-1"
            />
            <button type="button" onClick={addAccessory} className="btn-secondary">
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/borrows" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary" disabled={availableDevices.length === 0}>
            <Save className="w-4 h-4" />
            提交借用申请
          </button>
        </div>
      </form>
    </div>
  );
}
