import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Pet } from '@/types';
import { handleFileUpload } from '@/utils';

export default function PetForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { getPetById, addPet, updatePet } = useAppStore();

  const existingPet = id ? getPetById(id) : undefined;

  const [formData, setFormData] = useState<Omit<Pet, 'id' | 'createdAt'>>({
    name: '',
    species: 'dog',
    age: 1,
    breed: '',
    avatarUrl: '',
    allergies: '',
    foodBrand: '',
    foodAmount: '',
    vaccinePhotoUrl: '',
    notes: '',
  });

  useEffect(() => {
    if (existingPet) {
      setFormData({
        name: existingPet.name,
        species: existingPet.species,
        age: existingPet.age,
        breed: existingPet.breed,
        avatarUrl: existingPet.avatarUrl,
        allergies: existingPet.allergies,
        foodBrand: existingPet.foodBrand,
        foodAmount: existingPet.foodAmount,
        vaccinePhotoUrl: existingPet.vaccinePhotoUrl,
        notes: existingPet.notes,
      });
    }
  }, [existingPet]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleFileUpload(file);
      handleChange('avatarUrl', url);
    }
  };

  const handleVaccinePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleFileUpload(file);
      handleChange('vaccinePhotoUrl', url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入宠物名字');
      return;
    }

    if (isEditing && id) {
      updatePet(id, formData);
    } else {
      addPet(formData);
    }
    navigate('/pets');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/pets" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">
          {isEditing ? '编辑宠物资料' : '添加新宠物'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div className="flex-shrink-0">
            <label className="block text-center">
              <span className="label text-center">宠物头像</span>
              <div className="relative group cursor-pointer">
                {formData.avatarUrl ? (
                  <div className="relative">
                    <img
                      src={formData.avatarUrl}
                      alt="头像"
                      className="w-32 h-32 rounded-3xl object-cover border-4 border-brand-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('avatarUrl', '')}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-brand-50 border-4 border-dashed border-brand-200 flex flex-col items-center justify-center text-brand-400 group-hover:bg-brand-100 transition-colors">
                    <Upload size={28} />
                    <span className="text-xs mt-1">点击上传</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className="label">名字 *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="例如：小白"
              />
            </div>

            <div>
              <label className="label">种类</label>
              <select
                className="input"
                value={formData.species}
                onChange={(e) => handleChange('species', e.target.value)}
              >
                <option value="dog">🐕 狗狗</option>
                <option value="cat">🐱 猫咪</option>
                <option value="other">🐾 其他</option>
              </select>
            </div>

            <div>
              <label className="label">年龄（岁）</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                className="input"
                value={formData.age}
                onChange={(e) => handleChange('age', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label">品种</label>
              <input
                type="text"
                className="input"
                value={formData.breed}
                onChange={(e) => handleChange('breed', e.target.value)}
                placeholder="例如：金毛、布偶"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
          <label className="label text-red-700">⚠️ 过敏项</label>
          <textarea
            className="textarea bg-white"
            rows={2}
            value={formData.allergies}
            onChange={(e) => handleChange('allergies', e.target.value)}
            placeholder="例如：对鸡肉过敏、不能吃葡萄..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">🍚 常用粮品牌</label>
            <input
              type="text"
              className="input"
              value={formData.foodBrand}
              onChange={(e) => handleChange('foodBrand', e.target.value)}
              placeholder="例如：皇家、渴望"
            />
          </div>
          <div>
            <label className="label">每顿食量</label>
            <input
              type="text"
              className="input"
              value={formData.foodAmount}
              onChange={(e) => handleChange('foodAmount', e.target.value)}
              placeholder="例如：50克、1/2杯"
            />
          </div>
        </div>

        <div>
          <label className="label">💉 疫苗照片</label>
          {formData.vaccinePhotoUrl ? (
            <div className="relative inline-block">
              <img
                src={formData.vaccinePhotoUrl}
                alt="疫苗证明"
                className="max-w-xs rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={() => handleChange('vaccinePhotoUrl', '')}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 hover:border-brand-300 hover:bg-brand-50 transition-all">
                <Upload size={32} className="mx-auto mb-2" />
                <span>点击上传疫苗本照片</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleVaccinePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div>
          <label className="label">📝 其他备注</label>
          <textarea
            className="textarea"
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="性格、习惯、特殊需求等..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
          <Link to="/pets" className="btn-ghost">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save size={18} />
            {isEditing ? '保存修改' : '添加宠物'}
          </button>
        </div>
      </form>
    </div>
  );
}
