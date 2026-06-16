import { GitCompareArrows, TrendingDown, TrendingUp, CheckCircle2, AlertCircle, Minus, ArrowRight, Lightbulb, User, Activity, Ruler, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getVersionComparison, type OldSpecificProblem } from '@/utils/statistics';
import { ProblemTypeLabel } from '@/types';
import Tag from '@/components/common/Tag';

interface VersionComparisonProps {
  sampleId: string;
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-terracotta-600">
        <TrendingUp className="h-3 w-3" />+{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-moss-500">
        <TrendingDown className="h-3 w-3" />{delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-charcoal-400">
      <Minus className="h-3 w-3" />0
    </span>
  );
}

function ProblemStatusBadge({ status }: { status: OldSpecificProblem['status'] }) {
  switch (status) {
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-moss-50 px-2 py-0.5 text-xs font-semibold text-moss-600">
          <CheckCircle2 className="h-3 w-3" />已解决
        </span>
      );
    case 'improved':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-moss-50 px-2 py-0.5 text-xs font-semibold text-moss-500">
          <TrendingDown className="h-3 w-3" />已缓解
        </span>
      );
    case 'persisted':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-champagne-100 px-2 py-0.5 text-xs font-semibold text-champagne-500">
          <AlertCircle className="h-3 w-3" />仍存在
        </span>
      );
    case 'worsened':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-50 px-2 py-0.5 text-xs font-semibold text-terracotta-600">
          <TrendingUp className="h-3 w-3" />加剧
        </span>
      );
    default:
      return null;
  }
}

function ProblemCategoryIcon({ category }: { category: OldSpecificProblem['category'] }) {
  switch (category) {
    case 'fit':
      return <Ruler className="h-3.5 w-3.5" />;
    case 'action':
      return <Activity className="h-3.5 w-3.5" />;
    case 'description':
      return <MessageSquare className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

function OldProblemCard({ problem }: { problem: OldSpecificProblem }) {
  const borderColorMap = {
    resolved: 'border-moss-200 bg-moss-50/50',
    improved: 'border-moss-200/60 bg-moss-50/30',
    persisted: 'border-champagne-200 bg-champagne-50/50',
    worsened: 'border-terracotta-200 bg-terracotta-50/50',
  };

  const iconColorMap = {
    resolved: 'text-moss-500',
    improved: 'text-moss-400',
    persisted: 'text-champagne-500',
    worsened: 'text-terracotta-500',
  };

  return (
    <div
      className={`rounded-lg border px-4 py-3 transition-all duration-200 hover:shadow-sm ${
        borderColorMap[problem.status]
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-charcoal-400">
            <span className={`${iconColorMap[problem.status]}`}>
              <ProblemCategoryIcon category={problem.category} />
            </span>
            <Tag variant="size">{problem.size}</Tag>
            {problem.problemTypes && problem.problemTypes.length > 0 && (
              <Tag variant={problem.problemTypes[0]}>
                {ProblemTypeLabel[problem.problemTypes[0]]}
              </Tag>
            )}
          </div>
          <p className="mt-2 text-sm font-medium text-charcoal-800 leading-relaxed">
            {problem.originalText}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-charcoal-400">
            <User className="h-3 w-3" />
            <span>试穿人：{problem.wearerName}</span>
          </div>
          <p className="mt-1.5 text-xs text-charcoal-500 leading-relaxed">
            {problem.evidence}
          </p>
        </div>
        <div className="shrink-0">
          <ProblemStatusBadge status={problem.status} />
        </div>
      </div>
    </div>
  );
}

function SuggestionStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-moss-50 px-2 py-0.5 text-xs font-semibold text-moss-600">
          <CheckCircle2 className="h-3 w-3" />已解决
        </span>
      );
    case 'reduced':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-moss-50 px-2 py-0.5 text-xs font-semibold text-moss-500">
          <TrendingDown className="h-3 w-3" />已缓解
        </span>
      );
    case 'persisted':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-champagne-100 px-2 py-0.5 text-xs font-semibold text-champagne-500">
          <AlertCircle className="h-3 w-3" />仍存在
        </span>
      );
    case 'increased':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-50 px-2 py-0.5 text-xs font-semibold text-terracotta-600">
          <TrendingUp className="h-3 w-3" />加剧
        </span>
      );
    case 'new':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-50 px-2 py-0.5 text-xs font-semibold text-terracotta-600">
          <AlertCircle className="h-3 w-3" />新增
        </span>
      );
    default:
      return null;
  }
}

export default function VersionComparison({ sampleId }: VersionComparisonProps) {
  const comparison = getVersionComparison(sampleId);

  if (!comparison) return null;

  const {
    currentSample,
    previousSample,
    sizeHotspots,
    problemTypeDeltas,
    suggestionDeltas,
    oldSpecificProblems,
    overallImproved,
  } = comparison;

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-cream-100 bg-cream-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-charcoal-600" />
          <h3 className="font-display text-lg font-semibold text-charcoal-800">新旧版对照</h3>
          <span
            className={`ml-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              overallImproved
                ? 'bg-moss-50 text-moss-600'
                : 'bg-terracotta-50 text-terracotta-600'
            }`}
          >
            {overallImproved ? (
              <><TrendingDown className="h-3 w-3" />整体改善</>
            ) : (
              <><TrendingUp className="h-3 w-3" />整体未改善</>
            )}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center gap-4 rounded-lg bg-cream-50 px-4 py-3">
          <Link
            to={`/sample/${previousSample.id}`}
            className="text-center hover:opacity-80 transition-opacity"
          >
            <div className="text-xs text-charcoal-400">旧版</div>
            <div className="font-display text-base font-semibold text-charcoal-700">
              {previousSample.styleNo}
            </div>
            <div className="text-xs text-charcoal-400">
              {previousSample.version} · {previousSample.sampleDate}
            </div>
          </Link>
          <ArrowRight className="h-5 w-5 text-charcoal-300 shrink-0" />
          <div className="text-center">
            <div className="text-xs text-moss-500 font-medium">当前版</div>
            <div className="font-display text-base font-semibold text-charcoal-800">
              {currentSample.styleNo}
            </div>
            <div className="text-xs text-charcoal-400">
              {currentSample.version} · {currentSample.sampleDate}
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-charcoal-700">尺码问题高发点</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {sizeHotspots.map(item => (
              <div
                key={item.size}
                className={`rounded-lg border px-3 py-2.5 text-center ${
                  item.delta < 0
                    ? 'border-moss-200 bg-moss-50'
                    : item.delta > 0
                      ? 'border-terracotta-200 bg-terracotta-50'
                      : 'border-cream-200 bg-white'
                }`}
              >
                <div className="text-xs font-semibold text-charcoal-600">{item.size}</div>
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <span className="text-sm font-bold text-charcoal-800">{item.currentCount}</span>
                  <span className="text-xs text-charcoal-400">/ {item.previousCount}</span>
                </div>
                <div className="mt-1">
                  <DeltaBadge delta={item.delta} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-charcoal-400">当前版问题数 / 旧版问题数</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-charcoal-700">问题类型增减</h4>
          <div className="space-y-2">
            {problemTypeDeltas.map(item => (
              <div
                key={item.type}
                className="flex items-center gap-3 rounded-lg border border-cream-100 bg-white px-4 py-3"
              >
                <Tag
                  variant={item.type === 'pattern' ? 'pattern' : item.type === 'fabric' ? 'fabric' : item.type === 'workmanship' ? 'workmanship' : 'comfort'}
                >
                  {ProblemTypeLabel[item.type]}
                </Tag>
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-charcoal-500">
                    <span className="font-medium text-charcoal-300">旧版</span>
                    <span className="font-semibold text-charcoal-700">{item.previousCount}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-charcoal-300 shrink-0" />
                  <div className="flex items-center gap-2 text-xs text-charcoal-500">
                    <span className="font-medium text-moss-500">新版</span>
                    <span className="font-semibold text-charcoal-700">{item.currentCount}</span>
                  </div>
                </div>
                <DeltaBadge delta={item.delta} />
              </div>
            ))}
          </div>
        </div>

        {oldSpecificProblems.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-charcoal-700">旧版问题追踪</h4>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-terracotta-600">
                  <span className="h-2 w-2 rounded-full bg-terracotta-500" />
                  {oldSpecificProblems.filter(p => p.status === 'worsened').length} 加剧
                </span>
                <span className="flex items-center gap-1 text-champagne-500">
                  <span className="h-2 w-2 rounded-full bg-champagne-400" />
                  {oldSpecificProblems.filter(p => p.status === 'persisted').length} 仍存在
                </span>
                <span className="flex items-center gap-1 text-moss-500">
                  <span className="h-2 w-2 rounded-full bg-moss-500" />
                  {oldSpecificProblems.filter(p => p.status === 'improved' || p.status === 'resolved').length} 改善
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {oldSpecificProblems.map(problem => (
                <OldProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-charcoal-700">
            <Lightbulb className="h-4 w-4 text-champagne-400" />
            调整意见变化
          </h4>
          <div className="space-y-2">
            {suggestionDeltas.slice(0, 8).map(item => (
              <div
                key={item.text}
                className="flex items-center gap-3 rounded-lg border border-cream-100 bg-white px-4 py-2.5"
              >
                <span className="flex-1 text-sm text-charcoal-700">{item.text}</span>
                <div className="flex items-center gap-2 text-xs text-charcoal-400 shrink-0">
                  <span>{item.previousCount}→{item.currentCount}条</span>
                </div>
                <SuggestionStatusBadge status={item.status} />
              </div>
            ))}
            {suggestionDeltas.length > 8 && (
              <p className="text-center text-xs text-charcoal-400">
                还有 {suggestionDeltas.length - 8} 条调整意见...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
