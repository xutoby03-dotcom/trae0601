import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, AlertTriangle, Utensils, Syringe, FileText, Plus } from 'lucide-react';
import { useAppStore } from '@/store';
import { speciesLabel, formatDateDisplay, getTodayStr } from '@/utils';
import TaskCard from '@/components/TaskCard';

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPetById, deletePet, getTasksByPetId, getTaskStatus, getMissedItems } = useAppStore();

  const pet = id ? getPetById(id) : undefined;
  const tasks = id ? getTasksByPetId(id) : [];

  if (!pet) {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">😢</div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">找不到这只宠物</h3>
        <p className="text-slate-500 mb-6">可能已被删除</p>
        <Link to="/pets" className="btn-secondary">返回宠物列表</Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`确定要删除「${pet.name}」的资料吗？`)) {
      deletePet(pet.id);
      navigate('/pets');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/pets" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">宠物详情</h1>
        </div>
        <Link to={`/pets/${pet.id}/edit`} className="btn-secondary">
          <Edit2 size={16} />
          编辑
        </Link>
        <button onClick={handleDelete} className="btn-danger">
          <Trash2 size={16} />
          删除
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            {pet.avatarUrl ? (
              <img
                src={pet.avatarUrl}
                alt={pet.name}
                className="w-40 h-40 rounded-3xl object-cover border-4 border-brand-100 shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 rounded-3xl bg-brand-100 flex items-center justify-center text-7xl border-4 border-brand-50">
                {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">{pet.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="tag bg-brand-100 text-brand-700 text-base">
                  {speciesLabel[pet.species]}
                </span>
                {pet.breed && (
                  <span className="tag bg-slate-100 text-slate-600">
                    {pet.breed}
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar size={16} />
                  {pet.age} 岁
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pet.allergies && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-2 text-red-600 font-semibold mb-1">
                    <AlertTriangle size={18} />
                    过敏项
                  </div>
                  <p className="text-red-700">{pet.allergies}</p>
                </div>
              )}

              {pet.foodBrand && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold mb-1">
                    <Utensils size={18} />
                    常用粮
                  </div>
                  <p className="text-amber-800">{pet.foodBrand}</p>
                  {pet.foodAmount && (
                    <p className="text-amber-600 text-sm mt-1">每顿 {pet.foodAmount}</p>
                  )}
                </div>
              )}
            </div>

            {pet.vaccinePhotoUrl && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-3">
                  <Syringe size={18} />
                  疫苗照片
                </div>
                <img
                  src={pet.vaccinePhotoUrl}
                  alt="疫苗证明"
                  className="max-w-xs rounded-xl border border-emerald-200"
                />
              </div>
            )}

            {pet.notes && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
                  <FileText size={18} />
                  备注
                </div>
                <p className="text-slate-600 whitespace-pre-wrap">{pet.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">寄养记录</h3>
          <Link to={`/tasks/new?petId=${pet.id}`} className="btn-secondary text-sm">
            <Plus size={16} />
            新建寄养
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-500">暂无寄养记录</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const status = getTaskStatus(task);
              const today = getTodayStr();
              const missedItems = getMissedItems(task.id, today);
              return (
                <TaskCard
                  key={task.id}
                  task={{ ...task, status }}
                  pet={pet}
                  showMissedAlert={status === 'active'}
                  missedItemsCount={missedItems.length}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
