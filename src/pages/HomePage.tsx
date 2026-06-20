import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFilteredPerfumes } from '@/store/usePerfumeStore';
import { PerfumeCard } from '@/components/PerfumeCard';
import { SceneFilter } from '@/components/SceneTags';
import type { SceneType } from '@/types';

export function HomePage() {
  const [sceneFilter, setSceneFilter] = useState<SceneType | 'all'>('all');
  const perfumes = useFilteredPerfumes(sceneFilter);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-800 sm:text-3xl">
              我的香水实验室
            </h2>
            <p className="mt-1 text-stone-500">
              共 {perfumes.length} 支香水记录
            </p>
          </div>
          
          <Link
            to="/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-rose-600 px-6 py-3 font-medium text-white shadow-lg shadow-amber-200 transition-all hover:shadow-xl hover:shadow-amber-300 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            <span>新增记录</span>
          </Link>
        </div>
        
        <div className="mb-8 overflow-x-auto pb-2">
          <SceneFilter current={sceneFilter} onChange={setSceneFilter} />
        </div>
        
        {perfumes.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-stone-100">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
              <span className="text-3xl">🌸</span>
            </div>
            <h3 className="mb-2 font-serif text-xl font-bold text-stone-800">
              还没有记录
            </h3>
            <p className="mb-6 text-stone-500">
              开始记录你的第一支香水留香实验吧
            </p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 rounded-full bg-stone-800 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
            >
              <Plus className="h-4 w-4" />
              <span>创建第一条记录</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {perfumes.map((perfume, index) => (
              <PerfumeCard key={perfume.id} perfume={perfume} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
