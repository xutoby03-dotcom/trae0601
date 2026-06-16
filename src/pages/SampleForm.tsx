import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import SampleFormInner from '@/components/sample/SampleForm';
import { useStore } from '@/store';
import type { Sample } from '@/types';

export default function SampleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSampleById, addSample, updateSample } = useStore();

  const isEdit = !!id;

  const initialData = useMemo(() => {
    if (!id) return undefined;
    return getSampleById(id);
  }, [id, getSampleById]);

  const handleSubmit = (data: Omit<Sample, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isEdit && id) {
      updateSample(id, data);
      navigate(`/sample/${id}`);
    } else {
      const newSample = addSample(data);
      navigate(`/sample/${newSample.id}`);
    }
  };

  const handleCancel = () => {
    if (isEdit && id) {
      navigate(`/sample/${id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          {isEdit ? '返回详情' : '返回列表'}
        </Button>
      </div>

      <div className="card p-6">
        <h1 className="mb-6 font-display text-2xl font-bold text-charcoal-800">
          {isEdit ? '编辑样衣' : '新建样衣'}
        </h1>
        <SampleFormInner
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}
