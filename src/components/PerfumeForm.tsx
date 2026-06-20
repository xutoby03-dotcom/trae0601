import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { PerfumeRecord, ScentNote, TimePoint } from '@/types';
import { TIME_POINT_LABELS, TIME_POINTS } from '@/types';
import { ScoreInput, StarRating } from './ScoreDisplay';
import { calculateScenesWithReasons } from '@/utils/sceneClassifier';
import { SceneReasonCards } from './SceneTags';

interface PerfumeFormProps {
  initialData?: PerfumeRecord;
  onSubmit: (data: Omit<PerfumeRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function PerfumeForm({ initialData, onSubmit, onCancel }: PerfumeFormProps) {
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [name, setName] = useState(initialData?.name || '');
  const [scentFamily, setScentFamily] = useState(initialData?.scentFamily || '');
  const [sprayLocation, setSprayLocation] = useState(initialData?.sprayLocation || '');
  const [weather, setWeather] = useState(initialData?.weather || '');
  const [humidity, setHumidity] = useState(initialData?.humidity || 50);
  const [skinScore, setSkinScore] = useState(initialData?.skinScore || 3);
  const [clothScore, setClothScore] = useState(initialData?.clothScore || 3);
  const [timeline, setTimeline] = useState<Record<TimePoint, ScentNote>>(
    initialData?.timeline || {
      '0min': { top: '', middle: '', base: '', diffusion: 3 },
      '30min': { top: '', middle: '', base: '', diffusion: 3 },
      '2h': { top: '', middle: '', base: '', diffusion: 2 },
      '6h': { top: '', middle: '', base: '', diffusion: 1 },
    }
  );
  const [expandedTimePoint, setExpandedTimePoint] = useState<TimePoint | null>('0min');

  const autoSceneWithReasons = useMemo(
    () =>
      calculateScenesWithReasons({
        skinScore,
        clothScore,
        humidity,
        weather,
        timeline,
        scentFamily,
      }),
    [skinScore, clothScore, humidity, weather, timeline, scentFamily]
  );

  const autoScenes = useMemo(
    () => autoSceneWithReasons.map((r) => r.scene),
    [autoSceneWithReasons]
  );

  const avgScore = useMemo(() => (skinScore + clothScore) / 2, [skinScore, clothScore]);

  const handleTimelineChange = (timePoint: TimePoint, field: keyof ScentNote, value: string | number) => {
    setTimeline((prev) => ({
      ...prev,
      [timePoint]: {
        ...prev[timePoint],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !name) {
      alert('请填写品牌和香水名称');
      return;
    }
    
    onSubmit({
      brand,
      name,
      scentFamily,
      sprayLocation,
      weather,
      humidity,
      timeline,
      skinScore,
      clothScore,
      scenes: autoScenes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <h3 className="mb-4 font-serif text-xl font-bold text-stone-800">基础信息</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              品牌 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="例如：Jo Malone"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-800 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              香水名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：鼠尾草与海盐"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-800 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              香调
            </label>
            <input
              type="text"
              value={scentFamily}
              onChange={(e) => setScentFamily(e.target.value)}
              placeholder="例如：木质馥奇调"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-800 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              喷洒位置
            </label>
            <input
              type="text"
              value={sprayLocation}
              onChange={(e) => setSprayLocation(e.target.value)}
              placeholder="例如：手腕、耳后"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-800 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              天气
            </label>
            <input
              type="text"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              placeholder="例如：晴"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-800 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              湿度: {humidity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
          </div>
        </div>
      </div>
      
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <h3 className="mb-4 font-serif text-xl font-bold text-stone-800">留香记录</h3>
        
        <div className="space-y-3">
          {TIME_POINTS.map((timePoint) => (
            <div
              key={timePoint}
              className="overflow-hidden rounded-xl border border-stone-200"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedTimePoint(expandedTimePoint === timePoint ? null : timePoint)
                }
                className="flex w-full items-center justify-between bg-stone-50 px-4 py-3 transition-colors hover:bg-stone-100"
              >
                <span className="font-medium text-stone-700">
                  {TIME_POINT_LABELS[timePoint]}
                </span>
                {expandedTimePoint === timePoint ? (
                  <ChevronUp className="h-5 w-5 text-stone-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-stone-500" />
                )}
              </button>
              
              {expandedTimePoint === timePoint && (
                <div className="space-y-3 p-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-600">
                      前调
                    </label>
                    <input
                      type="text"
                      value={timeline[timePoint].top}
                      onChange={(e) =>
                        handleTimelineChange(timePoint, 'top', e.target.value)
                      }
                      placeholder="描述刚喷洒时的第一印象..."
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-600">
                      中调
                    </label>
                    <input
                      type="text"
                      value={timeline[timePoint].middle}
                      onChange={(e) =>
                        handleTimelineChange(timePoint, 'middle', e.target.value)
                      }
                      placeholder="描述核心香气..."
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-600">
                      尾调
                    </label>
                    <input
                      type="text"
                      value={timeline[timePoint].base}
                      onChange={(e) =>
                        handleTimelineChange(timePoint, 'base', e.target.value)
                      }
                      placeholder="描述最后的余香..."
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-600">
                      扩散范围: {timeline[timePoint].diffusion}/5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={timeline[timePoint].diffusion}
                      onChange={(e) =>
                        handleTimelineChange(
                          timePoint,
                          'diffusion',
                          Number(e.target.value)
                        )
                      }
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <h3 className="mb-4 font-serif text-xl font-bold text-stone-800">评分</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ScoreInput
            value={skinScore}
            onChange={setSkinScore}
            label="皮肤表现"
            icon="skin"
          />
          <ScoreInput
            value={clothScore}
            onChange={setClothScore}
            label="衣服表现"
            icon="cloth"
          />
        </div>
      </div>
      
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50 p-6 shadow-sm ring-1 ring-violet-100">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600" />
          <h3 className="font-serif text-xl font-bold text-stone-800">
            智能场景推荐
          </h3>
        </div>
        
        <p className="mb-4 text-sm text-stone-600">
          根据你的评分、湿度、天气和各时间点的扩散范围，系统自动推荐该香水适合的使用场景：
        </p>
        
        <div className="mb-4 rounded-xl bg-white/70 p-4 backdrop-blur-sm">
          <SceneReasonCards items={autoSceneWithReasons} />
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs text-stone-500 sm:grid-cols-4">
          <div className="rounded-lg bg-white/60 p-3">
            <p className="font-medium text-stone-700">综合评分</p>
            <div className="mt-1 flex items-center gap-1">
              <StarRating score={Math.round(avgScore)} size="sm" />
              <span className="text-stone-700">{avgScore.toFixed(1)}</span>
            </div>
          </div>
          <div className="rounded-lg bg-white/60 p-3">
            <p className="font-medium text-stone-700">平均扩散</p>
            <p className="mt-1 font-semibold text-stone-700">
              {(Object.values(timeline).reduce((a, b) => a + b.diffusion, 0) / 4).toFixed(1)} / 5
            </p>
          </div>
          <div className="rounded-lg bg-white/60 p-3">
            <p className="font-medium text-stone-700">湿度</p>
            <p className="mt-1 font-semibold text-stone-700">{humidity}%</p>
          </div>
          <div className="rounded-lg bg-white/60 p-3">
            <p className="font-medium text-stone-700">6h留香</p>
            <p className="mt-1 font-semibold text-stone-700">
              {timeline['6h'].diffusion >= 2 ? '持久' : timeline['6h'].diffusion >= 1 ? '贴身' : '微弱'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-stone-100 px-6 py-3 font-medium text-stone-700 transition-colors hover:bg-stone-200"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 px-6 py-3 font-medium text-white shadow-lg shadow-amber-200 transition-all hover:shadow-xl hover:shadow-amber-300"
        >
          保存记录
        </button>
      </div>
    </form>
  );
}
