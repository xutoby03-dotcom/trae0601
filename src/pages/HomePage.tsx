import { Coffee, Plus, Trash2, Eye, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useBlindTestStore } from '@/store/useBlindTestStore';
import { formatDate, getScoreBySampleId, calculateAverageScore } from '@/utils/helpers';
import { ROAST_LEVELS } from '@/types';
import { cn } from '@/lib/utils';

export function HomePage() {
  const navigate = useNavigate();
  const { blindTests, deleteBlindTest, isLoading } = useBlindTestStore();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条盲测记录吗？')) {
      deleteBlindTest(id);
    }
  };

  const getProgress = (test: typeof blindTests[0]) => {
    const total = test.waterSamples.length;
    if (total === 0) return { step: 0, label: '待添加水样' };
    const hasBrewing = test.brewingParams.length;
    const hasTasting = test.tastingScores.length;
    
    if (test.isRevealed) return { step: 4, label: '已完成' };
    if (hasTasting === total) return { step: 3, label: '待揭晓' };
    if (hasBrewing === total) return { step: 2, label: '待评分' };
    return { step: 1, label: '待记录冲煮' };
  };

  const getStatusColor = (step: number) => {
    const colors = [
      'bg-gray-100 text-gray-600',
      'bg-blue-100 text-blue-600',
      'bg-amber-100 text-amber-600',
      'bg-green-100 text-green-600',
      'bg-coffee-100 text-coffee-700',
    ];
    return colors[step] || colors[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-coffee-200 border-t-coffee-700 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-900 rounded-2xl mb-4">
          <Coffee className="w-8 h-8 text-coffee-50" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-coffee-900 mb-2">
          咖啡盲测记录
        </h1>
        <p className="text-coffee-600 max-w-md mx-auto">
          消除心理预期，科学对比不同水质对咖啡风味的影响
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => navigate('/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          开始新盲测
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-semibold text-coffee-900">
            历史记录
          </h2>
          <span className="text-sm text-coffee-500">
            共 {blindTests.length} 条记录
          </span>
        </div>

      {blindTests.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-coffee-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-8 h-8 text-coffee-300" />
          </div>
          <h3 className="font-semibold text-coffee-700 mb-2">还没有盲测记录</h3>
          <p className="text-coffee-500 text-sm mb-4">
            点击上方按钮开始你的第一次盲测
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {blindTests.map((test, index) => {
            const progress = getProgress(test);
            const roastLabel = ROAST_LEVELS.find((r) => r.value === test.roastLevel)?.label;
            const avgScores = test.waterSamples.map((s) => {
              const score = getScoreBySampleId(test, s.id);
              return score ? calculateAverageScore(score) : null;
            }).filter((s): s is number => s !== null);
            const overallAvg = avgScores.length > 0
              ? (avgScores.reduce((a, b) => a + b, 0) / avgScores.length).toFixed(1)
              : '-';

            return (
              <Card
                key={test.id}
                className="cursor-pointer hover:shadow-soft-lg transition-all animate-slide-up group"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  if (test.isRevealed) {
                    navigate(`/reveal/${test.id}`);
                  } else if (progress.step === 3) {
                    navigate(`/tasting/${test.id}`);
                  } else if (progress.step === 2) {
                    navigate(`/brewing/${test.id}`);
                  } else {
                    navigate(`/create?id=${test.id}`);
                  }
                }}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-coffee-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Coffee className="w-6 h-6 text-coffee-700" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-coffee-900 group-hover:text-coffee-700 transition-colors">
                          {test.coffeeName}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-coffee-500">
                          {test.origin && <span>{test.origin}</span>}
                          {roastLabel && <span>· {roastLabel}</span>}
                          {test.processMethod && <span>· {test.processMethod}</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-coffee-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(test.createdAt)}
                          </span>
                          <span>{test.waterSamples.length} 个水样</span>
                          {test.isRevealed && (
                            <span>平均分 {overallAvg}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        getStatusColor(progress.step)
                      )}>
                        {progress.label}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(test.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
