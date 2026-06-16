import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  Flame,
} from 'lucide-react';
import { usePotStore } from '../store/usePotStore';
import { Card } from '../components/ui';
import { cn } from '../lib/utils';

export default function Statistics() {
  const navigate = useNavigate();
  const { pots } = usePotStore();

  const spiceRanking = useMemo(() => {
    return [...pots]
      .map((pot) => ({
          potId: pot.id,
          potName: pot.name,
          count: pot.spicePackCount,
        }))
      .sort((a, b) => b.count - a.count);
  }, [pots]);

  const maxSpiceCount = Math.max(...spiceRanking.map((s) => s.count), 1);

  const cleanSchedule = useMemo(() => {
    const cleanCycle = pots.map((pot) => {
      const lastClean = new Date(pot.lastCleanDate);
      const daysSinceClean = Math.floor(
        (Date.now() - lastClean.getTime()) / (1000 * 60 * 60 * 24)
      );
      const recommendedCleanDate = new Date(lastClean.getTime() + 7 * 24 * 60 * 60 * 1000);
      const daysUntilClean = Math.ceil(
        (recommendedCleanDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        potId: pot.id,
        potName: pot.name,
        lastCleanDate: pot.lastCleanDate,
        recommendedCleanDate: recommendedCleanDate.toISOString().split('T')[0],
        daysSinceClean,
        daysUntilClean,
        isOverdue: daysSinceClean > 7,
      };
    });

    return [...cleanSchedule].sort((a, b) => a.daysUntilClean - b.daysUntilClean);
  }, [pots]);

  const tasteTrend = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push({
        date: dateStr,
        normal: 0,
        light: 0,
        salty: 0,
        weak: 0,
      });
    }

    pots.forEach((pot) => {
      pot.cookingRecords.forEach((record) => {
        const recordDate = record.timestamp.split('T')[0];
        const dayData = last7Days.find((d) => d.date === recordDate);
        if (dayData) {
          dayData[record.tasteResult]++;
        }
      });
    });

    return last7Days;
  }, [pots]);

  const maxTasteCount = Math.max(
    ...tasteTrend.flatMap((d) => [d.normal, d.light, d.salty, d.weak]),
    1
  );

  const totalComplaints = pots.reduce((sum, pot) => sum + pot.complaints.length, 0);
  const totalCookingRecords = pots.reduce(
    (sum, pot) => sum + pot.cookingRecords.length,
    0
  );
  const avgTasteNormalRate = totalCookingRecords > 0
    ? Math.round(
        (pots.reduce(
          (sum, pot) =>
            sum + pot.cookingRecords.filter((r) => r.tasteResult === 'normal').length,
          0
        ) /
          totalCookingRecords) *
          100
      )
    : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">统计分析</h1>
        <p className="text-stone-500 mt-1">香料消耗排行、清锅周期提醒、品质趋势分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-braised-red-100 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-braised-red-600" />
            </div>
            <div>
              <p className="text-stone-500 text-sm">本月香料</p>
              <p className="text-2xl font-bold text-stone-800">
                {spiceRanking.reduce((sum, s) => sum + s.count, 0)} 包
              </p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-stone-500 text-sm">试味正常率</p>
              <p className="text-2xl font-bold text-stone-800">{avgTasteNormalRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-gold-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-gold-600" />
            </div>
            <div>
              <p className="text-stone-500 text-sm">续煮次数</p>
              <p className="text-2xl font-bold text-stone-800">{totalCookingRecords} 次</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-stone-500 text-sm">累计客诉</p>
              <p className="text-2xl font-bold text-stone-800">{totalComplaints} 单</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="香料消耗排行"
          action={
            <span className="text-xs text-stone-500">本月累计</span>
          }
        >
          <div className="space-y-4">
            {spiceRanking.map((item, index) => (
              <div
                key={item.potId}
                onClick={() => navigate(`/pot/${item.potId}`)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                    index === 0 && 'bg-amber-gold-400 text-white',
                    index === 1 && 'bg-stone-400 text-white',
                    index === 2 && 'bg-amber-700 text-white',
                    index > 2 && 'bg-stone-200 text-stone-600'
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-stone-800">{item.potName}</span>
                    <span className="font-mono font-bold text-stone-700">
                      {item.count} 包
                    </span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-braised-red-500 to-braised-red-400 rounded-full transition-all duration-700"
                      style={{ width: `${(item.count / maxSpiceCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <Trophy
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    index === 0 ? 'text-amber-gold-500' : 'text-stone-300'
                  )}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="清锅提醒"
          action={
            <span className="text-xs text-stone-500">建议7天清锅一次</span>
          }
        >
          <div className="space-y-3">
            {cleanSchedule.map((item) => (
              <div
                key={item.potId}
                onClick={() => navigate(`/pot/${item.potId}`)}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm',
                  item.isOverdue
                    ? 'bg-red-50 border-red-200'
                    : item.daysUntilClean <= 2
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-stone-50 border-stone-200'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-stone-800">{item.potName}</span>
                  {item.isOverdue ? (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium animate-pulse">
                      已超期
                    </span>
                  ) : item.daysUntilClean <= 2 ? (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full font-medium">
                      即将到期
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">
                      正常
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <Calendar className="w-4 h-4" />
                    <span>上次清锅：{item.lastCleanDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      已用 {item.daysSinceClean} 天</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-stone-500 mb-1">
                    <span>距离下次清锅</span>
                    <span className="font-medium">
                      {item.isOverdue
                        ? `超期 ${Math.abs(item.daysUntilClean)} 天`
                        : `还有 ${item.daysUntilClean} 天`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        item.isOverdue
                          ? 'bg-red-500'
                          : item.daysUntilClean <= 2
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      )}
                      style={{
                        width: `${Math.min(100, (item.daysSinceClean / 7) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        title="试味结果趋势"
        action={<span className="text-xs text-stone-500">最近 7 天</span>}
      >
        <div className="h-48 flex items-end gap-3 pt-4">
          {tasteTrend.map((day) => {
            const total = day.normal + day.light + day.salty + day.weak;
            const dayLabel = new Date(day.date).toLocaleDateString('zh-CN', {
              month: 'numeric',
              day: 'numeric',
            });
            const weekday = new Date(day.date).toLocaleDateString('zh-CN', {
              weekday: 'short',
            });

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col justify-end gap-0.5 h-36">
                  {day.normal > 0 && (
                    <div
                      className="w-full bg-green-500 rounded-t-sm transition-all duration-500"
                      style={{ height: `${(day.normal / maxTasteCount) * 100}%` }}
                      title={`正常: ${day.normal}`}
                    ></div>
                  )}
                  {day.light > 0 && (
                    <div
                      className="w-full bg-sky-500 transition-all duration-500"
                      style={{ height: `${(day.light / maxTasteCount) * 100}%` }}
                      title={`偏淡: ${day.light}`}
                    ></div>
                  )}
                  {day.salty > 0 && (
                    <div
                      className="w-full bg-orange-500 transition-all duration-500"
                      style={{ height: `${(day.salty / maxTasteCount) * 100}%` }}
                      title={`偏咸: ${day.salty}`}
                    ></div>
                  )}
                  {day.weak > 0 && (
                    <div
                      className="w-full bg-violet-500 rounded-b-sm transition-all duration-500"
                      style={{ height: `${(day.weak / maxTasteCount) * 100}%` }}
                      title={`香味弱: ${day.weak}`}
                    ></div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-stone-700">{dayLabel}</p>
                  <p className="text-xs text-stone-400">{weekday}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{total} 次</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
            <span className="text-xs text-stone-600">正常</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-sky-500 rounded-sm"></span>
            <span className="text-xs text-stone-600">偏淡</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-500 rounded-sm"></span>
            <span className="text-xs text-stone-600">偏咸</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-violet-500 rounded-sm"></span>
            <span className="text-xs text-stone-600">香味弱</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
