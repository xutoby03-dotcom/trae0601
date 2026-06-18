import { useState } from 'react';
import { useAquaStore } from '@/store/aquaStore';
import { FilterMaterial, FILTER_MATERIAL_ICONS, FILTER_MATERIAL_DEFAULTS, FilterMaterialType } from '@/types';
import { RotateCcw, Package, Clock, Droplets, Plus, X, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const RADIUS = 54;
const STROKE_WIDTH = 8;
const VIEWBOX = 140;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function daysBetween(dateA: Date, dateB: Date): number {
  return Math.floor((dateB.getTime() - dateA.getTime()) / 86400000);
}

function getLifePercent(fm: FilterMaterial): number {
  const daysUsed = daysBetween(new Date(fm.installDate), new Date());
  const pct = (1 - daysUsed / fm.replaceCycleDays) * 100;
  return Math.max(0, Math.min(100, pct));
}

function getRemainingDays(fm: FilterMaterial): number {
  const daysUsed = daysBetween(new Date(fm.installDate), new Date());
  return Math.max(0, fm.replaceCycleDays - daysUsed);
}

function getRingColor(pct: number, expired: boolean): string {
  if (expired || pct <= 0) return '#EF4444';
  if (pct > 50) return '#2D8F4E';
  if (pct >= 25) return '#D4A853';
  return '#FF6B35';
}

function ProgressRing({ fm }: { fm: FilterMaterial }) {
  const pct = getLifePercent(fm);
  const remaining = getRemainingDays(fm);
  const expired = remaining <= 0;
  const color = getRingColor(pct, expired);
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * pct) / 100;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={VIEWBOX} height={VIEWBOX} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="progress-ring">
        <circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foam">{expired ? 0 : remaining}</span>
        <span className="text-xs text-foam/60">天</span>
      </div>
    </div>
  );
}

function MaterialCard({
  fm,
  onReplace,
  onRestock,
}: {
  fm: FilterMaterial;
  onReplace: (fm: FilterMaterial) => void;
  onRestock: (id: string) => void;
}) {
  const remaining = getRemainingDays(fm);
  const expired = remaining <= 0;

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col items-center">
      <ProgressRing fm={fm} />

      <div className="mt-4 w-full space-y-2 text-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">{FILTER_MATERIAL_ICONS[fm.type]}</span>
          <h3 className="text-lg font-serif font-semibold text-foam">{fm.type}</h3>
        </div>

        <div className="flex items-center gap-2 text-foam/60">
          <Clock size={14} className="shrink-0" />
          <span>安装日期: {fm.installDate}</span>
        </div>

        <div className="flex items-center gap-2 text-foam/60">
          <RotateCcw size={14} className="shrink-0" />
          <span>建议 {fm.replaceCycleDays} 天更换</span>
        </div>

        <div className="flex items-center gap-2 text-foam/60">
          <Droplets size={14} className="shrink-0" />
          <span>清洗方式: {fm.cleaningMethod}</span>
        </div>

        <div className="flex items-center gap-2 text-foam/60">
          <Package size={14} className="shrink-0" />
          <span>库存: {fm.stock} 个</span>
        </div>
      </div>

      <div className="flex gap-3 mt-4 w-full">
        <button
          onClick={() => onReplace(fm)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-colors ${
            expired
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
              : 'bg-coral/20 text-coral border border-coral/40 hover:bg-coral/30'
          }`}
        >
          <RotateCcw size={14} />
          更换
        </button>
        <button
          onClick={() => onRestock(fm.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-seaweed/20 text-seaweed border border-seaweed/40 hover:bg-seaweed/30 font-medium text-sm transition-colors"
        >
          <Plus size={14} />
          补货
        </button>
      </div>
    </div>
  );
}

function ReplaceModal({
  fm,
  onConfirm,
  onClose,
}: {
  fm: FilterMaterial;
  onConfirm: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-strong relative w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-serif font-bold text-foam">
            更换 {FILTER_MATERIAL_ICONS[fm.type]} {fm.type}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-foam/60 hover:text-foam transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="glass p-3 rounded-xl mb-4 space-y-1">
          <p className="text-sm text-foam/70">
            当前库存: <span className="text-foam font-medium">{fm.stock} 个</span>
          </p>
          <p className="text-sm text-foam/70">
            更换后库存: <span className="text-foam font-medium">{Math.max(0, fm.stock - 1)} 个</span>
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-foam/70 mb-1.5">更换备注</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
            placeholder="例：定期更换"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-foam/70 hover:bg-white/5 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-coral hover:bg-coral-light text-white font-medium transition-colors shadow-lg shadow-coral/20"
          >
            <RotateCcw size={16} />
            确认更换
          </button>
        </div>
      </div>
    </div>
  );
}

function ReplaceHistory({ tankId }: { tankId: string }) {
  const filterMaterials = useAquaStore((s) => s.filterMaterials);
  const tankMaterials = filterMaterials.filter((f) => f.tankId === tankId);

  const allRecords = tankMaterials.flatMap((fm) =>
    fm.replaceHistory.map((r) => ({
      ...r,
      type: fm.type,
      emoji: FILTER_MATERIAL_ICONS[fm.type],
    }))
  );

  const sorted = allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <History className="w-5 h-5 text-sand" />
        <h2 className="text-lg font-serif font-semibold text-foam">更换记录</h2>
      </div>

      {sorted.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-foam/40 text-sm">暂无更换记录</span>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
          <div className="space-y-4">
            {sorted.map((record) => (
              <div key={record.id} className="relative flex items-start gap-3">
                <div className="absolute left-[-20px] top-1.5 w-3 h-3 rounded-full bg-surface border-2 border-deep-sea" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{record.emoji}</span>
                    <span className="text-foam font-medium">{record.type}</span>
                    <span className="text-foam/40 text-xs">{record.date}</span>
                  </div>
                  {record.note && (
                    <p className="text-foam/60 text-xs mt-0.5 truncate">{record.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FilterMaterials() {
  const { filterMaterials, activeTankId, replaceFilterMaterial, updateFilterMaterial } = useAquaStore();
  const [replacing, setReplacing] = useState<FilterMaterial | null>(null);

  if (!activeTankId) {
    return (
      <div className="bubble-bg min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-2xl p-10 text-center max-w-md">
          <Package className="w-16 h-16 text-foam/30 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-semibold text-foam mb-2">还没有选择鱼缸</h2>
          <p className="text-foam-dark text-sm mb-6">请先创建或选择一个鱼缸，开始管理滤材</p>
          <Link
            to="/tank"
            className="inline-flex items-center gap-2 bg-surface hover:bg-shallow text-deep-sea font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            前往鱼缸
          </Link>
        </div>
      </div>
    );
  }

  const tankMaterials = filterMaterials.filter((f) => f.tankId === activeTankId);

  const handleReplace = (fm: FilterMaterial) => {
    setReplacing(fm);
  };

  const handleReplaceConfirm = (note: string) => {
    if (replacing) {
      replaceFilterMaterial(replacing.id, note);
    }
  };

  const handleRestock = (id: string) => {
    const fm = filterMaterials.find((f) => f.id === id);
    if (fm) {
      updateFilterMaterial(id, { stock: fm.stock + 1 });
    }
  };

  return (
    <div className="bubble-bg relative min-h-screen p-4 md:p-6 lg:p-8">
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-foam flex items-center gap-2">
          <Package size={28} className="text-coral" />
          滤材管理
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tankMaterials.map((fm) => (
            <MaterialCard
              key={fm.id}
              fm={fm}
              onReplace={handleReplace}
              onRestock={handleRestock}
            />
          ))}
        </div>

        <ReplaceHistory tankId={activeTankId} />
      </div>

      {replacing && (
        <ReplaceModal
          fm={replacing}
          onConfirm={handleReplaceConfirm}
          onClose={() => setReplacing(null)}
        />
      )}
    </div>
  );
}
