import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  Camera,
} from 'lucide-react';
import useAppStore from '@/store/useAppStore';
import ClothingCard from '@/components/ClothingCard';
import ProcessIcon from '@/components/ProcessIcon';
import { PROCESS_LABELS, ProcessType } from '@/types';
import { formatDateReadable } from '@/utils/dateUtils';

const CompletionRecords = () => {
  const navigate = useNavigate();
  const { clothings } = useAppStore();

  const completedClothings = useMemo(() => {
    return [...clothings]
      .filter((c) => c.status === 'completed')
      .sort(
        (a, b) =>
          new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime()
      );
  }, [clothings]);

  const stats = useMemo(() => {
    const totalTime = completedClothings.reduce((sum, c) => sum + (c.timeSpent || 0), 0);
    const avgTime = completedClothings.length > 0 ? Math.round(totalTime / completedClothings.length) : 0;

    const processCounts = completedClothings.reduce((acc, c) => {
      acc[c.processType] = (acc[c.processType] || 0) + 1;
      return acc;
    }, {} as Record<ProcessType, number>);

    const topProcess = Object.entries(processCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      total: completedClothings.length,
      totalTime,
      avgTime,
      topProcess: topProcess ? (topProcess[0] as ProcessType) : null,
      topProcessCount: topProcess ? topProcess[1] : 0,
    };
  }, [completedClothings]);

  const statCards = [
    {
      label: '已完成总数',
      value: stats.total,
      suffix: '件',
      icon: CheckCircle,
      gradient: 'from-success-400 to-success-600',
    },
    {
      label: '累计耗时',
      value: stats.totalTime,
      suffix: '分钟',
      icon: Clock,
      gradient: 'from-primary-400 to-primary-600',
    },
    {
      label: '平均耗时',
      value: stats.avgTime,
      suffix: '分钟/件',
      icon: TrendingUp,
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      label: '最常工序',
      value: stats.topProcess ? PROCESS_LABELS[stats.topProcess] : '-',
      suffix: stats.topProcess ? `(${stats.topProcessCount}件)` : '',
      icon: Award,
      gradient: 'from-purple-400 to-purple-600',
    },
  ];

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof completedClothings> = {};
    completedClothings.forEach((c) => {
      if (c.completedAt) {
        const month = formatDateReadable(c.completedAt).split(' ')[0].slice(0, -2) + '月';
        if (!groups[month]) {
          groups[month] = [];
        }
        groups[month].push(c);
      }
    });
    return groups;
  }, [completedClothings]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-6 stagger-item">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center hover:bg-brown-200 transition-colors md:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-brown-700" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-brown-900">
            🏆 完成记录
          </h1>
          <p className="text-brown-500 text-sm">
            查看已完成的缝补任务和成就
          </p>
        </div>
      </div>

      {stats.total > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, index) => (
              <div
                key={card.label}
                className="card-no-hover p-5 stagger-item"
                style={{ animationDelay: `${index * 100 + 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-brown-500 mb-1">{card.label}</p>
                    <p className="font-display text-2xl font-bold text-brown-900">
                      {card.value}
                      <span className="text-sm font-normal text-brown-500 ml-1">
                        {card.suffix}
                      </span>
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {stats.topProcess && (
            <div className="card-no-hover p-6 stagger-item animate-delay-300">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-brown-900">
                    本月最佳工序
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <ProcessIcon type={stats.topProcess} size="md" showLabel />
                    <span className="text-brown-500">
                      共完成 <span className="font-semibold text-brown-800">{stats.topProcessCount}</span> 件
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="stagger-item animate-delay-400">
            <h2 className="font-display text-xl font-bold text-brown-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary-500" />
              时间轴
            </h2>

            {Object.entries(groupedByMonth).map(([month, items], monthIndex) => (
              <div key={month} className="relative pl-8 pb-8">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brown-200" />
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary-500 border-4 border-cream" />
                <h3 className="font-display text-lg font-semibold text-brown-800 mb-4">
                  {month}
                  <span className="text-sm font-normal text-brown-500 ml-2">
                    ({items.length} 件)
                  </span>
                </h3>

                <div className="space-y-4">
                  {items.map((clothing, index) => (
                    <div
                      key={clothing.id}
                      className="relative"
                      style={{
                        animationDelay: `${monthIndex * 100 + index * 50 + 500}ms`,
                      }}
                    >
                      <div className="absolute left-[-29px] top-6 w-2 h-2 rounded-full bg-brown-300" />
                      <ClothingCard clothing={clothing} />
                      {clothing.photoAfter && (
                        <div className="mt-4 card-no-hover p-4">
                          <h4 className="text-sm font-medium text-brown-700 mb-3 flex items-center gap-2">
                            <Camera className="w-4 h-4 text-success-500" />
                            修复前后对比
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {clothing.photoBefore && (
                              <div>
                                <p className="text-xs text-brown-500 mb-2">修复前</p>
                                <img
                                  src={clothing.photoBefore}
                                  alt="修复前"
                                  className="w-full h-32 object-cover rounded-lg border-2 border-brown-200"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-brown-500 mb-2">修复后</p>
                              <img
                                src={clothing.photoAfter}
                                alt="修复后"
                                className="w-full h-32 object-cover rounded-lg border-2 border-success-300"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card-no-hover p-16 text-center stagger-item animate-delay-200">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brown-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-brown-300" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-brown-700 mb-3">
            还没有完成记录
          </h3>
          <p className="text-brown-500 mb-6 max-w-md mx-auto">
            完成第一件缝补任务后，这里会显示你的成就和记录。
            开始处理任务吧！
          </p>
          <button
            onClick={() => navigate('/queue')}
            className="btn-primary inline-flex items-center gap-2"
          >
            查看任务队列
          </button>
        </div>
      )}
    </div>
  );
};

export default CompletionRecords;
