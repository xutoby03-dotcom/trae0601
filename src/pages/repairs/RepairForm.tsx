import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Camera, DollarSign, User, FileText, Calendar, Wrench } from 'lucide-react';
import { useAppStore } from '@/store';

export default function RepairForm() {
  const navigate = useNavigate();
  const { devices, addRepair } = useAppStore();

  const repairingDevices = useMemo(
    () => devices.filter((d) => d.status !== 'scrapped'),
    [devices]
  );

  const [form, setForm] = useState({
    deviceId: '',
    faultDescription: '',
    handler: '',
    cost: 0,
    startDate: new Date().toISOString().split('T')[0],
    beforePhoto: '',
    remark: '',
  });

  const selectedDevice = devices.find((d) => d.id === form.deviceId);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.deviceId) {
      alert('请选择设备');
      return;
    }
    if (!form.faultDescription.trim()) {
      alert('请填写故障现象');
      return;
    }
    if (!form.handler.trim()) {
      alert('请填写处理人');
      return;
    }

    addRepair({
      deviceId: form.deviceId,
      faultDescription: form.faultDescription.trim(),
      handler: form.handler.trim(),
      cost: form.cost,
      startDate: form.startDate,
      beforePhoto: form.beforePhoto || undefined,
      remark: form.remark.trim() || undefined,
    });
    navigate('/repairs');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/repairs"
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">新建维修单</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Wrench className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-800">选择设备</h2>
          </div>
          <div>
            <label className="label">故障设备 *</label>
            <select
              value={form.deviceId}
              onChange={(e) => updateField('deviceId', e.target.value)}
              className="input"
              required
            >
              <option value="">请选择设备...</option>
              {repairingDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.category}
                </option>
              ))}
            </select>
            {selectedDevice && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 mt-3">
                <img
                  src={selectedDevice.photo}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800">{selectedDevice.code}</div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {selectedDevice.description || selectedDevice.category}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    保管人：{selectedDevice.custodian}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-800">维修信息</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                报修日期
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                处理人 *
              </label>
              <input
                type="text"
                value={form.handler}
                onChange={(e) => updateField('handler', e.target.value)}
                placeholder="维修负责人或单位"
                className="input"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">故障现象 *</label>
              <textarea
                value={form.faultDescription}
                onChange={(e) => updateField('faultDescription', e.target.value)}
                rows={3}
                placeholder="请详细描述故障现象"
                className="input resize-none"
                required
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                维修费用（元）
              </label>
              <input
                type="number"
                min="0"
                value={form.cost}
                onChange={(e) => updateField('cost', Number(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                故障照片 URL
              </label>
              <input
                type="url"
                value={form.beforePhoto}
                onChange={(e) => updateField('beforePhoto', e.target.value)}
                placeholder="可选，上传故障现场照片"
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">备注</label>
              <textarea
                value={form.remark}
                onChange={(e) => updateField('remark', e.target.value)}
                rows={2}
                placeholder="其他需要说明的信息"
                className="input resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/repairs" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" />
            创建维修单
          </button>
        </div>
      </form>
    </div>
  );
}
