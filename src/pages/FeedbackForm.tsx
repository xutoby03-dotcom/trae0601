import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import Tag from '@/components/common/Tag';
import FeedbackFormInner from '@/components/feedback/FeedbackForm';
import { useStore } from '@/store';
import type { Feedback } from '@/types';
import { formatDate, getProductionStatusLabel, getProductionStatusColor } from '@/utils/format';

export default function FeedbackForm() {
  const { sampleId } = useParams<{ sampleId: string }>();
  const navigate = useNavigate();
  const { getSampleById, addFeedback } = useStore();

  const sample = sampleId ? getSampleById(sampleId) : undefined;

  const handleSubmit = (data: Omit<Feedback, 'id' | 'createdAt'>) => {
    addFeedback(data);
    navigate(`/sample/${sampleId}`);
  };

  const handleCancel = () => {
    navigate(`/sample/${sampleId}`);
  };

  if (!sample || !sampleId) {
    return (
      <Layout>
        <div className="text-center py-16 text-charcoal-500">样衣不存在</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          返回样衣详情
        </Button>
      </div>

      <div className="card mb-6 p-5">
        <div className="flex items-start gap-4">
          {sample.photos[0] ? (
            <img
              src={sample.photos[0]}
              alt={sample.styleNo}
              className="h-20 w-20 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-cream-100 text-charcoal-300">
              暂无图
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-charcoal-800">
                {sample.styleNo}
              </h2>
              <span className="text-sm text-charcoal-500">{sample.version}</span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getProductionStatusColor(sample.productionStatus)}`}
              >
                {getProductionStatusLabel(sample.productionStatus)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Tag variant="fabric">{sample.fabric || '未填面料'}</Tag>
              {sample.sizes.map((size) => (
                <Tag key={size} variant="size">
                  {size}
                </Tag>
              ))}
            </div>
            <p className="mt-2 text-xs text-charcoal-400">
              打样日期：{sample.sampleDate ? formatDate(sample.sampleDate) : '未填写'}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h1 className="mb-6 font-display text-2xl font-bold text-charcoal-800">
          新增试穿反馈
        </h1>
        <FeedbackFormInner
          sampleId={sampleId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}
