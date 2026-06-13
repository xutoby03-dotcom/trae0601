import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Vaccine, Child } from '@/types';
import StatusBadge from '../ui/StatusBadge';
import {
  Calendar,
  MapPin,
  Ticket,
  FileText,
  Edit,
  Trash2,
  CalendarCheck,
  CheckCircle,
  AlertOctagon,
  History,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { formatDate, formatDateTime, friendlyDateDiff } from '@/utils/date';

interface VaccineCardProps {
  vaccine: Vaccine;
  child?: Child;
  onEdit?: () => void;
  onDelete?: () => void;
  onAppoint?: () => void;
  onComplete?: () => void;
  onDelay?: () => void;
}

const STATUS_COLORS = {
  pending: 'bg-info-400',
  appointed: 'bg-accent-400',
  completed: 'bg-primary-500',
  overdue: 'bg-danger-500',
};

export default function VaccineCard({
  vaccine,
  child,
  onEdit,
  onDelete,
  onAppoint,
  onComplete,
  onDelay,
}: VaccineCardProps) {
  const showActions = vaccine.status !== 'completed';
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 1800);
    return () => clearTimeout(t);
  }, [showToast]);

  const buildCopyText = () => {
    const lines: string[] = [];
    if (child?.name) lines.push(`【${child.name}】疫苗提醒`);
    lines.push(`疫苗：${vaccine.name} 第${vaccine.dose}剂`);
    lines.push(`推荐接种：${formatDate(vaccine.suggestedDate)}`);
    lines.push(`最晚接种：${formatDate(vaccine.latestDate)}`);
    if (child?.vaccinationSite) lines.push(`接种点：${child.vaccinationSite}`);
    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = buildCopyText();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setShowToast(true);
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  const statusBar = (
    <>
      <div className={`status-bar ${STATUS_COLORS[vaccine.status]}`} />
      {showToast &&
        createPortal(
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-fade-in-up">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white text-sm shadow-2xl backdrop-blur-md border border-white/10">
              <CheckCheck className="w-4 h-4 text-primary-400" />
              <span>已复制给家人 ✓</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );

  return (
    <div className="relative card card-hover overflow-hidden p-5 pl-6 animate-fade-in-up">
      {statusBar}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-slate-800 text-lg">
              {vaccine.name}
            </h3>
            <span className="chip bg-primary-50 text-primary-700 border border-primary-100">
              第 {vaccine.dose} 剂
            </span>
            {child && (
              <span className="chip bg-slate-100 text-slate-600">
                {child.name}
              </span>
            )}
          </div>
          <StatusBadge status={vaccine.status} />
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handleCopy}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-accent-600 hover:bg-accent-50 flex items-center justify-center transition-colors"
            title="复制给家人"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 flex items-center justify-center transition-colors"
            title="编辑"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`确定删除 ${vaccine.name} 第${vaccine.dose}剂？`)) {
                onDelete?.();
              }
            }}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 flex items-center justify-center transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
        <div className="text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-info-500 shrink-0" />
            <span>
              建议：{formatDate(vaccine.suggestedDate)}
            </span>
            <span className="text-xs text-slate-400">
              ({friendlyDateDiff(vaccine.suggestedDate)})
            </span>
          </div>
          {vaccine.originalSuggestedDate &&
            vaccine.originalSuggestedDate !== vaccine.suggestedDate && (
              <div className="flex items-center gap-2 mt-1 ml-6 text-xs text-slate-500">
                <History className="w-3 h-3" />
                <span>
                  原计划：
                  <span className="line-through text-slate-400">
                    {vaccine.originalSuggestedDate}
                  </span>
                  <span className="mx-1 text-slate-300">→</span>
                  <span className="text-info-600 font-medium">
                    已推迟至 {formatDate(vaccine.suggestedDate)}
                  </span>
                </span>
              </div>
            )}
        </div>
        <div className="text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-danger-500 shrink-0" />
            <span>最晚：{formatDate(vaccine.latestDate)}</span>
          </div>
          {vaccine.originalLatestDate &&
            vaccine.originalLatestDate !== vaccine.latestDate && (
              <div className="flex items-center gap-2 mt-1 ml-6 text-xs text-slate-500">
                <History className="w-3 h-3" />
                <span>
                  原最晚：
                  <span className="line-through text-slate-400">
                    {vaccine.originalLatestDate}
                  </span>
                  <span className="mx-1 text-slate-300">→</span>
                  <span className="text-danger-600 font-medium">
                    新截止 {formatDate(vaccine.latestDate)}
                  </span>
                </span>
              </div>
            )}
        </div>
      </div>

      {vaccine.status === 'appointed' && (
        <div className="mb-4 p-3 rounded-xl bg-accent-50/60 border border-accent-100 space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <CalendarCheck className="w-4 h-4 text-accent-600" />
            <span className="text-accent-700 font-medium">
              预约：{vaccine.appointmentTime}
            </span>
          </div>
          {vaccine.appointmentLocation && (
            <div className="flex items-center gap-2 text-sm text-slate-600 pl-6">
              <MapPin className="w-3.5 h-3.5" />
              <span>{vaccine.appointmentLocation}</span>
            </div>
          )}
          {vaccine.queueNumber && (
            <div className="flex items-center gap-2 text-sm text-slate-600 pl-6">
              <Ticket className="w-3.5 h-3.5" />
              <span>排队号 {vaccine.queueNumber}</span>
            </div>
          )}
        </div>
      )}

      {vaccine.status === 'completed' && (
        <div className="mb-4 p-3 rounded-xl bg-primary-50/60 border border-primary-100 space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-primary-600" />
            <span className="text-primary-700 font-medium">
              实际接种：{vaccine.actualDate && formatDate(vaccine.actualDate)}
            </span>
          </div>
          {vaccine.proofPhoto && (
            <div className="pl-6">
              <img
                src={vaccine.proofPhoto}
                alt="接种凭证"
                className="w-20 h-20 rounded-lg object-cover border border-primary-200"
              />
            </div>
          )}
          {vaccine.reaction && (
            <div className="flex items-start gap-2 text-sm text-slate-600 pl-6">
              <FileText className="w-3.5 h-3.5 mt-0.5" />
              <span>反应：{vaccine.reaction}</span>
            </div>
          )}
        </div>
      )}

      {vaccine.delayedCount > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-danger-50/50 border border-danger-100 space-y-1.5">
          <div className="text-xs font-medium text-danger-600">
            ⚠️ 已延期 {vaccine.delayedCount} 次
            {vaccine.delayedReason && `：${vaccine.delayedReason}`}
          </div>
          {(vaccine.originalSuggestedDate || vaccine.originalLatestDate) && (
            <div className="text-[11px] text-danger-500/80 flex items-center gap-3 flex-wrap">
              {vaccine.originalSuggestedDate &&
                vaccine.originalSuggestedDate !== vaccine.suggestedDate && (
                  <span>
                    原计划{' '}
                    <span className="line-through">{vaccine.originalSuggestedDate}</span> →{' '}
                    <span className="font-medium">{formatDate(vaccine.suggestedDate)}</span>
                  </span>
                )}
              {vaccine.originalLatestDate &&
                vaccine.originalLatestDate !== vaccine.latestDate && (
                  <span>
                    原截止{' '}
                    <span className="line-through">{vaccine.originalLatestDate}</span> →{' '}
                    <span className="font-medium">{formatDate(vaccine.latestDate)}</span>
                  </span>
                )}
            </div>
          )}
        </div>
      )}

      {vaccine.notes && (
        <div className="mb-4 flex items-start gap-2 text-xs text-slate-500">
          <FileText className="w-3.5 h-3.5 mt-0.5" />
          <span>备注：{vaccine.notes}</span>
        </div>
      )}

      {showActions && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap">
          {vaccine.status !== 'appointed' && (
            <button onClick={onAppoint} className="btn-accent btn-sm">
              <CalendarCheck className="w-4 h-4" />
              登记预约
            </button>
          )}
          {vaccine.status === 'appointed' && (
            <button onClick={onAppoint} className="btn-secondary btn-sm">
              <Edit className="w-4 h-4" />
              修改预约
            </button>
          )}
          <button onClick={onComplete} className="btn-primary btn-sm">
            <CheckCircle className="w-4 h-4" />
            完成接种
          </button>
          {vaccine.status !== 'appointed' && (
            <button onClick={onDelay} className="btn-ghost btn-sm text-danger-600 hover:text-danger-700 hover:bg-danger-50">
              <AlertOctagon className="w-4 h-4" />
              登记延期
            </button>
          )}
        </div>
      )}
    </div>
  );
}
