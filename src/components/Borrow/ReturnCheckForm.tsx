import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Package, User, Calendar } from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import { useBorrowStore } from '@/store/useBorrowStore';
import { useFriendStore } from '@/store/useFriendStore';
import { evaluateBoxCondition, getCategoryLabel } from '@/utils/condition';
import { formatDateCN } from '@/utils/date';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Avatar from '@/components/ui/Avatar';
import CheckSlider from './CheckSlider';

interface BoxStoreType {
  getState: () => {
    updateBoxStatus: (id: string, status: string) => void;
    incrementUsageCount: (id: string) => void;
    updateBox: (id: string, data: { scrapReason?: string }) => void;
  };
}

interface ReturnCheckFormProps {
  recordId: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function ReturnCheckForm({ recordId, onSubmit, onCancel }: ReturnCheckFormProps) {
  const { borrowRecords, confirmReturn } = useBorrowStore();
  const { getBoxById } = useBoxStore();
  const { getFriendById } = useFriendStore();

  const record = borrowRecords.find((r) => r.id === recordId);
  const box = record ? getBoxById(record.boxId) : undefined;
  const friend = record ? getFriendById(record.friendId) : undefined;

  const [dampCheck, setDampCheck] = useState(0);
  const [holeCheck, setHoleCheck] = useState(0);
  const [tapeCheck, setTapeCheck] = useState(0);
  const [scrapReason, setScrapReason] = useState('');

  const evaluation = useMemo(() => {
    return evaluateBoxCondition(dampCheck, holeCheck, tapeCheck);
  }, [dampCheck, holeCheck, tapeCheck]);

  const evaluationInfo = useMemo(() => {
    switch (evaluation) {
      case 'available':
        return {
          icon: <CheckCircle size={24} className="text-green-500" />,
          text: '可继续使用',
          color: 'text-green-700',
          bg: 'bg-green-50',
          border: 'border-green-200',
        };
      case 'need_repair':
        return {
          icon: <AlertTriangle size={24} className="text-yellow-500" />,
          text: '待修复',
          color: 'text-yellow-700',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
        };
      case 'scrapped':
        return {
          icon: <XCircle size={24} className="text-red-500" />,
          text: '报废',
          color: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200',
        };
      default:
        return {
          icon: <CheckCircle size={24} className="text-green-500" />,
          text: '可继续使用',
          color: 'text-green-700',
          bg: 'bg-green-50',
          border: 'border-green-200',
        };
    }
  }, [evaluation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    if (evaluation === 'scrapped' && !scrapReason.trim()) {
      return;
    }

    confirmReturn(
      recordId,
      {
        damp: dampCheck,
        hole: holeCheck,
        tape: tapeCheck,
        scrapReason: evaluation === 'scrapped' ? scrapReason : undefined,
      },
      useBoxStore as unknown as BoxStoreType
    );

    onSubmit?.();
  };

  if (!record || !box || !friend) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        未找到相关记录
      </div>
    );
  }

  const isFormValid = evaluation !== 'scrapped' || scrapReason.trim().length > 0;

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="p-4 bg-muted/30 rounded-lg space-y-3">
        <h4 className="font-medium text-foreground">归还信息</h4>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{getCategoryLabel(box.category)}</p>
            <p className="text-xs text-muted-foreground">
              {box.length}×{box.width}×{box.height} cm · 承重 {box.loadCapacity}kg
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Avatar
            src={friend.avatar}
            alt={friend.name}
            fallback={friend.name.charAt(0)}
            size="sm"
          />
          <span className="text-sm font-medium text-foreground">{friend.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm">
              {formatDateCN(record.reserveStartDate)} - {formatDateCN(record.reserveEndDate)}
            </p>
            <p className="text-xs text-muted-foreground">{record.community}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="font-medium text-foreground">外观检查</h4>

        <CheckSlider
          label="受潮检查"
          value={dampCheck}
          onChange={setDampCheck}
          descriptions={['干燥', '轻微', '明显', '严重']}
        />

        <CheckSlider
          label="破洞检查"
          value={holeCheck}
          onChange={setHoleCheck}
          descriptions={['完好', '边角小损', '有破洞', '严重破损']}
        />

        <CheckSlider
          label="胶带残留检查"
          value={tapeCheck}
          onChange={setTapeCheck}
          descriptions={['无残留', '轻微', '较多', '严重']}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={evaluation}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`p-4 rounded-lg border ${evaluationInfo.bg} ${evaluationInfo.border}`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
            >
              {evaluationInfo.icon}
            </motion.div>
            <div>
              <p className={`font-semibold ${evaluationInfo.color}`}>
                {evaluation === 'available' && '✓ '}
                {evaluation === 'need_repair' && '⚠ '}
                {evaluation === 'scrapped' && '✕ '}
                {evaluationInfo.text}
              </p>
              <p className="text-sm text-muted-foreground">
                综合评分：{dampCheck + holeCheck + tapeCheck} 分
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {evaluation === 'scrapped' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Textarea
              label="报废原因"
              value={scrapReason}
              onChange={(e) => setScrapReason(e.target.value)}
              placeholder="请详细说明报废原因..."
              rows={3}
            />
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
          确认归还
        </Button>
      </div>
    </motion.form>
  );
}
