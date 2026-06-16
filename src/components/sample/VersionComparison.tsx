import { GitCompareArrows, TrendingDown, TrendingUp, CheckCircle2, AlertCircle, Minus, ArrowRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getVersionComparison } from '@/utils/statistics';
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

function SuggestionStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-moss-50 px-2 py-0.5 text-xs font-medium text-moss-600">
          <CheckCircle2 className="h-3 w-3" />已解决
        </span>
      );
    case 'reduced':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-moss-50 px-2 py-0.5 text-xs font-medium text-moss-600">
          <TrendingDown className="h-3 w-3" />已缓解
        </span>
      );
    case 'persisted':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-champagne-100 px-2 py-0.5 text-xs font-medium text-champagne-500">
          <AlertCircle className="h-3 w-3" />仍存在
        </span>
      );
    case 'increased':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-50 px-2 py-0.5 text-xs font-medium text-terracotta-600">
          <TrendingUp className="h-3 w-3" />加剧
        </span>
      );
    case 'new':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-50 px-2 py-0.5 text-xs font-medium text-terracotta-600">
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
    oldProblemStatuses,
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

        {oldProblemStatuses.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-charcoal-700">旧版问题追踪</h4>
            <div className="flex flex-wrap gap-2">
              {oldProblemStatuses.map(item => (
                <div
                  key={item.problem}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                    item.status === 'resolved'
                      ? 'border-moss-200 bg-moss-50 text-moss-700'
                      : 'border-champagne-200 bg-champagne-50 text-champagne-500'
                  }`}
                >
                  {item.status === 'resolved' ? (
                    <CheckCircle2 className="h-4 w-4 text-moss-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-champagne-500" />
                  )}
                  <span className="font-medium">{item.problem}</span>
                  <span
                    className={`text-xs font-semibold ${
                      item.status === 'resolved' ? 'text-moss-600' : 'text-champagne-500'
                    }`}
                  >
                    {item.status === 'resolved' ? '已缓解' : '仍存在'}
                  </span>
                </div>
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
