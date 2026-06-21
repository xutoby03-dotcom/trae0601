import { useMemo, useState } from 'react';
import {
  Save, Trash2, GitCompare, Copy, FileText, Calendar, Star,
  XCircle, CheckCircle2, Eye, Music2, BarChart3, Activity, Shield,
  TrendingUp, TrendingDown, Minus, Award, Sparkles, Zap
} from 'lucide-react';
import { useSchemeStore } from '@/stores/schemeStore';
import { useStageStore } from '@/stores/stageStore';
import { useAuditionStore } from '@/stores/auditionStore';
import type { Scheme, StagePosition, AuditionScore } from '@/types';
import { formatDate, standardDeviation } from '@/utils/helpers';
import { VOICE_PART_CONFIG } from '@/utils/constants';
import { useMembersStore } from '@/stores/membersStore';

interface SchemeAnalysis {
  overall: number;
  chorus: AuditionScore | null;
  chorusBalance: number | null;
  chorusClarity: number | null;
  chorusBlend: number | null;
  chorusOverall: number | null;
  stability: number;
  rankingScore: number;
  stabilityLabel: string;
  stabilityColor: string;
  scoreCount: number;
  allPassagesAvg: number;
}

function computeOverall(s: AuditionScore): number {
  return Math.round(s.balance * 0.4 + s.clarity * 0.3 + s.blend * 0.3);
}

function findLatestByPassage(scores: AuditionScore[], passage: string): AuditionScore | null {
  const filtered = scores.filter(s => s.passage === passage);
  if (filtered.length === 0) return null;
  return [...filtered].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )[0];
}

function analyzeScheme(scheme: Scheme): SchemeAnalysis {
  const scores = scheme.auditionScores || [];
  const overall = scheme.overallScore || 0;
  const chorus = findLatestByPassage(scores, '副歌段落');

  const chorusBalance = chorus ? chorus.balance : null;
  const chorusClarity = chorus ? chorus.clarity : null;
  const chorusBlend = chorus ? chorus.blend : null;
  const chorusOverall = chorus ? computeOverall(chorus) : null;

  let stability = 0;
  let stabilityLabel = '暂无评分';
  let stabilityColor = 'text-white/30';
  const scoreCount = scores.length;

  if (scoreCount >= 2) {
    const overalls = scores.map(computeOverall);
    const mean = overalls.reduce((s, v) => s + v, 0) / overalls.length;
    const sd = standardDeviation(overalls);
    const cv = mean > 0 ? sd / mean : 1;
    stability = Math.round(Math.max(0, 100 - cv * 300));
    if (stability >= 85) { stabilityLabel = '非常稳定'; stabilityColor = 'text-emerald-400'; }
    else if (stability >= 70) { stabilityLabel = '比较稳定'; stabilityColor = 'text-teal-400'; }
    else if (stability >= 55) { stabilityLabel = '一般'; stabilityColor = 'text-amber-400'; }
    else if (stability >= 40) { stabilityLabel = '波动较大'; stabilityColor = 'text-orange-400'; }
    else { stabilityLabel = '很不稳定'; stabilityColor = 'text-rose-400'; }
  } else if (scoreCount === 1) {
    stability = 60;
    stabilityLabel = '评分不足';
    stabilityColor = 'text-amber-300/80';
  }

  const rankingChorus = chorusOverall ?? overall;
  const chorusBoost = chorusOverall !== null ? 1.0 : 0.9;
  const stabilityWeight = scoreCount >= 2 ? 0.25 : scoreCount === 1 ? 0.08 : 0;
  const chorusWeight = chorusOverall !== null ? 0.5 : 0;
  const overallWeight = 1 - stabilityWeight - chorusWeight;
  const rankingScore = Math.round(
    (overall * overallWeight) +
    (rankingChorus * chorusWeight * chorusBoost) +
    (stability * stabilityWeight)
  );

  const allPassagesAvg = scoreCount > 0
    ? Math.round(scores.reduce((s, x) => s + computeOverall(x), 0) / scoreCount)
    : 0;

  return {
    overall,
    chorus,
    chorusBalance,
    chorusClarity,
    chorusBlend,
    chorusOverall,
    stability,
    rankingScore,
    stabilityLabel,
    stabilityColor,
    scoreCount,
    allPassagesAvg,
  };
}

function MiniStagePreview({ scheme }: { scheme: Scheme }) {
  const getMember = useMembersStore((s) => s.getMember);
  return (
    <div
      className="grid gap-0.5 rounded-md bg-black/30 p-1"
      style={{ gridTemplateColumns: `repeat(${scheme.gridCols}, 1fr)` }}
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

function ScorePill({ value, nullLabel = '—' }: { value: number | null; nullLabel?: string }) {
  if (value === null) {
    return <span className="text-white/25 text-sm">{nullLabel}</span>;
  }
  const color =
    value >= 85 ? 'text-emerald-400' : value >= 70 ? 'text-amber-400' : value >= 55 ? 'text-orange-400' : 'text-rose-400';
  return <span className={`font-bold tabular-nums text-sm ${color}`}>{value}</span>;
}

function DeltaTag({ value }: { value: number | null }) {
  if (value === null || value === 0) {
    return <span className="inline-flex items-center gap-0.5 text-white/40"><Minus className="h-2.5 w-2.5" /> 基准</span>;
  }
  if (value > 0) {
    return <span className="inline-flex items-center gap-0.5 text-emerald-400"><TrendingUp className="h-2.5 w-2.5" /> +{value}</span>;
  }
  return <span className="inline-flex items-center gap-0.5 text-rose-400"><TrendingDown className="h-2.5 w-2.5" /> {value}</span>;
}

interface SchemeCardProps {
  scheme: Scheme;
  analysis: SchemeAnalysis;
  selected: boolean;
  onSelect: () => void;
  onLoad: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SchemeCard({ scheme, analysis, selected, onSelect, onLoad, onDelete, onDuplicate }: SchemeCardProps) {
  const score = analysis.overall;
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
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[#1a1a2e] z-10">
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

        <div className="mb-2 grid grid-cols-4 gap-1 rounded-lg bg-black/20 p-1.5 text-center">
          <div>
            <p className="text-[8px] text-white/35">副歌分</p>
            <ScorePill value={analysis.chorusOverall} />
          </div>
          <div>
            <p className="text-[8px] text-white/35">平衡</p>
            <ScorePill value={analysis.chorusBalance} />
          </div>
          <div>
            <p className="text-[8px] text-white/35">清晰</p>
            <ScorePill value={analysis.chorusClarity} />
          </div>
          <div>
            <p className="text-[8px] text-white/35">融合</p>
            <ScorePill value={analysis.chorusBlend} />
          </div>
        </div>

        <MiniStagePreview scheme={scheme} />

        <div className="mt-2 flex items-center justify-between gap-1 text-[10px]">
          <span className="text-white/40">
            {scheme.gridRows}×{scheme.gridCols} | {scheme.positions.filter(p => p.memberId).length}人
          </span>
          <div className="flex items-center gap-1">
            <span className={`font-medium ${analysis.stabilityColor}`}>
              <Shield className="h-2.5 w-2.5 inline mr-0.5" />
              {analysis.stabilityLabel}
            </span>
            {analysis.chorusOverall && analysis.chorusOverall >= 80 && (
              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
            )}
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
  const analyses = useMemo(
    () => schemes.map(s => ({ scheme: s, analysis: analyzeScheme(s) })),
    [schemes]
  );

  const ranked = useMemo(
    () => [...analyses].sort((a, b) => b.analysis.rankingScore - a.analysis.rankingScore),
    [analyses]
  );
  const best = ranked[0];
  const baseChorus = best.analysis.chorusOverall ?? best.analysis.overall;

  const dimensions = [
    { key: 'grid', label: '舞台规模', fmt: (a: SchemeAnalysis, s: Scheme) => `${s.gridRows}×${s.gridCols}` },
    { key: 'members', label: '参演人数', fmt: (a: SchemeAnalysis, s: Scheme) => `${s.positions.filter(p => p.memberId).length}人` },
    { key: 'scores', label: '试听次数', fmt: (a: SchemeAnalysis) => `${a.scoreCount}次${a.scoreCount >= 2 ? ' ✅' : a.scoreCount === 1 ? '' : ' ⚠'}` },
    { key: 'overall', label: '综合评分', fmt: (a: SchemeAnalysis) => `${a.overall}分` },
    { key: 'allAvg', label: '全段落均分', fmt: (a: SchemeAnalysis) => a.scoreCount > 0 ? `${a.allPassagesAvg}分` : '—' },
    { key: 'chorus', label: '副歌综合分 ⭐', fmt: (a: SchemeAnalysis) => a.chorusOverall !== null ? `${a.chorusOverall}分` : '未评' },
    { key: 'chorus3', label: '副歌：平/清/融', fmt: (a: SchemeAnalysis) => {
      if (a.chorusBalance === null) return '— / — / —';
      return `${a.chorusBalance} / ${a.chorusClarity} / ${a.chorusBlend}`;
    }},
    { key: 'stability', label: '稳定性 🛡️', fmt: (a: SchemeAnalysis) => {
      if (a.scoreCount < 2) return `${a.stabilityLabel} (数据不足)`;
      return `${a.stability}分 · ${a.stabilityLabel}`;
    }},
    { key: 'ranking', label: '综合推荐指数 🏆', fmt: (a: SchemeAnalysis) => `${a.rankingScore}分` },
  ];

  if (schemes.length < 2) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-6xl max-h-[92vh] overflow-auto rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1a2e] to-[#12101c] shadow-2xl custom-scrollbar">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#1e1a2e]/95 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-2 flex-wrap">
            <GitCompare className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">多方案对比分析</h3>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
              {schemes.length} 个方案
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] text-rose-300/90">
              <Zap className="h-2.5 w-2.5" />
              副歌权重最高 + 稳定性综合推荐
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(schemes.length, 4)}, minmax(0, 1fr))` }}>
            {ranked.map(({ scheme, analysis }, idx) => {
              const score = analysis.overall;
              const scoreColor = score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400';
              const chorusDelta = analysis.chorusOverall !== null ? analysis.chorusOverall - (baseChorus ?? 0) : null;
              return (
                <div
                  key={scheme.id}
                  className={`relative rounded-xl border overflow-hidden ${
                    idx === 0
                      ? 'border-amber-500/50 ring-2 ring-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  {idx === 0 && (
                    <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-2 py-0.5 text-[10px] font-extrabold text-[#1a1a2e] shadow-md">
                      <Award className="h-3 w-3" /> 🏆 推荐
                    </div>
                  )}
                  <div className="p-3 pt-8">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-white">{scheme.name}</h4>
                        <p className="text-[10px] text-white/40">{formatDate(scheme.updatedAt)}</p>
                      </div>
                      <div className={`text-3xl font-bold tabular-nums ${scoreColor}`}>{score}</div>
                    </div>
                    <div className="mb-2 grid grid-cols-3 gap-1 rounded-lg bg-black/25 p-1.5 text-center">
                      <div>
                        <p className="text-[8px] text-white/35">副歌综合</p>
                        <div className="text-sm font-bold text-amber-300 tabular-nums">
                          {analysis.chorusOverall ?? '—'}
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] text-white/35">稳定性</p>
                        <div className={`text-sm font-bold tabular-nums ${analysis.stabilityColor}`}>
                          {analysis.stability}
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] text-white/35">推荐指数</p>
                        <div className="text-sm font-bold text-emerald-400 tabular-nums">
                          {analysis.rankingScore}
                        </div>
                      </div>
                    </div>

                    <div className="mb-2 space-y-1 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-rose-400/80">副歌平衡</span>
                        <div className="flex items-center gap-1">
                          <ScorePill value={analysis.chorusBalance} />
                          {idx !== 0 && <DeltaTag value={chorusDelta} />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400/80">副歌清晰</span>
                        <ScorePill value={analysis.chorusClarity} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400/80">副歌融合</span>
                        <ScorePill value={analysis.chorusBlend} />
                      </div>
                    </div>

                    <MiniStagePreview scheme={scheme} />
                    <button
                      onClick={() => onLoad(scheme)}
                      className="mt-2 w-full rounded-lg bg-gradient-to-r from-amber-500/90 to-yellow-500/90 py-1.5 text-[11px] font-bold text-[#1a1a2e] shadow transition hover:from-amber-400 hover:to-yellow-400"
                    >
                      ✨ 载入此方案
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2">
              <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-white/80">详细维度对比</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[640px]">
                <thead>
                  <tr className="bg-white/[0.02] text-white/40">
                    <th className="px-4 py-2 text-left font-medium whitespace-nowrap">对比维度</th>
                    {ranked.map(({ scheme, analysis }) => (
                      <th key={scheme.id} className="px-4 py-2 text-center font-medium">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1">
                            {analysis.rankingScore === best.analysis.rankingScore && (
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            )}
                            <span className="truncate max-w-[120px]">{scheme.name}</span>
                          </div>
                          <span className="text-[9px] font-normal text-white/30">
                            推荐 {analysis.rankingScore}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dimensions.map((d, i) => {
                    const highlight = ['chorus', 'chorus3', 'stability', 'ranking'].includes(d.key);
                    const isRanking = d.key === 'ranking';
                    const values = ranked.map(r => r.analysis.rankingScore);
                    const maxRanking = Math.max(...values);
                    return (
                      <tr
                        key={d.key}
                        className={`border-t border-white/5 ${
                          highlight ? 'bg-amber-500/[0.04]' : ''
                        }`}
                      >
                        <td className={`px-4 py-2 whitespace-nowrap ${highlight ? 'text-amber-200/90 font-semibold' : 'text-white/60'}`}>
                          {d.label}
                        </td>
                        {ranked.map(({ scheme, analysis }) => {
                          const v = d.fmt(analysis, scheme);
                          const isBestRanking = isRanking && analysis.rankingScore === maxRanking;
                          return (
                            <td
                              key={scheme.id}
                              className={`px-4 py-2 text-center font-medium whitespace-nowrap ${
                                isBestRanking
                                  ? 'bg-emerald-500/10 text-emerald-300'
                                  : highlight
                                  ? 'text-white/80'
                                  : 'text-white/70'
                              }`}
                            >
                              {isBestRanking && <Star className="inline h-2.5 w-2.5 mr-1 fill-amber-400 text-amber-400 align-middle" />}
                              {v}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <Award className="h-3.5 w-3.5" /> 🏆 最终推荐方案
              </h4>
              <p className="text-sm font-bold text-white mb-1">
                「{best.scheme.name}」
                <span className="ml-2 text-xs font-normal text-emerald-300">
                  推荐指数 {best.analysis.rankingScore}
                </span>
              </p>
              <ul className="space-y-1.5 text-[11px] leading-relaxed text-white/75 mt-2">
                <li>
                  • 综合评分：<span className="text-amber-300 font-medium">{best.analysis.overall}分</span>
                  {best.analysis.chorusOverall !== null && (
                    <>，副歌综合：<span className="text-amber-300 font-medium">{best.analysis.chorusOverall}分</span></>
                  )}
                </li>
                {best.analysis.chorusBalance !== null && (
                  <li>
                    • 副歌三围：
                    <span className="text-rose-300">平衡{best.analysis.chorusBalance}</span>
                    <span className="mx-1 text-white/30">/</span>
                    <span className="text-purple-300">清晰{best.analysis.chorusClarity}</span>
                    <span className="mx-1 text-white/30">/</span>
                    <span className="text-emerald-300">融合{best.analysis.chorusBlend}</span>
                  </li>
                )}
                {best.analysis.scoreCount >= 2 && (
                  <li>
                    • 稳定性：<span className={`font-medium ${best.analysis.stabilityColor}`}>
                      {best.analysis.stability}分 · {best.analysis.stabilityLabel}
                    </span>（{best.analysis.scoreCount}次试听标准差评估）
                  </li>
                )}
                {best.scheme.notes && (
                  <li>• 方案备注：{best.scheme.notes}</li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/70">
                <Activity className="h-3.5 w-3.5" /> 📐 推荐逻辑说明
              </h4>
              <ul className="space-y-1.5 text-[11px] leading-relaxed text-white/60">
                <li>
                  <span className="inline-block w-20 text-amber-300">副歌权重</span>
                  副歌综合分占推荐指数 50%（解决副歌不稳问题）
                </li>
                <li>
                  <span className="inline-block w-20 text-emerald-300">稳定性</span>
                  多段评分间标准差越小稳定性越高，占 25%
                </li>
                <li>
                  <span className="inline-block w-20 text-white/50">综合评分</span>
                  当前 overall 评分占剩余权重（25~67%）
                </li>
                <li>
                  <span className="inline-block w-20 text-rose-300">降级处理</span>
                  未评副歌的方案推荐指数打九折，评分不足1次降稳定分
                </li>
              </ul>

              {best.analysis.scoreCount < 2 && (
                <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[10px] text-amber-200/90">
                  💡 建议为每个方案至少试听2个不同段落（主歌+副歌），稳定性计算更准确
                </div>
              )}
              {best.analysis.chorusOverall === null && (
                <div className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-[10px] text-rose-200/90">
                  ⚠️ 推荐方案缺少副歌评分，请先试听副歌段落以获得更准确的推荐
                </div>
              )}
            </div>
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
  const importScoresForScheme = useAuditionStore((s) => s.importScoresForScheme);

  const savedSchemes = useSchemeStore((s) => s.savedSchemes);
  const saveCurrentScheme = useSchemeStore((s) => s.saveCurrentScheme);
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

  const analyzedSchemes = useMemo(
    () => new Map(savedSchemes.map(s => [s.id, analyzeScheme(s)])),
    [savedSchemes]
  );

  const handleSaveAsNew = () => {
    const toSave = {
      ...stageScheme,
      name: nameInput.trim() || stageScheme.name,
      notes: notesInput.trim(),
      positions: stageScheme.positions.map((p): StagePosition => ({ ...p })),
      auditionScores: stageScheme.auditionScores || [],
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
      auditionScores: [],
      createdAt: stageScheme.createdAt,
      updatedAt: new Date().toISOString(),
    };
    loadScheme(copy);
    if (scheme.auditionScores && scheme.auditionScores.length > 0) {
      importScoresForScheme(stageScheme.id, scheme.auditionScores);
    }
  };

  const handleDuplicate = (scheme: Scheme) => {
    const copy: Scheme = {
      ...scheme,
      name: `${scheme.name} (副本)`,
      positions: scheme.positions.map(p => ({ ...p })),
      auditionScores: (scheme.auditionScores || []).map(s => ({ ...s })),
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
            保存为新方案（含试听评分）
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
                  className="flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500/90 to-yellow-500/90 px-2 py-1 text-[10px] font-bold text-[#1a1a2e] shadow hover:from-amber-400 hover:to-yellow-400"
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
          💡 再选至少 1 个方案开启对比分析（副歌分和稳定性自动评估）
        </div>
      )}

      {savedSchemes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FileText className="mb-2 h-10 w-10 text-white/10" />
          <p className="text-xs text-white/30">暂无已保存方案</p>
          <p className="mt-1 text-[10px] text-white/20">调整站位+试听评分后点上方按钮保存</p>
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
                analysis={analyzedSchemes.get(s.id) ?? analyzeScheme(s)}
                selected={compareIds.includes(s.id)}
                onSelect={() => toggleCompareId(s.id)}
                onLoad={() => handleLoad(s)}
                onDelete={() => {
                  if (confirm(`确定删除方案「${s.name}」吗？`)) {
                    deleteScheme(s.id);
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
