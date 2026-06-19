import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Wine,
  Coffee,
} from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';
import { cn } from '@/lib/utils';

export default function PlanForm() {
  const navigate = useNavigate();
  const { createPlan, loading } = usePlanStore();

  const [formData, setFormData] = useState({
    name: '',
    restaurant: '',
    date: '',
    totalTables: 2,
    seatsPerTable: 10,
    budget: 2000,
    alcoholicDrinks: ['啤酒', '红酒'],
    nonAlcoholicDrinks: ['可乐', '雪碧', '矿泉水'],
  });

  const [newAlcoholic, setNewAlcoholic] = useState('');
  const [newNonAlcoholic, setNewNonAlcoholic] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入方案名称';
    }
    if (!formData.restaurant.trim()) {
      newErrors.restaurant = '请输入餐厅名称';
    }
    if (!formData.date) {
      newErrors.date = '请选择活动日期';
    }
    if (formData.totalTables < 1) {
      newErrors.totalTables = '桌数至少为1';
    }
    if (formData.seatsPerTable < 2) {
      newErrors.seatsPerTable = '每桌人数至少为2';
    }
    if (formData.budget < 0) {
      newErrors.budget = '预算不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const plan = await createPlan({
        name: formData.name,
        restaurant: formData.restaurant,
        date: formData.date,
        totalTables: formData.totalTables,
        seatsPerTable: formData.seatsPerTable,
        dishes: [],
        drinks: {
          alcoholic: formData.alcoholicDrinks,
          nonAlcoholic: formData.nonAlcoholicDrinks,
        },
        budget: formData.budget,
      });

      navigate(`/plans/${plan.id}`);
    } catch (error) {
      console.error('创建方案失败:', error);
    }
  };

  const handleAddAlcoholic = () => {
    if (newAlcoholic.trim() && !formData.alcoholicDrinks.includes(newAlcoholic.trim())) {
      setFormData((prev) => ({
        ...prev,
        alcoholicDrinks: [...prev.alcoholicDrinks, newAlcoholic.trim()],
      }));
      setNewAlcoholic('');
    }
  };

  const handleRemoveAlcoholic = (drink: string) => {
    setFormData((prev) => ({
      ...prev,
      alcoholicDrinks: prev.alcoholicDrinks.filter((d) => d !== drink),
    }));
  };

  const handleAddNonAlcoholic = () => {
    if (newNonAlcoholic.trim() && !formData.nonAlcoholicDrinks.includes(newNonAlcoholic.trim())) {
      setFormData((prev) => ({
        ...prev,
        nonAlcoholicDrinks: [...prev.nonAlcoholicDrinks, newNonAlcoholic.trim()],
      }));
      setNewNonAlcoholic('');
    }
  };

  const handleRemoveNonAlcoholic = (drink: string) => {
    setFormData((prev) => ({
      ...prev,
      nonAlcoholicDrinks: prev.nonAlcoholicDrinks.filter((d) => d !== drink),
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/plans"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            返回方案列表
          </Link>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
            新建方案
          </h1>
          <p className="text-slate-500">
            创建一个新的聚餐方案，填写基本信息和酒水配置
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-primary-600" />
            基本信息
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                方案名称 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className={cn('input', errors.name && 'border-danger-300 focus:border-danger-500')}
                placeholder="如：2024年终团建聚餐"
              />
              {errors.name && <p className="text-xs text-danger-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label">
                餐厅名称 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.restaurant}
                onChange={(e) => setFormData((prev) => ({ ...prev, restaurant: e.target.value }))}
                className={cn('input', errors.restaurant && 'border-danger-300 focus:border-danger-500')}
                placeholder="请输入餐厅名称"
              />
              {errors.restaurant && <p className="text-xs text-danger-500 mt-1">{errors.restaurant}</p>}
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                活动日期 <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                min={today}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className={cn('input', errors.date && 'border-danger-300 focus:border-danger-500')}
              />
              {errors.date && <p className="text-xs text-danger-500 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <DollarSign size={14} className="text-slate-400" />
                预算（元） <span className="text-danger-500">*</span>
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                className={cn('input', errors.budget && 'border-danger-300 focus:border-danger-500')}
                placeholder="0"
                min="0"
              />
              {errors.budget && <p className="text-xs text-danger-500 mt-1">{errors.budget}</p>}
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                总桌数 <span className="text-danger-500">*</span>
              </label>
              <input
                type="number"
                value={formData.totalTables}
                onChange={(e) => setFormData((prev) => ({ ...prev, totalTables: Number(e.target.value) }))}
                className={cn('input', errors.totalTables && 'border-danger-300 focus:border-danger-500')}
                placeholder="0"
                min="1"
                max="50"
              />
              {errors.totalTables && <p className="text-xs text-danger-500 mt-1">{errors.totalTables}</p>}
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                每桌人数 <span className="text-danger-500">*</span>
              </label>
              <input
                type="number"
                value={formData.seatsPerTable}
                onChange={(e) => setFormData((prev) => ({ ...prev, seatsPerTable: Number(e.target.value) }))}
                className={cn('input', errors.seatsPerTable && 'border-danger-300 focus:border-danger-500')}
                placeholder="0"
                min="2"
                max="30"
              />
              {errors.seatsPerTable && <p className="text-xs text-danger-500 mt-1">{errors.seatsPerTable}</p>}
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-sm text-primary-700">
              <strong>预计容纳人数：</strong> {formData.totalTables * formData.seatsPerTable} 人
            </p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Wine size={20} className="text-primary-600" />
            酒水配置
          </h2>

          <div className="space-y-6">
            <div>
              <label className="label mb-3 flex items-center gap-2">
                <Wine size={14} className="text-amber-500" />
                含酒精饮品
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.alcoholicDrinks.map((drink) => (
                  <span
                    key={drink}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm"
                  >
                    {drink}
                    <button
                      type="button"
                      onClick={() => handleRemoveAlcoholic(drink)}
                      className="ml-1 hover:text-amber-900 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAlcoholic}
                  onChange={(e) => setNewAlcoholic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAlcoholic())}
                  className="input flex-1"
                  placeholder="输入饮品名称，按回车添加"
                />
                <button
                  type="button"
                  onClick={handleAddAlcoholic}
                  className="btn-secondary"
                >
                  <Plus size={16} />
                  添加
                </button>
              </div>
            </div>

            <div>
              <label className="label mb-3 flex items-center gap-2">
                <Coffee size={14} className="text-slate-500" />
                无酒精饮品
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.nonAlcoholicDrinks.map((drink) => (
                  <span
                    key={drink}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-sm"
                  >
                    {drink}
                    <button
                      type="button"
                      onClick={() => handleRemoveNonAlcoholic(drink)}
                      className="ml-1 hover:text-slate-900 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNonAlcoholic}
                  onChange={(e) => setNewNonAlcoholic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNonAlcoholic())}
                  className="input flex-1"
                  placeholder="输入饮品名称，按回车添加"
                />
                <button
                  type="button"
                  onClick={handleAddNonAlcoholic}
                  className="btn-secondary"
                >
                  <Plus size={16} />
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link to="/plans" className="btn-secondary">
            取消
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            <Save size={16} />
            创建方案
          </button>
        </div>
      </form>
    </div>
  );
}
