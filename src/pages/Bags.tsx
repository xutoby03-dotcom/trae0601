import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, User, Ruler } from 'lucide-react';
import { useStore } from '@/store/useStore';
import BagForm from '@/components/BagForm';
import StatusBadge from '@/components/StatusBadge';
import type { Bag } from '@/types';

const colorMap: Record<string, string> = {
  '蓝色': '#3b82f6',
  '橙色': '#f97316',
  '黑色': '#1f2937',
  '绿色': '#22c55e',
  '红色': '#ef4444',
  '紫色': '#a855f7',
  '黄色': '#eab308',
  '灰色': '#6b7280',
};

export default function Bags() {
  const { bags, members, addBag, updateBag, deleteBag } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBags = bags.filter(b => 
    b.number.includes(searchTerm) ||
    b.color.includes(searchTerm)
  );

  const getOwnerName = (ownerId: string) => {
    return members.find(m => m.id === ownerId)?.name || '未知';
  };

  const handleAdd = () => {
    setEditingBag(null);
    setShowForm(true);
  };

  const handleEdit = (bag: Bag) => {
    setEditingBag(bag);
    setShowForm(true);
  };

  const handleSubmit = (data: Omit<Bag, 'id' | 'createdAt'>) => {
    if (editingBag) {
      updateBag(editingBag.id, data);
    } else {
      addBag(data);
    }
    setShowForm(false);
    setEditingBag(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该防水包吗？')) {
      deleteBag(id);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10 w-64"
            placeholder="搜索编号或颜色..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新增防水包
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBags.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center">
            <p className="text-gray-500">
              {searchTerm ? '未找到匹配的防水包' : '暂无防水包数据，请点击"新增防水包"添加'}
            </p>
          </div>
        ) : (
          filteredBags.map((bag, index) => (
            <div
              key={bag.id}
              className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
              style={{ 
                animationDelay: `${index * 50}ms`,
                borderTop: `4px solid ${colorMap[bag.color] || '#6b7280'}`
              }}
            >
              <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                {bag.photoUrl ? (
                  <img
                    src={bag.photoUrl}
                    alt={`防水包 ${bag.number}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div 
                      className="w-24 h-24 rounded-2xl shadow-xl"
                      style={{ backgroundColor: colorMap[bag.color] || '#6b7280' }}
                    />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={bag.sealStatus} size="sm" />
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">#{bag.number}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colorMap[bag.color] || '#6b7280' }}
                      />
                      {bag.color}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Ruler className="w-4 h-4" />
                    {bag.capacity}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{getOwnerName(bag.ownerId)}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(bag)}
                    className="flex-1 btn-secondary text-sm py-2"
                  >
                    <Edit2 className="w-4 h-4 inline mr-1" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(bag.id)}
                    className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <BagForm
          bag={editingBag}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBag(null);
          }}
        />
      )}
    </div>
  );
}
