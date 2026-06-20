import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award,
  TrendingUp,
  AlertCircle,
  Clock,
  Star,
  CheckCircle2,
  Home,
  Play,
  ArrowLeft,
  Edit2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import ScoreGauge from '@/components/report/ScoreGauge';
import TimeBarChart, { type ChartPoint } from '@/components/report/TimeBarChart';
import { useGuideStore } from '@/store/useGuideStore';
import { calculateRhythmScore } from '@/utils/scoring';
import { formatDurationChinese } from '@/utils/time';
import { cn } from '@/lib/utils';

interface PointDetail {
  pointId: string;
  name: string;
  plannedDuration: number;
  actualDuration: number;
  diff: number;
  isKeyPoint: boolean;
  isOvertime: boolean;
  isSaved: boolean;
  isNormal: boolean;
}

export default function Report() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getSessionById, getRouteById } = useGuideStore();

  const session = sessionId ? getSessionById(sessionId) : undefined;
  const route = session ? getRouteById(session.routeId) : undefined;

  const scoreResult = useMemo(() => {
    if (!session || !route) return null;
    return calculateRhythmScore(session, route.points);
  }, [session, route]);

  const chartPoints: ChartPoint[] = useMemo(() => {
    if (!session || !route) return [];
    const sortedPoints = [...route.points].sort((a, b) => a.order - b.order);
    return sortedPoints.map((point) => {
      const pointSession = session.pointSessions.find(
        (ps) => ps.pointId === point.id
      );
      return {
        name: point.name,
        plannedDuration: point.plannedDuration,
        actualDuration: pointSession?.actualDuration || 0,
        isKeyPoint: point.isKeyPoint,
      };
    });
  }, [session, route]);

  const overtimePoints = useMemo(() => {
    if (!session || !route) return [] as PointDetail[];
    const sortedPoints = [...route.points].sort((a, b) => a.order - b.order);

    const details: PointDetail[] = sortedPoints.map((point) => {
      const pointSession = session.pointSessions.find(
        (ps) => ps.pointId === point.id
      );
      const actual = pointSession?.actualDuration || 0;
      const planned = point.plannedDuration;
      const diff = actual - planned;
      const isOvertime = diff > 0;
      const isSaved = diff < 0;
      const isNormal = diff === 0;

      return {
        pointId: point.id,
        name: point.name,
        plannedDuration: planned,
        actualDuration: actual,
        diff,
        isKeyPoint: point.isKeyPoint,
        isOvertime,
        isSaved,
        isNormal,
      };
    });

    return details
      .filter((d) => d.isOvertime)
      .sort((a, b) => b.diff - a.diff)
      .slice(0, 5);
  }, [session, route]);

  const insufficientKeyPoints = useMemo(() => {
    if (!session || !route) return [] as (PointDetail & { ratio: number; shortage: number })[];
    const sortedPoints = [...route.points].sort((a, b) => a.order - b.order);

    return sortedPoints
      .map((point) => {
        const pointSession = session.pointSessions.find(
          (ps) => ps.pointId === point.id
        );
        const actual = pointSession?.actualDuration || 0;
        const planned = point.plannedDuration;
        const ratio = planned > 0 ? actual / planned : 0;
        const shortage = planned - actual;
        return {
          pointId: point.id,
          name: point.name,
          plannedDuration: planned,
          actualDuration: actual,
          diff: actual - planned,
          isKeyPoint: point.isKeyPoint,
          isOvertime: false,
          isSaved: shortage > 0,
          isNormal: false,
          ratio,
          shortage,
        };
      })
      .filter((d) => d.isKeyPoint && d.ratio < 0.8 && d.plannedDuration > 0)
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 5);
  }, [session, route]);

  const allPointDetails: PointDetail[] = useMemo(() => {
    if (!session || !route) return [];
    const sortedPoints = [...route.points].sort((a, b) => a.order - b.order);

    return sortedPoints.map((point) => {
      const pointSession = session.pointSessions.find(
        (ps) => ps.pointId === point.id
      );
      const actual = pointSession?.actualDuration || 0;
      const planned = point.plannedDuration;
      const diff = actual - planned;
      const isOvertime = diff > 0;
      const isSaved = diff < 0;
      const isNormal = diff === 0;

      return {
        pointId: point.id,
        name: point.name,
        plannedDuration: planned,
        actualDuration: actual,
        diff,
        isKeyPoint: point.isKeyPoint,
        isOvertime,
        isSaved,
        isNormal,
      };
    });
  }, [session, route]);

  if (!session || !route || !scoreResult) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="讲解报告" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center glass-card p-12 max-w-md">
            <AlertCircle className="w-16 h-16 text-coral-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-deep-900 mb-2">
              未找到讲解记录
            </h2>
            <p className="text-deep-500 mb-6">
              该讲解记录不存在或已被删除。
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              返回首页
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { total, accuracy, keyCoverage, uniformity, suggestions } = scoreResult;

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="讲解报告" />

      <main className="flex-1 container mx-auto px-6 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-deep-900">
              {session.routeName}
            </h1>
            <p className="text-deep-500 mt-1">
              {session.startedAt
                ? new Date(session.startedAt).toLocaleString('zh-CN')
                : ''}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
        </div>

        <section className="glass-card p-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10">
            <ScoreGauge score={total} label="综合评分" size={200} strokeWidth={16} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto lg:flex-1 lg:max-w-2xl">
              <div className="glass-card p-5 text-center bg-gradient-to-br from-deep-900/5 to-transparent">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-jade-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-jade-500" />
                </div>
                <div className="text-3xl font-serif font-bold text-deep-900">
                  {accuracy}
                </div>
                <div className="text-sm text-deep-500 mt-1">准确度</div>
                <div className="text-xs text-deep-400 mt-2">
                  满分 40
                </div>
              </div>

              <div className="glass-card p-5 text-center bg-gradient-to-br from-deep-900/5 to-transparent">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-museum-500/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-museum-500" />
                </div>
                <div className="text-3xl font-serif font-bold text-deep-900">
                  {keyCoverage}
                </div>
                <div className="text-sm text-deep-500 mt-1">重点覆盖率</div>
                <div className="text-xs text-deep-400 mt-2">
                  满分 30
                </div>
              </div>

              <div className="glass-card p-5 text-center bg-gradient-to-br from-deep-900/5 to-transparent">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-coral-500/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-coral-500" />
                </div>
                <div className="text-3xl font-serif font-bold text-deep-900">
                  {uniformity}
                </div>
                <div className="text-sm text-deep-500 mt-1">均匀度</div>
                <div className="text-xs text-deep-400 mt-2">
                  满分 30
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-deep-600" />
            <h2 className="text-lg font-serif font-bold text-deep-900">
              各点位用时对比
            </h2>
          </div>
          <TimeBarChart points={chartPoints} />
        </section>

        {overtimePoints.length > 0 && (
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-coral-500" />
              <h2 className="text-lg font-serif font-bold text-deep-900">
                超时分析 TOP5
              </h2>
            </div>
            <div className="space-y-3">
              {overtimePoints.map((point, index) => (
                <div
                  key={point.pointId}
                  className="flex items-center gap-4 p-4 rounded-xl bg-coral-500/5 border border-coral-500/10"
                >
                  <div className="w-8 h-8 rounded-full bg-coral-500/10 flex items-center justify-center text-coral-500 font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-deep-900 truncate">
                        {point.name}
                      </span>
                      {point.isKeyPoint && (
                        <Star className="w-4 h-4 text-museum-500 fill-museum-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-sm text-deep-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>计划：{formatDurationChinese(point.plannedDuration)}</span>
                      <span>实际：{formatDurationChinese(point.actualDuration)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-coral-500 font-bold">
                      +{formatDurationChinese(point.diff)}
                    </div>
                    <div className="text-xs text-coral-400">超时</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {insufficientKeyPoints.length > 0 && (
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-museum-500 fill-museum-500" />
              <h2 className="text-lg font-serif font-bold text-deep-900">
                重点点位不足提醒
              </h2>
              <span className="text-xs text-deep-400 ml-1">
                （实际用时不足计划 80%）
              </span>
            </div>
            <div className="space-y-3">
              {insufficientKeyPoints.map((point, index) => (
                <div
                  key={point.pointId}
                  className="flex items-center gap-4 p-4 rounded-xl bg-museum-500/5 border border-museum-500/15"
                >
                  <div className="w-8 h-8 rounded-full bg-museum-500/15 flex items-center justify-center text-museum-600 font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-deep-900 truncate">
                        {point.name}
                      </span>
                      <Star className="w-4 h-4 text-museum-500 fill-museum-500 flex-shrink-0" />
                    </div>
                    <div className="text-sm text-deep-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>计划：{formatDurationChinese(point.plannedDuration)}</span>
                      <span>实际：{formatDurationChinese(point.actualDuration)}</span>
                    </div>
                    <div className="mt-2 w-full max-w-xs h-1.5 bg-museum-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-museum-500 rounded-full"
                        style={{ width: `${Math.min(100, point.ratio * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-museum-600 mt-1">
                      仅完成计划的 {Math.round(point.ratio * 100)}%
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-museum-600 font-bold">
                      -{formatDurationChinese(point.shortage)}
                    </div>
                    <div className="text-xs text-museum-500">缺口</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-deep-600" />
            <h2 className="text-lg font-serif font-bold text-deep-900">
              时间线详情
            </h2>
          </div>
          <div className="space-y-2">
            {allPointDetails.map((point) => (
              <div
                key={point.pointId}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg transition-colors',
                  point.isOvertime && 'bg-coral-500/5',
                  point.isSaved && 'bg-jade-500/5',
                  point.isNormal && 'bg-deep-900/5'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-deep-900 truncate">
                      {point.name}
                    </span>
                    {point.isKeyPoint && (
                      <Star className="w-3.5 h-3.5 text-museum-500 fill-museum-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
                <div className="text-sm text-deep-500 flex-shrink-0 w-20 text-right">
                  {formatDurationChinese(point.plannedDuration)}
                </div>
                <div className="text-sm text-deep-600 flex-shrink-0 w-20 text-right">
                  {formatDurationChinese(point.actualDuration)}
                </div>
                <div
                  className={cn(
                    'text-sm font-medium flex-shrink-0 w-24 text-right',
                    point.isOvertime && 'text-coral-500',
                    point.isSaved && 'text-jade-500',
                    point.isNormal && 'text-deep-400'
                  )}
                >
                  {point.isNormal
                    ? '准时'
                    : `${point.isSaved ? '-' : '+'}${formatDurationChinese(Math.abs(point.diff))}`}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-4 pt-4 border-t border-museum-200 text-sm text-deep-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-coral-500/20 border border-coral-500/30" />
              超时
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-jade-500/20 border border-jade-500/30" />
              节省
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-deep-900/10 border border-deep-900/20" />
              正常
            </div>
          </div>
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-deep-600" />
            <h2 className="text-lg font-serif font-bold text-deep-900">
              改进建议
            </h2>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex gap-3 p-3 rounded-lg bg-museum-50"
              >
                <CheckCircle2 className="w-5 h-5 text-jade-500 flex-shrink-0 mt-0.5" />
                <p className="text-deep-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col sm:flex-row gap-3 justify-center pb-8">
          <button
            onClick={() => navigate(`/guide/${session.routeId}`)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            再次讲解
          </button>
          <button
            onClick={() => navigate(`/routes/${session.routeId}/edit`)}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            编辑路线继续练
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-ghost flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            返回首页
          </button>
        </section>
      </main>
    </div>
  );
}
