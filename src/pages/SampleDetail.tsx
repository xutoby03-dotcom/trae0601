import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Plus, User, Calendar, Ruler, Users, GitCompare } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import Tag from '@/components/common/Tag';
import Empty from '@/components/common/Empty';
import VersionTimeline from '@/components/sample/VersionTimeline';
import VersionComparison from '@/components/sample/VersionComparison';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import ProblemPieChart from '@/components/stats/ProblemPieChart';
import SizeProblemBarChart from '@/components/stats/SizeProblemBarChart';
import HeatmapChart from '@/components/stats/HeatmapChart';
import SuggestionWall from '@/components/stats/SuggestionWall';
import ProductionDecisionPanel from '@/components/stats/ProductionDecisionPanel';
import { useStore } from '@/store';
import type { SizeCode } from '@/types';
import { formatDate, getProductionStatusLabel, getProductionStatusColor } from '@/utils/format';

const SIZE_TABS: (SizeCode | 'all')[] = ['all', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function SampleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSampleById, getFeedbacksBySample } = useStore();

  const [selectedSizeTab, setSelectedSizeTab] = useState<SizeCode | 'all'>('all');

  const sample = id ? getSampleById(id) : undefined;
  const feedbacks = id ? getFeedbacksBySample(id) : [];

  const filteredFeedbacks = useMemo(() => {
    if (selectedSizeTab === 'all') return feedbacks;
    return feedbacks.filter((f) => f.trySize === selectedSizeTab);
  }, [feedbacks, selectedSizeTab]);

  if (!sample || !id) {
    return (
      <Layout>
        <Empty description="样衣不存在或已被删除" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          返回列表
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/sample/${id}/edit`)}
          icon={<Edit2 className="h-4 w-4" />}
        >
          编辑样衣
        </Button>
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-cream-100">
            {sample.photos[0] ? (
              <img
                src={sample.photos[0]}
                alt={sample.styleNo}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-80 items-center justify-center text-charcoal-300">
                暂无图片
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-charcoal-800">
                  {sample.styleNo}
                </h1>
                <span className="mt-1 inline-block text-sm text-charcoal-500">
                  {sample.version}
                </span>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getProductionStatusColor(sample.productionStatus)}`}
              >
                {getProductionStatusLabel(sample.productionStatus)}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-charcoal-400" />
                <span className="text-sm text-charcoal-500 w-16">面料</span>
                <Tag variant="fabric">{sample.fabric || '未填写'}</Tag>
              </div>

              <div className="flex items-start gap-2">
                <Ruler className="h-4 w-4 text-charcoal-400 mt-0.5" />
                <span className="text-sm text-charcoal-500 w-16 shrink-0">尺码</span>
                <div className="flex flex-wrap gap-1.5">
                  {sample.sizes.length > 0 ? (
                    sample.sizes.map((size) => (
                      <Tag key={size} variant="size">
                        {size}
                      </Tag>
                    ))
                  ) : (
                    <span className="text-sm text-charcoal-400">未设置</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-charcoal-400" />
                <span className="text-sm text-charcoal-500 w-16">目标人群</span>
                <span className="text-sm text-charcoal-700">{sample.targetGroup || '未填写'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-charcoal-400" />
                <span className="text-sm text-charcoal-500 w-16">打样日期</span>
                <span className="text-sm text-charcoal-700">
                  {sample.sampleDate ? formatDate(sample.sampleDate) : '未填写'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-charcoal-400" />
                <span className="text-sm text-charcoal-500 w-16">反馈数</span>
                <span className="text-sm text-charcoal-700">{feedbacks.length} 条</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <VersionTimeline sampleId={id} />

          {sample.previousVersionId && (
            <VersionComparison sampleId={id} />
          )}

          <div className="card p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-charcoal-800">试穿反馈</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/sample/${id}/feedback/new`)}
                icon={<Plus className="h-4 w-4" />}
              >
                新增试穿反馈
              </Button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {SIZE_TABS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSizeTab(size)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedSizeTab === size
                      ? 'bg-moss-500 text-white'
                      : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200'
                  }`}
                >
                  {size === 'all' ? '全部' : size}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback) => (
                  <FeedbackCard key={feedback.id} feedback={feedback} />
                ))
              ) : (
                <Empty description="暂无该尺码的试穿反馈" />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-5">
          <ProductionDecisionPanel sampleId={id} />
          <div className="card p-6">
            <ProblemPieChart sampleId={id} title="问题类型分布" />
          </div>
          <div className="card p-6">
            <SizeProblemBarChart sampleId={id} />
          </div>
          <div className="card p-6">
            <HeatmapChart sampleId={id} />
          </div>
          <div className="card p-6">
            <SuggestionWall sampleId={id} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
