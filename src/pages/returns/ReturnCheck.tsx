import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Save, Wrench, ShieldAlert, Shield, ShieldHalf } from 'lucide-react';
import { useAppStore } from '@/store';
import type { AccessoryItem, AppearanceStatus } from '@/types';
import { APPEARANCE_LABELS } from '@/types';

export default function ReturnCheck() {
  const { borrowId } = useParams<{ borrowId: string }>();
  const navigate = useNavigate();
  const { getBorrow, getDevice, returnBorrow, addRepair } = useAppStore();

  const borrow = getBorrow(borrowId!);
  const device = borrow ? getDevice(borrow.deviceId) : undefined;

  const [checkedAccessories, setCheckedAccessories] = useState<AccessoryItem[]>([]);
  const [appearance, setAppearance] = useState<AppearanceStatus>('good');
  const [note, setNote] = useState('');
  const [showRepairDialog, setShowRepairDialog] = useState(false);
  const [repairForm, setRepairForm] = useState({
    faultDescription: '',
    handler: '',
    cost: 0,
  });

  useEffect(() => {
    if (borrow) {
      setCheckedAccessories(
        borrow.accessories.map((a) => ({ ...a, checked: true }))
      );
    }
  }, [borrow]);

  if (!borrow || !device) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-500 mb-4">借用记录不存在</p>
        <Link to="/returns" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
      </div>
    );
  }

  const missingItems = checkedAccessories.filter((a) => !a.checked);

  const toggleAccessory = (id: string) => {
    setCheckedAccessories((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    );
  };

  const handleReturn = () => {
    const { hasIssue, missingAccessories } = returnBorrow(borrow.id, {
      accessories: checkedAccessories,
      appearance,
      note: note.trim() || undefined,
    });

    if (hasIssue) {
      const issues = [];
      if (missingAccessories.length > 0) {
        issues.push(`缺失配件：${missingAccessories.join('、')}`);
      }
      if (appearance !== 'good') {
        issues.push(`外观状态：${APPEARANCE_LABELS[appearance]}`);
      }
      if (note.trim()) {
        issues.push(note.trim());
      }
      setRepairForm((prev) => ({
        ...prev,
        faultDescription: issues.join('；'),
      }));
      setShowRepairDialog(true);
    } else {
      navigate('/returns');
    }
  };

  const handleCreateRepair = () => {
    if (!repairForm.handler.trim()) {
      alert('请填写处理人');
      return;
    }
    addRepair({
      deviceId: device.id,
      borrowId: borrow.id,
      faultDescription: repairForm.faultDescription || '归还验收发现问题',
      handler: repairForm.handler.trim(),
      cost: repairForm.cost,
      startDate: new Date().toISOString().split('T')[0],
    });
    navigate('/repairs');
  };

  const appearanceOptions: { value: AppearanceStatus; label: string; icon: typeof Shield; color: string }[] = [
    { value: 'good', label: '外观完好', icon: Shield, color: 'emerald' },
    { value: 'minor_damage', label: '轻微划痕', icon: ShieldHalf, color: 'amber' },
    { value: 'damaged', label: '明显损坏', icon: ShieldAlert, color: 'rose' },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/returns"
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">归还验收</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {device.code} · 借用人：{borrow.borrower}
          </p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-start gap-4">
          <img
            src={device.photo}
            alt=""
            className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-800">{device.code}</span>
              <span className="badge bg-blue-100 text-blue-700">{device.category}</span>
            </div>
            <p className="text-sm text-slate-500">{device.description || device.category}</p>
            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
              <div>
                <span className="text-slate-400">借用人</span>
                <p className="font-medium text-slate-700">{borrow.borrower}</p>
              </div>
              <div>
                <span className="text-slate-400">借出日期</span>
                <p className="font-medium text-slate-700">{borrow.borrowDate}</p>
              </div>
              <div>
                <span className="text-slate-400">预计归还</span>
                <p className="font-medium text-slate-700">{borrow.expectedReturnDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-800">配件验收</h2>
          </div>
          {missingItems.length > 0 && (
            <span className="badge bg-rose-100 text-rose-700">
              <AlertCircle className="w-3 h-3 mr-1" />
              缺失 {missingItems.length} 件
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-3">逐项核对归还的配件，未归还请取消勾选</p>
        <div className="space-y-2">
          {checkedAccessories.map((acc) => (
            <div
              key={acc.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                acc.checked
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-rose-200 bg-rose-50/50'
              }`}
            >
              <input
                type="checkbox"
                checked={acc.checked}
                onChange={() => toggleAccessory(acc.id)}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <span className={`flex-1 text-sm font-medium ${acc.checked ? 'text-slate-800' : 'text-rose-700'}`}>
                {acc.name}
              </span>
              {acc.checked ? (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  已归还
                </span>
              ) : (
                <span className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  未归还
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-slate-800">外观检查</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {appearanceOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = appearance === opt.value;
            const colorClasses = {
              emerald: isSelected
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30',
              amber: isSelected
                ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/30',
              rose: isSelected
                ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50/30',
            };
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAppearance(opt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${colorClasses[opt.color]}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
        <div>
          <label className="label">备注说明（可选）</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="如有异常请详细描述，如划痕位置、损坏程度等"
            className="input resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link to="/returns" className="btn-secondary">
          取消
        </Link>
        <button onClick={handleReturn} className="btn-primary">
          <Save className="w-4 h-4" />
          确认归还
        </button>
      </div>

      {showRepairDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">发现问题，生成维修单</h3>
                <p className="text-sm text-slate-500">设备状态将变更为维修中</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">故障描述</label>
                <textarea
                  value={repairForm.faultDescription}
                  onChange={(e) =>
                    setRepairForm((p) => ({ ...p, faultDescription: e.target.value }))
                  }
                  rows={3}
                  className="input resize-none"
                />
              </div>
              <div>
                <label className="label">处理人 *</label>
                <input
                  type="text"
                  value={repairForm.handler}
                  onChange={(e) => setRepairForm((p) => ({ ...p, handler: e.target.value }))}
                  placeholder="维修负责人或维修单位"
                  className="input"
                />
              </div>
              <div>
                <label className="label">预计费用（元）</label>
                <input
                  type="number"
                  min="0"
                  value={repairForm.cost}
                  onChange={(e) =>
                    setRepairForm((p) => ({ ...p, cost: Number(e.target.value) }))
                  }
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRepairDialog(false);
                  navigate('/returns');
                }}
                className="btn-secondary"
              >
                暂不维修
              </button>
              <button onClick={handleCreateRepair} className="btn-primary">
                <Wrench className="w-4 h-4" />
                创建维修单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
