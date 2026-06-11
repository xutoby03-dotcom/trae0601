import { useState, useRef } from 'react';
import { useStore } from '@/store';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { DamageLevel } from '@/types';
import {
  Upload,
  Camera,
  X,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  User,
  MapPin,
  CalendarClock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDateTime } from '@/utils/helpers';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  ladderId?: string;
}

export default function ReturnModal({ isOpen, onClose, ladderId }: ReturnModalProps) {
  const { borrowRecords, reservations, ladders, returnRecords, confirmReturn } = useStore();
  const { showToast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const unreturnedBorrows = borrowRecords.filter((br) => {
    if (returnRecords.some((rr) => rr.borrowRecordId === br.id)) return false;
    if (ladderId) {
      const r = reservations.find((res) => res.id === br.reservationId);
      if (r?.ladderId !== ladderId) return false;
    }
    return true;
  }).sort((a, b) => new Date(a.borrowTime).getTime() - new Date(b.borrowTime).getTime());

  const handleConfirm = (
    borrowRecordId: string,
    damageLevel: DamageLevel,
    damageDescription: string,
    damagePhoto?: string
  ) => {
    setProcessing(true);
    setTimeout(() => {
      const result = confirmReturn(borrowRecordId, damageLevel, damageDescription, damagePhoto);
      setProcessing(false);

      if (result.success) {
        showToast(result.message, 'success');
        onClose();
      } else {
        showToast(result.message, 'error');
      }
    }, 400);
  };

  const renderBorrowCard = (borrowId: string) => {
    const borrow = borrowRecords.find((b) => b.id === borrowId);
    if (!borrow) return null;
    const reservation = reservations.find((r) => r.id === borrow.reservationId);
    if (!reservation) return null;
    const ladder = ladders.find((l) => l.id === reservation.ladderId);
    const isExpanded = expandedId === borrowId;

    return (
      <ReturnCardInner
        key={borrowId}
        borrowId={borrowId}
        borrowerName={reservation.borrowerName}
        building={reservation.building}
        ladderName={ladder?.name || ''}
        ladderType={ladder?.type || ''}
        borrowTime={borrow.borrowTime}
        expectedEndTime={reservation.expectedEndTime}
        purpose={reservation.purpose}
        phone={reservation.phone}
        isExpanded={isExpanded}
        onToggle={() => setExpandedId(isExpanded ? null : borrowId)}
        onConfirm={handleConfirm}
        processing={processing}
      />
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="归还登记"
      subtitle="选择需归还的借出记录，检查并记录损坏情况"
      maxWidth="max-w-2xl"
    >
      {unreturnedBorrows.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-mint-50 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-mint-500" />
          </div>
          <p className="text-slate-500">所有借出的梯子都已归还 🎉</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2 -mr-2">
          {unreturnedBorrows.map((b) => renderBorrowCard(b.id))}
        </div>
      )}
    </Modal>
  );
}

interface ReturnCardInnerProps {
  borrowId: string;
  borrowerName: string;
  building: string;
  ladderName: string;
  ladderType: string;
  borrowTime: string;
  expectedEndTime: string;
  purpose: string;
  phone: string;
  isExpanded: boolean;
  onToggle: () => void;
  onConfirm: (
    id: string,
    level: DamageLevel,
    desc: string,
    photo?: string
  ) => void;
  processing: boolean;
}

function ReturnCardInner({
  borrowId,
  borrowerName,
  building,
  ladderName,
  ladderType,
  borrowTime,
  expectedEndTime,
  purpose,
  phone,
  isExpanded,
  onToggle,
  onConfirm,
  processing,
}: ReturnCardInnerProps) {
  const [damageLevel, setDamageLevel] = useState<DamageLevel>(DamageLevel.NONE);
  const [damageDescription, setDamageDescription] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const damageOptions = [
    { value: DamageLevel.NONE, label: '无损坏', icon: ShieldCheck, color: 'mint' },
    { value: DamageLevel.MINOR, label: '轻微损坏', icon: Wrench, color: 'amber' },
    { value: DamageLevel.SEVERE, label: '严重损坏', icon: AlertTriangle, color: 'danger' },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setDamageLevel(DamageLevel.NONE);
    setDamageDescription('');
    setPhoto(undefined);
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-mint-300">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-mint-100 to-mint-200 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-mint-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-semibold text-slate-800 truncate">{borrowerName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {ladderName}
              </span>
              <span className="text-xs text-slate-400">{ladderType}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span>{building}</span>
              <span>·</span>
              <span>借出 {formatDateTime(borrowTime)}</span>
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
          <div className="pt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <MiniInfo icon={User} label="借用人" value={borrowerName} />
              <MiniInfo icon={MapPin} label="楼栋" value={building} />
              <MiniInfo icon={CalendarClock} label="借出时间" value={formatDateTime(borrowTime)} compact />
              <MiniInfo icon={CalendarClock} label="预计归还" value={formatDateTime(expectedEndTime)} compact />
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-700 mb-1">
                <span className="px-1.5 py-0.5 rounded bg-amber-100">用途</span>
                <span>{purpose}</span>
              </div>
              <div className="text-xs text-amber-600">联系电话：{phone}</div>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <span>损坏程度检查</span>
                <span className="text-xs text-slate-400">（必填）</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {damageOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = damageLevel === opt.value;
                  const colorMap: Record<string, string> = {
                    mint: isActive
                      ? 'bg-mint-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.35)] border-mint-500'
                      : 'bg-white hover:bg-mint-50 border-mint-200 text-mint-700 hover:border-mint-300',
                    amber: isActive
                      ? 'bg-amber-500 text-white shadow-[0_0_16px_rgba(245,158,11,0.35)] border-amber-500'
                      : 'bg-white hover:bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-300',
                    danger: isActive
                      ? 'bg-danger-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.35)] border-danger-500'
                      : 'bg-white hover:bg-danger-50 border-danger-200 text-danger-700 hover:border-danger-300',
                  };
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDamageLevel(opt.value)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${colorMap[opt.color]}`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {(damageLevel === DamageLevel.MINOR || damageLevel === DamageLevel.SEVERE) && (
              <>
                <div>
                  <label className="label">损坏描述</label>
                  <textarea
                    value={damageDescription}
                    onChange={(e) => setDamageDescription(e.target.value)}
                    rows={3}
                    placeholder="请详细描述损坏位置和情况..."
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="label">拍照记录（可选）</label>
                  <div className="flex gap-3 flex-wrap items-stretch">
                    {photo ? (
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-amber-200 shadow-sm">
                        <img src={photo} alt="损坏照片" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhoto(undefined)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-600"
                        >
                          <Upload className="w-6 h-6" strokeWidth={1.8} />
                          <span className="text-xs font-medium">上传照片</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-600"
                        >
                          <Camera className="w-6 h-6" strokeWidth={1.8} />
                          <span className="text-xs font-medium">拍照</span>
                        </button>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onToggle();
                }}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => {
                  onConfirm(borrowId, damageLevel, damageDescription, photo);
                  resetForm();
                }}
                className="flex-[2] btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-5 h-5" />
                {processing ? '登记中...' : '确认归还'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniInfo({
  icon: Icon,
  label,
  value,
  compact,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="p-2.5 rounded-xl bg-white border border-slate-100">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] text-slate-400">{label}</span>
      </div>
      <div className={`text-xs text-slate-700 font-medium ${compact ? '' : 'truncate'}`}>{value}</div>
    </div>
  );
}
