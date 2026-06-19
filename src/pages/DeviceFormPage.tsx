import { useAppStore } from '@/store';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BATTERY_TYPE_OPTIONS } from '@/constants';
import { todayStr } from '@/utils/dateUtils';

export default function DeviceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { getDevice, addDevice, updateDevice } = useAppStore();

  const existingDevice = isEdit ? getDevice(id!) : undefined;

  const [form, setForm] = useState({
    location: '',
    model: '',
    install_date: todayStr(),
    battery_type: 'AA',
    battery_replace_date: '',
    maintenance_phone: '',
    photo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && existingDevice) {
      setForm({
        location: existingDevice.location,
        model: existingDevice.model,
        install_date: existingDevice.install_date,
        battery_type: existingDevice.battery_type,
        battery_replace_date: existingDevice.battery_replace_date,
        maintenance_phone: existingDevice.maintenance_phone,
        photo: existingDevice.photo || '',
      });
    }
  }, [isEdit, existingDevice]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.location.trim()) e.location = '请输入安装位置';
    if (!form.model.trim()) e.model = '请输入设备型号';
    if (!form.install_date) e.install_date = '请选择安装日期';
    if (!form.battery_replace_date) e.battery_replace_date = '请选择电池更换日期';
    if (!form.maintenance_phone.trim()) e.maintenance_phone = '请输入维修电话';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      updateDevice(id!, form);
    } else {
      addDevice(form);
    }
    navigate('/devices');
  };

  const setField = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link
          to="/devices"
          className="w-10 h-10 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-gray-600 hover:bg-cream-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? '编辑设备' : '新增设备'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? '修改设备档案信息' : '录入燃气报警器基本信息'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-cream-200">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-500" />
            </div>
            <h2 className="font-bold text-gray-800">基本信息</h2>
          </div>

          <div>
            <label className="label-text">安装位置 *</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setField('location', e.target.value)}
              placeholder="如：厨房、客厅、阳台..."
              className={`input-field ${errors.location ? 'border-danger-400 focus:ring-danger-200 focus:border-danger-400' : ''}`}
            />
            {errors.location && <p className="text-xs text-danger-500 mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="label-text">设备型号 *</label>
            <input
              type="text"
              value={form.model}
              onChange={e => setField('model', e.target.value)}
              placeholder="如：海康威视 DS-1..."
              className={`input-field ${errors.model ? 'border-danger-400 focus:ring-danger-200 focus:border-danger-400' : ''}`}
            />
            {errors.model && <p className="text-xs text-danger-500 mt-1">{errors.model}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">安装日期 *</label>
              <input
                type="date"
                value={form.install_date}
                onChange={e => setField('install_date', e.target.value)}
                className={`input-field ${errors.install_date ? 'border-danger-400 focus:ring-danger-200 focus:border-danger-400' : ''}`}
              />
              {errors.install_date && <p className="text-xs text-danger-500 mt-1">{errors.install_date}</p>}
            </div>

            <div>
              <label className="label-text">电池类型 *</label>
              <select
                value={form.battery_type}
                onChange={e => setField('battery_type', e.target.value)}
                className="input-field"
              >
                {BATTERY_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-text">上次电池更换日期 *</label>
            <input
              type="date"
              value={form.battery_replace_date}
              onChange={e => setField('battery_replace_date', e.target.value)}
              className={`input-field ${errors.battery_replace_date ? 'border-danger-400 focus:ring-danger-200 focus:border-danger-400' : ''}`}
            />
            {errors.battery_replace_date && <p className="text-xs text-danger-500 mt-1">{errors.battery_replace_date}</p>}
            <p className="text-xs text-gray-400 mt-1">电池寿命将根据电池类型自动计算</p>
          </div>

          <div>
            <label className="label-text">维修联系电话 *</label>
            <input
              type="tel"
              value={form.maintenance_phone}
              onChange={e => setField('maintenance_phone', e.target.value)}
              placeholder="如：400-xxx-xxxx 或手机"
              className={`input-field ${errors.maintenance_phone ? 'border-danger-400 focus:ring-danger-200 focus:border-danger-400' : ''}`}
            />
            {errors.maintenance_phone && <p className="text-xs text-danger-500 mt-1">{errors.maintenance_phone}</p>}
          </div>

          <div>
            <label className="label-text">设备照片（可选）</label>
            <input
              type="text"
              value={form.photo}
              onChange={e => setField('photo', e.target.value)}
              placeholder="输入图片 URL 地址"
              className="input-field"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link to="/devices" className="btn-secondary flex-1">
            取消
          </Link>
          <button type="submit" className="btn-primary flex-1">
            <Save className="w-4 h-4" />
            {isEdit ? '保存修改' : '创建设备'}
          </button>
        </div>
      </form>
    </div>
  );
}
