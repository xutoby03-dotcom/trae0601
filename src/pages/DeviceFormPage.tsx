import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  ArrowLeft,
  Save,
  X,
  Package,
} from 'lucide-react';
import { CLINIC_ROOMS, ACCESSORY_OPTIONS, Device, DeviceStatus } from '@shared/types';
import { api } from '@/lib/api';
import { formatDate, getTodayDate } from '@/lib/format';

function DeviceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Device>>({
    code: '',
    brand: '',
    model: '',
    ageRange: '',
    clinicRoom: '',
    purchaseDate: getTodayDate(),
    photo: '',
    accessories: [],
    remark: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      loadDevice();
    }
  }, [id, isEdit]);

  const loadDevice = async () => {
    setLoading(true);
    try {
      const device = await api.getDevice(id!);
      setFormData({
        ...device,
        purchaseDate: device.purchaseDate ? formatDate(device.purchaseDate) : getTodayDate(),
      });
    } catch (err: any) {
      alert(err.message);
      navigate('/devices');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Device, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAccessoryToggle = (accessory: string) => {
    const accessories = formData.accessories || [];
    if (accessories.includes(accessory)) {
      handleChange('accessories', accessories.filter((a) => a !== accessory));
    } else {
      handleChange('accessories', [...accessories, accessory]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      alert('请填写设备编号');
      return;
    }
    if (!formData.brand) {
      alert('请填写品牌');
      return;
    }
    if (!formData.model) {
      alert('请填写型号');
      return;
    }
    if (!formData.clinicRoom) {
      alert('请选择所在诊室');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        status: isEdit ? formData.status : DeviceStatus.AVAILABLE,
      };
      if (isEdit && id) {
        await api.updateDevice(id, submitData);
      } else {
        await api.createDevice(submitData);
      }
      navigate('/devices');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const AGE_RANGE_OPTIONS = [
    '全年龄段',
    '成人',
    '儿童/婴幼儿',
    '儿童',
    '婴幼儿',
    '成人/儿童',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mr-3" />
        <span className="text-slate-600">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/devices')}
            className="btn-ghost !p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2 rounded-lg bg-blue-100">
            {isEdit ? (
              <Pencil className="w-6 h-6 text-blue-600" />
            ) : (
              <Plus className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEdit ? '编辑设备' : '新增设备'}
            </h1>
            <p className="text-sm text-slate-500">
              {isEdit ? '修改设备档案信息' : '录入新的雾化器设备信息'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-600" />
            基本信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">设备编号 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input"
                placeholder="例如：WH-2024-001"
                value={formData.code || ''}
                onChange={(e) => handleChange('code', e.target.value)}
              />
            </div>
            <div>
              <label className="label">品牌 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input"
                placeholder="例如：欧姆龙"
                value={formData.brand || ''}
                onChange={(e) => handleChange('brand', e.target.value)}
              />
            </div>
            <div>
              <label className="label">型号 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input"
                placeholder="例如：NE-C28P"
                value={formData.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
              />
            </div>
            <div>
              <label className="label">适用年龄</label>
              <select
                className="select"
                value={formData.ageRange || ''}
                onChange={(e) => handleChange('ageRange', e.target.value)}
              >
                <option value="">请选择适用年龄</option>
                {AGE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">所在诊室 <span className="text-red-500">*</span></label>
              <select
                className="select"
                value={formData.clinicRoom || ''}
                onChange={(e) => handleChange('clinicRoom', e.target.value)}
              >
                <option value="">请选择诊室</option>
                {CLINIC_ROOMS.map((room) => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">采购日期</label>
              <input
                type="date"
                className="input"
                value={formData.purchaseDate || getTodayDate()}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">照片URL</label>
              <input
                type="text"
                className="input"
                placeholder="输入设备照片的URL地址"
                value={formData.photo || ''}
                onChange={(e) => handleChange('photo', e.target.value)}
              />
              {formData.photo && (
                <div className="mt-3 w-40 h-30 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={formData.photo}
                    alt="设备预览"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">配件清单</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ACCESSORY_OPTIONS.map((accessory) => {
              const checked = (formData.accessories || []).includes(accessory);
              return (
                <label
                  key={accessory}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    checked
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={checked}
                    onChange={() => handleAccessoryToggle(accessory)}
                  />
                  <span className="text-sm font-medium text-slate-700">{accessory}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">备注</h3>
          <textarea
            className="textarea h-28"
            placeholder="输入备注信息..."
            value={formData.remark || ''}
            onChange={(e) => handleChange('remark', e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/devices" className="btn-secondary">
            <X className="w-4 h-4 mr-2" />
            取消
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : (isEdit ? '保存修改' : '创建设备')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeviceFormPage;
