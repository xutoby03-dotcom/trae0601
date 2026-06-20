import { useLightingStore } from '@/store/useLightingStore';
import {
  FilePlus2,
  Save,
  Copy,
  History,
  Download,
  Tag,
  Calendar,
  Building2,
  Sparkles,
  Camera,
} from 'lucide-react';
import { useState } from 'react';

export default function TopBar() {
  const setup = useLightingStore((s) => s.currentSetup);
  const saveToast = useLightingStore((s) => s.saveToast);
  const updateSetupMeta = useLightingStore((s) => s.updateSetupMeta);
  const saveSetup = useLightingStore((s) => s.saveSetup);
  const createNewSetup = useLightingStore((s) => s.createNewSetup);
  const toggleHistoryPanel = useLightingStore((s) => s.toggleHistoryPanel);
  const showHistoryPanel = useLightingStore((s) => s.showHistoryPanel);
  const historySetups = useLightingStore((s) => s.historySetups);
  const duplicateSetup = useLightingStore((s) => s.duplicateSetup);
  const [tagInput, setTagInput] = useState('');

  if (!setup) return null;

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (setup.tags.includes(t)) {
      setTagInput('');
      return;
    }
    updateSetupMeta({ tags: [...setup.tags, t] });
    setTagInput('');
  };

  const removeTag = (t: string) =>
    updateSetupMeta({ tags: setup.tags.filter((x) => x !== t) });

  const duplicateLatest = () => {
    if (historySetups.length === 0) return;
    duplicateSetup(historySetups[0].id);
  };

  return (
    <header className="shrink-0 h-16 bg-studio-900/80 backdrop-blur-md border-b border-studio-800 flex items-center px-5 gap-6 relative z-40">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-glow via-amber-warm to-amber-dim flex items-center justify-center shadow-amber-glow-sm">
          <Camera className="w-4.5 h-4.5 text-studio-950" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-studio-100 tracking-tight leading-none font-display">
            LumenGrid
          </h1>
          <p className="text-[10px] text-studio-500 mt-0.5 tracking-wide">
            布光复盘系统 · Studio Light Planner
          </p>
        </div>
      </div>

      <div className="w-px h-8 bg-studio-800 shrink-0" />

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <input
          value={setup.name}
          onChange={(e) => updateSetupMeta({ name: e.target.value })}
          className="bg-transparent outline-none text-lg font-semibold text-studio-100
                     placeholder-studio-600 border-b border-transparent focus:border-amber-glow/60
                     transition-colors pb-0.5 w-full font-display"
          placeholder="未命名布光方案"
        />
        <div className="flex items-center gap-4 mt-1 flex-wrap">
          <div className="flex items-center gap-1.5 group">
            <Building2 className="w-3 h-3 text-studio-500" />
            <input
              value={setup.client}
              onChange={(e) => updateSetupMeta({ client: e.target.value })}
              className="bg-transparent outline-none text-[11px] text-studio-400
                         placeholder-studio-600 border-b border-transparent focus:border-studio-600
                         transition-colors w-40"
              placeholder="客户名称"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-studio-500" />
            <input
              type="date"
              value={setup.shootDate}
              onChange={(e) => updateSetupMeta({ shootDate: e.target.value })}
              className="bg-transparent outline-none text-[11px] text-studio-400
                         border-b border-transparent focus:border-studio-600 font-mono"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="w-3 h-3 text-studio-500 shrink-0" />
            {setup.tags.map((t) => (
              <span
                key={t}
                className="chip border-amber-glow/40 bg-amber-glow/10 text-amber-glow group"
              >
                {t}
                <button
                  onClick={() => removeTag(t)}
                  className="opacity-0 group-hover:opacity-100 hover:text-alert-danger ml-0.5 transition-opacity"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              onBlur={addTag}
              placeholder="+ 标签"
              className="bg-transparent outline-none text-[11px] text-studio-400
                         placeholder-studio-600 w-14"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={createNewSetup}
          className="studio-btn-ghost !px-3 !py-1.5"
          title="新建方案"
        >
          <FilePlus2 className="w-3.5 h-3.5" />
          新建
        </button>
        <button
          onClick={duplicateLatest}
          disabled={historySetups.length === 0}
          className="studio-btn-ghost !px-3 !py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          title="复制上一套布光"
        >
          <Copy className="w-3.5 h-3.5" />
          复制上一套
        </button>
        <button
          onClick={toggleHistoryPanel}
          className={`studio-btn !px-3 !py-1.5 !border
                     ${
                       showHistoryPanel
                         ? 'bg-amber-glow/15 text-amber-glow border-amber-glow/40'
                         : 'studio-btn-ghost'
                     }`}
          title="历史方案库"
        >
          <History className="w-3.5 h-3.5" />
          历史库
          <span className="chip !border-0 bg-studio-800/60 text-studio-400 !py-0">
            {historySetups.length}
          </span>
        </button>

        <div className="w-px h-6 bg-studio-800 mx-0.5" />

        <button
          className="studio-btn-ghost !px-3 !py-1.5"
          title="导出为PDF/JSON"
        >
          <Download className="w-3.5 h-3.5" />
          导出
        </button>
        <button
          onClick={saveSetup}
          className="studio-btn-primary !px-4 !py-1.5"
          title="保存方案 (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5" />
          保存方案
        </button>
      </div>

      {saveToast && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-4 py-2 rounded-lg bg-amber-glow text-studio-950 font-semibold text-sm shadow-amber-glow flex items-center gap-2 animate-slide-down z-50">
          <Sparkles className="w-4 h-4" />
          {saveToast}
        </div>
      )}
    </header>
  );
}
