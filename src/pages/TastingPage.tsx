import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Coffee, Eye, CheckCircle2 } from 'lucide-react';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { RatingSlider } from '@/components/scoring/RatingSlider';
import { FlavorTags } from '@/components/scoring/FlavorTags';
import { PreferenceRanker } from '@/components/scoring/PreferenceRanker';
import { Textarea } from '@/components/common/Input';
import { useBlindTestStore } from '@/store/useBlindTestStore';
import { RATING_DIMENSIONS } from '@/types';
import { getBlindCodeColor, getScoreBySampleId, isAllScoresCompleted } from '@/utils/helpers';
import type { TastingScore } from '@/types';

export function TastingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setCurrentBlindTest, currentBlindTest, setTastingScore } = useBlindTestStore();

  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, Omit<TastingScore, 'id'>>>({});
  const [ranks, setRanks] = useState<Record<string, number>>({});

  useEffect(() => {
    if (id) {
      setCurrentBlindTest(id);
    }
  }, [id, setCurrentBlindTest]);

  useEffect(() => {
    if (currentBlindTest) {
      const initialScores: Record<string, Omit<TastingScore, 'id'>> = {};
      const initialRanks: Record<string, number> = {};

      currentBlindTest.waterSamples.forEach((sample, index) => {
        const existing = getScoreBySampleId(currentBlindTest, sample.id);
        initialScores[sample.id] = existing || {
          waterSampleId: sample.id,
          acidity: 5,
          sweetness: 5,
          bitterness: 5,
          aftertaste: 5,
          cleanliness: 5,
          preferenceRank: index + 1,
          flavorTags: [],
          notes: '',
        };
        initialRanks[sample.id] = existing?.preferenceRank || index + 1;
      });

      setScores(initialScores);
      setRanks(initialRanks);
    }
  }, [currentBlindTest]);

  if (!currentBlindTest || currentBlindTest.waterSamples.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center py-12">
          <Coffee className="w-12 h-12 text-coffee-300 mx-auto mb-4" />
          <p className="text-coffee-600">请先创建盲测并添加水样</p>
        </Card>
      </div>
    );
  }

  const samples = currentBlindTest.waterSamples;
  const activeSample = samples[activeSampleIndex];
  const activeScore = scores[activeSample?.id];

  const handleScoreChange = (field: keyof Omit<TastingScore, 'id' | 'waterSampleId' | 'preferenceRank' | 'flavorTags' | 'notes'>, value: number) => {
    if (!activeSample) return;
    setScores((prev) => ({
      ...prev,
      [activeSample.id]: {
        ...prev[activeSample.id],
        [field]: value,
      },
    }));
  };

  const handleToggleTag = (tag: string) => {
    if (!activeSample) return;
    setScores((prev) => {
      const currentTags = prev[activeSample.id]?.flavorTags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
      return {
        ...prev,
        [activeSample.id]: {
          ...prev[activeSample.id],
          flavorTags: newTags,
        },
      };
    });
  };

  const handleNotesChange = (notes: string) => {
    if (!activeSample) return;
    setScores((prev) => ({
      ...prev,
      [activeSample.id]: {
        ...prev[activeSample.id],
        notes,
      },
    }));
  };

  const handleRankChange = (newRanks: Record<string, number>) => {
    setRanks(newRanks);
    Object.entries(newRanks).forEach(([sampleId, rank]) => {
      setScores((prev) => ({
        ...prev,
        [sampleId]: {
          ...prev[sampleId],
          preferenceRank: rank,
        },
      }));
    });
  };

  const handleSaveAll = () => {
    if (!id) return;
    Object.values(scores).forEach((score) => {
      setTastingScore(id, score);
    });
    navigate(`/reveal/${id}`);
  };

  const canProceed = Object.keys(scores).length === samples.length &&
    samples.every((s) => scores[s.id]?.flavorTags.length > 0);

  return (
    <div className="space-y-8">
      <StepIndicator currentStep="tasting" />

      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-coffee-900 to-coffee-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <Coffee className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold">
                  {currentBlindTest.coffeeName}
                </h2>
                <p className="text-coffee-200 text-sm">
                  盲测评分阶段 · 仅显示盲编号
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {samples.map((sample, index) => (
                <button
                  key={sample.id}
                  onClick={() => setActiveSampleIndex(index)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${
                    index === activeSampleIndex
                      ? 'bg-white text-coffee-900 scale-110'
                      : scores[sample.id]
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                  style={{
                    backgroundColor: index === activeSampleIndex
                      ? undefined
                      : getBlindCodeColor(sample.blindCode) + (scores[sample.id] ? '80' : '40'),
                  }}
                >
                  {scores[sample.id] ? (
                    <CheckCircle2 className="w-5 h-5 mx-auto" />
                  ) : (
                    sample.blindCode
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {activeSample && activeScore && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="xl:col-span-2 space-y-6">
            <Card className="animate-fade-in">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-md"
                    style={{ backgroundColor: getBlindCodeColor(activeSample.blindCode) }}
                  >
                    {activeSample.blindCode}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">水样 {activeSample.blindCode}</CardTitle>
                    <CardDescription>
                      请根据实际品尝体验进行评分，不要受到任何心理预期影响
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                {RATING_DIMENSIONS.map((dim) => (
                  <RatingSlider
                    key={dim.key}
                    label={dim.label}
                    value={activeScore[dim.key]}
                    onChange={(value) => handleScoreChange(dim.key as 'acidity' | 'sweetness' | 'bitterness' | 'aftertaste' | 'cleanliness', value)}
                    color={dim.color}
                    description={
                      dim.key === 'bitterness'
                        ? '苦感越低越好，分数越高表示苦感越舒适'
                        : undefined
                    }
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <FlavorTags
                  selectedTags={activeScore.flavorTags}
                  onToggle={handleToggleTag}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Textarea
                  label="杯测感受"
                  value={activeScore.notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="记录你对这杯咖啡的整体感受、特别发现或任何想备注的内容..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <PreferenceRanker
                  samples={samples}
                  ranks={ranks}
                  onChange={handleRankChange}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/brewing/${id}`)}
                className="flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                上一步
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={!canProceed}
                className="flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                完成评分，查看结果
              </Button>
              {!canProceed && (
                <p className="text-xs text-center text-coffee-500">
                  请完成所有水样的评分并至少选择一个风味标签
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
