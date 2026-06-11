import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, PawPrint } from 'lucide-react';
import { useAppStore } from '@/store';
import type { FosterTask } from '@/types';
import { getTodayStr } from '@/utils';

export default function TaskForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const petIdFromQuery = searchParams.get('petId');

  const { pets, addTask, getPetById } = useAppStore();

  const [formData, setFormData] = useState<Omit<FosterTask, 'id' | 'createdAt' | 'status'>>({
    petId: petIdFromQuery || '',
    title: '',
    startDate: getTodayStr(),
    endDate: getTodayStr(),
    caretakerName: '',
    caretakerPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    feedingTimesPerDay: 2,
    feedingNotes: '',
    walkingRequirements: '',
    medicationInstructions: '',
    initialFoodAmount: 0,
    foodUnit: '克',
  });

  const selectedPet = formData.petId ? getPetById(formData.petId) : undefined;

  useEffect(() => {
    if (selectedPet) {
      setFormData((prev) => ({
        ...prev,
        title: prev.title || `${selectedPet.name}寄养`,
        feedingNotes:
          prev.feedingNotes ||
          (selectedPet.foodBrand
            ? `喂食${selectedPet.foodBrand}${selectedPet.foodAmount ? `，每顿${selectedPet.foodAmount}` : ''}`
            : ''),
      }));
    }
  }, [selectedPet?.id]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.petId) {
      alert('请选择宠物');
      return;
    }
    if (!formData.title.trim()) {
      alert('请输入任务标题');
      return;
    }
    if (!formData.caretakerName.trim()) {
      alert('请输入接手人姓名');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('结束日期不能早于开始日期');
      return;
    }

    addTask(formData);
    navigate('/tasks');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tasks" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">新建寄养任务</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
          <label className="label text-brand-700">
            <PawPrint size={16} className="inline mr-1" />
            选择宠物 *
          </label>
          {pets.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-500 mb-3">还没有宠物资料，请先添加</p>
              <Link to="/pets/new" className="btn-secondary text-sm">
                添加宠物
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pets.map((pet) => (
                <label
                  key={pet.id}
                  className={`cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.petId === pet.id
                      ? 'border-brand-500 bg-white shadow-md'
                      : 'border-transparent bg-white/60 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="petId"
                    value={pet.id}
                    checked={formData.petId === pet.id}
                    onChange={(e) => handleChange('petId', e.target.value)}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    {pet.avatarUrl ? (
                      <img
                        src={pet.avatarUrl}
                        alt={pet.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-2xl">
                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
                      </div>
                    )}
                    <span className="font-medium text-slate-700 text-sm">{pet.name}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">任务标题 *</label>
          <input
            type="text"
            className="input"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="例如：国庆期间小白寄养"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">开始日期 *</label>
            <input
              type="date"
              className="input"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="label">结束日期 *</label>
            <input
              type="date"
              className="input"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">接手人姓名 *</label>
            <input
              type="text"
              className="input"
              value={formData.caretakerName}
              onChange={(e) => handleChange('caretakerName', e.target.value)}
              placeholder="朋友的名字"
            />
          </div>
          <div>
            <label className="label">接手人电话</label>
            <input
              type="tel"
              className="input"
              value={formData.caretakerPhone}
              onChange={(e) => handleChange('caretakerPhone', e.target.value)}
              placeholder="联系电话"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">紧急联系人姓名</label>
            <input
              type="text"
              className="input"
              value={formData.emergencyContactName}
              onChange={(e) => handleChange('emergencyContactName', e.target.value)}
              placeholder="宠物主人或兽医"
            />
          </div>
          <div>
            <label className="label">紧急联系人电话</label>
            <input
              type="tel"
              className="input"
              value={formData.emergencyContactPhone}
              onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
              placeholder="紧急情况下拨打"
            />
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
          <h3 className="font-semibold text-amber-800 flex items-center gap-2">
            🍚 喂食安排
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">每天喂食次数</label>
              <input
                type="number"
                min="1"
                max="6"
                className="input"
                value={formData.feedingTimesPerDay}
                onChange={(e) =>
                  handleChange('feedingTimesPerDay', parseInt(e.target.value) || 1)
                }
              />
            </div>
            <div>
              <label className="label">初始粮食量</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="input"
                value={formData.initialFoodAmount}
                onChange={(e) =>
                  handleChange('initialFoodAmount', parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className="label">计量单位</label>
              <select
                className="input"
                value={formData.foodUnit}
                onChange={(e) => handleChange('foodUnit', e.target.value)}
              >
                <option value="克">克</option>
                <option value="杯">杯</option>
                <option value="袋">袋</option>
                <option value="份">份</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">喂食说明</label>
            <textarea
              className="textarea bg-white"
              rows={2}
              value={formData.feedingNotes}
              onChange={(e) => handleChange('feedingNotes', e.target.value)}
              placeholder="详细的喂食说明，如注意事项、食量分配等..."
            />
          </div>
        </div>

        <div>
          <label className="label">🐾 遛弯要求</label>
          <textarea
            className="textarea"
            rows={2}
            value={formData.walkingRequirements}
            onChange={(e) => handleChange('walkingRequirements', e.target.value)}
            placeholder="例如：每天早晚各一次，每次30分钟，注意牵好绳子...（不需要遛弯可留空）"
          />
        </div>

        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <label className="label text-rose-700">💊 用药提醒</label>
          <textarea
            className="textarea bg-white"
            rows={3}
            value={formData.medicationInstructions}
            onChange={(e) => handleChange('medicationInstructions', e.target.value)}
            placeholder="例如：每天早上饭后半片驱虫药，注意观察反应...（不需要喂药可留空）"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
          <Link to="/tasks" className="btn-ghost">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save size={18} />
            创建寄养任务
          </button>
        </div>
      </form>
    </div>
  );
}
