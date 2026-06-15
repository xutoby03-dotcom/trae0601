import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '@/store/useOrderStore';
import { PLATFORMS, generateId } from '@/types';
import type { Participant } from '@/types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (orderId: string) => void;
}

export default function NewOrderModal({ isOpen, onClose, onCreated }: NewOrderModalProps) {
  const addOrder = useOrderStore((state) => state.addOrder);

  const [platform, setPlatform] = useState('Amazon');
  const [exchangeRate, setExchangeRate] = useState('7.25');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [totalShipping, setTotalShipping] = useState('');
  const [totalTax, setTotalTax] = useState('0');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newName, setNewName] = useState('');

  const handleAddParticipant = () => {
    if (newName.trim()) {
      setParticipants([
        ...participants,
        { id: generateId(), name: newName.trim() },
      ]);
      setNewName('');
    }
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      alert('请输入转运单号');
      return;
    }

    if (participants.length === 0) {
      alert('请至少添加一位参与人');
      return;
    }

    const newOrder = addOrder({
      platform,
      exchangeRate: parseFloat(exchangeRate) || 7,
      trackingNumber: trackingNumber.trim(),
      totalShipping: parseFloat(totalShipping) || 0,
      totalTax: parseFloat(totalTax) || 0,
      participants,
      items: [],
      adjustments: [],
      allocationMethod: 'by_weight',
      status: 'draft',
    });

    resetForm();
    onClose();

    if (onCreated) {
      onCreated(newOrder.id);
    }
  };

  const resetForm = () => {
    setPlatform('Amazon');
    setExchangeRate('7.25');
    setTrackingNumber('');
    setTotalShipping('');
    setTotalTax('0');
    setParticipants([]);
    setNewName('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl m-4">
              <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                <h2 className="font-serif text-xl font-bold text-neutral-800">新建订单</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="label">海淘平台</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="input-field"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">汇率</label>
                    <input
                      type="number"
                      step="0.01"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="input-field"
                      placeholder="7.25"
                    />
                  </div>
                  <div>
                    <label className="label">转运单号</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="input-field"
                      placeholder="YZ123456789US"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">总运费 (¥)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={totalShipping}
                      onChange={(e) => setTotalShipping(e.target.value)}
                      className="input-field"
                      placeholder="180.00"
                    />
                  </div>
                  <div>
                    <label className="label">总税费 (¥)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={totalTax}
                      onChange={(e) => setTotalTax(e.target.value)}
                      className="input-field"
                      placeholder="85.50"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">参与人</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                      className="input-field flex-1"
                      placeholder="输入姓名后按回车添加"
                    />
                    <button
                      type="button"
                      onClick={handleAddParticipant}
                      className="btn-secondary px-4"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {participants.length === 0 ? (
                      <p className="text-sm text-neutral-400">还没有添加参与人</p>
                    ) : (
                      participants.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                        >
                          {p.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(p.id)}
                            className="hover:text-accent-coral transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    创建订单
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
