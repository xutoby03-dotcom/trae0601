import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FabricForm } from '@/components/FabricForm';
import { useFabricStore } from '@/store/fabricStore';
import type { FabricFormData } from '@/types';

export function FabricEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFabricById, addFabric, updateFabric, init: initFabrics } = useFabricStore();
  const isEditing = id && id !== 'new';

  useEffect(() => {
    initFabrics();
  }, [initFabrics]);

  const existingFabric = isEditing ? getFabricById(id!) : undefined;

  const handleSubmit = (data: FabricFormData) => {
    if (isEditing && id) {
      updateFabric(id, data);
      navigate(`/fabric/${id}`);
    } else {
      const newFabric = addFabric(data);
      navigate(`/fabric/${newFabric.id}`);
    }
  };

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/fabric/${id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4ED]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-[#8B5A3C]/70 hover:text-[#8B5A3C] transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>

        <div className="mb-8">
          <h1 className="font-serif text-4xl text-[#8B5A3C] mb-2">
            {isEditing ? '编辑面料' : '新增面料小样'}
          </h1>
          <p className="text-[#8B5A3C]/60">
            {isEditing ? '修改面料的属性和评分' : '录入新的面料小样，记录成分、触感评分和照片'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#8B5A3C]/10">
          <FabricForm
            initialData={existingFabric}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel={isEditing ? '保存修改' : '添加入库'}
          />
        </div>
      </div>
    </div>
  );
}
