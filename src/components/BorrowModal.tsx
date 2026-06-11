import { useState } from 'react';
import { useStore } from '@/store';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { Reservation } from '@/types';
import {
  CalendarClock,
  MapPin,
  User,
  Phone,
  PackageOpen,
  HandHelping,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDateTime } from '@/utils/helpers';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  ladderId?: string;
}

export default function BorrowModal({ isOpen, onClose, ladderId }: BorrowModalProps) {
  const { reservations, ladders, confirmBorrow, getLadderCurrentReservation } = useStore();
  const { showToast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const pendingReservations = reservations.filter((r) => {
    if (r.status !== 'pending') return false;
    if (ladderId && r.ladderId !== ladderId) return false;
    return true;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleConfirm = async (reservationId: string) => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = confirmBorrow(reservationId);
    setProcessing(false);

    if (result.success) {
      showToast(result.message, 'success');
      onClose();
    } else {
      showToast(result.message, 'error');
    }
  };

  const renderReservationCard = (r: Reservation) => {
    const ladder = ladders.find((l) => l.id === r.ladderId);
    const isExpanded = expandedId === r.id;

    return (
      <div
        key={r.id}
        className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-amber-300"
      >
        <button
          onClick={() => setExpandedId(isExpanded ? null : r.id)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
              <PackageOpen className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-slate-800 truncate">{r.borrowerName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {r.building}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{ladder?.name}</span>
                <span>·</span>
                <span>{formatDateTime(r.startTime)}</span>
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50">
            <div className="pt-4 space-y-3 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={User} label="借用人" value={r.borrowerName} />
                <InfoRow icon={MapPin} label="楼栋" value={r.building} />
                <InfoRow icon={Phone} label="联系电话" value={r.phone} />
                <InfoRow
                  icon={HandHelping}
                  label="搬移协助"
                  value={r.needHelp ? '需要帮忙搬运' : '自行取用'}
                />
              </div>
              <InfoRow
                icon={CalendarClock}
                label="借用时段"
                value={`${formatDateTime(r.startTime)} → ${formatDateTime(r.expectedEndTime)}`}
              />
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-xs font-medium text-amber-700 px-2 py-0.5 rounded-md bg-amber-100 flex-shrink-0">
                  用途
                </span>
                <span className="text-sm text-amber-900">{r.purpose}</span>
              </div>
            </div>

            <button
              onClick={() => handleConfirm(r.id)}
              disabled={processing}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5" />
              {processing ? '登记中...' : '确认借出登记'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="借出登记"
      subtitle="请选择待借出的预约单进行确认"
      maxWidth="max-w-xl"
    >
      {pendingReservations.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <PackageOpen className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">暂无待借出的预约记录</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
          {pendingReservations.map(renderReservationCard)}
        </div>
      )}
    </Modal>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-400 mb-0.5">{label}</div>
        <div className="text-sm text-slate-700 font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
