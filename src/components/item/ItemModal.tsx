import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Item, Participant } from '@/types';
import { formatCurrency } from '@/types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Item, 'id' | 'orderId'>) => void;
  participants: Participant[];
  editingItem: Item | null;
  exchangeRate: number;
}

export default function ItemModal({
  isOpen,
  onClose,
  onSubmit,
  participants,
  editingItem,
  exchangeRate,
}: ItemModalProps) {
  const [name, setName] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [weight, setWeight] = useState('');
  const [isReturned, setIsReturned] = useState(false);
  const [screenshot, setScreenshot] = useState<string | undefined>();
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setBuyerId(editingItem.buyerId);
      setPrice(editingItem.price.toString());
      setQuantity(editingItem.quantity.toString());
      setWeight(editingItem.weight.toString());
      setIsReturned(editingItem.isReturned);
      setScreenshot(editingItem.screenshot);
      setRemark(editingItem.remark || '');
    } else {
      setName('');
      setBuyerId(participants[0]?.id || '');
      setPrice('');
      setQuantity('1');
      setWeight('');
      setIsReturned(false);
      setScreenshot(undefined);
      setRemark('');
    }
  }, [editingItem, participants, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('请输入商品名称');
      return;
    }
    if (!buyerId) {
      alert('请选择购买人');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      alert('请输入有效价格');
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      alert('请输入有效数量');
      return;
    }

    onSubmit({
      name: name.trim(),
      buyerId,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      weight: parseFloat(weight) || 0,
      isReturned,
      screenshot,
      remark: remark.trim() || undefined,
    });
  };

  const subtotalRMB = parseFloat(price || '0') * parseInt(quantity || '0') * exchangeRate;

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
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl m-4">
              <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                <h2 className="font-serif text-xl font-bold text-neutral-800">
                  {editingItem ? '编辑商品' : '添加商品'}
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
                  <label className="label">商品名称</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="如：Kindle Paperwhite"
                  />
                </div>

                <div>
                  <label className="label">购买人</label>
                  <select
                    value={buyerId}
                    onChange={(e) => setBuyerId(e.target.value)}
                    className="input-field"
                  >
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">单价 ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="input-field"
                      placeholder="139.99"
                    />
                  </div>
                  <div>
                    <label className="label">数量</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="input-field"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">重量 (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="input-field"
                      placeholder="0.3"
                    />
                  </div>
                  <div>
                    <label className="label">小计 (¥)</label>
                    <div className="input-field bg-neutral-50 font-semibold text-primary-700">
                      {formatCurrency(subtotalRMB)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">商品截图</label>
                  <div className="flex items-start gap-4">
                    {screenshot ? (
                      <div className="relative">
                        <img
                          src={screenshot}
                          alt="预览"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-primary-200"
                        />
                        <button
                          type="button"
                          onClick={() => setScreenshot(undefined)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                        <Upload className="w-6 h-6 text-neutral-400 mb-1" />
                        <span className="text-xs text-neutral-500">点击上传</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">备注</label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="颜色、尺码等说明"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isReturned"
                    checked={isReturned}
                    onChange={(e) => setIsReturned(e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isReturned" className="text-sm text-neutral-700">
                    此商品已单独退货
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={onClose} className="btn-secondary flex-1">
                    取消
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingItem ? '保存修改' : '添加商品'}
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
