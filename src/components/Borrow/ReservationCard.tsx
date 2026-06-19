import { motion } from 'framer-motion';
import { Calendar, Package, CheckCircle, XCircle, RotateCcw, Eye, User } from 'lucide-react';
import type { BorrowRecord } from '@/types';
import { useBoxStore } from '@/store/useBoxStore';
import { useBorrowStore } from '@/store/useBorrowStore';
import { useFriendStore } from '@/store/useFriendStore';
import { getCategoryLabel, getBorrowStatusLabel } from '@/utils/condition';
import { formatDateCN } from '@/utils/date';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface BoxStoreType {
  getState: () => {
    updateBoxStatus: (id: string, status: string) => void;
    incrementUsageCount: (id: string) => void;
    updateBox: (id: string, data: { scrapReason?: string }) => void;
  };
}

interface ReservationCardProps {
  record: BorrowRecord;
  onPickup?: (recordId: string) => void;
  onCancel?: (recordId: string) => void;
  onReturnCheck?: (recordId: string) => void;
  onViewDetail?: (recordId: string) => void;
}

export default function ReservationCard({
  record,
  onPickup,
  onCancel,
  onReturnCheck,
  onViewDetail,
}: ReservationCardProps) {
  const { getBoxById } = useBoxStore();
  const { getFriendById } = useFriendStore();
  const { confirmPickup, cancelBorrow } = useBorrowStore();

  const box = getBoxById(record.boxId);
  const friend = getFriendById(record.friendId);

  const handlePickup = () => {
    if (onPickup) {
      onPickup(record.id);
    } else {
      confirmPickup(record.id, useBoxStore as unknown as BoxStoreType);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(record.id);
    } else {
      cancelBorrow(record.id, useBoxStore as unknown as BoxStoreType);
    }
  };

  const handleReturnCheck = () => {
    onReturnCheck?.(record.id);
  };

  const handleViewDetail = () => {
    onViewDetail?.(record.id);
  };

  if (!box || !friend) {
    return null;
  }

  const renderActions = () => {
    switch (record.status) {
      case 'pending':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <Button
              variant="primary"
              size="sm"
              onClick={handlePickup}
              className="flex-1"
            >
              <CheckCircle size={16} className="mr-1" />
              确认领取
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              className="flex-1"
            >
              <XCircle size={16} className="mr-1" />
              取消预约
            </Button>
          </motion.div>
        );
      case 'picked_up':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <Button
              variant="primary"
              size="sm"
              onClick={handleReturnCheck}
              className="flex-1"
            >
              <RotateCcw size={16} className="mr-1" />
              归还检查
            </Button>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={handleViewDetail}
              className="w-full"
            >
              <Eye size={16} className="mr-1" />
              查看详情
            </Button>
          </motion.div>
        );
    }
  };

  const statusVariant = (() => {
    switch (record.status) {
      case 'pending':
        return 'warning';
      case 'picked_up':
        return 'info';
      case 'returned':
        return 'success';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <span className="text-lg font-semibold text-primary">
                  {friend.name.charAt(0)}
                </span>
              </div>
            )}
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{friend.name}</p>
              <Badge variant={statusVariant}>{getBorrowStatusLabel(record.status)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{record.community}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Package size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">纸箱：</span>
          <span className="font-medium text-foreground">
            {getCategoryLabel(box.category)} ({box.length}×{box.width}×{box.height} cm)
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">时间：</span>
          <span className="font-medium text-foreground">
            {formatDateCN(record.reserveStartDate)} - {formatDateCN(record.reserveEndDate)}
          </span>
        </div>

        {record.actualPickupDate && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
            <span className="text-muted-foreground">领取：</span>
            <span className="font-medium text-green-600">
              {formatDateCN(record.actualPickupDate)}
            </span>
          </div>
        )}

        {record.actualReturnDate && (
          <div className="flex items-center gap-2 text-sm">
            <RotateCcw size={16} className="text-green-500 flex-shrink-0" />
            <span className="text-muted-foreground">归还：</span>
            <span className="font-medium text-green-600">
              {formatDateCN(record.actualReturnDate)}
            </span>
          </div>
        )}
      </div>

      {record.status === 'picked_up' && record.dampCheck !== undefined && (
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-sm">
          <User size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">检查：</span>
          <span className="text-foreground">
            受潮{record.dampCheck} · 破洞{record.holeCheck} · 胶带{record.tapeCheck}
          </span>
        </div>
      )}

      <div className="pt-2 border-t border-border">
        {renderActions()}
      </div>
    </motion.div>
  );
}
