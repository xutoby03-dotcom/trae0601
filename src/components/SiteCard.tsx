import { SamplingSite } from '@/types';
import { useSamplingStore } from '@/stores/useSamplingStore';
import { formatTime } from '@/utils/formatters';
import { calculateTideWindow, getUrgencyLevel } from '@/utils/tideCalculations';
import StatusBadge from './StatusBadge';
import { Shell, MapPin, Clock, Edit2, Trash2 } from 'lucide-react';
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

export default function SiteCard({ site, isSelected, onEdit }: SiteCardProps) {
  const { deleteSite, setSelectedSiteId, sampleRecords } = useSamplingStore();
  const tideWindow = calculateTideWindow(site);
  const urgency = getUrgencyLevel(tideWindow);
  const recordCount = sampleRecords.filter((r) => r.siteId === site.id).length;

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

  return (
    <div
      onClick={() => setSelectedSiteId(site.id)}
      className={cn(
        'relative p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-200',
        'bg-white shadow-sm hover:shadow-md',
        urgencyBorderColors[urgency],
        isSelected ? 'ring-2 ring-cyan-400 shadow-md scale-[1.01]' : 'ring-0'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-50">
            <Shell size={16} className="text-cyan-600" />
          </div>
          <h3 className="font-semibold text-slate-800 font-display">{site.name}</h3>
        </div>
        <div className="flex items-center gap-1">
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

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin size={13} className="text-slate-400" />
          <span className="truncate">{site.targetSpecies}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Clock size={13} className="text-slate-400" />
          <span className="font-mono">{formatTime(tideWindow.lowTide)} 低潮</span>
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
