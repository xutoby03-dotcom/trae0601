import { useMemo, useState } from 'react';
import {
  Calendar, Moon, Sun, CloudRain, Thermometer, Wind, Eye,
  ArrowRight, Sparkles, ChevronLeft, ChevronRight, Search, Filter
} from 'lucide-react';
import { useAstroStore } from '@/store/useAstroStore';
import {
  formatDate, formatDateChinese, getNext7Days,
  calculateMoonData, generateWeatherData, getScoreLabel, getBestObservationHours
} from '@/utils/astro';
import { CONSTELLATIONS, DEEP_SKY_TARGETS } from '@/data/constellations';
import MoonPhaseView from '@/components/MoonPhase';
import WeatherChart from '@/components/WeatherChart';
import TargetCard from '@/components/TargetCard';
import type { Difficulty } from '@/types';

export default function PlanPage() {
  const selectedDate = useAstroStore(s => s.selectedDate);
  const setSelectedDate = useAstroStore(s => s.setSelectedDate);
  const checklistTargets = useAstroStore(s => s.checklistTargets);

  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const days = getNext7Days();
  const moonData = useMemo(() => calculateMoonData(selectedDate), [selectedDate]);
  const weatherData = useMemo(() => generateWeatherData(selectedDate), [selectedDate]);
  const nightWeather = weatherData.filter(w => w.hour >= 19 || w.hour <= 5);
  const avgScore = Math.round(nightWeather.reduce((s, w) => s + w.score, 0) / nightWeather.length);
  const avgCloud = Math.round(nightWeather.reduce((s, w) => s + w.cloudCover, 0) / nightWeather.length);
  const avgTemp = Math.round(nightWeather.reduce((s, w) => s + w.temperature, 0) / nightWeather.length * 10) / 10;
  const avgWind = Math.round(nightWeather.reduce((s, w) => s + w.windSpeed, 0) / nightWeather.length * 10) / 10;
  const bestHours = getBestObservationHours(weatherData);
  const scoreInfo = getScoreLabel(avgScore);

  const filteredTargets = useMemo(() => {
    return DEEP_SKY_TARGETS.filter(t => {
      if (filterDifficulty !== 'all' && t.difficulty !== filterDifficulty) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.name.toLowerCase().includes(q) &&
            !t.commonName?.toLowerCase().includes(q) &&
            !t.constellation.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [filterDifficulty, filterType, searchQuery]);

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(formatDate(d));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 chip bg-nebula-purple/15 border border-nebula-purple/30 text-nebula-purple mb-3 px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">今晚，和宇宙有个约会</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
            <span className="text-gradient">观测计划</span>
          </h1>
          <p className="text-white/50 text-base">
            {formatDateChinese(selectedDate)} · 精选可见目标，规划最佳观测窗口
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium
                         focus:outline-none focus:ring-2 focus:ring-nebula-purple/40 text-sm"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          </div>
          <button
            onClick={() => changeDate(1)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 lg:mx-0 lg:px-0 scrollbar-hide">
        {days.map(d => {
          const active = d.date === selectedDate;
          const dayScore = getScoreLabel(
            Math.round(getBestObservationHours(generateWeatherData(d.date))[0]?.score ?? 50)
          );
          return (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl transition-all min-w-[76px]
                ${active
                  ? 'bg-gradient-to-br from-nebula-purple/30 to-nebula-cyan/20 border border-nebula-purple/40 shadow-lg shadow-nebula-purple/20'
                  : 'bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20'}`}
            >
              <span className={`text-[11px] font-medium mb-1 ${active ? 'text-nebula-purple' : 'text-white/50'}`}>
                {d.weekday}
              </span>
              <span className={`text-lg font-bold mb-1 ${active ? 'text-white' : 'text-white/80'}`}>
                {d.label}
              </span>
              <span className={`text-[10px] ${dayScore.color} font-medium`}>
                {dayScore.label}
              </span>
            </button>
          );
        })}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 glass-card p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-moonlight/5 blur-[80px]" />
          <div className="flex items-center justify-between mb-5 relative">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-moonlight" />
              <h2 className="font-display text-xl font-semibold">月相信息</h2>
            </div>
            <div className={`chip chip-${moonData.illumination < 30 ? 'easy' : moonData.illumination < 70 ? 'medium' : 'hard'}`}>
              {moonData.illumination < 30 ? '观星佳' : moonData.illumination < 70 ? '可观测' : '月光干扰'}
            </div>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div className="flex-shrink-0 pl-4 pt-4">
              <MoonPhaseView phase={moonData.phase} illumination={moonData.illumination} />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-2xl font-bold text-white mb-0.5">{moonData.phaseName}</p>
                <p className="text-xs text-white/40">月龄 {moonData.age} 天</p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50 flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-moonlight" /> 月出</span>
                  <span className="text-white font-medium">{moonData.moonRise}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50 flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-nebula-blue" /> 月落</span>
                  <span className="text-white font-medium">{moonData.moonSet}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <p className="text-xs text-white/50 leading-relaxed">
              {moonData.illumination < 30
                ? '✨ 今晚是观测深空天体的绝佳时机！月光微弱，暗天体更容易捕捉。'
                : moonData.illumination < 70
                  ? '🌙 月光中等，建议选择远离月面位置的目标进行观测，或使用滤镜。'
                  : '🔆 月光强烈，较适合观测明亮的行星、星团和月球本身，深空目标建议另选日期。'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 glass-card p-6 relative overflow-hidden">
          <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-nebula-cyan/5 blur-[100px]" />
          <div className="flex items-center justify-between mb-5 relative">
            <div className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-nebula-cyan" />
              <h2 className="font-display text-xl font-semibold">天气窗口</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`chip chip-${avgScore >= 60 ? 'easy' : avgScore >= 40 ? 'medium' : 'hard'} !text-sm !py-1.5 !px-3`}>
                综合评分 {avgScore} · {scoreInfo.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-5">
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-nebula-cyan/15 flex items-center justify-center">
                <CloudRain className="w-4 h-4 text-nebula-cyan" />
              </div>
              <p className="text-lg font-bold text-white">{avgCloud}%</p>
              <p className="text-[11px] text-white/40">夜间平均云量</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-red-500/15 flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-lg font-bold text-white">{avgTemp}°</p>
              <p className="text-[11px] text-white/40">夜间平均温度</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-nebula-purple/15 flex items-center justify-center">
                <Wind className="w-4 h-4 text-nebula-purple" />
              </div>
              <p className="text-lg font-bold text-white">{avgWind}</p>
              <p className="text-[11px] text-white/40">风速 m/s</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-aurora-green/15 flex items-center justify-center">
                <Eye className="w-4 h-4 text-aurora-green" />
              </div>
              <p className="text-lg font-bold text-white">{checklistTargets.length}</p>
              <p className="text-[11px] text-white/40">已选目标数</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-white/50 mb-2">24小时云量趋势（拖动下方滑块选择观测时段）</p>
            <WeatherChart data={weatherData} />
          </div>

          {bestHours.length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-white/50 mb-2.5">🌟 推荐观测时段</p>
              <div className="flex flex-wrap gap-2">
                {bestHours.map(h => {
                  const info = getScoreLabel(h.score);
                  return (
                    <span key={h.hour} className="chip bg-white/5 border border-white/10 !py-1.5 !px-3">
                      <span className={`${info.color} font-semibold`}>
                        {String(h.hour).padStart(2, '0')}:00 - {String(h.hour + 1).padStart(2, '0')}:00
                      </span>
                      <span className="text-white/50 ml-1">
                        云{h.cloudCover}% · {h.temperature}°
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <span>🌟 可见星座</span>
            </h2>
            <p className="section-subtitle">今晚升起的主要星座，点击筛选深空目标</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CONSTELLATIONS.map(c => (
            <div
              key={c.id}
              className="glass-card-hover p-4 cursor-pointer text-center group"
            >
              <div className="text-3xl mb-2 transition-transform group-hover:scale-110">{c.symbol}</div>
              <p className="font-semibold text-white text-sm mb-0.5">{c.name}</p>
              <p className="text-[10px] text-white/40 italic mb-2">{c.latinName}</p>
              <div className="flex flex-wrap justify-center gap-1">
                <span className="text-[10px] text-white/60">{c.riseTime}↑</span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] text-aurora-green">{c.season}季</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <span>🌠 深空目标推荐</span>
            </h2>
            <p className="section-subtitle">共 {DEEP_SKY_TARGETS.length} 个精选目标 · 已加入 {checklistTargets.length} 个</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="搜索目标/星座..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30
                           focus:outline-none focus:ring-2 focus:ring-nebula-purple/40 w-48"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
              <Filter className="w-4 h-4 text-white/40 mx-2" />
              {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setFilterDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${filterDifficulty === d
                      ? 'bg-nebula-purple/30 text-white border border-nebula-purple/40'
                      : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  {d === 'all' ? '全部' : d === 'easy' ? '入门' : d === 'medium' ? '进阶' : '挑战'}
                </button>
              ))}
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-nebula-purple/40"
            >
              <option value="all" className="bg-space-900">全部类型</option>
              <option value="nebula" className="bg-space-900">星云</option>
              <option value="galaxy" className="bg-space-900">星系</option>
              <option value="cluster" className="bg-space-900">星团</option>
            </select>
          </div>
        </div>

        {filteredTargets.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-5xl mb-4">🔭</p>
            <p className="text-white/60 mb-1">没有符合条件的目标</p>
            <p className="text-xs text-white/40">请尝试调整筛选条件或清空搜索</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTargets.map(t => (
              <TargetCard key={t.id} target={t} />
            ))}
          </div>
        )}
      </section>

      {checklistTargets.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <a
            href="#/checklist"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#/checklist';
            }}
            className="btn-primary shadow-2xl shadow-nebula-purple/40 animate-pulse-glow !px-6 !py-3"
          >
            查看观测清单
            <span className="ml-2 chip bg-white/20 border-white/30 text-white">
              {checklistTargets.length} 个目标
            </span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
