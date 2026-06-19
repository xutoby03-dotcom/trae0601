import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, Calendar, ArrowRight, Check, X } from 'lucide-react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { useFriendStore } from '@/store/useFriendStore';
import { useBoxStore } from '@/store/useBoxStore';
import { getCategoryLabel, getBorrowStatusLabel, isDateOverlap } from '@/utils/condition';
import { formatDateCN } from '@/utils/date';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';

export default function ConflictsBoard() {
  const navigate = useNavigate();
  const borrowRecords = useBorrowStore((state) => state.borrowRecords);
  const cancelBorrow = useBorrowStore((state) => state.cancelBorrow);
  const getFriendById = useFriendStore((state) => state.getFriendById);
  const getBoxById = useBoxStore((state) => state.getBoxById);

  const conflicts = useMemo(() => {
    const activeRecords = borrowRecords.filter(
      (r) => r.status !== 'cancelled' && r.status !== 'returned'
    );

    const boxGroups = new Map<string, typeof activeRecords>();
    activeRecords.forEach((r) => {
      if (!boxGroups.has(r.boxId)) {
        boxGroups.set(r.boxId, []);
      }
      boxGroups.get(r.boxId)!.push(r);
    });

    const result: Array<{ boxId: string; records: typeof activeRecords }> = [];

    boxGroups.forEach((records, boxId) => {
      for (let i = 0; i < records.length; i++) {
        for (let j = i + 1; j < records.length; j++) {
          if (
            isDateOverlap(
              records[i].reserveStartDate,
              records[i].reserveEndDate,
              records[j].reserveStartDate,
              records[j].reserveEndDate
            )
          ) {
            const existing = result.find((c) => c.boxId === boxId);
            if (existing) {
              if (!existing.records.find((r) => r.id === records[i].id)) {
                existing.records.push(records[i]);
              }
              if (!existing.records.find((r) => r.id === records[j].id)) {
                existing.records.push(records[j]);
              }
            } else {
              result.push({ boxId, records: [records[i], records[j]] });
            }
          }
        }
      }
    });

    return result;
  }, [borrowRecords]);

  const handleCancel = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    cancelBorrow(recordId, { getState: () => ({ updateBoxStatus: () => {}, incrementUsageCount: () => {}, updateBox: () => {} }) });
  };

  const handleViewAll = () => {
    navigate('/borrow');
  };

  if (conflicts.length === 0) {
    return (
      <div onClick={handleViewAll} className="cursor-pointer">
        <Card title="预约冲突" hoverable>
          <Empty
            icon={<span className="text-4xl">🎉</span>}
            title="暂无预约冲突"
            description="所有预约安排井然有序"
          />
        </Card>
      </div>
    );
  }

  return (
    <div onClick={handleViewAll} className="cursor-pointer">
      <Card title="预约冲突" hoverable>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
      >
        <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
        <span className="text-red-700 font-medium">
          检测到 {conflicts.length} 个预约冲突，请及时处理
        </span>
      </motion.div>

      <div className="space-y-4">
        {conflicts.map((conflict, index) => {
          const box = getBoxById(conflict.boxId);
          const [record1, record2] = conflict.records;
          const friend1 = getFriendById(record1.friendId);
          const friend2 = getFriendById(record2.friendId);

          return (
            <motion.div
              key={conflict.boxId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/borrow');
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={16} className="text-red-600" />
                </div>
                <span className="font-semibold text-red-700">
                  纸箱冲突：{box ? `${getCategoryLabel(box.category)} · ${box.length}×${box.width}×${box.height}cm` : '未知纸箱'}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-white rounded-lg p-3 border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={14} className="text-muted-foreground" />
                    <span className="font-medium text-foreground">{friend1?.name || '未知用户'}</span>
                    <Badge variant="info">{getBorrowStatusLabel(record1.status)}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar size={12} />
                    <span>
                      {formatDateCN(record1.reserveStartDate)} - {formatDateCN(record1.reserveEndDate)}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <ArrowRight size={20} className="text-red-400" />
                </div>

                <div className="flex-1 bg-white rounded-lg p-3 border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={14} className="text-muted-foreground" />
                    <span className="font-medium text-foreground">{friend2?.name || '未知用户'}</span>
                    <Badge variant="info">{getBorrowStatusLabel(record2.status)}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar size={12} />
                    <span>
                      {formatDateCN(record2.reserveStartDate)} - {formatDateCN(record2.reserveEndDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-red-600 hover:bg-red-100"
                  onClick={(e) => handleCancel(record1.id, e)}
                >
                  <X size={14} className="mr-1" />
                  取消 {friend1?.name} 的预约
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-red-600 hover:bg-red-100"
                  onClick={(e) => handleCancel(record2.id, e)}
                >
                  <X size={14} className="mr-1" />
                  取消 {friend2?.name} 的预约
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/borrow');
                  }}
                >
                  <Check size={14} className="mr-1" />
                  手动处理
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
      </Card>
    </div>
  );
}
