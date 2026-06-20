import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePerfumeStore } from '@/store/usePerfumeStore';
import { PerfumeForm } from '@/components/PerfumeForm';
import type { PerfumeRecord } from '@/types';

export function FormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const perfume = usePerfumeStore((state) => state.getPerfumeById(id || ''));
  const addPerfume = usePerfumeStore((state) => state.addPerfume);
  const updatePerfume = usePerfumeStore((state) => state.updatePerfume);
  
  const isEditing = !!id;

  const handleSubmit = (data: Omit<PerfumeRecord, 'id' | 'createdAt'>) => {
    if (isEditing && id) {
      updatePerfume(id, data);
    } else {
      addPerfume(data);
    }
    navigate('/');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-stone-600 transition-colors hover:text-stone-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>返回列表</span>
          </Link>
        </div>
        
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-stone-800">
            {isEditing ? '编辑香水记录' : '新增留香实验'}
          </h1>
          <p className="mt-2 text-stone-500">
            {isEditing 
              ? '修改这支香水的留香记录' 
              : '记录一支新香水的留香变化过程'}
          </p>
        </div>
        
        <PerfumeForm
          initialData={perfume}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
