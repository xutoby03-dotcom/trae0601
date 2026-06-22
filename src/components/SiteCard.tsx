import { SamplingSite } from '@/types';
import { useSamplingStore } from '@/stores/useSamplingStore';
import { formatTime } from '@/utils/formatters';
import { calculateTideWindow, getUrgencyLevel } from '@/utils/tideCalculations';
import { useNow, formatCountdown } from '@/hooks/useCountdown';
import StatusBadge from './StatusBadge';
import { Shell, MapPin, Clock, Edit2, Trash2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SiteCardProps {
  site: SamplingSite;
  isSelected: boolean;
  onEdit: (site: SamplingSite) => void;
}

const urgencyBorderColors: Record<string, string> = {
  safe: 'border-l-emerald-400',
  warning: 'border-l-amber-400',
  critical: 'border-l-orange-500',
  expired: 'border-l-slate-300',
};

const countdownLevelStyles = {
  safe: {
    departure: {
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
      text: 'text-slate-600',
      pulse: '',
    },
    evacuate: {
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
      text: 'text-slate-600',
      pulse: '',
    },
  },
  urgent: {
    departure: {
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      text: 'text-amber-700',
      pulse: 'animate-pulse',
    },
    evacuate: {
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
      text: 'text-slate-600',
      pulse: '',
    },
  },
  critical: {
    departure: {
      badge: 'bg-red-100 text-red-700 border-red-200',
      text: 'text-red-700',
      pulse: 'animate-pulse',
    },
    evacuate: {
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      text: 'text-amber-700',
      pulse: '',
    },
  },
  missed: {
    departure: {
      badge: 'bg-slate-500 text-white border-slate-500',
      text: 'text-slate-500',
      pulse: '',
    },
    evacuate: {
      badge: 'bg-red-100 text-red-700 border-red-200',
      text: 'text-red-700',
      pulse: 'animate-pulse',
    },
  },
};

export default function SiteCard({ site, isSelected, onEdit }: SiteCardProps) {
  const { deleteSite, setSelectedSiteId, sampleRecords } = useSamplingStore();
  const now = useNow(20000);
  const tideWindow = calculateTideWindow(site);
  const urgency = getUrgencyLevel(tideWindow);
  const recordCount = sampleRecords.filter((r) => r.siteId === site.id).length;

  const departureCountdown = formatCountdown(tideWindow.latestDeparture, now);
  const evacuateCountdown = formatCountdown(tideWindow.mustEvacuate, now);

  const depLevel = departureCountdown.level;
  const evLevel = evacuateCountdown.level;

  const depStyles = countdownLevelStyles[depLevel].departure;
  const evStyles = countdownLevelStyles[evLevel].evacuate;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除点位「${site.name}」吗？相关采样记录也会被删除。`)) {
      deleteSite(site.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(site);
  };

  const showUrgentBanner = depLevel !== 'safe';
  const isMissedDeparture = depLevel === 'missed';

  return (
    <div
      onClick={() => setSelectedSiteId(site.id)}
      className={cn(
        'relative p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-200',
        'bg-white shadow-sm hover:shadow-md',
        urgencyBorderColors[urgency],
        isSelected ? 'ring-2 ring-cyan-400 shadow-md scale-[1.01]' : 'ring-0',
        isMissedDeparture && 'opacity-80'
      )}
    >
      {showUrgentBanner && (
        <div className={cn(
          'absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0',
          isMissedDeparture
            ? 'bg-slate-600 text-white'
            : depLevel === 'critical'
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-amber-500 text-white animate-pulse'
        )}>
          <AlertCircle size={10} />
          {isMissedDeparture ? '已错过出发' : '快到点'}
        </div>
      )}

      <div className="flex items-start justify-between mb-3 pr-12">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-50">
            <Shell size={16} className="text-cyan-600" />
          </div>
          <h3 className="font-semibold text-slate-800 font-display">{site.name}</h3>
        </div>
        <div className="flex items-center gap-1 absolute top-3 right-12">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
            title="编辑"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin size={13} className="text-slate-400" />
          <span className="truncate">{site.targetSpecies}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Clock size={13} className="text-slate-400" />
          <span className="font-mono">{formatTime(tideWindow.lowTide)} 低潮</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="relative">
          <div className="text-[10px] text-slate-400 mb-1">最晚出发 {formatTime(tideWindow.latestDeparture)}</div>
          <span className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium',
            depStyles.badge,
            depStyles.pulse
          )}>
            {departureCountdown.level === 'missed' && <XCircle size={10} />}
            {departureCountdown.text}
          </span>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 mb-1">必须撤离 {formatTime(tideWindow.mustEvacuate)}</div>
          <span className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium',
            evStyles.badge,
            evStyles.pulse
          )}>
            {evacuateCountdown.level === 'missed' && <XCircle size={10} />}
            {evacuateCountdown.text}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <StatusBadge status={site.permitStatus} />
        <span className="text-xs text-slate-500">
          {recordCount} 条记录
        </span>
      </div>
    </div>
  );
}
