import { useEffect } from 'react';
import { Leaf } from 'lucide-react';
import StatsPanel from '@/components/StatsPanel';
import SpecimenForm from '@/components/SpecimenForm';
import SpecimenList from '@/components/SpecimenList';
import ExportPanel from '@/components/ExportPanel';
import { useSpecimenStore } from '@/store/useSpecimenStore';

export default function Home() {
  const refreshDryness = useSpecimenStore((s) => s.refreshDryness);

  useEffect(() => {
    refreshDryness();
    const interval = setInterval(refreshDryness, 60000);
    return () => clearInterval(interval);
  }, [refreshDryness]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-paper-100/80 backdrop-blur-lg border-b border-forest-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-forest-500 p-2.5 rounded-xl shadow-md">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest-700">
                植物标本压制管理系统
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                自然社团 · 标本制作数字化跟踪
              </p>
            </div>
          </div>
          <ExportPanel />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <section>
          <StatsPanel />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-4 xl:col-span-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-thin">
            <SpecimenForm />
          </section>

          <section className="lg:col-span-8 xl:col-span-7">
            <SpecimenList />
          </section>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-xs text-gray-400">
          🌿 用心压制每一份标本，留住大自然的美好瞬间
        </p>
      </footer>
    </div>
  );
}
