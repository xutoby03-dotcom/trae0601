import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Cat } from '@/types';
import CatCard from '@/components/CatCard';
import CatForm from '@/components/CatForm';

export default function Cats() {
  const { cats, addCat, updateCat, deleteCat } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Cat | null>(null);

  const handleSubmit = (data: Omit<Cat, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCat) {
      updateCat(editingCat.id, data);
    } else {
      addCat(data);
    }
    setShowForm(false);
    setEditingCat(null);
  };

  const handleEdit = (cat: Cat) => {
    setEditingCat(cat);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这只猫咪的档案吗？')) {
      deleteCat(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCat(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">🐱 猫咪档案</h1>
          <p className="text-warm-300 mt-1">管理你家的毛孩子</p>
        </div>
        <button
          onClick={() => {
            setEditingCat(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          添加猫咪
        </button>
      </div>

      {cats.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🐈</div>
          <h3 className="text-xl font-display mb-2">还没有猫咪档案</h3>
          <p className="text-warm-300 mb-6">添加你家猫咪的信息，开始记录吧</p>
          <button
            onClick={() => {
              setEditingCat(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            添加第一只猫咪
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cats.map((cat, index) => (
            <CatCard
              key={cat.id}
              cat={cat}
              onEdit={handleEdit}
              onDelete={handleDelete}
              delay={index * 100}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CatForm
          cat={editingCat}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
