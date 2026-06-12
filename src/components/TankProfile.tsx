import { useState } from 'react';
import { Droplets, Thermometer, Filter, User, Edit3, X, Check, Plus, Trash2 } from 'lucide-react';
import { useFishTankStore } from '@/store/useFishTankStore';
import type { Fish, Tank } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig = {
  healthy: { label: '健康', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  sick: { label: '生病', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  quarantine: { label: '隔离', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const avatarOptions = ['🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🪼', '🦐'];

export default function TankProfile() {
  const { tank, fishes, updateTank, addFish, updateFish, removeFish } = useFishTankStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Tank>(tank);
  const [editFishes, setEditFishes] = useState<Fish[]>(fishes);
  const [newFish, setNewFish] = useState<Omit<Fish, 'id'>>({
    name: '',
    species: '',
    avatar: '🐟',
    addedDate: new Date().toISOString().split('T')[0],
    status: 'healthy',
  });

  const handleStartEdit = () => {
    setEditData(tank);
    setEditFishes(fishes);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateTank(editData);

    const existingFishIds = fishes.map((f) => f.id);
    const editedFishIds = editFishes.map((f) => f.id);

    editFishes.forEach((fish) => {
      if (existingFishIds.includes(fish.id)) {
        const original = fishes.find((f) => f.id === fish.id);
        if (original && (original.name !== fish.name || original.species !== fish.species || original.avatar !== fish.avatar || original.status !== fish.status)) {
          updateFish(fish.id, {
            name: fish.name,
            species: fish.species,
            avatar: fish.avatar,
            status: fish.status,
          });
        }
      } else {
        addFish({
          name: fish.name,
          species: fish.species,
          avatar: fish.avatar,
          addedDate: fish.addedDate,
          status: fish.status,
        });
      }
    });

    existingFishIds.forEach((id) => {
      if (!editedFishIds.includes(id)) {
        removeFish(id);
      }
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddNewFish = () => {
    if (!newFish.name.trim() || !newFish.species.trim()) return;
    setEditFishes([
      ...editFishes,
      { ...newFish, id: `temp-${Date.now()}` },
    ]);
    setNewFish({
      name: '',
      species: '',
      avatar: '🐟',
      addedDate: new Date().toISOString().split('T')[0],
      status: 'healthy',
    });
  };

  const handleRemoveEditFish = (id: string) => {
    setEditFishes(editFishes.filter((f) => f.id !== id));
  };

  const handleUpdateEditFish = (id: string, data: Partial<Fish>) => {
    setEditFishes(editFishes.map((f) => (f.id === id ? { ...f, ...data } : f)));
  };

  if (isEditing) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-sky-200">
        <div className="relative h-48 overflow-hidden">
          <img
            src={editData.photo}
            alt={editData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sky-900/80 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full bg-white/20 backdrop-blur-sm text-white text-2xl font-bold px-3 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">容量 (L)</label>
              <input
                type="number"
                value={editData.capacity}
                onChange={(e) => setEditData({ ...editData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">最低水温 (°C)</label>
              <input
                type="number"
                step="0.5"
                value={editData.minTemp}
                onChange={(e) => setEditData({ ...editData, minTemp: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">最高水温 (°C)</label>
              <input
                type="number"
                step="0.5"
                value={editData.maxTemp}
                onChange={(e) => setEditData({ ...editData, maxTemp: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">换水间隔 (天)</label>
              <input
                type="number"
                value={editData.waterChangeInterval}
                onChange={(e) => setEditData({ ...editData, waterChangeInterval: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">过滤类型</label>
            <input
              type="text"
              value={editData.filterType}
              onChange={(e) => setEditData({ ...editData, filterType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">负责人</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={editData.owner}
                  onChange={(e) => setEditData({ ...editData, owner: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">设备照片 URL</label>
              <input
                type="text"
                value={editData.photo}
                onChange={(e) => setEditData({ ...editData, photo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="图片链接"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">🐟 编辑鱼只清单</h4>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {editFishes.map((fish) => (
                <div
                  key={fish.id}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <select
                    value={fish.avatar}
                    onChange={(e) => handleUpdateEditFish(fish.id, { avatar: e.target.value })}
                    className="text-2xl bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    {avatarOptions.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={fish.name}
                    onChange={(e) => handleUpdateEditFish(fish.id, { name: e.target.value })}
                    placeholder="名字"
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="text"
                    value={fish.species}
                    onChange={(e) => handleUpdateEditFish(fish.id, { species: e.target.value })}
                    placeholder="品种"
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <select
                    value={fish.status}
                    onChange={(e) => handleUpdateEditFish(fish.id, { status: e.target.value as Fish['status'] })}
                    className="px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="healthy">健康</option>
                    <option value="sick">生病</option>
                    <option value="quarantine">隔离</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveEditFish(fish.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-lg border border-sky-100">
              <select
                value={newFish.avatar}
                onChange={(e) => setNewFish({ ...newFish, avatar: e.target.value })}
                className="text-2xl bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {avatarOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newFish.name}
                onChange={(e) => setNewFish({ ...newFish, name: e.target.value })}
                placeholder="新鱼名字"
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
              <input
                type="text"
                value={newFish.species}
                onChange={(e) => setNewFish({ ...newFish, species: e.target.value })}
                placeholder="品种"
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
              <button
                type="button"
                onClick={handleAddNewFish}
                className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white rounded text-sm font-medium hover:bg-sky-700 transition-colors"
              >
                <Plus size={14} />
                添加
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-full text-sm font-medium hover:bg-sky-700 transition-colors shadow-md"
            >
              <Check size={16} />
              保存修改
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-sky-100 hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={tank.photo}
          alt={tank.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-900/70 to-transparent" />
        <button
          onClick={handleStartEdit}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sky-700 rounded-full text-sm font-medium hover:bg-white transition-colors shadow-md"
        >
          <Edit3 size={14} />
          编辑
        </button>
        <div className="absolute bottom-4 left-6 right-6">
          <h2 className="text-2xl font-bold text-white mb-1">{tank.name}</h2>
          <p className="text-sky-100 text-sm flex items-center gap-1">
            <User size={14} />
            <span>负责人：{tank.owner}</span>
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-sky-50 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <Droplets className="text-sky-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-sky-900">{tank.capacity}<span className="text-sm font-normal text-sky-600">L</span></div>
            <div className="text-xs text-sky-500 mt-1">容量</div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <Filter className="text-emerald-600" size={24} />
            </div>
            <div className="text-sm font-medium text-emerald-900 line-clamp-2">{tank.filterType}</div>
            <div className="text-xs text-emerald-500 mt-1">过滤系统</div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <Thermometer className="text-amber-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {tank.minTemp}-{tank.maxTemp}<span className="text-sm font-normal">°C</span>
            </div>
            <div className="text-xs text-amber-500 mt-1">水温范围</div>
          </div>

          <div className="bg-rose-50 rounded-xl p-4 text-center">
            <div className="text-3xl mb-1">🐠</div>
            <div className="text-2xl font-bold text-rose-900">{fishes.length}<span className="text-sm font-normal">条</span></div>
            <div className="text-xs text-rose-500 mt-1">鱼只数量</div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🐟</span>
            <span>鱼只清单</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {fishes.map((fish) => (
              <div
                key={fish.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">{fish.avatar}</span>
                <div>
                  <div className="text-sm font-medium text-gray-800">{fish.name}</div>
                  <div className="text-xs text-gray-500">{fish.species}</div>
                </div>
                <span className={cn(
                  'ml-2 px-2 py-0.5 text-xs rounded-full border',
                  statusConfig[fish.status].color
                )}>
                  {statusConfig[fish.status].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
