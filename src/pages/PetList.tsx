import { Link } from 'react-router-dom';
import { Plus, PawPrint } from 'lucide-react';
import { useAppStore } from '@/store';
import PetCard from '@/components/PetCard';

export default function PetList() {
  const pets = useAppStore((state) => state.pets);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PawPrint className="text-brand-500" size={28} />
            我的宠物
          </h1>
          <p className="text-slate-500 mt-1">管理所有宠物的详细资料</p>
        </div>
        <Link to="/pets/new" className="btn-primary">
          <Plus size={18} />
          添加宠物
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">还没有宠物资料</h3>
          <p className="text-slate-500 mb-6">添加第一只宠物，开始管理它们的健康信息</p>
          <Link to="/pets/new" className="btn-primary">
            <Plus size={18} />
            立即添加
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
