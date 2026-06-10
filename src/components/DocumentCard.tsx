import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, BellRing } from 'lucide-react';
import type { Document } from '@/types';
import { DOCUMENT_TYPE_LABELS } from '@/types';
import { DocumentIcon } from './DocumentIcon';
import { StatusBadge } from './StatusBadge';
import { getDocumentStatus, formatExpiryDisplay, getDaysUntilExpiry } from '@/utils/dateUtils';

interface DocumentCardProps {
  document: Document;
  delay?: number;
}

export const DocumentCard = ({ document: doc, delay = 0 }: DocumentCardProps) => {
  const status = getDocumentStatus(doc);
  const expiryInfo = formatExpiryDisplay(doc.expireDate);
  const daysUntil = getDaysUntilExpiry(doc.expireDate);
  const needsReminder = daysUntil !== Infinity && daysUntil <= doc.remindDays && daysUntil >= 0;
  const isExpired = status === 'expired';

  return (
    <Link
      to={`/document/${doc.id}`}
      className={`block p-4 rounded-xl bg-white card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in-up ${
        isExpired ? 'border-2 border-red-400 animate-pulse-border' : 'border border-slate-100'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <DocumentIcon type={doc.type} className="w-5 h-5" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-slate-800">
                {DOCUMENT_TYPE_LABELS[doc.type]}
              </h3>
              <p className="text-sm text-slate-500">持有人：{doc.holder}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {needsReminder && (
                <BellRing className="w-4 h-4 text-accent-500" />
              )}
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className={expiryInfo.colorClass}>
                {expiryInfo.text}
              </span>
            </div>

            {doc.issueLocation && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{doc.issueLocation}</span>
              </div>
            )}

            {doc.needAnnualReview && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>需要年审</span>
              </div>
            )}

            {doc.remindDays > 0 && daysUntil !== Infinity && (
              <div className="text-xs text-primary-500">
                提醒：提前 {doc.remindDays} 天
              </div>
            )}
          </div>
        </div>
      </div>

      {doc.notes && (
        <p className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500 line-clamp-2">
          {doc.notes}
        </p>
      )}
    </Link>
  );
};
