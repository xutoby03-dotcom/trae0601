import { useState, useMemo } from 'react';
import { UserX, Search, Award, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Sparkles, ChevronUp, ChevronDown, X, History, UserCheck, MapPin, Shield } from 'lucide-react';
import { useStageStore } from '@/stores/stageStore';
import { useMembersStore } from '@/stores/membersStore';
import { findBestSubstitutes, formatDelta, getDeltaColorClass } from '@/engine/substituteEngine';
import type { SubstituteCandidate, Member } from '@/types';
import { VOICE_PART_CONFIG, VOICE_PARTS } from '@/utils/constants';
import { computeScore } from '@/engine/scoreEngine';
import { getInitial, formatTime, generateId, now } from '@/utils/helpers';

interface SubstituteApplyRecord {
  id: string;
  appliedAt: string;
  absentMember: Member;
  substituteMember: Member;
  row: number;
  col: number;
  impactScore: number;
  originalOverall: number;
  newOverall: number;
}

function ImpactBar({ value }: { value: number }) {
  const color =
    value <= 15 ? 'bg-emerald-500' : value <= 30 ? 'bg-green-500' : value <= 45 ? 'bg-amber-500' : 'bg-rose-500';
  const bgColor =
    value <= 15 ? 'bg-emerald-500/15' : value <= 30 ? 'bg-green-500/15' : value <= 45 ? 'bg-amber-500/15' : 'bg-rose-500/15';

  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full ${bgColor}`}>
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

interface MemberSelectOptionProps {
  member: Member;
  selected?: boolean;
  onClick?: () => void;
  showBadge?: boolean;
}

function MemberSelectOption({ member, selected, onClick, showBadge }: MemberSelectOptionProps) {
  const cfg = VOICE_PART_CONFIG[member.voicePart];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-lg border p-2 text-left transition ${
        selected
          ? 'border-amber-500/50 bg-amber-500/15'
          : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]'
      }`}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{
          backgroundColor: `${cfg.color}33`,
          border: `2px solid ${cfg.color}`,
          color: cfg.textColor,
        }}
      >
        {getInitial(member.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded text-[8px] font-bold text-white"
            style={{ backgroundColor: cfg.color }}
          >
            {cfg.shortLabel}
          </span>
          <span className="truncate text-xs font-medium text-white">{member.name}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-white/40">
          <span>音量{member.vocalPower}</span>
          <span>音域{member.vocalRange}</span>
          <span>经验{member.experience}</span>
        </div>
      </div>
      {showBadge && selected && (
        <CheckCircle className="h-4 w-4 flex-shrink-0 text-amber-400" />
      )}
    </button>
  );
}

interface CandidateResultCardProps {
  rank: number;
  candidate: SubstituteCandidate;
  substituteMember: Member;
  absentMember: Member;
  originalScore: number;
  onApply: () => void;
}

function DeltaBadge({
  label,
  delta,
  warnThreshold = -8,
}: {
  label: string;
  delta: number;
  warnThreshold?: number;
}) {
  const isBadDrop = delta <= warnThreshold;
  let className = 'rounded-md px-1.5 py-0.5 flex items-center gap-0.5 font-bold tabular-nums border ';
  if (delta > 0) {
    className += 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  } else if (delta === 0) {
    className += 'bg-white/[0.03] text-white/40 border-white/5';
  } else if (isBadDrop) {
    className += 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse';
  } else {
    className += 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  }
  const icon = delta > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : delta < 0 ? <TrendingDown className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />;
  return (
    <div className={className}>
      <span className="text-[8px] font-medium opacity-80">{label}</span>
      {icon}
      <span className="text-[9px]">{formatDelta(delta)}</span>
      {isBadDrop && <AlertTriangle className="h-2.5 w-2.5 ml-0.5" />}
    </div>
  );
}

function CandidateResultCard({
  rank,
  candidate,
  substituteMember,
  absentMember,
  originalScore,
  onApply,
}: CandidateResultCardProps) {
  const cfg = VOICE_PART_CONFIG[substituteMember.voicePart];
  const sameVoice = substituteMember.voicePart === absentMember.voicePart;
  const impactColor =
    candidate.impactScore <= 15 ? 'text-emerald-400' : candidate.impactScore <= 30 ? 'text-green-400' : candidate.impactScore <= 45 ? 'text-amber-400' : 'text-rose-400';
  const impactLabel =
    candidate.impactScore <= 15 ? '影响极小' : candidate.impactScore <= 30 ? '影响较小' : candidate.impactScore <= 45 ? '有一定影响' : '影响较大';
  const isLowRisk = candidate.impactScore < 30;

  return (
    <div className="relative rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden">
      {rank === 1 && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400 to-amber-600" />
      )}
      {isLowRisk && (
        <div className="absolute right-0 top-0">
          <div className="flex items-center gap-0.5 rounded-bl-lg bg-gradient-to-l from-emerald-500/30 to-emerald-400/20 px-2 py-0.5 text-[8px] font-bold text-emerald-300 border-b border-l border-emerald-500/30">
            <Shield className="h-2.5 w-2.5" />
            低风险
          </div>
        </div>
      )}
      <div className={`p-3 ${rank === 1 ? 'pl-4' : ''}`}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 pr-10">
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              rank === 1
                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-[#1a1a2e] shadow-md shadow-amber-500/30'
                : 'bg-white/10 text-white/60'
            }`}>
              {rank === 1 ? <Award className="h-4 w-4" /> : rank}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-white truncate">{substituteMember.name}</span>
                {rank === 1 && (
                  <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                    推荐
                  </span>
                )}
                {sameVoice && (
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-300">
                    同声部
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded text-[8px] font-bold text-white"
                  style={{ backgroundColor: cfg.color }}
                >
                  {cfg.shortLabel}
                </span>
                <span className="text-[10px] text-white/40">
                  推荐站位: 第{candidate.recommendedRow + 1}排 第{candidate.recommendedCol + 1}列
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold tabular-nums ${impactColor}`}>{candidate.impactScore}</div>
            <div className={`text-[9px] font-medium ${impactColor}`}>{impactLabel}</div>
          </div>
        </div>

        <div className="mb-2">
          <ImpactBar value={candidate.impactScore} />
        </div>

        <div className="grid grid-cols-2 gap-1 mb-2 text-center rounded-lg bg-black/20 p-2">
          <div>
            <p className="text-[9px] text-white/40">原综合</p>
            <p className="text-sm font-bold text-white/70 tabular-nums">{originalScore}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/40">新综合</p>
            <p className="text-sm font-bold text-amber-300 tabular-nums">{candidate.newScore.overall}</p>
          </div>
        </div>

        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[9px] text-white/40">三维度变化</span>
            <span className="text-[8px] text-rose-300/80 flex items-center gap-0.5">
              <AlertTriangle className="h-2 w-2" /> ≤-8 警告
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <DeltaBadge label="平衡" delta={candidate.balanceDelta} />
            <DeltaBadge label="清晰" delta={candidate.clarityDelta} />
            <DeltaBadge label="融合" delta={candidate.blendDelta} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-2 py-1.5">
            <MapPin className="h-3 w-3 flex-shrink-0 text-teal-400" />
            <span className="text-[9px] text-white/50 whitespace-nowrap">预览站位</span>
            <div className="ml-auto flex items-center gap-1">
              <span className="rounded bg-teal-500/20 px-1.5 py-px text-[9px] font-bold text-teal-300 whitespace-nowrap">
                第{candidate.recommendedRow + 1}排
              </span>
              <span className="rounded bg-cyan-500/20 px-1.5 py-px text-[9px] font-bold text-cyan-300 whitespace-nowrap">
                第{candidate.recommendedCol + 1}列
              </span>
            </div>
          </div>
          <button
            onClick={onApply}
            className="flex-shrink-0 rounded-lg bg-gradient-to-r from-emerald-500/90 to-teal-500/90 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-md transition hover:from-emerald-400 hover:to-teal-400 whitespace-nowrap"
          >
            ✨ <span className="hidden sm:inline">套用替补方案</span><span className="sm:hidden">套用方案</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubstituteFinder() {
  const scheme = useStageStore((s) => s.scheme);
  const members = useMembersStore((s) => s.members);
  const placeMember = useStageStore((s) => s.placeMember);
  const removeMemberAt = useStageStore((s) => s.removeMemberAt);

  const placedMemberIds = useMemo(
    () => new Set(scheme.positions.filter(p => p.memberId).map(p => p.memberId as string)),
    [scheme.positions]
  );

  const placedMembers = useMemo(
    () => members.filter(m => placedMemberIds.has(m.id)),
    [members, placedMemberIds]
  );

  const unplacedMembers = useMemo(
    () => members.filter(m => !placedMemberIds.has(m.id)),
    [members, placedMemberIds]
  );

  const [absentId, setAbsentId] = useState<string>('');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [applyRecords, setApplyRecords] = useState<SubstituteApplyRecord[]>([]);
  const [recordsCollapsed, setRecordsCollapsed] = useState(false);

  const absentMember = members.find(m => m.id === absentId);

  const originalScore = useMemo(
    () => computeScore(members, scheme.positions, scheme.gridRows, scheme.gridCols),
    [members, scheme.positions, scheme.gridRows, scheme.gridCols]
  );

  const candidates = useMemo<SubstituteCandidate[]>(() => {
    if (!absentId) return [];
    const candidateIds = selectedCandidates.size > 0 ? Array.from(selectedCandidates) : undefined;
    return findBestSubstitutes({
      scheme,
      members,
      absentMemberId: absentId,
      candidateIds,
      topN: 5,
    });
  }, [scheme, members, absentId, selectedCandidates]);

  const handleAnalyze = () => {
    if (!absentId) return;
    setShowResults(true);
  };

  const applyCandidate = (c: SubstituteCandidate) => {
    if (!absentId || !absentMember) return;
    const sub = members.find(m => m.id === c.substituteMemberId);
    if (!sub) return;
    const absentPos = scheme.positions.find(p => p.memberId === absentId);
    if (absentPos) {
      removeMemberAt(absentPos.row, absentPos.col);
    }
    const currentAtTarget = scheme.positions.find(
      p => p.row === c.recommendedRow && p.col === c.recommendedCol && p.memberId && p.memberId !== absentId
    );
    if (currentAtTarget?.memberId) {
      removeMemberAt(c.recommendedRow, c.recommendedCol);
    }
    placeMember(c.recommendedRow, c.recommendedCol, c.substituteMemberId);

    const record: SubstituteApplyRecord = {
      id: generateId('rec'),
      appliedAt: now(),
      absentMember,
      substituteMember: sub,
      row: c.recommendedRow,
      col: c.recommendedCol,
      impactScore: c.impactScore,
      originalOverall: originalScore.overall,
      newOverall: c.newScore.overall,
    };
    setApplyRecords(prev => [record, ...prev]);
    setRecordsCollapsed(false);
    setAbsentId('');
    setShowResults(false);
  };

  const toggleCandidate = (id: string) => {
    setSelectedCandidates(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
      <div className="rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20">
            <UserX className="h-3.5 w-3.5 text-rose-300" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-rose-300">临演出缺人应急</h4>
            <p className="text-[10px] text-white/40">选择缺席成员，自动推荐最优替补方案</p>
          </div>
        </div>
      </div>

      {applyRecords.length > 0 && (
        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-500/10">
            <button
              onClick={() => setRecordsCollapsed(!recordsCollapsed)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 transition"
            >
              <History className="h-3.5 w-3.5" />
              套用记录
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-px text-[9px] font-bold">
                {applyRecords.length}
              </span>
              {recordsCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </button>
            <button
              onClick={() => setApplyRecords([])}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-medium text-white/40 hover:bg-white/5 hover:text-rose-400 transition"
              title="清空所有记录"
            >
              <X className="h-3 w-3" />
              清空
            </button>
          </div>

          {!recordsCollapsed && (
            <div className="max-h-56 overflow-y-auto custom-scrollbar-thin p-2 space-y-2">
              {applyRecords.map((rec, idx) => {
                const absCfg = VOICE_PART_CONFIG[rec.absentMember.voicePart];
                const subCfg = VOICE_PART_CONFIG[rec.substituteMember.voicePart];
                const impactColor =
                  rec.impactScore <= 15 ? 'text-emerald-400' : rec.impactScore <= 30 ? 'text-green-400' : rec.impactScore <= 45 ? 'text-amber-400' : 'text-rose-400';
                return (
                  <div
                    key={rec.id}
                    className={`rounded-lg border border-white/5 bg-white/[0.02] p-2 ${idx === 0 ? 'ring-1 ring-emerald-500/30' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-white/30">{formatTime(rec.appliedAt)}</span>
                        {idx === 0 && (
                          <span className="rounded-full bg-emerald-500/20 px-1.5 py-px text-[8px] font-bold text-emerald-300">
                            最新
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-white/40">影响分</span>
                        <span className={`text-[11px] font-bold tabular-nums ${impactColor}`}>
                          {rec.impactScore}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 items-center text-[10px]">
                      <div className="col-span-5 flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20">
                          <UserX className="h-2.5 w-2.5 text-rose-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span
                              className="flex h-3 w-3 items-center justify-center rounded text-[6px] font-bold text-white"
                              style={{ backgroundColor: absCfg.color }}
                            >
                              {absCfg.shortLabel}
                            </span>
                            <span className="text-white/70 truncate">{rec.absentMember.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center gap-0.5 text-white/20">
                          <Minus className="h-3 w-3" />
                          <UserCheck className="h-3 w-3" />
                        </div>
                      </div>

                      <div className="col-span-5 flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                          <UserCheck className="h-2.5 w-2.5 text-emerald-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span
                              className="flex h-3 w-3 items-center justify-center rounded text-[6px] font-bold text-white"
                              style={{ backgroundColor: subCfg.color }}
                            >
                              {subCfg.shortLabel}
                            </span>
                            <span className="text-white/70 truncate">{rec.substituteMember.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-[9px]">
                      <div className="flex items-center gap-1 text-white/40">
                        <MapPin className="h-2.5 w-2.5" />
                        <span>第{rec.row + 1}排 第{rec.col + 1}列</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/40">
                        <TrendingDown className="h-2.5 w-2.5" />
                        <span>
                          {rec.originalOverall} → <span className="text-amber-300 font-medium">{rec.newOverall}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-[11px] font-semibold text-white/70">
          1. 选择缺席成员 <span className="text-rose-400">*</span>
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar-thin">
          {placedMembers.length === 0 ? (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] py-4 text-center text-[11px] text-white/30">
              请先在舞台上摆放成员
            </div>
          ) : (
            VOICE_PARTS.map(part => {
              const partMembers = placedMembers.filter(m => m.voicePart === part);
              if (partMembers.length === 0) return null;
              const cfg = VOICE_PART_CONFIG[part];
              return (
                <div key={part} className="mb-2">
                  <div className="mb-1 flex items-center gap-1 px-1">
                    <span
                      className="flex h-3.5 w-3.5 items-center justify-center rounded text-[8px] font-bold text-white"
                      style={{ backgroundColor: cfg.color }}
                    >
                      {cfg.shortLabel}
                    </span>
                    <span className="text-[10px] text-white/40">{cfg.label}</span>
                  </div>
                  <div className="space-y-1">
                    {partMembers.map(m => (
                      <MemberSelectOption
                        key={m.id}
                        member={m}
                        selected={absentId === m.id}
                        onClick={() => setAbsentId(absentId === m.id ? '' : m.id)}
                        showBadge
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {absentId && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <label className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-white/70">
            <span>2. 选择替补候选人 <span className="text-white/30 text-[9px]">(可选，留空=全体未登台成员)</span></span>
            {selectedCandidates.size > 0 && (
              <span className="text-[10px] text-amber-300">已选 {selectedCandidates.size} 人</span>
            )}
          </label>
          {unplacedMembers.length === 0 ? (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-200/80 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <div>
                暂无未登台的成员可作为替补。请先在成员管理中添加备选成员，或从当前舞台上移除部分成员。
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar-thin">
              {unplacedMembers.length > 3 && (
                <div className="flex items-center gap-1.5 text-[10px] text-white/30 pb-1">
                  <Search className="h-3 w-3" />
                  共 {unplacedMembers.length} 位候选，建议选同声部成员
                </div>
              )}
              {VOICE_PARTS.map(part => {
                const partMembers = unplacedMembers.filter(m => m.voicePart === part);
                if (partMembers.length === 0) return null;
                const cfg = VOICE_PART_CONFIG[part];
                const isSame = absentMember?.voicePart === part;
                return (
                  <div key={part} className="mb-2">
                    <div className="mb-1 flex items-center gap-1 px-1">
                      <span
                        className="flex h-3.5 w-3.5 items-center justify-center rounded text-[8px] font-bold text-white"
                        style={{ backgroundColor: cfg.color }}
                      >
                        {cfg.shortLabel}
                      </span>
                      <span className="text-[10px] text-white/40">{cfg.label}</span>
                      {isSame && (
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-px text-[8px] font-medium text-emerald-300">
                          同声部
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {partMembers.map(m => (
                        <MemberSelectOption
                          key={m.id}
                          member={m}
                          selected={selectedCandidates.has(m.id)}
                          onClick={() => toggleCandidate(m.id)}
                          showBadge
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!absentId || unplacedMembers.length === 0}
        className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 disabled:opacity-40 disabled:shadow-none"
      >
        <Sparkles className="h-4 w-4" />
        分析替补方案
      </button>

      {showResults && candidates.length > 0 && (
        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              推荐方案（按影响从低到高排序）
            </h4>
            <span className="text-[10px] text-white/40">共 {candidates.length} 个</span>
          </div>
          <div className="space-y-2.5">
            {candidates.map((c, idx) => {
              const sub = members.find(m => m.id === c.substituteMemberId);
              if (!sub || !absentMember) return null;
              return (
                <CandidateResultCard
                  key={c.substituteMemberId}
                  rank={idx + 1}
                  candidate={c}
                  substituteMember={sub}
                  absentMember={absentMember}
                  originalScore={originalScore.overall}
                  onApply={() => applyCandidate(c)}
                />
              );
            })}
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[10px] text-white/40 space-y-1.5 leading-relaxed">
            <p className="text-white/50 font-semibold">📖 评估说明</p>
            <p>• 影响分：综合评分变动幅度 + 声部匹配度 + 成员属性相似度，分数越低越好</p>
            <p>• 同声部匹配：替补与缺席者同声部，可显著降低融合度损失</p>
            <p>• 推荐站位：系统自动计算的最优放置位置（不一定是原位置）</p>
            <p>• 建议：优先选影响分 &lt; 30 且同声部的方案</p>
          </div>
        </div>
      )}
    </div>
  );
}
