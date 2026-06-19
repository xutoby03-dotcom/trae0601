import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, User, Package } from 'lucide-react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { useFriendStore } from '@/store/useFriendStore';
import { useBoxStore } from '@/store/useBoxStore';
import { getDaysFromNow, getCategoryLabel } from '@/utils/condition';
import { isOverdue, daysBetween, formatDateCN } from '@/utils/date';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';

export default function PendingReturnsBoard() {
  const navigate = useNavigate();
  const borrowRecords = useBorrowStore((state) => state.borrowRecords);
  const getFriendById = useFriendStore((state) => state.getFriendById);
  const getBoxById = useBoxStore((state) => state.getBoxById);

  const pendingReturns = useMemo(() => {
    return borrowRecords
      .filter((r) => r.status === 'picked_up')
      .sort((a, b) => new Date(a.reserveEndDate).getTime() - new Date(b.reserveEndDate).getTime());
  }, [borrowRecords]);

  const getReturnStatus = (dateStr: string) => {
    if (isOverdue(dateStr)) {
      const overdueDays = daysBetween(dateStr, new Date().toISOString().split('T')[0]);
      return { type: 'overdue', label: `逾期${overdueDays}天`, color: 'danger' as const };
    }
    const daysUntil = getDaysFromNow(dateStr);
    if (daysUntil <= 3) {
      return { type: 'warning', label: `还有${daysUntil}天`, color: 'warning' as const };
    }
    return { type: 'normal', label: `还有${daysUntil}天`, color: 'info' as const };
  };

  const handleClick = () => {
    navigate('/borrow');
  };

  if (pendingReturns.length === 0) {
    return (
      <div onClick={handleClick} className="cursor-pointer">
        <Card title="待归还纸箱" hoverable>
          <Empty
            icon={<Package size={32} className="text-muted-foreground" />}
            title="暂无待归还纸箱"
            description="所有纸箱都已按时归还"
          />
        </Card>
      </div>
    );
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Card title="待归还纸箱" hoverable>
        <div className="space-y-3">
        {pendingReturns.map((record, index) => {
          const friend = getFriendById(record.friendId);
          const box = getBoxById(record.boxId);
          const status = getReturnStatus(record.reserveEndDate);

          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                'p-4 rounded-xl border transition-colors cursor-pointer',
                status.type === 'overdue'
                  ? 'bg-red-50 border-red-200 hover:bg-red-100'
                  : status.type === 'warning'
                  ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                  : 'bg-white border-border hover:bg-muted/50'
              )}
              onClick={(e) => {
                e.stopPropagation();
                navigate('/borrow');
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      status.type === 'overdue'
                        ? 'bg-red-100'
                        : status.type === 'warning'
                        ? 'bg-orange-100'
                        : 'bg-blue-100'
                    )}
                  >
                    {status.type === 'overdue' ? (
                      <AlertTriangle size={20} className="text-red-600" />
                    ) : (
                      <Clock
                        size={20}
                        className={status.type === 'warning' ? 'text-orange-600' : 'text-blue-600'}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        {friend?.name || '未知用户'}
                      </span>
                      <Badge variant={status.color} className="flex-shrink-0">
                        {status.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package size={14} className="flex-shrink-0" />
                      <span className="truncate">
                        {box ? `${getCategoryLabel(box.category)} · ${box.length}×${box.width}×${box.height}cm` : '未知纸箱'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock size={14} className="flex-shrink-0" />
                      <span>预计归还：{formatDateCN(record.reserveEndDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      </Card>
    </div>
  );
}
