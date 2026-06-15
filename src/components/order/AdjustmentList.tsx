import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Adjustment, Participant, AdjustmentType } from '@/types';
import { ADJUSTMENT_TYPES, formatCurrency, formatDate } from '@/types';

interface AdjustmentListProps {
  adjustments: Adjustment[];
  participants: Participant[];
  onAdd: (adjustment: Omit<Adjustment, 'id' | 'orderId' | 'createdAt'>) => void;
  onUpdate: (adjId: string, updates: Partial<Adjustment>) => void;
  onDelete: (adjId: string) => void;
}

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Adjustment, 'id' | 'orderId' | 'createdAt'>) => void;
  participants: Participant[];
  editingAdjustment: Adjustment | null;
}

function AdjustmentModal({
  isOpen,
  onClose,
  onSubmit,
  participants,
  editingAdjustment,
}: AdjustmentModalProps) {
  const [type, setType] = useState<AdjustmentType>('other');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [targetParticipantId, setTargetParticipantId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (editingAdjustment) {
        setType(editingAdjustment.type);
        setAmount(editingAdjustment.amount.toString());
        setDescription(editingAdjustment.description);
        setTargetParticipantId(editingAdjustment.targetParticipantId || '');
      } else {
        setType('other');
        setAmount('');
        setDescription('');
        setTargetParticipantId('');
      }
    }
  }, [isOpen, editingAdjustment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('请输入调整说明');
      return;
    }

    onSubmit({
      type,
      amount: parseFloat(amount) || 0,
      description: description.trim(),
      targetParticipantId: targetParticipantId || undefined,
    });

    onClose();
  };

  const typeInfo = ADJUSTMENT_TYPES.find((t) => t.value === type);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl m-4">
              <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                <h2 className="font-serif text-xl font-bold text-neutral-800">
                  {editingAdjustment ? '编辑调整项' : '添加调整项'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="label">调整类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ADJUSTMENT_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          type === t.value
                            ? `${t.color} ring-2 ring-offset-2 ring-primary-500`
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">金额 (¥)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`input-field ${typeInfo?.color}`}
                    placeholder="正数增加费用，负数减少费用"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    提示：退款填负数（如 -290.93），补税填正数
                  </p>
                </div>

                <div>
                  <label className="label">说明</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                    placeholder="如：海关抽检补缴税款"
                  />
                </div>

                <div>
                  <label className="label">承担人（可选）</label>
                  <select
                    value={targetParticipantId}
                    onChange={(e) => setTargetParticipantId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">全员平摊</option>
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">
                    不选则所有参与人平摊此费用
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={onClose} className="btn-secondary flex-1">
                    取消
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingAdjustment ? '保存修改' : '添加调整'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AdjustmentList({
  adjustments,
  participants,
  onAdd,
  onUpdate,
  onDelete,
}: AdjustmentListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<Adjustment | null>(null);

  const handleEdit = (adj: Adjustment) => {
    setEditingAdjustment(adj);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingAdjustment(null);
  };

  const handleSubmit = (data: Omit<Adjustment, 'id' | 'orderId' | 'createdAt'>) => {
    if (editingAdjustment) {
      onUpdate(editingAdjustment.id, data);
    } else {
      onAdd(data);
    }
  };

  const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.amount, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-neutral-800">调整记录</h2>
          <p className="text-sm text-neutral-500 mt-1">
            调整合计：
            <span
              className={`font-semibold ${
                totalAdjustment >= 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {formatCurrency(totalAdjustment)}
            </span>
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加调整
        </button>
      </div>

      {adjustments.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无调整记录</p>
          <p className="text-sm">缺货、退款、补税等可在此处添加</p>
        </div>
      ) : (
        <div className="space-y-3">
          {adjustments.map((adj, index) => {
            const typeInfo = ADJUSTMENT_TYPES.find((t) => t.value === adj.type);
            const targetName = adj.targetParticipantId
              ? participants.find((p) => p.id === adj.targetParticipantId)?.name
              : '全员平摊';

            return (
              <motion.div
                key={adj.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <span className={`badge ${typeInfo?.color}`}>{typeInfo?.label}</span>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{adj.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
                      <span>{formatDate(adj.createdAt)}</span>
                      <span>·</span>
                      <span>{targetName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold text-lg ${
                      adj.amount >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {adj.amount >= 0 ? '+' : ''}
                    {formatCurrency(adj.amount)}
                  </span>
                  <button
                    onClick={() => handleEdit(adj)}
                    className="p-2 hover:bg-white rounded-lg transition-colors text-neutral-500 hover:text-primary-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(adj.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-neutral-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AdjustmentModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        participants={participants}
        editingAdjustment={editingAdjustment}
      />
    </div>
  );
}
