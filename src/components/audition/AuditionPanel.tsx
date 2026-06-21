import { useMemo } from 'react';
import { Mic, MicOff, Scale, Eye, Sparkles, Save, ChevronDown, MessageSquare, Clock } from 'lucide-react';
import { useAuditionStore } from '@/stores/auditionStore';
import { useStageStore } from '@/stores/stageStore';
import { useMembersStore } from '@/stores/membersStore';
import { AUDITION_PASSAGES, VOICE_PART_CONFIG, VOICE_PARTS } from '@/utils/constants';
import { computeScore } from '@/engine/scoreEngine';
import { computeAcoustics } from '@/engine/acousticEngine';
import { formatDate } from '@/utils/helpers';
import { useState } from 'react';

interface ScoreSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  color: string;
  description: string;
  goodHint: string;
  badHint: string;
}

function ScoreSlider({ label, icon, value, onChange, color, description, goodHint, badHint }: ScoreSliderProps) {
  const percentage = `${value}%`;
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span className="text-sm font-semibold text-white">{label}</span>
        </div>
        <span
          className="rounded-md px-2 py-0.5 text-sm font-bold tabular-nums"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {value}
        </span>
      </div>
      <div className="relative mb-2 h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
          style={{ width: percentage, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: color }}
      />
      <p className="mt-1.5 text-[10px] text-white/40 leading-snug">{description}</p>
      <div className="mt-1 flex justify-between text-[9px]">
        <span className="text-rose-400/60">{badHint}</span>
        <span className="text-emerald-400/60">{goodHint}</span>
      </div>
    </div>
  );
}

function ScoreRing({ value, size = 120 }: { value: number; size?: number }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const color =
    value >= 85 ? '#10B981' : value >= 70 ? '#D4AF37' : value >= 55 ? '#F59E0B' : '#EF4444';
  const label =
    value >= 85 ? '优秀' : value >= 70 ? '良好' : value >= 55 ? '一般' : value >= 40 ? '较差' : '失衡';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums" style={{ color }}>
          {value}
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export function AuditionPanel() {
  const scheme = useStageStore((s) => s.scheme);
  const members = useMembersStore((s) => s.members);
  const applySchemeScore = useStageStore((s) => s.applySchemeScore);

  const store = useAuditionStore();
  const [showPassages, setShowPassages] = useState(false);

  const predicted = useMemo(
    () => computeScore(members, scheme.positions, scheme.gridRows, scheme.gridCols),
    [members, scheme.positions, scheme.gridRows, scheme.gridCols]
  );

  const acoustic = useMemo(
    () => computeAcoustics(members, scheme.positions, scheme.gridRows, scheme.gridCols),
    [members, scheme.positions, scheme.gridRows, scheme.gridCols]
  );

  const history = store.getScores(scheme.id);
  const draftOverall = store.computeDraftOverall();

  const handleSave = () => {
    store.saveScore(scheme.id);
    applySchemeScore(draftOverall);
  };

  const totalVolume = Object.values(acoustic.voiceVolumes).reduce((s, v) => s + v, 0) || 1;
  const maxV = Math.max(...Object.values(acoustic.voiceVolumes), 0.01);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-amber-400/70">声学模型预测</p>
            <p className="text-xs text-white/50">基于站位和声部属性自动计算</p>
          </div>
          <ScoreRing value={predicted.overall} size={76} />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(['balance', 'clarity', 'blend'] as const).map((key) => {
            const v = predicted[key];
            const cfg = {
              balance: { l: '平衡', c: '#FF6B9D' },
              clarity: { l: '清晰', c: '#7B68EE' },
              blend: { l: '融合', c: '#4CAF7D' },
            }[key];
            return (
              <div key={key} className="rounded-lg bg-black/20 p-1.5 text-center">
                <p className="text-[9px] text-white/40">{cfg.l}</p>
                <p className="text-base font-bold tabular-nums" style={{ color: cfg.c }}>
                  {v}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
          {VOICE_PARTS.map((p) => {
            const cfg = VOICE_PART_CONFIG[p];
            const v = acoustic.voiceVolumes[p];
            const pct = (v / maxV) * 100;
            return (
              <div key={p} className="flex items-center gap-2">
                <span
                  className="flex h-5 w-6 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: cfg.color }}
                >
                  {cfg.shortLabel}
                </span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                  />
                </div>
                <span className="w-8 text-right text-[10px] tabular-nums text-white/50">
                  {((v / totalVolume) * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white/90 flex items-center gap-1.5">
            <Mic className="h-4 w-4 text-amber-400" />
            试听打分
          </h4>
          <button
            onClick={() => (store.isRecording ? store.stopRecording() : store.startRecording())}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition ${
              store.isRecording
                ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/50'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {store.isRecording ? (
              <>
                <MicOff className="h-3 w-3" />
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
                试听中...
              </>
            ) : (
              <>
                <Mic className="h-3 w-3" />
                开始试听
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowPassages((s) => !s)}
            className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/80 hover:bg-white/10"
          >
            <span className="text-white/50 mr-1.5">段落：</span>
            {store.draftPassage}
            <ChevronDown className={`h-3.5 w-3.5 text-white/40 transition ${showPassages ? 'rotate-180' : ''}`} />
          </button>
          {showPassages && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-[#1a1525] shadow-xl">
              {AUDITION_PASSAGES.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    store.setDraftPassage(p);
                    setShowPassages(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-xs transition hover:bg-white/10 ${
                    store.draftPassage === p ? 'bg-amber-500/15 text-amber-300' : 'text-white/70'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <ScoreSlider
          label="平衡度"
          icon={<Scale className="h-4 w-4" />}
          value={store.draftBalance}
          onChange={store.setDraftBalance}
          color="#FF6B9D"
          description="各声部音量是否均衡，女高不盖过低音，男低不被埋没"
          badHint="声部失衡"
          goodHint="完美均衡"
        />
        <ScoreSlider
          label="清晰度"
          icon={<Eye className="h-4 w-4" />}
          value={store.draftClarity}
          onChange={store.setDraftClarity}
          color="#7B68EE"
          description="各声部线条是否可辨，旋律线条是否突出可闻"
          badHint="混浊难辨"
          goodHint="纤毫毕现"
        />
        <ScoreSlider
          label="融合度"
          icon={<Sparkles className="h-4 w-4" />}
          value={store.draftBlend}
          onChange={store.setDraftBlend}
          color="#4CAF7D"
          description="各声部音色过渡是否自然，整体和声是否协调"
          badHint="各自为政"
          goodHint="水乳交融"
        />
      </div>

      <div className="flex items-center justify-around rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent p-4">
        <div>
          <p className="mb-1 text-center text-[10px] uppercase tracking-wider text-white/40">综合评分</p>
          <ScoreRing value={draftOverall} size={100} />
        </div>
        <div className="space-y-1.5">
          {(['balance', 'clarity', 'blend'] as const).map((k) => {
            const val = k === 'balance' ? store.draftBalance : k === 'clarity' ? store.draftClarity : store.draftBlend;
            const w = k === 'balance' ? 0.4 : 0.3;
            const c = k === 'balance' ? '#FF6B9D' : k === 'clarity' ? '#7B68EE' : '#4CAF7D';
            const label = k === 'balance' ? '平衡 ×40%' : k === 'clarity' ? '清晰 ×30%' : '融合 ×30%';
            return (
              <div key={k} className="flex items-center gap-2 text-[10px]">
                <span className="w-14 text-white/50">{label}</span>
                <span className="w-6 text-right font-bold tabular-nums" style={{ color: c }}>
                  {val}
                </span>
                <span className="text-white/30">×{w} =</span>
                <span className="w-10 font-bold tabular-nums text-white/80">
                  {Math.round(val * w)}
                </span>
              </div>
            );
          })}
          <div className="mt-1.5 border-t border-white/5 pt-1.5 flex items-center gap-2 text-[10px]">
            <span className="w-14 font-semibold text-amber-300">合计</span>
            <span className="w-24 text-right font-bold tabular-nums text-amber-300">= {draftOverall}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 flex items-center gap-1 text-xs font-medium text-white/60">
          <MessageSquare className="h-3 w-3" />
          指挥评语
        </label>
        <textarea
          value={store.draftComment}
          onChange={(e) => store.setDraftComment(e.target.value)}
          placeholder="记录本次试听的感受，如：副歌段男低音需要加强..."
          rows={3}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs text-white placeholder-white/20 outline-none transition focus:border-amber-500/50 focus:bg-white/10"
        />
      </div>

      <button
        onClick={handleSave}
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-sm font-bold text-[#1a1a2e] shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-yellow-400"
      >
        <Save className="h-4 w-4" />
        保存本次试听评分
      </button>

      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
            <Clock className="h-3.5 w-3.5 text-white/40" />
            历史试听记录 ({history.length})
          </div>
          <div className="space-y-1.5">
            {history
              .slice()
              .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
              .slice(0, 5)
              .map((h) => {
                const o = Math.round(h.balance * 0.4 + h.clarity * 0.3 + h.blend * 0.3);
                return (
                  <div
                    key={h.id}
                    className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/15 text-xs font-bold text-amber-300">
                      {o}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-white/80">{h.passage}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-white/40">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(h.recordedAt)}
                      </div>
                      {h.comment && (
                        <p className="mt-0.5 line-clamp-1 text-[10px] text-white/50">{h.comment}</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
