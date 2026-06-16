import { useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import ProblemPieChart from '@/components/stats/ProblemPieChart';
import HeatmapChart from '@/components/stats/HeatmapChart';
import SuggestionWall from '@/components/stats/SuggestionWall';
import SizeProblemBarChart from '@/components/stats/SizeProblemBarChart';
import SampleCard from '@/components/sample/SampleCard';
import Tag from '@/components/common/Tag';
import { useStore } from '@/store';
import { BarChart3, Shirt, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { getProblemTypeDistribution, aggregateSuggestions } from '@/utils/statistics';

export default function Dashboard() {
  const { samples, feedbacks } = useStore();

  const kpis = useMemo(() => {
    const totalSamples = samples.length;
    const pendingSamples = samples.filter((s) => s.productionStatus === 'pending').length;
    const approvedSamples = samples.filter((s) => s.productionStatus === 'approved').length;
    const totalWithStatus = samples.filter(
      (s) => s.productionStatus === 'approved' || s.productionStatus === 'rejected'
    ).length;
    const passRate =
      totalWithStatus > 0 ? Math.round((approvedSamples / totalWithStatus) * 100) : 0;

    const problemDist = getProblemTypeDistribution();
    const totalProblems = Object.values(problemDist).reduce((sum, v) => sum + v, 0);

    return {
      totalSamples,
      pendingSamples,
      passRate,
      totalProblems,
    };
  }, [samples, feedbacks]);

  const pendingSamples = useMemo(
    () => samples.filter((s) => s.productionStatus === 'pending'),
    [samples]
  );

  const suggestionList = useMemo(() => aggregateSuggestions(), []);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal-800">数据看板</h1>
        <p className="mt-1 text-sm text-charcoal-500">全局数据一览，洞察产品问题与趋势</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-charcoal-500">样衣总数</p>
              <p className="mt-1 text-3xl font-bold text-charcoal-800">{kpis.totalSamples}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-moss-100">
              <Shirt className="h-6 w-6 text-moss-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-charcoal-500">待决策样衣</p>
              <p className="mt-1 text-3xl font-bold text-charcoal-800">{kpis.pendingSamples}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-champagne-100">
              <AlertTriangle className="h-6 w-6 text-champagne-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-charcoal-500">大货通过率</p>
              <p className="mt-1 text-3xl font-bold text-charcoal-800">
                {kpis.passRate}
                <span className="text-base font-normal text-charcoal-400">%</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-moss-100">
              <CheckCircle className="h-6 w-6 text-moss-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-charcoal-500">问题总数</p>
              <p className="mt-1 text-3xl font-bold text-charcoal-800">{kpis.totalProblems}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta-100">
              <XCircle className="h-6 w-6 text-terracotta-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <ProblemPieChart title="全局问题类型分布" />
        </div>
        <div className="card p-6">
          <HeatmapChart />
        </div>
        <div className="card p-6">
          <SizeProblemBarChart />
        </div>
        <div className="card p-6">
          <SuggestionWall />
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-charcoal-800">
            待决策样衣
          </h2>
          <Tag variant="status">{pendingSamples.length} 件</Tag>
        </div>
        {pendingSamples.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pendingSamples.map((sample) => (
              <SampleCard key={sample.id} sample={sample} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-charcoal-400">暂无待决策样衣</div>
        )}
      </div>
    </Layout>
  );
}
