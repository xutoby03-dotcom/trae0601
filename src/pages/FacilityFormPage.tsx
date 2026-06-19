import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { FACILITY_TYPE_LABELS } from '@/types';
import type { Facility, FacilityType, FacilityStatus } from '@/types';
import { todayStr } from '@/utils';

export default function FacilityFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFacility, addFacility, updateFacility } = useAppStore();
  const isEdit = !!id;

  const existing = id ? getFacility(id) : undefined;

  const [form, setForm] = useState({
    name: '',
    location: '',
    type: 'slide' as FacilityType,
    material: '',
    ageRange: '',
    installDate: '',
    maintenanceUnit: '',
    photo: '',
    status: 'normal' as FacilityStatus,
    area: '',
    nextInspectionDate: '',
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        location: existing.location,
        type: existing.type,
        material: existing.material,
        ageRange: existing.ageRange,
        installDate: existing.installDate,
        maintenanceUnit: existing.maintenanceUnit,
        photo: existing.photo,
        status: existing.status,
        area: existing.area,
        nextInspectionDate: existing.nextInspectionDate || '',
      });
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location) {
      alert('请填写设施名称和位置');
      return;
    }

    const defaultPhoto = form.photo || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(form.name + ' children playground equipment')}&image_size=landscape_4_3`;

    const facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'> = {
      ...form,
      photo: defaultPhoto,
      lastInspectionDate: existing?.lastInspectionDate || todayStr(),
    };

    if (isEdit && id) {
      updateFacility(id, facilityData);
    } else {
      addFacility(facilityData);
    }
    navigate('/facilities');
  };

  const handlePhotoPreview = () => {
    const desc = window.prompt('请输入设施照片描述（用于生成示例图片）：', form.name || '儿童滑梯');
    if (desc) {
      setForm({ ...form, photo: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(desc)}&image_size=landscape_4_3` });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/facilities" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回设施列表
        </Link>
      </div>

      <div className="card p-6">
        <h1 className="font-display text-2xl text-gray-800 mb-6">
          {isEdit ? '编辑设施档案' : '新增设施档案'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text">设施名称 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="如：彩虹滑梯"
              />
            </div>
            <div>
              <label className="label-text">所在区域</label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="input-field"
                placeholder="如：A区"
              />
            </div>
          </div>

          <div>
            <label className="label-text">具体位置 *</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input-field"
              placeholder="如：A区儿童乐园中央"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="label-text">设施类型</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as FacilityType })}
                className="input-field"
              >
                {Object.entries(FACILITY_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">材质</label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="input-field"
                placeholder="如：工程塑料+不锈钢"
              />
            </div>
            <div>
              <label className="label-text">适用年龄</label>
              <input
                type="text"
                value={form.ageRange}
                onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
                className="input-field"
                placeholder="如：3-12岁"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text">安装日期</label>
              <input
                type="date"
                value={form.installDate}
                onChange={(e) => setForm({ ...form, installDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">下次巡检日期</label>
              <input
                type="date"
                value={form.nextInspectionDate}
                onChange={(e) => setForm({ ...form, nextInspectionDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label-text">维保单位</label>
            <input
              type="text"
              value={form.maintenanceUnit}
              onChange={(e) => setForm({ ...form, maintenanceUnit: e.target.value })}
              className="input-field"
              placeholder="如：安游乐设施维保有限公司"
            />
          </div>

          <div>
            <label className="label-text">设施状态</label>
            <div className="flex gap-3">
              {([
                { value: 'normal', label: '正常使用', color: 'bg-success-500' },
                { value: 'needs_repair', label: '待维修', color: 'bg-primary-500' },
                { value: 'out_of_service', label: '已停用', color: 'bg-danger-500' },
              ] as const).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.status === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={form.status === opt.value}
                    onChange={(e) => setForm({ ...form, status: e.target.value as FacilityStatus })}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 justify-center">
                    <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                    <span className="font-medium">{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text">设施照片</label>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-3 items-start">
              {form.photo ? (
                <img src={form.photo} alt="预览" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
              ) : (
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <input
                type="text"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                className="input-field"
                placeholder="图片URL"
              />
              <button
                type="button"
                onClick={handlePhotoPreview}
                className="btn-secondary whitespace-nowrap"
              >
                生成示例
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link to="/facilities" className="btn-ghost">取消</Link>
            <button type="submit" className="btn-primary inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isEdit ? '保存修改' : '创建设施'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
