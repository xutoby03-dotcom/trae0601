import { motion } from 'framer-motion';
import { AlertTriangle, Phone, XCircle, Package } from 'lucide-react';
import type { BorrowRecord, Box, Friend } from '@/types';
import { getCategoryLabel } from '@/utils/condition';
import { formatDateCN } from '@/utils/date';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ConflictAlertProps {
  box: Box;
  records: BorrowRecord[];
  friends: Friend[];
  onContact: (friendId: string) => void;
  onCancel: (recordId: string) => void;
  className?: string;
}

export default function ConflictAlert({ box, records, friends, onContact, onCancel, className }: ConflictAlertProps) {
  const getFriendById = (id: string) => friends.find((f) => f.id === id);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden',
        className
      )}
    >
      <div className="px-5 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <AlertTriangle size={24} />
        </motion.div>
        <div>
          <h4 className="font-semibold">预约冲突警告</h4>
          <p className="text-sm text-orange-100">该纸箱在所选时间段已有其他预约</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <Package size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {getCategoryLabel(box.category)}
            </p>
            <p className="text-sm text-muted-foreground">
              {box.length}×{box.width}×{box.height} cm
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {records.map((record, index) => {
            const friend = getFriendById(record.friendId);
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/70 rounded-lg border border-orange-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {friend?.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
                        <span className="text-orange-700 font-medium">
                          {friend?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{friend?.name || '未知用户'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateCN(record.reserveStartDate)} - {formatDateCN(record.reserveEndDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onContact(record.friendId)}
                    className="flex-1"
                  >
                    <Phone size={16} className="mr-1" />
                    联系
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onCancel(record.id)}
                    className="flex-1"
                  >
                    <XCircle size={16} className="mr-1" />
                    取消
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-start gap-2 p-3 bg-red-100/50 rounded-lg text-sm">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">
            请尽快调解冲突，可联系双方协商调整时间，或取消其中一个预约。
          </p>
        </div>
      </div>
    </motion.div>
  );
}
