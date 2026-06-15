import { useAppStore } from '@/store/useAppStore';
import { MEDICATION_STATUS_LABELS } from '@/types';
import type { MedicationStatus } from '@/types';
import { CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';

interface Props {
  slotId: string;
  compact?: boolean;
}

const STATUSES: { status: MedicationStatus; icon: typeof CheckCircle2 }[] = [
  { status: 'taken', icon: CheckCircle2 },
  { status: 'missed', icon: XCircle },
  { status: 'vomited', icon: RefreshCcw },
];

export default function MedicationButtons({ slotId, compact = false }: Props) {
  const { getMedicationRecord, setMedicationStatus } = useAppStore();
  const record = getMedicationRecord(slotId);
  const current = record?.status;

  if (compact) {
    return (
      <div className={`flex gap-2 flex-wrap ${compact ? '' : ''}`}>
        {STATUSES.map(({ status, icon: Icon }) => {
          const label = MEDICATION_STATUS_LABELS[status];
          const isActive = current === status;
          return (
            <button
              key={status}
              onClick={() => setMedicationStatus(slotId, status)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                isActive
                  ? `${label.bg} ${label.color} shadow-md scale-105`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label.label}
            </button>
          );
        })}
        {current && (
          <span className="text-xs text-gray-400 self-center">
            {new Date(record!.recordedAt).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {STATUSES.map(({ status, icon: Icon }) => {
        const label = MEDICATION_STATUS_LABELS[status];
        const isActive = current === status;
        return (
          <button
            key={status}
            onClick={() => setMedicationStatus(slotId, status)}
            className={`flex flex-col items-center justify-center gap-2 py-5 rounded-3xl font-bold border-3 transition-all duration-300 ${
              isActive
                ? `${label.bg} ${label.color} border-3 shadow-lg scale-105`
                : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50'
            }`}
            style={{ borderWidth: isActive ? '3px' : '2px' }}
          >
            <Icon className={`${isActive ? 'h-10 w-10' : 'h-8 w-8'} transition-all`} strokeWidth={2} />
            <span className="text-lg">{label.label}</span>
            <span className="text-xs opacity-70 font-normal">
              {status === 'taken' && '按时服用完毕'}
              {status === 'missed' && '忘记服用'}
              {status === 'vomited' && '吐出需重服'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
