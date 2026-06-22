import { useState } from 'react';
import { Waves, Plus, Menu, X } from 'lucide-react';
import { useSamplingStore } from '@/stores/useSamplingStore';
import { useNow } from '@/hooks/useCountdown';
import { SamplingSite } from '@/types';
import SiteCard from '@/components/SiteCard';
import SiteForm from '@/components/SiteForm';
import TideTimeline from '@/components/TideTimeline';
import SampleRecordPanel from '@/components/SampleRecordPanel';
import { cn } from '@/lib/utils';

export default function TidalSamplingPage() {
  const { sites, selectedSiteId } = useSamplingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState<SamplingSite | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  useNow(20000);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  const sortedSites = [...sites].sort(
    (a, b) => new Date(a.lowTideTime).getTime() - new Date(b.lowTideTime).getTime()
  );

  const handleEdit = (site: SamplingSite) => {
    setEditingSite(site);
    setShowForm(true);
    setShowMobileSidebar(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSite(null);
  };

  const handleAddClick = () => {
    setEditingSite(null);
    setShowForm(true);
    setShowMobileSidebar(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              >
                {showMobileSidebar ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-500/20">
                  <Waves size={22} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 font-display">
                    潮汐采样安排
                  </h1>
                  <p className="text-xs text-slate-500">精准把握低潮窗口</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddClick}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium',
                'bg-gradient-to-r from-cyan-600 to-sky-600 text-white',
                'shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30',
                'transition-all hover:-translate-y-0.5 active:translate-y-0'
              )}
            >
              <Plus size={16} />
              新增点位
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside
            className={cn(
              'w-80 flex-shrink-0 space-y-4',
              'fixed lg:static inset-y-0 left-0 z-40 bg-white lg:bg-transparent',
              'pt-20 lg:pt-0 p-4 lg:p-0',
              'transform transition-transform duration-300',
              'lg:transform-none',
              showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
              'shadow-xl lg:shadow-none'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                采样点位
              </h2>
              <span className="text-xs text-slate-400">{sites.length} 个点位</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] lg:max-h-[calc(100vh-160px)] pr-1">
              {sortedSites.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Waves size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无采样点位</p>
                  <p className="text-xs mt-1">点击右上角新增点位</p>
                </div>
              ) : (
                sortedSites.map((site) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    isSelected={site.id === selectedSiteId}
                    onEdit={handleEdit}
                  />
                ))
              )}
            </div>
          </aside>

          {showMobileSidebar && (
            <div
              className="fixed inset-0 bg-black/30 z-30 lg:hidden"
              onClick={() => setShowMobileSidebar(false)}
            />
          )}

          <main className="flex-1 min-w-0 space-y-6">
            {selectedSite ? (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 font-display">
                        {selectedSite.name}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        目标贝种：{selectedSite.targetSpecies}
                      </p>
                    </div>
                  </div>

                  {selectedSite.notes && (
                    <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">备注：</span>
                        {selectedSite.notes}
                      </p>
                    </div>
                  )}

                  <TideTimeline site={selectedSite} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <SampleRecordPanel siteId={selectedSite.id} />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-100 to-sky-100 flex items-center justify-center">
                  <Waves size={36} className="text-cyan-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 font-display mb-2">
                  选择一个点位开始
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  从左侧列表选择采样点位，查看潮汐时间轴和采样记录
                </p>
                <button
                  onClick={handleAddClick}
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium',
                    'bg-gradient-to-r from-cyan-600 to-sky-600 text-white',
                    'shadow-lg shadow-cyan-500/25 hover:shadow-xl',
                    'transition-all hover:-translate-y-0.5'
                  )}
                >
                  <Plus size={16} />
                  添加第一个点位
                </button>
              </div>
            )}
          </main>

          {showForm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={handleCloseForm}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              >
                <SiteForm editingSite={editingSite} onClose={handleCloseForm} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
