import { motion } from 'framer-motion';
import { Calendar, MapPin, User, CheckCircle, AlertCircle, Package } from 'lucide-react';
import type { BorrowRecord } from '@/types';
import { useFriendStore } from '@/store/useFriendStore';
import { formatDateCN } from '@/utils/date';
import { getBorrowStatusLabel, getBorrowStatusColor } from '@/utils/condition';
import Badge from '@/components/ui/Badge';

interface BorrowTimelineProps {
  borrowRecords: BorrowRecord[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function BorrowTimeline({ borrowRecords }: BorrowTimelineProps) {
  const { getFriendById } = useFriendStore();

  if (borrowRecords.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="mx-auto mb-2" size={48} opacity={0.3} />
        <p>暂无借还记录</p>
      </div>
    );
  }

  const renderCheckResult = (label: string, value?: number) => {
    if (value === undefined) return null;
    const isGood = value <= 1;
    return (
      <div className="flex items-center gap-1.5">
        {isGood ? (
          <CheckCircle size={14} className="text-green-500" />
        ) : (
          <AlertCircle size={14} className="text-red-500" />
        )}
        <span className="text-sm">{label}: {value}</span>
      </div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {borrowRecords.map((record) => {
          const friend = getFriendById(record.friendId);

          return (
            <motion.div
              key={record.id}
              variants={itemVariants}
              className="relative pl-12"
            >
              <div className={`absolute left-2 top-1 w-5 h-5 rounded-full border-2 ${
                record.status === 'returned' ? 'bg-green-500 border-green-500' :
                record.status === 'cancelled' ? 'bg-gray-400 border-gray-400' :
                record.status === 'picked_up' ? 'bg-blue-500 border-blue-500' :
                'bg-orange-500 border-orange-500'
              }`}>
                {record.status === 'returned' && (
                  <CheckCircle size={12} className="text-white m-0.5" />
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-muted-foreground" />
                    <span className="font-medium">{friend?.name || '未知用户'}</span>
                  </div>
                  <Badge className={getBorrowStatusColor(record.status)}>
                    {getBorrowStatusLabel(record.status)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{record.community}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>
                      预约: {formatDateCN(record.reserveStartDate)} ~ {formatDateCN(record.reserveEndDate)}
                    </span>
                  </div>

                  {record.actualPickupDate && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-blue-500" />
                      <span>借出: {formatDateCN(record.actualPickupDate)}</span>
                    </div>
                  )}

                  {record.actualReturnDate && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>归还: {formatDateCN(record.actualReturnDate)}</span>
                    </div>
                  )}
                </div>

                {record.status === 'returned' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">检查结果:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {renderCheckResult('潮湿', record.dampCheck)}
                      {renderCheckResult('破洞', record.holeCheck)}
                      {renderCheckResult('胶带', record.tapeCheck)}
                    </div>
                    {record.scrapReason && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                        报废原因: {record.scrapReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
