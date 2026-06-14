import {
  DISPLAY_STATUS_COLOR,
  DISPLAY_STATUS_LABEL,
  RESERVATION_STATUS_COLOR,
  RESERVATION_STATUS_LABEL,
  DISPLAY_INTERFACE_COLORS,
  type DisplayStatus,
  type ReservationStatus,
  type DisplayInterface,
} from '../types';

export function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={`chip ${DISPLAY_STATUS_COLOR[status]} text-white shadow-sm`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/90 mr-0.5" />
      {DISPLAY_STATUS_LABEL[status]}
    </span>
  );
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`chip border ${RESERVATION_STATUS_COLOR[status]}`}>
      {RESERVATION_STATUS_LABEL[status]}
    </span>
  );
}

export function InterfaceChip({ type }: { type: DisplayInterface }) {
  return (
    <span className={`chip ${DISPLAY_INTERFACE_COLORS[type]}`}>{type}</span>
  );
}
