import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { LitterBox } from '@/types';
import LitterBoxCard from '@/components/LitterBoxCard';
import LitterBoxForm from '@/components/LitterBoxForm';

export default function LitterBoxes() {
  const { litterBoxes, addLitterBox, updateLitterBox, deleteLitterBox } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBox, setEditingBox] = useState<LitterBox | null>(null);

  const handleSubmit = (data: Omit<LitterBox, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingBox) {
      updateLitterBox(editingBox.id, data);
    } else {
      addLitterBox(data);
    }
    setShowForm(false);
    setEditingBox(null);
  };

  const handleEdit = (box: LitterBox) => {
    setEditingBox(box);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个猫砂盆吗？相关的清理记录不会被删除。')) {
      deleteLitterBox(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBox(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">📦 猫砂盆档案</h1>
          <p className="text-warm-300 mt-1">管理猫砂盆信息和清理频率</p>
        </div>
        <button
          onClick={() => {
            setEditingBox(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          添加猫砂盆
        </button>
      </div>

      {litterBoxes.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-display mb-2">还没有猫砂盆</h3>
          <p className="text-warm-300 mb-6">添加猫砂盆信息，设置清理频率</p>
          <button
            onClick={() => {
              setEditingBox(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            添加第一个猫砂盆
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {litterBoxes.map((box, index) => (
            <LitterBoxCard
              key={box.id}
              box={box}
              onEdit={handleEdit}
              onDelete={handleDelete}
              delay={index * 100}
            />
          ))}
        </div>
      )}

      {showForm && (
        <LitterBoxForm
          box={editingBox}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
