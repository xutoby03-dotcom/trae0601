import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Waves, Shirt, Camera, Aperture, Layers, Anchor } from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';
import RatingInput from '@/components/RatingInput';
import Bubbles from '@/components/Bubbles';
import {
  SALINITY_OPTIONS,
  WETSUIT_OPTIONS,
  CAMERA_HOUSING_OPTIONS,
  LENS_PORT_OPTIONS,
  BUOYANCY_ARM_OPTIONS,
  LEAD_POSITION_OPTIONS,
  RATING_ITEMS,
} from '@/types';

const defaultFormData = {
  name: '',
  salinity: SALINITY_OPTIONS[0],
  wetsuitThickness: WETSUIT_OPTIONS[0],
  cameraHousing: CAMERA_HOUSING_OPTIONS[0],
  lensPort: LENS_PORT_OPTIONS[0],
  buoyancyArm: BUOYANCY_ARM_OPTIONS[0],
  leadPosition: LEAD_POSITION_OPTIONS[0],
  pitchForward: 3,
  pitchBackward: 3,
  roll: 3,
  ascentSpeed: 3,
  handling: 3,
  notes: '',
};

export default function PlanForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addPlan, updatePlan, getPlan } = usePlanStore();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(defaultFormData);
  const [activeTab, setActiveTab] = useState<'equipment' | 'feedback'>('equipment');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      const plan = getPlan(id);
      if (plan) {
        setFormData({
          name: plan.name,
          salinity: plan.salinity,
          wetsuitThickness: plan.wetsuitThickness,
          cameraHousing: plan.cameraHousing,
          lensPort: plan.lensPort,
          buoyancyArm: plan.buoyancyArm,
          leadPosition: plan.leadPosition,
          pitchForward: plan.pitchForward,
          pitchBackward: plan.pitchBackward,
          roll: plan.roll,
          ascentSpeed: plan.ascentSpeed,
          handling: plan.handling,
          notes: plan.notes,
        });
      }
    }
  }, [id, getPlan]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('请输入方案名称');
      return;
    }

    if (isEditing && id) {
      updatePlan(id, formData);
    } else {
      addPlan(formData);
    }

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const SelectField = ({
    label,
    icon: Icon,
    value,
    onChange,
    options,
  }: {
    label: string;
    icon: React.ElementType;
    value: string;
    onChange: (value: string) => void;
    options: string[];
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
        <Icon size={18} className="text-cyan-400" />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 
                   rounded-xl text-white focus:outline-none focus:border-cyan-500/50 
                   focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-800">
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative">
      <Bubbles />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <header className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>返回</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {isEditing ? '编辑配重方案' : '新建配重方案'}
          </h1>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-slate-800/30 rounded-xl backdrop-blur-md border border-slate-700/30">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'equipment'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            装备配置
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'feedback'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            下潜反馈
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'equipment' && (
            <div className="space-y-5 animate-fade-in">
              {/* Plan Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">方案名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="例如：三亚海水3mm湿衣方案"
                  className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 
                             rounded-xl text-white placeholder-slate-500 focus:outline-none 
                             focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="水域盐度"
                  icon={Waves}
                  value={formData.salinity}
                  onChange={(v) => handleChange('salinity', v)}
                  options={SALINITY_OPTIONS}
                />
                <SelectField
                  label="潜水服厚度"
                  icon={Shirt}
                  value={formData.wetsuitThickness}
                  onChange={(v) => handleChange('wetsuitThickness', v)}
                  options={WETSUIT_OPTIONS}
                />
                <SelectField
                  label="相机壳体"
                  icon={Camera}
                  value={formData.cameraHousing}
                  onChange={(v) => handleChange('cameraHousing', v)}
                  options={CAMERA_HOUSING_OPTIONS}
                />
                <SelectField
                  label="镜头罩"
                  icon={Aperture}
                  value={formData.lensPort}
                  onChange={(v) => handleChange('lensPort', v)}
                  options={LENS_PORT_OPTIONS}
                />
                <SelectField
                  label="浮力臂"
                  icon={Layers}
                  value={formData.buoyancyArm}
                  onChange={(v) => handleChange('buoyancyArm', v)}
                  options={BUOYANCY_ARM_OPTIONS}
                />
                <SelectField
                  label="铅块位置"
                  icon={Anchor}
                  value={formData.leadPosition}
                  onChange={(v) => handleChange('leadPosition', v)}
                  options={LEAD_POSITION_OPTIONS}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('feedback')}
                  className="px-6 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30
                             rounded-xl hover:bg-cyan-500/20 transition-colors"
                >
                  下一步：填写反馈
                </button>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6 animate-fade-in">
              {/* Rating Section */}
              <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/30 p-5 space-y-6">
                <h3 className="text-lg font-semibold text-white">下潜后评分</h3>
                <p className="text-sm text-slate-400 -mt-4">
                  根据实际下潜体验，对以下各项进行1-5分评分
                </p>

                <div className="space-y-5">
                  {RATING_ITEMS.map((item) => (
                    <RatingInput
                      key={item.key}
                      label={item.label}
                      description={item.description}
                      value={formData[item.key] as number}
                      onChange={(v) => handleChange(item.key, v)}
                    />
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="记录其他需要注意的事项，如水深、水温、特殊装备等..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 
                             rounded-xl text-white placeholder-slate-500 focus:outline-none 
                             focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all
                             resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('equipment')}
                  className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                >
                  返回配置
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 
                             bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 
                             text-white font-medium rounded-xl transition-all duration-300 
                             hover:shadow-[0_4px_20px_rgba(0,212,255,0.4)]"
                >
                  <Save size={20} />
                  <span>{isEditing ? '保存修改' : '保存方案'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500/90 text-white 
                          rounded-xl shadow-lg backdrop-blur-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">保存成功</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
