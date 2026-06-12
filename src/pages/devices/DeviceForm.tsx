import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { useAppStore } from '@/store';
import { DEVICE_CATEGORIES, DEVICE_STATUS_LABELS, type DeviceStatus, type DeviceCategory } from '@/types';

export default function DeviceForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const { addDevice, updateDevice, getDevice } = useAppStore();

  const existing = isEdit ? getDevice(id!) : undefined;

  const [form, setForm] = useState({
    code: '',
    category: DEVICE_CATEGORIES[0] as DeviceCategory,
    status: 'available' as DeviceStatus,
    purchaseDate: new Date().toISOString().split('T')[0],
    custodian: '',
    value: 0,
    photo: '',
    description: '',
  });

  useEffect(() => {
    if (existing) {
      setForm({
        code: existing.code,
        category: existing.category,
        status: existing.status,
        purchaseDate: existing.purchaseDate,
        custodian: existing.custodian,
        value: existing.value,
        photo: existing.photo,
        description: existing.description || '',
      });
    }
  }, [existing]);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.custodian) {
      alert('请填写设备编号和保管人');
      return;
    }
    const photo =
      form.photo ||
      `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(form.category)}%20device%20equipment&image_size=square`;

    if (isEdit && existing) {
      updateDevice(existing.id, { ...form, photo });
    } else {
      addDevice({ ...form, photo });
    }
    navigate('/devices');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/devices"
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">
          {isEdit ? '编辑设备' : '新增设备'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label">设备编号 *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField('code', e.target.value)}
              placeholder="例如：PROJ-003"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">品类</label>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value as DeviceCategory)}
              className="input"
            >
              {DEVICE_CATEGORIES.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {isEdit && (
            <div>
              <label className="label">当前状态</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value as DeviceStatus)}
                className="input"
              >
                {Object.entries(DEVICE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">购买日期</label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) => updateField('purchaseDate', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">保管人 *</label>
            <input
              type="text"
              value={form.custodian}
              onChange={(e) => updateField('custodian', e.target.value)}
              placeholder="请输入保管人姓名"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">价值（元）</label>
            <input
              type="number"
              min="0"
              value={form.value}
              onChange={(e) => updateField('value', Number(e.target.value))}
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">照片 URL</label>
            <div className="flex gap-3">
              <input
                type="url"
                value={form.photo}
                onChange={(e) => updateField('photo', e.target.value)}
                placeholder="留空将自动生成设备图片"
                className="input flex-1"
              />
              {form.photo && (
                <img
                  src={form.photo}
                  alt="预览"
                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                />
              )}
            </div>
            {!form.photo && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                不填写将根据品类自动生成图片
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="label">设备描述</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              placeholder="设备型号、配置、备注等信息"
              className="input resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Link to="/devices" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" />
            {isEdit ? '保存修改' : '创建设备'}
          </button>
        </div>
      </form>
    </div>
  );
}
