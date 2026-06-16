import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { useStore } from '../store/useStore';
import { BracesStage } from '../types';
import { getTodayString } from '../utils/storage';
import Card, { CardHeader, CardContent } from '../components/Card';

const stageOptions: { value: BracesStage; label: string }[] = [
  { value: '第一阶段', label: '第一阶段' },
  { value: '第二阶段', label: '第二阶段' },
  { value: '保持器', label: '保持器' },
];

const colorOptions = [
  { value: '#FFB6C1', label: '粉色' },
  { value: '#87CEEB', label: '天蓝色' },
  { value: '#98FB98', label: '薄荷绿' },
  { value: '#DDA0DD', label: '淡紫色' },
  { value: '#FFDAB9', label: '桃色' },
  { value: '#E6E6FA', label: '薰衣草' },
  { value: '#F0E68C', label: '卡其色' },
  { value: '#FFA07A', label: '浅珊瑚' },
];

const BracesForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { braces, init, initialized, addBraces, updateBraces } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    stage: '第一阶段' as BracesStage,
    doctor: '',
    receiveDate: getTodayString(),
    boxColor: '#FFB6C1',
    cleanCycle: 3,
    photo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialized) {
      init();
    }
  }, [init, initialized]);

  useEffect(() => {
    if (isEdit && initialized) {
      const existingBraces = braces.find(b => b.id === id);
      if (existingBraces) {
        setFormData({
          name: existingBraces.name,
          stage: existingBraces.stage,
          doctor: existingBraces.doctor,
          receiveDate: existingBraces.receiveDate,
          boxColor: existingBraces.boxColor,
          cleanCycle: existingBraces.cleanCycle,
          photo: existingBraces.photo || '',
        });
      }
    }
  }, [isEdit, id, braces, initialized]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = '请输入名称';
    }
    if (!formData.doctor.trim()) {
      newErrors.doctor = '请输入医生姓名';
    }
    if (!formData.receiveDate) {
      newErrors.receiveDate = '请选择领取日期';
    }
    if (formData.cleanCycle < 1) {
      newErrors.cleanCycle = '清洁周期至少1天';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && id) {
      updateBraces(id, formData);
    } else {
      addBraces(formData);
    }
    navigate('/braces');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePhoto = () => {
    const prompt = encodeURIComponent('cute dental braces retainer for kids clean product photo white background');
    const photoUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`;
    setFormData(prev => ({ ...prev, photo: photoUrl }));
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-pulse text-primary text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-warm-gray transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-display text-warm-dark">
            {isEdit ? '编辑档案' : '添加牙套档案'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEdit ? '修改牙套信息' : '记录新的牙套或保持器'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-warm-dark">基本信息</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="label-base">照片</label>
              <div className="flex gap-4 items-center">
                {formData.photo ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden">
                    <img
                      src={formData.photo}
                      alt="牙套照片"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-warm-gray flex items-center justify-center">
                    <span className="text-5xl">🦷</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="btn-secondary flex items-center justify-center gap-2 cursor-pointer">
                    <Camera size={18} />
                    上传照片
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={generatePhoto}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    ✨ 生成照片
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="label-base">名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例如：上颌牙套"
                className={`input-base ${errors.name ? 'border-accent-coral' : ''}`}
              />
              {errors.name && <p className="text-accent-coral text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label-base">佩戴阶段 *</label>
              <div className="grid grid-cols-3 gap-2">
                {stageOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, stage: option.value }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.stage === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent bg-warm-gray/50 hover:bg-warm-gray'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-base">主治医生 *</label>
              <input
                type="text"
                value={formData.doctor}
                onChange={(e) => setFormData(prev => ({ ...prev, doctor: e.target.value }))}
                placeholder="例如：李医生"
                className={`input-base ${errors.doctor ? 'border-accent-coral' : ''}`}
              />
              {errors.doctor && <p className="text-accent-coral text-sm mt-1">{errors.doctor}</p>}
            </div>

            <div>
              <label className="label-base">领取日期 *</label>
              <input
                type="date"
                value={formData.receiveDate}
                onChange={(e) => setFormData(prev => ({ ...prev, receiveDate: e.target.value }))}
                className={`input-base ${errors.receiveDate ? 'border-accent-coral' : ''}`}
              />
              {errors.receiveDate && <p className="text-accent-coral text-sm mt-1">{errors.receiveDate}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold font-display text-warm-dark">清洁设置</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="label-base">盒子颜色</label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, boxColor: color.value }))}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      formData.boxColor === color.value
                        ? 'border-primary'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-xs">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-base">清洁周期（天）*</label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.cleanCycle}
                onChange={(e) => setFormData(prev => ({ ...prev, cleanCycle: Number(e.target.value) }))}
                className={`input-base ${errors.cleanCycle ? 'border-accent-coral' : ''}`}
              />
              <p className="text-gray-500 text-sm mt-1">
                每隔多少天需要泡一次清洁片
              </p>
              {errors.cleanCycle && <p className="text-accent-coral text-sm mt-1">{errors.cleanCycle}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {isEdit ? '保存修改' : '创建档案'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BracesForm;
