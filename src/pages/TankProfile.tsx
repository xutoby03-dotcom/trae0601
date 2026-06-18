import { useState } from 'react';
import { useAquaStore } from '@/store/aquaStore';
import type { Tank } from '@/types';
import { Plus, Fish, Thermometer, Sun, Trash2, Edit2, X, Save, Image } from 'lucide-react';

interface FormData {
  name: string;
  capacity: number;
  filterModel: string;
  fishSpecies: string;
  temperature: number;
  lightDuration: number;
  photo: string;
}

const emptyForm: FormData = {
  name: '',
  capacity: 100,
  filterModel: '',
  fishSpecies: '',
  temperature: 25,
  lightDuration: 8,
  photo: '',
};

export default function TankProfile() {
  const { tanks, activeTankId, addTank, updateTank, deleteTank, setActiveTankId } = useAquaStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const activeTank = tanks.find((t) => t.id === activeTankId) ?? null;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (tank: Tank) => {
    setEditingId(tank.id);
    setForm({
      name: tank.name,
      capacity: tank.capacity,
      filterModel: tank.filterModel,
      fishSpecies: tank.fishSpecies.join(', '),
      temperature: tank.temperature,
      lightDuration: tank.lightDuration,
      photo: tank.photo ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const species = form.fishSpecies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const data = {
      name: form.name,
      capacity: form.capacity,
      filterModel: form.filterModel,
      fishSpecies: species,
      temperature: form.temperature,
      lightDuration: form.lightDuration,
      photo: form.photo || null,
    };

    if (editingId) {
      updateTank(editingId, data);
    } else {
      const tank = addTank(data);
      setActiveTankId(tank.id);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteTank(id);
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bubble-bg relative min-h-screen p-4 md:p-6 lg:p-8">
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foam">
            <Fish className="inline-block mr-2 mb-1" size={28} />
            鱼缸档案
          </h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coral hover:bg-coral-light text-white font-medium transition-all duration-200 shadow-lg shadow-coral/20"
          >
            <Plus size={18} />
            添加鱼缸
          </button>
        </div>

        {tanks.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Fish size={48} className="mx-auto mb-4 text-foam/30" />
            <p className="text-foam/50 text-lg">还没有鱼缸档案，点击上方按钮添加第一个</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tanks.map((tank) => {
              const isActive = tank.id === activeTankId;
              return (
                <div
                  key={tank.id}
                  onClick={() => setActiveTankId(tank.id)}
                  className={`glass-card p-4 cursor-pointer transition-all duration-300 ${
                    isActive ? 'border-l-4 border-l-coral' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-serif font-semibold text-foam truncate flex-1 mr-2">
                      {tank.name}
                    </h3>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(tank);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-foam/60 hover:text-coral transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tank.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-foam/60 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-foam/70">
                    <div className="flex items-center justify-between">
                      <span>容量</span>
                      <span className="text-foam font-medium">{tank.capacity} L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>过滤桶</span>
                      <span className="text-foam font-medium truncate ml-2">{tank.filterModel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer size={14} className="text-coral shrink-0" />
                      <span>{tank.temperature} °C</span>
                      <Sun size={14} className="text-sand ml-2 shrink-0" />
                      <span>{tank.lightDuration} h</span>
                    </div>
                  </div>

                  {tank.fishSpecies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {tank.fishSpecies.map((sp, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full bg-shallow/30 text-foam/90 border border-shallow/30"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTank && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-serif font-bold text-foam mb-5 flex items-center gap-2">
              <Fish size={22} className="text-coral" />
              {activeTank.name}
              <span className="text-sm font-normal text-foam/40 ml-2">详情</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {activeTank.photo ? (
                  <img
                    src={activeTank.photo}
                    alt={activeTank.name}
                    className="w-full h-48 object-cover rounded-xl border border-white/10"
                  />
                ) : (
                  <div className="w-full h-48 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Image size={40} className="text-foam/20" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass p-3 rounded-xl">
                    <p className="text-xs text-foam/50 mb-1">容量</p>
                    <p className="text-lg font-semibold text-foam">{activeTank.capacity} L</p>
                  </div>
                  <div className="glass p-3 rounded-xl">
                    <p className="text-xs text-foam/50 mb-1">过滤桶</p>
                    <p className="text-sm font-semibold text-foam truncate">{activeTank.filterModel}</p>
                  </div>
                  <div className="glass p-3 rounded-xl">
                    <p className="text-xs text-foam/50 mb-1">
                      <Thermometer size={12} className="inline mr-1 text-coral" />
                      温度
                    </p>
                    <p className="text-lg font-semibold text-foam">{activeTank.temperature} °C</p>
                  </div>
                  <div className="glass p-3 rounded-xl">
                    <p className="text-xs text-foam/50 mb-1">
                      <Sun size={12} className="inline mr-1 text-sand" />
                      灯光
                    </p>
                    <p className="text-lg font-semibold text-foam">{activeTank.lightDuration} h</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm text-foam/50 mb-3">鱼种</h3>
                {activeTank.fishSpecies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeTank.fishSpecies.map((sp, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-sm rounded-full bg-ocean/40 text-foam border border-shallow/30 font-medium"
                      >
                        🐟 {sp}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-foam/30 text-sm">暂未记录鱼种</p>
                )}

                <div className="mt-6 glass p-4 rounded-xl">
                  <p className="text-xs text-foam/50 mb-1">创建时间</p>
                  <p className="text-sm text-foam/70">
                    {new Date(activeTank.createdAt).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="glass-strong relative w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-foam">
                {editingId ? '编辑鱼缸' : '添加鱼缸'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-foam/60 hover:text-foam transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-foam/70 mb-1.5">鱼缸名称</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                  placeholder="例：客厅草缸"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foam/70 mb-1.5">容量 (L)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.capacity}
                    onChange={(e) => updateField('capacity', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foam/70 mb-1.5">过滤桶型号</label>
                  <input
                    type="text"
                    required
                    value={form.filterModel}
                    onChange={(e) => updateField('filterModel', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                    placeholder="例：CF1200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-foam/70 mb-1.5">鱼种（逗号分隔）</label>
                <input
                  type="text"
                  value={form.fishSpecies}
                  onChange={(e) => updateField('fishSpecies', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                  placeholder="例：红绿灯, 孔雀鱼, 黑壳虾"
                />
                {form.fishSpecies && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.fishSpecies
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((sp, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full bg-shallow/30 text-foam/90 border border-shallow/30"
                        >
                          {sp}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foam/70 mb-1.5">
                    <Thermometer size={12} className="inline mr-1 text-coral" />
                    温度 (°C)
                  </label>
                  <input
                    type="number"
                    required
                    step={0.1}
                    value={form.temperature}
                    onChange={(e) => updateField('temperature', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foam/70 mb-1.5">
                    <Sun size={12} className="inline mr-1 text-sand" />
                    灯光时长 (h)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={24}
                    value={form.lightDuration}
                    onChange={(e) => updateField('lightDuration', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-foam/70 mb-1.5">
                  <Image size={12} className="inline mr-1" />
                  照片 URL
                </label>
                <input
                  type="text"
                  value={form.photo}
                  onChange={(e) => updateField('photo', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                  placeholder="https://example.com/tank.jpg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-foam/70 hover:bg-white/5 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-coral hover:bg-coral-light text-white font-medium transition-colors shadow-lg shadow-coral/20"
                >
                  <Save size={16} />
                  {editingId ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
