import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PackagePlus, X, Loader2, User, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/dateUtils';
import type { RestockRecord } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement> | null;
  onSuccess?: (record: RestockRecord) => void;
}

const QUICK_AMOUNTS = [10, 20, 50, 100];

export default function RestockPopover({ open, onClose, anchorRef, onSuccess }: Props) {
  const addRestock = useAppStore((s) => s.addRestock);
  const inventory = useAppStore((s) => s.ticketInventory);
  const employees = useAppStore((s) => s.employees);

  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setAmount('');
      setNote('');
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;
      onClose();
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose, anchorRef]);

  const lastRestock = inventory.restockHistory?.[0];
  const lastOperator = lastRestock ? employees.find((e) => e.id === lastRestock.operatorId) : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = Number(amount);
    if (!amount || !Number.isInteger(n) || n <= 0) {
      setError('请输入有效的正整数数量');
      return;
    }
    if (n > 1000) {
      setError('单次补充不能超过 1000 张');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      try {
        const record = addRestock(n, note || undefined);
        onSuccess?.(record);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : '补券失败');
      } finally {
        setSubmitting(false);
      }
    }, 300);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute right-0 top-full mt-2 w-[340px] rounded-card bg-white border border-neutral-200 shadow-card-hover z-40 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-mint-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <PackagePlus size={16} />
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-800">补充停车券</div>
                <div className="text-[11px] text-neutral-500">当前剩余 {inventory.total - inventory.used} / {inventory.total} 张</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-white/80 transition flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>

          {lastRestock && (
            <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-start gap-2 text-[11px]">
              <Clock size={12} className="text-neutral-400 mt-0.5 shrink-0" />
              <div className="text-neutral-500 leading-relaxed">
                最近补券：
                <span className="text-neutral-700 font-medium">+{lastRestock.amount} 张</span>
                <span className="mx-1 text-neutral-300">·</span>
                <span className="inline-flex items-center gap-0.5">
                  <User size={10} />
                  {lastOperator?.name || '未知'}
                </span>
                <span className="mx-1 text-neutral-300">·</span>
                <span>{formatDate(lastRestock.operatedAt, true)}</span>
                {lastRestock.note && (
                  <span className="block text-neutral-400 mt-0.5">「{lastRestock.note}」</span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-neutral-700">
                <PackagePlus size={12} className="text-primary-500" />
                补充数量
                <span className="text-accent-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                step={1}
                value={amount}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  setAmount(v);
                  if (error) setError(null);
                }}
                placeholder="请输入张数"
                className={
                  'w-full px-3 py-2 rounded-lg border text-sm font-mono bg-white outline-none focus:ring-2 transition ' +
                  (error
                    ? 'border-accent-400 focus:border-accent-500 focus:ring-accent-100'
                    : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-100 hover:border-neutral-300')
                }
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setAmount(q);
                      if (error) setError(null);
                    }}
                    className={
                      'px-2.5 py-1 rounded-md text-[11px] font-medium border transition ' +
                      (amount === q
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-primary-300 hover:bg-primary-50')
                    }
                  >
                    +{q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-neutral-700">
                备注说明
                <span className="text-neutral-400 font-normal">（选填）</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="例：月初批量补充 / 客户高峰日预留"
                maxLength={50}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100 hover:border-neutral-300 transition resize-none"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-2 rounded-md bg-accent-50 border border-accent-200 text-accent-700 text-[11px] overflow-hidden"
                >
                  ! {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-button disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                确认补券
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
