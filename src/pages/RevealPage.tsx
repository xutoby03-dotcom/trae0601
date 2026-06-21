import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Coffee, RefreshCw, BarChart3 } from 'lucide-react';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { RadarChart } from '@/components/charts/RadarChart';
import { BarChart } from '@/components/charts/BarChart';
import { RevealCard } from '@/components/reveal/RevealCard';
import { ComparisonTable } from '@/components/reveal/ComparisonTable';
import { SuggestionCard } from '@/components/reveal/SuggestionCard';
import { useBlindTestStore } from '@/store/useBlindTestStore';
import { getScoreBySampleId, getSortedSamplesByPreference, getSortedSamplesByBlindCode } from '@/utils/helpers';
import { ROAST_LEVELS } from '@/types';
import { cn } from '@/lib/utils';

export function RevealPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setCurrentBlindTest, currentBlindTest, revealBlindTest, generateSuggestions } = useBlindTestStore();

  const [isRevealed, setIsRevealed] = useState(false);
  const [showAllNames, setShowAllNames] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [sortMode, setSortMode] = useState<'preference' | 'blindCode'>('preference');

  useEffect(() => {
    if (id) {
      setCurrentBlindTest(id);
    }
  }, [id, setCurrentBlindTest]);

  useEffect(() => {
    if (currentBlindTest?.isRevealed) {
      setIsRevealed(true);
      setShowAllNames(true);
    }
  }, [currentBlindTest]);

  if (!currentBlindTest) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center py-12">
          <Coffee className="w-12 h-12 text-coffee-300 mx-auto mb-4" />
          <p className="text-coffee-600">找不到这条盲测记录</p>
        </Card>
      </div>
    );
  }

  const handleReveal = () => {
    if (id && !currentBlindTest.isRevealed) {
      revealBlindTest(id);
    }
    setIsRevealed(true);
    setShowAllNames(true);
  };

  const sortedSamples = sortMode === 'preference'
    ? getSortedSamplesByPreference(currentBlindTest)
    : getSortedSamplesByBlindCode(currentBlindTest);
  const roastLabel = ROAST_LEVELS.find((r) => r.value === currentBlindTest.roastLevel)?.label;

  return (
    <div className="space-y-8">
      <StepIndicator currentStep="reveal" />

      <div className="max-w-4xl mx-auto">
        <Card className={`overflow-hidden transition-all duration-500 ${
          isRevealed ? 'bg-gradient-to-r from-coffee-900 to-amber-700' : 'bg-gradient-to-r from-coffee-800 to-coffee-900'
        } text-white`}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                  <Coffee className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold">
                    {currentBlindTest.coffeeName}
                  </h2>
                  <p className="text-white/70 text-sm">
                    {currentBlindTest.origin} · {roastLabel} · {currentBlindTest.processMethod}
                  </p>
                </div>
              </div>

              {!isRevealed ? (
                <Button
                  size="lg"
                  onClick={handleReveal}
                  className="bg-white text-coffee-900 hover:bg-coffee-50 flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  点击揭晓答案
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAllNames(!showAllNames)}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 flex items-center gap-2"
                  >
                    {showAllNames ? (
                      <><EyeOff className="w-4 h-4" /> 隐藏名称</>
                    ) : (
                      <><Eye className="w-4 h-4" /> 显示名称</>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {!isRevealed && (
              <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-white/80 text-sm">
                  🎉 恭喜完成所有评分！点击上方按钮揭晓每个水样的真实来源，
                  查看详细对比数据和个性化冲煮建议。
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isRevealed && (
        <div className="space-y-8 animate-fade-in">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-semibold text-coffee-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-coffee-700 rounded-full" />
                水样对照 · 一目了然
              </h3>
              <div className="flex items-center bg-coffee-100 rounded-lg p-1">
                <button
                  onClick={() => setSortMode('blindCode')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                    sortMode === 'blindCode'
                      ? 'bg-white text-coffee-900 shadow-sm'
                      : 'text-coffee-600 hover:text-coffee-800'
                  )}
                >
                  按盲编号
                </button>
                <button
                  onClick={() => setSortMode('preference')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                    sortMode === 'preference'
                      ? 'bg-white text-coffee-900 shadow-sm'
                      : 'text-coffee-600 hover:text-coffee-800'
                  )}
                >
                  按喜好排序
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {sortedSamples.map((sample, index) => {
                const score = getScoreBySampleId(currentBlindTest, sample.id);
                const brewingParam = currentBlindTest.brewingParams.find(
                  (p) => p.waterSampleId === sample.id
                );
                return (
                  <div
                    key={sample.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <RevealCard
                      sample={sample}
                      score={score}
                      brewingParam={brewingParam}
                      isRevealed={showAllNames}
                      rank={sortMode === 'preference' ? index + 1 : score?.preferenceRank}
                      badgeMode={sortMode === 'preference' ? 'rank' : 'blindCode'}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="flex items-center gap-2 text-coffee-600 hover:text-coffee-900 transition-colors group"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium group-hover:underline">
                {showDetail ? '收起详细图表' : '展开详细图表与综合建议'}
              </span>
            </button>
          </div>

          {showDetail && (
            <div className="space-y-8 animate-fade-in">
              <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>风味雷达图</CardTitle>
                    <CardDescription>
                      各水样在不同评分维度的表现对比
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <RadarChart blindTest={currentBlindTest} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>综合评分对比</CardTitle>
                    <CardDescription>
                      基于各维度评分计算的综合得分
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <BarChart blindTest={currentBlindTest} />
                  </CardContent>
                </Card>
              </div>

              <div className="max-w-5xl mx-auto">
                <ComparisonTable blindTest={currentBlindTest} samples={sortedSamples} />
              </div>

              <div className="max-w-4xl mx-auto space-y-4">
                <h3 className="font-serif text-xl font-semibold text-coffee-900 flex items-center gap-2">
                  <span className="w-1 h-6 bg-coffee-700 rounded-full" />
                  综合冲煮建议
                </h3>
                <div className="space-y-4">
                  {generateSuggestions(currentBlindTest.id).map((suggestion, index) => (
                    <SuggestionCard
                      key={index}
                      suggestion={suggestion}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-center gap-4 pt-8 pb-12">
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
            <Button
              onClick={() => navigate('/create')}
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              开始新盲测
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
