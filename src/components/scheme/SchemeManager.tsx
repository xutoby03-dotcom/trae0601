import { useState } from 'react';
import { Save, Trash2, GitCompare, Copy, FileText, Calendar, Star, XCircle, CheckCircle2, Eye } from 'lucide-react';
import { useSchemeStore } from '@/stores/schemeStore';
import { useStageStore } from '@/stores/stageStore';
import type { Scheme, StagePosition } from '@/types';
import { formatDate } from '@/utils/helpers';
import { VOICE_PART_CONFIG } from '@/utils/constants';
import { useMembersStore } from '@/stores/membersStore';

function MiniStagePreview({ scheme }: { scheme: Scheme }) {
  const getMember = useMembersStore((s) => s.getMember);
  return (
    <div
      className="grid gap-0.5 rounded-md bg-black/30 p-1"
      style={{
        gridTemplateColumns: `repeat(${scheme.gridCols}, 1fr)`,
      }}
    >
      {Array.from({ length: scheme.gridRows }, (_, r) =>
        Array.from({ length: scheme.gridCols }, (_, c) => {
          const pos = scheme.positions.find((p) => p.row === r && p.col === c);
          const m = pos?.memberId ? getMember(pos.memberId) : null;
          const cfg = m ? VOICE_PART_CONFIG[m.voicePart] : null;
          return (
            <div
              key={`${r}-${c}`}
              className="aspect-square rounded-sm text-[6px] flex items-center justify-center font-bold"
              style={{
                backgroundColor: cfg ? cfg.color : 'rgba(255,255,255,0.04)',
                color: cfg ? '#fff' : 'transparent',
              }}
              title={m?.name}
            >
              {cfg?.shortLabel}
            </div>
          );
        })
      )}
    </div>
  );
}

interface SchemeCardProps {
  scheme: Scheme;
  selected: boolean;
  onSelect: () => void;
  onLoad: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SchemeCard({ scheme, selected, onSelect, onLoad, onDelete, onDuplicate }: SchemeCardProps) {
  const score = scheme.overallScore || 0;
  const scoreColor =
    score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : score >= 55 ? 'text-orange-400' : 'text-rose-400';

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-xl border transition-all hover:-translate-y-0.5 ${
        selected
          ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10'
          : 'border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
      }`}
    >
      {selected && (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[#1a1a2e]">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      )}
      <div className="p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold text-white">{scheme.name}</h4>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-white/40">
              <Calendar className="h-2.5 w-2.5" />
              {formatDate(scheme.updatedAt)}
            </div>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${scoreColor}`}>{score}</div>
        </div>

        {scheme.notes && (
          <p className="mb-2 line-clamp-1 text-[10px] text-white/40">📝 {scheme.notes}</p>
        )}

        <MiniStagePreview scheme={scheme} />

        <div className="mt-2 flex items-center justify-between gap-1 text-[10px] text-white/40">
          <span>{scheme.gridRows}×{scheme.gridCols} | {scheme.positions.filter(p => p.memberId).length}人</span>
          <div className="flex items-center gap-0.5">
            {score >= 70 && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
          </div>
        </div>
      </div>

      <div className="flex border-t border-white/5">
        <button
          onClick={(e) => { e.stopPropagation(); onLoad(); }}
          className="flex flex-1 items-center justify-center gap-1 py-2 text-[10px] font-medium text-white/60 transition hover:bg-white/10 hover:text-amber-300"
        >
          <Eye className="h-3 w-3" />
          载入
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="flex flex-1 items-center justify-center gap-1 border-l border-white/5 py-2 text-[10px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <Copy className="h-3 w-3" />
          复制
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex flex-1 items-center justify-center gap-1 border-l border-white/5 py-2 text-[10px] font-medium text-white/60 transition hover:bg-rose-500/10 hover:text-rose-300"
        >
          <Trash2 className="h-3 w-3" />
          删除
        </button>
      </div>
    </div>
  );
}

interface CompareViewProps {
  schemes: Scheme[];
  onClose: () => void;
  onLoad: (scheme: Scheme) => void;
}

function CompareView({ schemes, onClose, onLoad }: CompareViewProps) {
  const dimensions = [
    { key: 'gridRows', label: '舞台排数', fmt: (s: Scheme) => `${s.gridRows}排` },
    { key: 'gridCols', label: '舞台列数', fmt: (s: Scheme) => `${s.gridCols}列` },
    { key: 'members', label: '参演人数', fmt: (s: Scheme) => `${s.positions.filter(p => p.memberId).length}人` },
    { key: 'score', label: '综合评分', fmt: (s: Scheme) => `${s.overallScore || 0}分` },
  ];

  if (schemes.length < 2) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-auto rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1a2e] to-[#12101c] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#1e1a2e]/95 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">多方案对比分析</h3>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
              {schemes.length} 个方案
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${schemes.length}, minmax(0, 1fr))` }}>
            {schemes.map((s) => {
              const score = s.overallScore || 0;
              const scoreColor = score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400';
              return (
                <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{s.name}</h4>
                      <p className="text-[10px] text-white/40">{formatDate(s.updatedAt)}</p>
                    </div>
                    <div className={`text-3xl font-bold tabular-nums ${scoreColor}`}>{score}</div>
                  </div>
                  <MiniStagePreview scheme={s} />
                  <button
                    onClick={() => onLoad(s)}
                    className="mt-2 w-full rounded-lg bg-amber-500/20 py-1.5 text-[11px] font-medium text-amber-300 transition hover:bg-amber-500/30"
                  >
                    载入此方案
                  </button>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="border-b border-white/5 px-4 py-2 text-xs font-semibold text-white/70">📊 维度对比</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-white/[0.02] text-white/40">
                  <th className="px-4 py-2 text-left font-medium">对比项</th>
                  {schemes.map((s) => (
                    <th key={s.id} className="px-4 py-2 text-center font-medium">
                      <div className="truncate max-w-[140px]">{s.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dimensions.map((d) => (
                  <tr key={d.key} className="border-t border-white/5">
                    <td className="px-4 py-2 text-white/60">{d.label}</td>
                    {schemes.map((s) => (
                      <td key={s.id} className="px-4 py-2 text-center font-medium text-white/80">
                        {d.fmt(s)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-white/10 bg-amber-500/5">
                  <td className="px-4 py-2 font-semibold text-amber-300">🏆 推荐方案</td>
                  {(() => {
                    const max = Math.max(...schemes.map(s => s.overallScore || 0));
                    return schemes.map((s) => (
                      <td key={s.id} className="px-4 py-2 text-center">
                        {(s.overallScore || 0) === max ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            <Star className="h-2.5 w-2.5 fill-emerald-300" /> 最优
                          </span>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                    ));
                  })()}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Star className="h-3.5 w-3.5" />
              分析建议
            </h4>
            <ul className="space-y-1.5 text-[11px] leading-relaxed text-white/70">
              {(() => {
                const sorted = [...schemes].sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
                const best = sorted[0];
                const tips: string[] = [];
                tips.push(`综合评分最高的方案为「${best.name}」（${best.overallScore || 0}分），建议作为优先考虑。`);
                if (best.notes) {
                  tips.push(`方案备注：${best.notes}`);
                }
                if (schemes.length >= 2) {
                  const diff = (best.overallScore || 0) - (sorted[1].overallScore || 0);
                  tips.push(`领先第二名「${sorted[1].name}」约 ${diff} 分${diff < 5 ? '，差距较小，可再结合副歌表现综合考量' : '，优势较明显'}。`);
                }
                return tips.map((t, i) => <li key={i}>• {t}</li>);
              })()}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SchemeManager() {
  const stageScheme = useStageStore((s) => s.scheme);
  const loadScheme = useStageStore((s) => s.loadScheme);
  const updateSchemeName = useStageStore((s) => s.updateSchemeName);
  const updateSchemeNotes = useStageStore((s) => s.updateSchemeNotes);

  const savedSchemes = useSchemeStore((s) => s.savedSchemes);
  const saveCurrentScheme = useSchemeStore((s) => s.saveCurrentScheme);
  const updateSavedScheme = useSchemeStore((s) => s.updateSavedScheme);
  const deleteScheme = useSchemeStore((s) => s.deleteScheme);
  const compareIds = useSchemeStore((s) => s.compareIds);
  const toggleCompareId = useSchemeStore((s) => s.toggleCompareId);
  const clearCompare = useSchemeStore((s) => s.clearCompare);
  const setCompareMode = useSchemeStore((s) => s.setCompareMode);
  const compareMode = useSchemeStore((s) => s.compareMode);
  const getSchemesForCompare = useSchemeStore((s) => s.getSchemesForCompare);

  const [nameInput, setNameInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSaveAsNew = () => {
    const toSave = {
      ...stageScheme,
      name: nameInput.trim() || stageScheme.name,
      notes: notesInput.trim(),
      positions: stageScheme.positions.map((p): StagePosition => ({ ...p })),
    };
    const saved = saveCurrentScheme(toSave);
    updateSchemeName(saved.name);
    updateSchemeNotes(saved.notes);
    setShowSaveForm(false);
    setNameInput('');
    setNotesInput('');
  };

  const handleLoad = (scheme: Scheme) => {
    const copy: Scheme = {
      ...scheme,
      id: stageScheme.id,
      positions: scheme.positions.map(p => ({ ...p, schemeId: stageScheme.id })),
      createdAt: stageScheme.createdAt,
      updatedAt: new Date().toISOString(),
    };
    loadScheme(copy);
  };

  const handleDuplicate = (scheme: Scheme) => {
    const copy: Scheme = {
      ...scheme,
      name: `${scheme.name} (副本)`,
      positions: scheme.positions.map(p => ({ ...p })),
    };
    saveCurrentScheme(copy);
  };

  const compareSchemes = getSchemesForCompare();

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-3">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            当前方案信息
          </h4>
        </div>
        <div className="space-y-1.5">
          <div>
            <label className="text-[10px] text-white/40">方案名称</label>
            <input
              type="text"
              value={stageScheme.name}
              onChange={(e) => updateSchemeName(e.target.value)}
              className="mt-0.5 w-full rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40">备注说明</label>
            <textarea
              value={stageScheme.notes}
              onChange={(e) => updateSchemeNotes(e.target.value)}
              rows={2}
              placeholder="适合曲目、演出场合等说明..."
              className="mt-0.5 w-full resize-none rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white placeholder-white/20 outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
        {!showSaveForm ? (
          <button
            onClick={() => {
              setNameInput(stageScheme.name);
              setNotesInput(stageScheme.notes);
              setShowSaveForm(true);
            }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 py-2 text-xs font-bold text-[#1a1a2e] shadow-md transition hover:from-amber-400 hover:to-yellow-400"
          >
            <Save className="h-3.5 w-3.5" />
            保存为新方案
          </button>
        ) : (
          <div className="mt-3 space-y-2 rounded-lg bg-black/30 p-2.5">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="输入方案名称..."
              className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-amber-500/50"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowSaveForm(false)}
                className="flex-1 rounded-md border border-white/10 bg-white/5 py-1.5 text-[11px] text-white/60 hover:bg-white/10"
              >
                取消
              </button>
              <button
                onClick={handleSaveAsNew}
                className="flex-1 rounded-md bg-amber-500/90 py-1.5 text-[11px] font-semibold text-[#1a1a2e] hover:bg-amber-400"
              >
                确认保存
              </button>
            </div>
          </div>
        )}
      </div>

      {savedSchemes.length > 0 && (
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
            已保存方案 <span className="text-[10px] text-white/40">({savedSchemes.length})</span>
          </h4>
          <div className="flex items-center gap-1.5">
            {compareIds.length >= 2 && (
              <>
                <button
                  onClick={() => setCompareMode(true)}
                  className="flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/30"
                >
                  <GitCompare className="h-3 w-3" />
                  对比 {compareIds.length}
                </button>
                <button
                  onClick={clearCompare}
                  className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {compareIds.length > 0 && compareIds.length < 2 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[10px] text-amber-200/80">
          💡 再选择至少 1 个方案即可开启对比分析
        </div>
      )}

      {savedSchemes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FileText className="mb-2 h-10 w-10 text-white/10" />
          <p className="text-xs text-white/30">暂无已保存方案</p>
          <p className="mt-1 text-[10px] text-white/20">调整好站位后点击上方按钮保存</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {savedSchemes
            .slice()
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((s) => (
              <SchemeCard
                key={s.id}
                scheme={s}
                selected={compareIds.includes(s.id)}
                onSelect={() => toggleCompareId(s.id)}
                onLoad={() => handleLoad(s)}
                onDelete={() => {
                  if (confirm(`确定删除方案「${s.name}」吗？`)) {
                    deleteScheme(s.id);
                    if (s.id.endsWith('_unused')) updateSavedScheme(s.id, {});
                  }
                }}
                onDuplicate={() => handleDuplicate(s)}
              />
            ))}
        </div>
      )}

      {compareMode && (
        <CompareView
          schemes={compareSchemes}
          onClose={() => setCompareMode(false)}
          onLoad={(s) => {
            handleLoad(s);
            setCompareMode(false);
          }}
        />
      )}
    </div>
  );
}
