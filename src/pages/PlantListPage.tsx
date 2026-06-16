import { useState } from 'react';
import { Search, Filter, Leaf } from 'lucide-react';
import { usePlantStore } from '../store/plantStore';
import PlantCard from '../components/plant/PlantCard';

export default function PlantListPage() {
  const plants = usePlantStore((s) => s.plants);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'alive' | 'recovery' | 'dead'>('all');
  const isPlantInRecovery = usePlantStore((s) => s.isPlantInRecovery);

  const filteredPlants = plants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.species?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.position.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filterStatus === 'alive') matchesFilter = p.isAlive && !isPlantInRecovery(p.id);
    if (filterStatus === 'recovery') matchesFilter = isPlantInRecovery(p.id);
    if (filterStatus === 'dead') matchesFilter = !p.isAlive;

    return matchesSearch && matchesFilter;
  });

  const aliveCount = plants.filter((p) => p.isAlive && !isPlantInRecovery(p.id)).length;
  const recoveryCount = plants.filter((p) => isPlantInRecovery(p.id)).length;
  const deadCount = plants.filter((p) => !p.isAlive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-forest-800">
            我的盆栽
          </h2>
          <p className="text-forest-500 mt-1 text-sm">
            共 {plants.length} 盆 · 健康 {aliveCount} · 缓苗 {recoveryCount} · 已枯萎 {deadCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
          <input
            type="text"
            placeholder="搜索植物名称、品种、位置..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-cream-200 shadow-soft">
          <Filter className="w-4 h-4 text-forest-400 ml-3" />
          {[
            { key: 'all', label: '全部' },
            { key: 'alive', label: '健康' },
            { key: 'recovery', label: '缓苗' },
            { key: 'dead', label: '已枯萎' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key as typeof filterStatus)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === f.key
                  ? 'bg-forest-600 text-white'
                  : 'text-forest-600 hover:bg-forest-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredPlants.length === 0 ? (
        <div className="card p-12 text-center">
          <Leaf className="w-16 h-16 text-forest-200 mx-auto mb-4" />
          <p className="text-forest-500">没有找到符合条件的植物</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlants.map((plant, idx) => (
            <div key={plant.id} style={{ animationDelay: `${idx * 50}ms` }}>
              <PlantCard plant={plant} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
