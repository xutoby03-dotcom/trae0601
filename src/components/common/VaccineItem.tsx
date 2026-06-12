import { Link } from 'react-router-dom';
import { Calendar, Hospital, FileImage, ChevronRight } from 'lucide-react';
import { Pet, VaccineRecord } from '../../../shared/types';
import { formatDate, humanizeDays, parseDate } from '../../utils/date';
import { today } from '../../utils/date';

interface VaccineItemProps {
  record: VaccineRecord;
  pet?: Pet;
  accent?: 'none' | 'orange' | 'red';
  onEdit?: () => void;
  compact?: boolean;
}

const accentClass = {
  none: '',
  orange: 'before:bg-orange-400',
  red: 'before:bg-rose-500',
};

export function VaccineItem({
  record,
  pet,
  accent = 'none',
  onEdit,
  compact,
}: VaccineItemProps) {
  const daysToDue = (() => {
    const d = Math.ceil(
      (parseDate(record.nextDueAt).getTime() - today().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return d;
  })();

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${accentClass[accent]}`}
    >
      <div className="flex flex-wrap items-start gap-3">
        {record.proofPhotoUrl ? (
          <img
            src={record.proofPhotoUrl}
            alt="证明"
            className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-slate-100"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg bg-amber-50 text-amber-500 ring-1 ring-amber-200">
            <FileImage className="h-5 w-5" />
            <span className="text-[10px] font-medium">缺证明</span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-slate-900">{record.vaccineName}</h4>
            {pet && (
              <Link
                to={`/pets/${pet.id}`}
                className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 transition hover:bg-emerald-100 hover:text-emerald-700"
              >
                {pet.type === 'dog' ? '🐶' : pet.type === 'cat' ? '🐱' : '🐾'}
                {pet.name} · {pet.building}
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
            {accent !== 'none' && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  accent === 'red'
                    ? 'bg-rose-100 text-rose-700 animate-pulse-badge'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {humanizeDays(daysToDue)}
              </span>
            )}
          </div>

          {!compact && (
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 sm:grid-cols-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                接种：{formatDate(record.vaccinatedAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                到期：{formatDate(record.nextDueAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Hospital className="h-3.5 w-3.5 text-slate-400" />
                {record.hospital}
              </div>
            </div>
          )}

          {record.remark && !compact && (
            <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
              💬 {record.remark}
            </p>
          )}
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 opacity-0 transition hover:bg-slate-100 hover:text-slate-800 group-hover:opacity-100"
          >
            编辑
          </button>
        )}
      </div>
    </div>
  );
}
