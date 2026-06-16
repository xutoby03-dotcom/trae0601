import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FurnitureForm } from '@/components/furniture';
import { Button, Loading, Empty } from '@/components/ui';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import { ArrowLeft } from 'lucide-react';

export default function FurnitureNew() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFurnitureById, fetchFurniture, loading, addFurniture, updateFurniture } = useFurnitureStore();
  
  const isEdit = !!id;
  const furniture = id ? getFurnitureById(id) : undefined;

  useEffect(() => {
    fetchFurniture();
  }, [fetchFurniture]);

  const handleSubmit = () => {
    if (isEdit && furniture) {
      navigate(`/furniture/${furniture.id}`);
    } else {
      navigate('/furniture');
    }
  };

  const handleCancel = () => {
    if (isEdit && furniture) {
      navigate(`/furniture/${furniture.id}`);
    } else {
      navigate('/furniture');
    }
  };

  if (loading && isEdit && !furniture) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (isEdit && !furniture) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Empty description="桌椅不存在或已被删除" />
        <Button className="mt-4" onClick={() => navigate('/furniture')}>
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={handleCancel}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {isEdit ? '编辑桌椅' : '新增桌椅'}
        </h1>
        <div className="w-9" />
      </div>

      <div className="p-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <FurnitureForm
            furniture={furniture}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
