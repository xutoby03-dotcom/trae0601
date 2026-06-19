import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Calendar, Package, User } from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import { useBorrowStore } from '@/store/useBorrowStore';
import { useFriendStore } from '@/store/useFriendStore';
import { getCategoryLabel } from '@/utils/condition';
import { formatDate, getUpcomingDays, formatDateCN } from '@/utils/date';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface BoxStoreType {
  getState: () => {
    updateBoxStatus: (id: string, status: string) => void;
    incrementUsageCount: (id: string) => void;
    updateBox: (id: string, data: { scrapReason?: string }) => void;
  };
}

interface ReservationFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function ReservationForm({ onSubmit, onCancel }: ReservationFormProps) {
  const { getBoxesByStatus } = useBoxStore();
  const { friends } = useFriendStore();
  const { addBorrowRecord, checkConflict } = useBorrowStore();

  const [boxId, setBoxId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [community, setCommunity] = useState('');
  const [reserveStartDate, setReserveStartDate] = useState(formatDate(new Date()));
  const [reserveEndDate, setReserveEndDate] = useState(getUpcomingDays(7));
  const [conflicts, setConflicts] = useState<ReturnType<typeof checkConflict>>([]);

  const availableBoxes = useMemo(() => {
    return getBoxesByStatus('available');
  }, [getBoxesByStatus]);

  const boxOptions = useMemo(() => {
    return availableBoxes.map((box) => ({
      value: box.id,
      label: `${getCategoryLabel(box.category)} - ${box.length}×${box.width}×${box.height} cm`,
    }));
  }, [availableBoxes]);

  const friendOptions = useMemo(() => {
    return friends.map((friend) => ({
      value: friend.id,
      label: friend.name,
    }));
  }, [friends]);

  const checkForConflicts = useCallback(() => {
    if (boxId && reserveStartDate && reserveEndDate) {
      const conflictRecords = checkConflict(boxId, reserveStartDate, reserveEndDate);
      setConflicts(conflictRecords);
    } else {
      setConflicts([]);
    }
  }, [boxId, reserveStartDate, reserveEndDate, checkConflict]);

  useEffect(() => {
    checkForConflicts();
  }, [checkForConflicts]);

  useEffect(() => {
    if (friendId) {
      const friend = friends.find((f) => f.id === friendId);
      if (friend) {
        setCommunity(friend.community);
      }
    }
  }, [friendId, friends]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boxId || !friendId || !community || !reserveStartDate || !reserveEndDate) {
      return;
    }
    if (conflicts.length > 0) {
      return;
    }

    addBorrowRecord(
      {
        boxId,
        friendId,
        community,
        reserveStartDate,
        reserveEndDate,
      },
      useBoxStore as unknown as BoxStoreType
    );

    onSubmit?.();
  };

  const isFormValid = boxId && friendId && community && reserveStartDate && reserveEndDate && conflicts.length === 0;

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package size={18} />
          <span className="text-sm">选择纸箱</span>
        </div>
        <Select
          label="纸箱"
          options={[{ value: '', label: '请选择可借用的纸箱' }, ...boxOptions]}
          value={boxId}
          onChange={setBoxId}
          disabled={availableBoxes.length === 0}
        />
        {availableBoxes.length === 0 && (
          <p className="text-sm text-orange-600">当前没有可借用的纸箱</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User size={18} />
          <span className="text-sm">选择借用人</span>
        </div>
        <Select
          label="借用人"
          options={[{ value: '', label: '请选择借用人' }, ...friendOptions]}
          value={friendId}
          onChange={setFriendId}
        />
      </div>

      <Input
        label="小区"
        value={community}
        onChange={(e) => setCommunity(e.target.value)}
        placeholder="请输入小区名称"
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar size={18} />
          <span className="text-sm">预约时间</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="开始日期"
            type="date"
            value={reserveStartDate}
            onChange={(e) => setReserveStartDate(e.target.value)}
            min={formatDate(new Date())}
          />
          <Input
            label="预计归还日期"
            type="date"
            value={reserveEndDate}
            onChange={(e) => setReserveEndDate(e.target.value)}
            min={reserveStartDate}
          />
        </div>
      </div>

      <AnimatePresence>
        {conflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">检测到预约冲突</p>
                <p className="text-sm text-red-600 mt-1">
                  该纸箱在 {formatDateCN(reserveStartDate)} 至 {formatDateCN(reserveEndDate)} 期间已有 {conflicts.length} 个预约：
                </p>
                <ul className="mt-2 space-y-1">
                  {conflicts.map((conflict) => {
                    const friend = friends.find((f) => f.id === conflict.friendId);
                    return (
                      <li key={conflict.id} className="text-sm text-red-600">
                        • {friend?.name || '未知用户'}：{formatDateCN(conflict.reserveStartDate)} - {formatDateCN(conflict.reserveEndDate)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          取消
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!isFormValid}
          className="flex-1"
        >
          提交预约
        </Button>
      </div>
    </motion.form>
  );
}
