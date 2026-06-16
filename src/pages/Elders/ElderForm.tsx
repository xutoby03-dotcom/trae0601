import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import { useElderStore } from '@/store/elderStore';
import type { Elder, Gender } from '@/types';

export default function ElderForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getElderById, addElder, updateElder } = useElderStore();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Elder>>({
    name: '',
    phone: '',
    age: 65,
    gender: 'female' as Gender,
    avatar: '',
    phoneModel: '',
    phoneSystem: 'android',
    commonApps: '',
    vision: '正常',
    hearing: '正常',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    notes: '',
    needHomeVisit: false,
  });

  useEffect(() => {
    if (isEdit && id) {
      const elder = getElderById(id);
      if (elder) {
        setFormData(elder);
      }
    }
  }, [id, isEdit, getElderById]);

  const handleChange = (field: keyof Elder, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('请填写姓名和电话');
      return;
    }

    if (isEdit && id) {
      updateElder(id, formData);
    } else {
      if (!formData.avatar) {
        const color = ['#FF6B35', '#22C55E', '#3B82F6', '#F59E0B'][Math.floor(Math.random() * 4)];
        const initial = formData.name?.charAt(0) || '老';
        formData.avatar = `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="${color}"/>
            <text x="50" y="62" text-anchor="middle" fill="white" font-family="Noto Sans SC, sans-serif" font-size="42" font-weight="600">${initial}</text>
          </svg>`
        )}`;
      }
      addElder(formData as Omit<Elder, 'id' | 'createdAt'>);
    }

    navigate('/elders');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/elders" className="btn-ghost -ml-2">
          <ArrowLeft size={20} />
          返回
        </Link>
        <h1 className="text-2xl font-bold text-neutral-800">
          {isEdit ? '编辑老人档案' : '新增老人档案'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="section-title">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-neutral-100 overflow-hidden flex items-center justify-center">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="头像" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={32} className="text-neutral-400" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-primary-600 transition-colors">
                  <Upload size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              <div>
                <p className="font-medium text-neutral-800">头像照片</p>
                <p className="text-sm text-neutral-500 mt-1">上传老人照片，方便识别</p>
              </div>
            </div>

            <div>
              <label className="label">姓名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="input"
                placeholder="请输入姓名"
              />
            </div>

            <div>
              <label className="label">手机号 <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input"
                placeholder="请输入手机号"
              />
            </div>

            <div>
              <label className="label">年龄</label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                className="input"
                placeholder="请输入年龄"
              />
            </div>

            <div>
              <label className="label">性别</label>
              <div className="flex gap-4">
                {[
                  { value: 'male', label: '男' },
                  { value: 'female', label: '女' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.gender === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={(e) => handleChange('gender', e.target.value as Gender)}
                      className="hidden"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">居住地址</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="input"
                placeholder="请输入居住地址"
              />
            </div>

            <div>
              <label className="label">是否需要上门辅导</label>
              <div className="flex items-center h-12">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needHomeVisit}
                    onChange={(e) => handleChange('needHomeVisit', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-500"></div>
                  <span className="ml-3 text-sm text-neutral-600">
                    {formData.needHomeVisit ? '是，需要上门' : '否，可到社区'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">手机信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">手机型号</label>
              <input
                type="text"
                value={formData.phoneModel || ''}
                onChange={(e) => handleChange('phoneModel', e.target.value)}
                className="input"
                placeholder="例如：iPhone 13、华为Mate 40"
              />
            </div>

            <div>
              <label className="label">手机系统</label>
              <select
                value={formData.phoneSystem || 'android'}
                onChange={(e) => handleChange('phoneSystem', e.target.value)}
                className="input"
              >
                <option value="ios">iOS (苹果)</option>
                <option value="android">Android (安卓)</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">常用软件</label>
              <input
                type="text"
                value={formData.commonApps || ''}
                onChange={(e) => handleChange('commonApps', e.target.value)}
                className="input"
                placeholder="例如：微信、抖音、支付宝"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">健康状况</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">视力情况</label>
              <input
                type="text"
                value={formData.vision || ''}
                onChange={(e) => handleChange('vision', e.target.value)}
                className="input"
                placeholder="例如：正常、老花眼、白内障"
              />
            </div>

            <div>
              <label className="label">听力情况</label>
              <input
                type="text"
                value={formData.hearing || ''}
                onChange={(e) => handleChange('hearing', e.target.value)}
                className="input"
                placeholder="例如：正常、左耳稍差"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">紧急联系人</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">紧急联系人姓名</label>
              <input
                type="text"
                value={formData.emergencyContact || ''}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                className="input"
                placeholder="例如：王小明（儿子）"
              />
            </div>

            <div>
              <label className="label">紧急联系电话</label>
              <input
                type="tel"
                value={formData.emergencyPhone || ''}
                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                className="input"
                placeholder="请输入紧急联系电话"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">备注</h2>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input min-h-[100px] resize-y"
            placeholder="其他需要注意的信息..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <Link to="/elders" className="btn-secondary btn-lg">
            取消
          </Link>
          <button type="submit" className="btn-primary btn-lg">
            <Save size={20} />
            {isEdit ? '保存修改' : '创建档案'}
          </button>
        </div>
      </form>
    </div>
  );
}
