import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Item, Order, Participant } from '@/types';
import { formatCurrency } from '@/types';
import ItemModal from './ItemModal';

interface ItemListProps {
  order: Order;
  onAddItem: (item: Omit<Item, 'id' | 'orderId'>) => void;
  onUpdateItem: (itemId: string, updates: Partial<Item>) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function ItemList({ order, onAddItem, onUpdateItem, onDeleteItem }: ItemListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const getBuyerName = (buyerId: string): string => {
    const participant = order.participants.find((p) => p.id === buyerId);
    return participant?.name || '未知';
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (data: Omit<Item, 'id' | 'orderId'>) => {
    if (editingItem) {
      onUpdateItem(editingItem.id, data);
    } else {
      onAddItem(data);
    }
    handleClose();
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-bold text-neutral-800">商品明细</h2>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加商品
        </button>
      </div>

      {order.items.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>还没有添加商品</p>
          <p className="text-sm">点击右上角按钮添加第一个商品</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-neutral-500">
            <div className="col-span-1">序号</div>
            <div className="col-span-3">商品名称</div>
            <div className="col-span-2">购买人</div>
            <div className="col-span-1 text-right">单价($)</div>
            <div className="col-span-1 text-right">数量</div>
            <div className="col-span-1 text-right">重量(kg)</div>
            <div className="col-span-2 text-right">小计(¥)</div>
            <div className="col-span-1 text-right">操作</div>
          </div>

          {order.items.map((item, index) => {
            const subtotalRMB = item.price * item.quantity * order.exchangeRate;
            const isExpanded = expandedItem === item.id;

            return (
              <div key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-xl items-center transition-colors ${
                    item.isReturned ? 'bg-red-50' : 'hover:bg-neutral-50'
                  } ${isExpanded ? 'bg-primary-50' : ''}`}
                >
                  <div className="col-span-1 text-sm text-neutral-500">{index + 1}</div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="text-neutral-400 hover:text-primary-600"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={`font-medium ${item.isReturned ? 'line-through text-neutral-400' : 'text-neutral-800'}`}
                      >
                        {item.name}
                      </span>
                      {item.isReturned && (
                        <span className="badge badge-danger">已退货</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                      {getBuyerName(item.buyerId)}
                    </span>
                  </div>
                  <div className="col-span-1 text-right font-mono">
                    {item.price.toFixed(2)}
                  </div>
                  <div className="col-span-1 text-right">{item.quantity}</div>
                  <div className="col-span-1 text-right font-mono">{item.weight}</div>
                  <div className="col-span-2 text-right font-semibold text-primary-700">
                    {formatCurrency(subtotalRMB)}
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-neutral-500 hover:text-primary-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-neutral-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-4 bg-neutral-50 border-t border-neutral-100">
                        <div className="grid grid-cols-2 gap-4">
                          {item.remark && (
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">备注</p>
                              <p className="text-sm text-neutral-700">{item.remark}</p>
                            </div>
                          )}
                          {item.screenshot && (
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">截图</p>
                              <img
                                src={item.screenshot}
                                alt="商品截图"
                                className="w-24 h-24 object-cover rounded-lg border border-neutral-200"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">单独退货</p>
                            <p className={`text-sm ${item.isReturned ? 'text-red-600' : 'text-neutral-700'}`}>
                              {item.isReturned ? '是' : '否'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <ItemModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        participants={order.participants}
        editingItem={editingItem}
        exchangeRate={order.exchangeRate}
      />
    </div>
  );
}
