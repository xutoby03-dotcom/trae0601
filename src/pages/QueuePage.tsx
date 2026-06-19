import { useState } from 'react';
import { Plus, User, Users, Shirt, UserCheck, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import QueueItemCard from '@/components/QueueItemCard';
import CompleteFittingModal from '@/components/CompleteFittingModal';
import type { QueueItem } from '../../shared/types';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function QueuePage() {
  const { queue, assistants, rooms, addQueueItem, loading } = useStore();
  const [completingItem, setCompletingItem] = useState<QueueItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneLast4: '',
    peopleCount: 1,
    itemsCount: 1,
    keySizes: [] as string[],
    assistantId: '',
    assistantName: '',
  });
  const [itemsWarning, setItemsWarning] = useState('');

  const waitingQueue = queue.filter(q => q.status === 'waiting').sort((a, b) => a.createdAt - b.createdAt);
  const activeQueue = queue.filter(q => q.status === 'called' || q.status === 'fitting');
  const completedQueue = queue.filter(q => q.status === 'completed' || q.status === 'timeout')
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
    .slice(0, 10);

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      keySizes: prev.keySizes.includes(size)
        ? prev.keySizes.filter(s => s !== size)
        : [...prev.keySizes, size],
    }));
  };

  const handleAssistantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assistant = assistants.find(a => a.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      assistantId: e.target.value,
      assistantName: assistant?.name || '',
    }));
  };

  const checkItemsLimit = () => {
    const availableRooms = rooms.filter(r => r.status === 'available' && r.cleanStatus === 'clean');
    if (availableRooms.length > 0 && formData.itemsCount > Math.max(...availableRooms.map(r => r.maxItems))) {
      setItemsWarning(`注意：当前可用试衣间最大件数限制为 ${Math.max(...availableRooms.map(r => r.maxItems))} 件`);
    } else {
      setItemsWarning('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assistantId) return;
    if (!formData.customerName && !formData.phoneLast4) return;

    try {
      await addQueueItem(formData);
      setFormData({
        customerName: '',
        phoneLast4: '',
        peopleCount: 1,
        itemsCount: 1,
        keySizes: [],
        assistantId: '',
        assistantName: '',
      });
      setShowForm(false);
      setItemsWarning('');
    } catch (error) {
      // error handled in store
    }
  };

  return (
    <div className="space-y-6">
      {completingItem && (
        <CompleteFittingModal item={completingItem} onClose={() => setCompletingItem(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-cream-100">排队管理</h2>
          <p className="text-cream-400 mt-1">顾客登记、叫号管理、状态追踪</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新增排队
        </button>
      </div>

      {showForm && (
        <div className="card p-6 animate-fade-in">
          <h3 className="font-display text-xl text-charcoal-800 mb-6">顾客排队登记</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  顾客姓名
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="input-field"
                  placeholder="请输入姓名（选填）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  手机尾号
                </label>
                <input
                  type="text"
                  value={formData.phoneLast4}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneLast4: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  className="input-field"
                  placeholder="请输入手机尾号4位（选填）"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  人数
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, peopleCount: Math.max(1, prev.peopleCount - 1) }))}
                    className="w-10 h-10 rounded-lg bg-cream-300 text-charcoal-700 font-bold text-xl hover:bg-cream-400 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={formData.peopleCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, peopleCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="flex-1 input-field text-center text-xl font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, peopleCount: prev.peopleCount + 1 }))}
                    className="w-10 h-10 rounded-lg bg-cream-300 text-charcoal-700 font-bold text-xl hover:bg-cream-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  <Shirt className="w-4 h-4 inline mr-1" />
                  拿入件数
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, itemsCount: Math.max(1, prev.itemsCount - 1) }));
                      setTimeout(checkItemsLimit, 0);
                    }}
                    className="w-10 h-10 rounded-lg bg-cream-300 text-charcoal-700 font-bold text-xl hover:bg-cream-400 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={formData.itemsCount}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, itemsCount: Math.max(1, parseInt(e.target.value) || 1) }));
                      setTimeout(checkItemsLimit, 0);
                    }}
                    onBlur={checkItemsLimit}
                    className="flex-1 input-field text-center text-xl font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, itemsCount: prev.itemsCount + 1 }));
                      setTimeout(checkItemsLimit, 0);
                    }}
                    className="w-10 h-10 rounded-lg bg-cream-300 text-charcoal-700 font-bold text-xl hover:bg-cream-400 transition-colors"
                  >
                    +
                  </button>
                </div>
                {itemsWarning && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-yellow-700">
                    <AlertTriangle className="w-3 h-3" />
                    {itemsWarning}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  <UserCheck className="w-4 h-4 inline mr-1" />
                  服务导购
                </label>
                <select
                  value={formData.assistantId}
                  onChange={handleAssistantChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择导购</option>
                  {assistants.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.employeeId})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">重点尺码</label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.keySizes.includes(size)
                        ? 'bg-burgundy-700 text-white'
                        : 'bg-cream-100 text-charcoal-600 hover:bg-cream-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-cream-300">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                取消
              </button>
              <button
                type="submit"
                disabled={loading || (!formData.customerName && !formData.phoneLast4) || !formData.assistantId}
                className="btn-primary"
              >
                加入排队
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-5">
          <h3 className="font-display text-lg text-charcoal-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-champagne-400"></span>
            等待中 ({waitingQueue.length})
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
            {waitingQueue.length === 0 ? (
              <div className="text-center py-8 text-charcoal-400">暂无等待顾客</div>
            ) : (
              waitingQueue.map(item => (
                <QueueItemCard key={item.id} item={item} showActions={false} />
              ))
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-charcoal-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-burgundy-600 animate-pulse"></span>
            进行中 ({activeQueue.length})
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
            {activeQueue.length === 0 ? (
              <div className="text-center py-8 text-charcoal-400">暂无进行中的顾客</div>
            ) : (
              activeQueue.map(item => (
                <QueueItemCard
                  key={item.id}
                  item={item}
                  onComplete={() => setCompletingItem(item)}
                />
              ))
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-charcoal-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            已完成 ({completedQueue.length})
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
            {completedQueue.length === 0 ? (
              <div className="text-center py-8 text-charcoal-400">暂无完成记录</div>
            ) : (
              completedQueue.map(item => (
                <QueueItemCard key={item.id} item={item} showActions={false} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
