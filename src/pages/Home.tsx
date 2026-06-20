import { useEffect, useRef } from 'react';
import { Headphones, Music } from 'lucide-react';
import { FilterBar } from '@/components/FilterBar';
import { FavoritesList } from '@/components/FavoritesList';
import { TakeCard } from '@/components/TakeCard';
import { ComparisonBar } from '@/components/ComparisonBar';
import { AnnotationPanel } from '@/components/AnnotationPanel';
import { ExportModal } from '@/components/ExportModal';
import { useStore } from '@/store/useStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function Home() {
  const getFilteredTakes = useStore((s) => s.getFilteredTakes);
  const selectedTakeId = useStore((s) => s.selectedTakeId);
  const filteredTakes = getFilteredTakes();
  const gridRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-studio-bg text-studio-text">
      <header className="bg-studio-panel border-b border-studio-border">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-amber to-accent-purple flex items-center justify-center">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-studio-text flex items-center gap-2">
                  Studio Compare
                  <span className="text-xs font-normal px-2 py-0.5 rounded bg-accent-amber/20 text-accent-amber">
                    v1.0
                  </span>
                </h1>
                <p className="text-sm text-studio-textDim">人声试音对比工具 · 精准选择设备链路</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-studio-textDim">
              <div className="flex items-center gap-1.5">
                <Music className="w-4 h-4 text-accent-amber" />
                <span>{filteredTakes.length} 条试音</span>
              </div>
              <div className="h-4 w-px bg-studio-border" />
              <div>
                <kbd className="px-1.5 py-0.5 bg-studio-card border border-studio-border rounded text-xs font-mono">空格</kbd>
                <span className="ml-1">快速切换 A/B</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <FilterBar />
      <FavoritesList />

      <main className="container px-4 py-6 pb-44">
        {filteredTakes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-studio-card border border-studio-border flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-studio-textDim" />
            </div>
            <h3 className="font-display font-semibold text-lg text-studio-text mb-2">没有找到匹配的试音</h3>
            <p className="text-studio-textDim text-sm max-w-md">
              尝试调整筛选条件，或重置筛选器查看所有试音。
            </p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredTakes.map((take, index) => (
              <TakeCard key={take.id} take={take} index={index} />
            ))}
          </div>
        )}
      </main>

      <ComparisonBar />
      {selectedTakeId && <AnnotationPanel />}
      <ExportModal />
    </div>
  );
}
