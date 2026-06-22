import { MapPin, Calendar, Scale, FileText, Droplet, Package, AlertTriangle, Clock } from 'lucide-react';
import type { Specimen } from '@/types/specimen';
import DrynessProgress from '@/components/DrynessProgress';
import StatusBadge from '@/components/StatusBadge';
import ActionPanel from '@/components/ActionPanel';
import { formatDate, daysSince } from '@/utils/date';
import { getEstimatedCompletionDays, needsPaperChange, getNextPaperChangeInfo } from '@/utils/dryness';

interface SpecimenCardProps {
  specimen: Specimen;
}

export default function SpecimenCard({ specimen }: SpecimenCardProps) {
  const hasAlerts =
    specimen.hasMold || specimen.hasEdgeRoll || specimen.hasColorFade || specimen.hasMissingLabel;
  const pressedDays = daysSince(specimen.pressingDate);
  const estDays = getEstimatedCompletionDays(specimen);
  const needPaperChange = needsPaperChange(specimen);
  const nextPaperChange = getNextPaperChangeInfo(specimen);

  const alerts = [];
  if (specimen.hasMold) alerts.push('mold' as const);
  if (specimen.hasEdgeRoll) alerts.push('edgeRoll' as const);
  if (specimen.hasColorFade) alerts.push('colorFade' as const);
  if (specimen.hasMissingLabel) alerts.push('missingLabel' as const);

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 border ${
        specimen.isCompleted
          ? 'border-amber-200'
          : hasAlerts
          ? 'border-red-200'
          : 'border-forest-100'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-lg ${
              specimen.isCompleted
                ? 'bg-amber-100 text-warning-gold'
                : 'bg-forest-100 text-forest-600'
            }`}
          >
            {specimen.plantName.charAt(0)}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-800">
              {specimen.plantName}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {specimen.collectionLocation}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {specimen.isCompleted && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-warning-gold">
              已干燥
            </span>
          )}
          {needPaperChange && !specimen.isCompleted && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-forest-500 text-white animate-pulse-slow">
              需换纸
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4 text-xs">
        <div className="flex items-center gap-1.5 text-gray-600">
          <FileText className="w-3.5 h-3.5 text-forest-400" />
          <span>{specimen.plantPart}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar className="w-3.5 h-3.5 text-forest-400" />
          <span>{formatDate(specimen.pressingDate)} · {pressedDays}天</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Scale className="w-3.5 h-3.5 text-forest-400" />
          <span>{specimen.plateWeight}kg</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Droplet className="w-3.5 h-3.5 text-forest-400" />
          <span>已换纸 {specimen.paperChangeCount} 次</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Package className="w-3.5 h-3.5 text-forest-400" />
          <span className={!specimen.absorbentPaperBatch ? 'text-warning-orange font-semibold' : ''}>
            {specimen.absorbentPaperBatch || '未填写'}
          </span>
        </div>
        {!specimen.isCompleted && nextPaperChange.dateStr && (
          <div
            className={`flex items-center gap-1.5 ${
              nextPaperChange.isOverdue
                ? 'text-warning-danger font-semibold'
                : nextPaperChange.daysUntil <= 1
                ? 'text-warning-orange font-semibold'
                : 'text-gray-600'
            }`}
          >
            {nextPaperChange.isOverdue ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-forest-400" />
            )}
            <span>
              {nextPaperChange.isOverdue
                ? `换纸逾期 ${nextPaperChange.overdueDays} 天`
                : nextPaperChange.daysUntil === 0
                ? '今日需换纸'
                : `下次换纸 ${nextPaperChange.daysUntil}天后`}
            </span>
          </div>
        )}
      </div>

      {!specimen.isCompleted && nextPaperChange.dateStr && nextPaperChange.isOverdue && (
        <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 animate-pulse-slow">
          <AlertTriangle className="w-4 h-4 text-warning-danger shrink-0" />
          <span className="text-xs text-warning-danger font-semibold">
            换纸已逾期 {nextPaperChange.overdueDays} 天（应于 {nextPaperChange.dateStr} 换纸），请及时处理！
          </span>
        </div>
      )}

      <div className="mb-4">
        <DrynessProgress value={specimen.currentDryness} isCompleted={specimen.isCompleted} />
        {!specimen.isCompleted && estDays > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">预计还需约 {estDays} 天完成干燥</p>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {alerts.map((a) => (
            <StatusBadge key={a} type={a} />
          ))}
        </div>
      )}

      {specimen.notes && (
        <p className="text-xs text-gray-500 italic mb-4 px-3 py-2 bg-paper-50 rounded-lg border border-paper-200">
          "{specimen.notes}"
        </p>
      )}

      <div className="pt-3 border-t border-paper-100">
        <ActionPanel specimen={specimen} />
      </div>
    </div>
  );
}
