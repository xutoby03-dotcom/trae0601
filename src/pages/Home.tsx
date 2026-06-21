import { useState, useMemo } from 'react';
import { Mic, FolderKanban, UserCheck, Users } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { StageGrid } from '@/components/stage/StageGrid';
import { MemberPanel } from '@/components/members/MemberPanel';
import { MemberFormModal } from '@/components/members/MemberFormModal';
import { AuditionPanel } from '@/components/audition/AuditionPanel';
import { SchemeManager } from '@/components/scheme/SchemeManager';
import { SubstituteFinder } from '@/components/substitute/SubstituteFinder';
import { useStageStore } from '@/stores/stageStore';
import type { Member } from '@/types';

type RightTab = 'audition' | 'scheme' | 'substitute';

export default function Home() {
  const scheme = useStageStore((s) => s.scheme);
  const [activeTab, setActiveTab] = useState<RightTab>('audition');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const placedMemberIds = useMemo(() => {
    const set = new Set<string>();
    scheme.positions.forEach(p => {
      if (p.memberId) set.add(p.memberId);
    });
    return set;
  }, [scheme.positions]);

  const placedCount = placedMemberIds.size;

  const handleAddMember = () => {
    setEditingMember(null);
    setFormModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setFormModalOpen(true);
  };

  const tabs: Array<{ key: RightTab; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { key: 'audition', label: '试听打分', icon: <Mic className="h-3.5 w-3.5" /> },
    { key: 'scheme', label: '方案管理', icon: <FolderKanban className="h-3.5 w-3.5" /> },
    { key: 'substitute', label: '替补推荐', icon: <UserCheck className="h-3.5 w-3.5" />, badge: placedCount > 0 ? undefined : undefined },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <TopNav />

      <div className="grid flex-1 min-h-0 grid-cols-12 gap-0">
        <aside className="col-span-12 flex flex-col border-r border-white/5 bg-black/20 p-3 min-h-0 sm:col-span-4 lg:col-span-3 xl:col-span-3">
          <MemberPanel
            onAddMember={handleAddMember}
            onEditMember={handleEditMember}
            placedMemberIds={placedMemberIds}
          />
        </aside>

        <main className="col-span-12 flex min-h-0 flex-col gap-3 p-3 sm:col-span-8 lg:col-span-6 xl:col-span-6">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
                <Users className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-medium text-white/80">
                  已登台 <span className="font-bold text-amber-300">{placedCount}</span> 人
                </span>
              </div>
              <div className="hidden items-center gap-1 rounded-full bg-white/5 px-3 py-1 md:flex">
                <span className="text-xs text-white/50">
                  舞台 <span className="font-bold text-white/80">{scheme.gridRows}×{scheme.gridCols}</span>
                </span>
              </div>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-[10px] text-white/30">
                当前评分：<span className="font-bold text-amber-300">{scheme.overallScore || '—'}</span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <StageGrid />
          </div>
        </main>

        <aside className="col-span-12 flex min-h-0 flex-col border-l border-white/5 bg-black/20 sm:col-span-12 lg:col-span-3 xl:col-span-3">
          <div className="flex border-b border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-1 items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition ${
                  activeTab === tab.key
                    ? 'text-amber-300'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
                }`}
              >
                {tab.icon}
                <span className="hidden xl:inline">{tab.label}</span>
                {tab.badge && (
                  <span className="ml-0.5 rounded-full bg-rose-500/20 px-1.5 py-px text-[9px] font-bold text-rose-300">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden p-3 min-h-0">
            {activeTab === 'audition' && <AuditionPanel />}
            {activeTab === 'scheme' && <SchemeManager />}
            {activeTab === 'substitute' && <SubstituteFinder />}
          </div>
        </aside>
      </div>

      <MemberFormModal
        open={formModalOpen}
        editingMember={editingMember}
        onClose={() => {
          setFormModalOpen(false);
          setEditingMember(null);
        }}
      />
    </div>
  );
}
