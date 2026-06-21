import { Music2, FilePlus, Save, LayoutGrid, HelpCircle } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';
import { useStageStore } from '@/stores/stageStore';
import { useSchemeStore } from '@/stores/schemeStore';
import { useAuditionStore } from '@/stores/auditionStore';
import { useState } from 'react';

export function TopNav() {
  const scheme = useStageStore((s) => s.scheme);
  const updateSchemeName = useStageStore((s) => s.updateSchemeName);
  const saveCurrentScheme = useSchemeStore((s) => s.saveCurrentScheme);
  const resetDraft = useAuditionStore((s) => s.resetDraft);
  const clearStage = useStageStore((s) => s.clearStage);
  const applySchemeScore = useStageStore((s) => s.applySchemeScore);

  const [showHelp, setShowHelp] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(scheme.name);

  const handleQuickSave = () => {
    const saved = saveCurrentScheme(scheme);
    updateSchemeName(saved.name);
    applySchemeScore(saved.overallScore);
  };

  const handleNewScheme = () => {
    if (!confirm('确定创建新方案？当前站位将会被清空。')) return;
    clearStage();
    updateSchemeName('新站位方案');
    resetDraft();
  };

  return (
    <>
      <header className="relative z-20 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-[#12101c]/90 via-[#1a1525]/90 to-[#12101c]/90 backdrop-blur-md px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/30 via-wine-500/30 to-transparent shadow-lg">
            <Music2 className="h-5 w-5 text-amber-400 drop-shadow" />
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-amber-400/20 to-rose-500/20 blur-sm opacity-60" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold tracking-wide text-white text-shadow-gold sm:text-xl">
              {APP_NAME}
            </h1>
            <p className="hidden text-[10px] tracking-wider text-white/40 sm:block">
              ✦ {APP_TAGLINE} ✦
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden min-w-0 md:block">
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={() => {
                  if (nameValue.trim()) updateSchemeName(nameValue.trim());
                  setEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (nameValue.trim()) updateSchemeName(nameValue.trim());
                    setEditingName(false);
                  }
                  if (e.key === 'Escape') setEditingName(false);
                }}
                autoFocus
                className="w-64 rounded-lg border border-amber-500/50 bg-white/5 px-3 py-1 text-center text-sm font-medium text-white outline-none focus:bg-white/10"
              />
            </div>
          ) : (
            <button
              onClick={() => {
                setNameValue(scheme.name);
                setEditingName(true);
              }}
              className="group flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1 transition hover:border-white/10 hover:bg-white/5"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-white/40" />
              <span className="max-w-xs truncate text-sm font-medium text-white/90 group-hover:text-white">
                {scheme.name}
              </span>
              <span className="text-[10px] text-amber-400/60 opacity-0 transition group-hover:opacity-100">
                点击编辑
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewScheme}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <FilePlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">新方案</span>
          </button>
          <button
            onClick={handleQuickSave}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-3.5 py-1.5 text-xs font-bold text-[#1a1a2e] shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-yellow-400 hover:shadow-lg hover:shadow-amber-500/30"
          >
            <Save className="h-3.5 w-3.5" />
            <span>保存方案</span>
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </header>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1a2e] to-[#12101c] p-6 shadow-2xl">
            <h3 className="mb-4 font-display text-xl font-bold text-amber-400">🎼 使用指南</h3>
            <div className="space-y-3 text-xs text-white/70 leading-relaxed">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="mb-1 font-semibold text-white">1. 摆放成员</p>
                <p>从左侧面板拖拽成员卡片到舞台网格；在网格内也可以拖拽调整位置。</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="mb-1 font-semibold text-white">2. 调整舞台</p>
                <p>使用舞台上方的排数/列数调节器，根据合唱团规模调整网格大小。</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="mb-1 font-semibold text-white">3. 试听打分</p>
                <p>在右侧「试听打分」Tab，让合唱团演唱后拖动滑块给三个维度评分。系统自带声学预测可作为参考。</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="mb-1 font-semibold text-white">4. 方案比较</p>
                <p>保存多套站位方案后，在「方案管理」中勾选 2 个以上方案开启对比分析，找出最优解。</p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
                <p className="mb-1 font-semibold text-emerald-300">5. 应急替补</p>
                <p>演出前有人缺席？在「替补推荐」中选择缺席成员，系统自动找出影响最小的替补方案。</p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-sm font-bold text-[#1a1a2e] transition hover:from-amber-400 hover:to-yellow-400"
            >
              开始使用 ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
}
