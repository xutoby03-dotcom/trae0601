import { DoctorMark, DOCTOR_MARK_LABELS, DOCTOR_MARK_COLORS } from '@/types';

interface Props {
  mark: DoctorMark;
}

export default function StatusTag({ mark }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DOCTOR_MARK_COLORS[mark]}`}
    >
      {DOCTOR_MARK_LABELS[mark]}
    </span>
  );
}
