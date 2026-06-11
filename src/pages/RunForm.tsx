import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Footprints, MapPin, Cloud, Star, FileText, Trophy, Check, Zap } from 'lucide-react';
import { useShoeStore } from '@/store';
import { Surface, Weather, SURFACE_LABELS, WEATHER_LABELS, WEATHER_ICONS, ShoeWithStats } from '@/types';
import StarRating from '@/components/StarRating';

const ALL_SURFACES: Surface[] = ['asphalt', 'concrete', 'track', 'trail', 'treadmill'];
const ALL_WEATHER: Weather[] = ['sunny', 'cloudy', 'rainy', 'cold', 'hot'];

interface ShoeOption {
  shoe: ShoeWithStats;
  isRecommended: boolean;
  isRace: boolean;
}

export default function RunForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addRun = useShoeStore((s) => s.addRun);
  const getShoesWithStats = useShoeStore((s) => s.getShoesWithStats);
  const getShoeById = useShoeStore((s) => s.getShoeById);

  const preselectedShoeId = searchParams.get('shoeId');
  const allShoes = getShoesWithStats();
  const preselectedShoe = preselectedShoeId ? getShoeById(preselectedShoeId) : null;

  const [form, setForm] = useState({
    shoeId: preselectedShoeId || '',
    date: new Date().toISOString().split('T')[0],
    kilometers: '',
    surface: (preselectedShoe?.suitableSurfaces?.[0] as Surface) || 'asphalt',
    weather: 'sunny' as Weather,
    feelRating: 4,
    wearNotes: '',
  });

  const [showRaceShoes, setShowRaceShoes] = useState(preselectedShoe?.isRaceLocked || false);

  useEffect(() => {
    if (preselectedShoeId && !form.shoeId) {
      setForm((f) => ({ ...f, shoeId: preselectedShoeId }));
      if (preselectedShoe?.isRaceLocked) {
        setShowRaceShoes(true);
      }
    }
  }, [preselectedShoeId, preselectedShoe, form.shoeId]);

  const shoeOptions = useMemo<ShoeOption[]>(() => {
    const shoes = allShoes.filter((s) => (showRaceShoes ? s.isRaceLocked : !s.isRaceLocked));
    return shoes
      .map((s) => {
        const isRecommended = s.suitableSurfaces.includes(form.surface);
        return { shoe: s, isRecommended, isRace: s.isRaceLocked };
      })
      .sort((a, b) => {
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        return b.shoe.lifePercentage - a.shoe.lifePercentage;
      });
  }, [allShoes, form.surface, showRaceShoes]);

  const recommendedOptions = shoeOptions.filter((o) => o.isRecommended);
  const otherOptions = shoeOptions.filter((o) => !o.isRecommended);

  const raceShoeCount = allShoes.filter((s) => s.isRaceLocked).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shoeId) {
      alert('请选择跑鞋');
      return;
    }
    const km = Number(form.kilometers);
    if (!km || km <= 0) {
      alert('请输入有效的公里数');
      return;
    }

    const selectedShoe = getShoeById(form.shoeId);
    if (selectedShoe && !selectedShoe.suitableSurfaces.includes(form.surface)) {
      if (!confirm(`注意：${selectedShoe.brand} ${selectedShoe.model} 不推荐用于 ${SURFACE_LABELS[form.surface]}，确定继续吗？`)) {
        return;
      }
    }

    addRun({
      shoeId: form.shoeId,
      date: form.date,
      kilometers: km,
      surface: form.surface,
      weather: form.weather,
      feelRating: form.feelRating,
      wearNotes: form.wearNotes.trim() || undefined,
    });
    navigate('/');
  };

  const ShoeCard = ({ option }: { option: ShoeOption }) => {
    const selected = form.shoeId === option.shoe.id;
    const s = option.shoe;
    return (
      <button
        type="button"
        onClick={() => setForm((f) => ({ ...f, shoeId: s.id }))}
        className={`w-full text-left p-4 rounded-xl border transition-all ${
          selected
            ? 'bg-energy-500/10 border-energy-500 ring-2 ring-energy-500/30'
            : 'bg-night-900 border-night-600 hover:border-night-500 hover:bg-night-800'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-display font-semibold text-white truncate">
                {s.brand} {s.model}
              </p>
              {option.isRecommended && (
                <span className="tag bg-fresh-500/20 text-fresh-400 !text-[10px] !px-2 !py-0.5">
                  <Zap className="w-3 h-3" /> 推荐
                </span>
              )}
              {option.isRace && (
                <span className="tag bg-caution-500/20 text-caution-400 !text-[10px] !px-2 !py-0.5">
                  <Trophy className="w-3 h-3" /> 比赛
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
              <span>
                剩余 <span className="text-gray-200 font-medium">{s.remainingKilometers.toFixed(0)} km</span>
              </span>
              <span>
                每公里 <span className="text-fresh-400 font-medium">¥{s.totalKilometers > 0 ? s.costPerKilometer.toFixed(1) : '-'}</span>
              </span>
              <span>
                已用 <span className={`font-medium ${s.lifePercentage >= 85 ? 'text-danger-400' : 'text-gray-200'}`}>
                  {s.lifePercentage.toFixed(0)}%
                </span>
              </span>
            </div>
          </div>
          <div
            className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
              selected
                ? 'bg-energy-500 text-white'
                : 'border-2 border-night-500'
            }`}
          >
            {selected && <Check className="w-4 h-4" />}
          </div>
        </div>
      </button>
    );
  };

  if (allShoes.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="card text-center py-12">
          <Footprints className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-white text-lg mb-2">
            还没有跑鞋档案
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            请先添加一双跑鞋，然后再记录跑步数据
          </p>
          <Link to="/shoe/new" className="btn-primary inline-flex items-center gap-2">
            添加跑鞋
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="btn-ghost !p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">记录跑步</h1>
          <p className="text-gray-400 text-sm">记录本次跑步数据，更新跑鞋寿命</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            路面类型
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ALL_SURFACES.map((surface) => {
              const selected = form.surface === surface;
              return (
                <button
                  key={surface}
                  type="button"
                  onClick={() => setForm({ ...form, surface })}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-center ${
                    selected
                      ? 'bg-fresh-500 text-white shadow-lg shadow-fresh-500/25'
                      : 'bg-night-700 text-gray-300 hover:bg-night-600 border border-night-500'
                  }`}
                >
                  {SURFACE_LABELS[surface]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label flex items-center gap-2 mb-0">
              <Footprints className="w-4 h-4" />
              选择跑鞋
            </label>
            {raceShoeCount > 0 && (
              <button
                type="button"
                onClick={() => setShowRaceShoes(!showRaceShoes)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  showRaceShoes
                    ? 'bg-caution-500/20 text-caution-400'
                    : 'bg-night-700 text-gray-400 hover:text-gray-200 border border-night-500'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                {showRaceShoes ? '切回日常鞋' : '切换到比赛鞋'} ({raceShoeCount})
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin">
            {shoeOptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {showRaceShoes ? '暂无比赛专用鞋' : '暂无日常训练鞋'}
              </div>
            ) : (
              <>
                {recommendedOptions.length > 0 && !showRaceShoes && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-fresh-400 mb-2 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> 适合 {SURFACE_LABELS[form.surface]}
                    </p>
                    <div className="space-y-2">
                      {recommendedOptions.map((o) => (
                        <ShoeCard key={o.shoe.id} option={o} />
                      ))}
                    </div>
                  </div>
                )}

                {otherOptions.length > 0 && (
                  <div>
                    {recommendedOptions.length > 0 && !showRaceShoes && (
                      <p className="text-xs font-medium text-gray-500 mb-2">其他可选</p>
                    )}
                    <div className="space-y-2">
                      {otherOptions.map((o) => (
                        <ShoeCard key={o.shoe.id} option={o} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">日期</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">公里数</label>
            <input
              type="number"
              value={form.kilometers}
              onChange={(e) => setForm({ ...form, kilometers: e.target.value })}
              placeholder="0.0"
              min="0.1"
              step="0.1"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            天气情况
          </label>
          <div className="grid grid-cols-5 gap-2">
            {ALL_WEATHER.map((weather) => {
              const selected = form.weather === weather;
              return (
                <button
                  key={weather}
                  type="button"
                  onClick={() => setForm({ ...form, weather })}
                  className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl transition-all ${
                    selected
                      ? 'bg-energy-500 text-white shadow-lg shadow-energy-500/25'
                      : 'bg-night-700 text-gray-300 hover:bg-night-600 border border-night-500'
                  }`}
                >
                  <span className="text-xl">{WEATHER_ICONS[weather]}</span>
                  <span className="text-xs">{WEATHER_LABELS[weather]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Star className="w-4 h-4" />
            脚感评分
          </label>
          <div className="p-4 rounded-xl bg-night-900 border border-night-600">
            <StarRating rating={form.feelRating} onChange={(r) => setForm({ ...form, feelRating: r })} />
            <p className="text-xs text-gray-500 mt-2">
              {form.feelRating === 5 && '完美脚感，弹性十足！'}
              {form.feelRating === 4 && '表现不错，跑步顺畅'}
              {form.feelRating === 3 && '一般水平，中规中矩'}
              {form.feelRating === 2 && '略显不适，需注意'}
              {form.feelRating === 1 && '脚感糟糕，建议检查鞋子'}
            </p>
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <FileText className="w-4 h-4" />
            磨损备注（可选）
          </label>
          <textarea
            value={form.wearNotes}
            onChange={(e) => setForm({ ...form, wearNotes: e.target.value })}
            placeholder="记录鞋子的磨损情况、异常感受等..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1">
            保存记录
          </button>
          <Link to="/" className="btn-secondary">
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
