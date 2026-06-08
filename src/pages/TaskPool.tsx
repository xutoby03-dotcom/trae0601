import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import type { Scene, EnergyLevel } from '@/types';
import { SCENE_LABELS, ENERGY_LABELS, SCENE_COLORS, ENERGY_COLORS } from '@/types';
import { useTaskStore } from '@/stores/taskStore';
import { useFilterStore } from '@/stores/filterStore';
import { cn } from '@/lib/utils';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';

export default function TaskPool() {
  const { tasks, deleteTask, getFilteredTasks } = useTaskStore();
  const { filter, setFilter, clearFilter } = useFilterStore();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const filtered = getFilteredTasks(filter).filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const sceneOptions: Scene[] = ['indoor', 'outdoor', 'both'];
  const energyOptions: EnergyLevel[] = ['low', 'medium', 'high'];

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 pb-24 pt-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            任务池 <span className="text-lg font-normal text-gray-400">({filtered.length})</span>
          </h1>
          <button onClick={clearFilter} className="text-sm text-gray-400 hover:text-[#FF6B35]">
            清除筛选
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索任务..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Filter size={16} />
            <span className="text-xs">筛选</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {sceneOptions.map((s) => (
            <button
              key={s}
              onClick={() => setFilter({ scene: filter.scene === s ? undefined : s })}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter.scene === s
                  ? SCENE_COLORS[s].replace('bg-', 'bg-').replace('text-', 'text-') + ' ring-2 ring-[#FF6B35]'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {SCENE_LABELS[s]}
            </button>
          ))}
          <span className="mx-1 border-l border-gray-200" />
          {energyOptions.map((e) => (
            <button
              key={e}
              onClick={() => setFilter({ energyLevel: filter.energyLevel === e ? undefined : e })}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter.energyLevel === e
                  ? ENERGY_COLORS[e] + ' ring-2 ring-[#FF6B35]'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {ENERGY_LABELS[e]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <TaskCard task={task} onDelete={deleteTask} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-gray-400">暂无匹配的任务</div>
        )}
      </div>

      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-lg shadow-orange-300/50 hover:bg-[#e55e2e] transition-colors"
      >
        <Plus size={24} />
      </button>

      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
