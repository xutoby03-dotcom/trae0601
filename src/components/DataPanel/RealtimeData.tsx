import { useWindSimulation } from '../../hooks/useWindSimulation';
import { getWindDirectionLabel, getBeaufortScale, getTanglingLevel } from '../../utils/windCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Wind, Compass, Zap, Volume2, AlertTriangle, TrendingUp } from 'lucide-react';

export const RealtimeData = () => {
  const { currentWindData, riskSummary } = useWindSimulation();
  const beaufort = getBeaufortScale(currentWindData.windSpeed);
  const tangling = getTanglingLevel(currentWindData.tanglingIndex);

  const dataItems = [
    {
      icon: <Compass size={18} className="text-cyan-400" />,
      label: '风向',
      value: `${currentWindData.windDirection.toFixed(0)}°`,
      subValue: getWindDirectionLabel(currentWindData.windDirection),
      color: 'text-cyan-400',
    },
    {
      icon: <Wind size={18} className="text-emerald-400" />,
      label: '风速',
      value: `${currentWindData.windSpeed.toFixed(1)} m/s`,
      subValue: `${beaufort.label} (${beaufort.level}级)`,
      color: 'text-emerald-400',
    },
    {
      icon: <Zap size={18} className="text-amber-400" />,
      label: '阵风',
      value: `${currentWindData.gustSpeed.toFixed(1)} m/s`,
      subValue: `+${((currentWindData.gustSpeed / currentWindData.windSpeed - 1) * 100).toFixed(0)}%`,
      color: 'text-amber-400',
    },
    {
      icon: <Volume2 size={18} className="text-purple-400" />,
      label: '噪声',
      value: `${currentWindData.noiseLevel.toFixed(0)} dB`,
      subValue: currentWindData.noiseLevel > 65 ? '偏高' : '正常',
      color: currentWindData.noiseLevel > 65 ? 'text-red-400' : 'text-purple-400',
    },
    {
      icon: <AlertTriangle size={18} style={{ color: tangling.color }} />,
      label: '缠绕指数',
      value: `${currentWindData.tanglingIndex.toFixed(0)}`,
      subValue: tangling.level,
      color: tangling.color,
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-cyan-400">实时风场数据</span>
          <span className="text-xs text-slate-400 font-normal">
            {riskSummary.averageRiskScore > 50 && (
              <span className="text-amber-400 mr-2">⚠ 检测到高风险</span>
            )}
            {riskSummary.totalPoles} 根旗杆
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {dataItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-slate-800/80">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-400 font-mono">{item.label}</div>
                <div className={`text-lg font-bold font-mono ${item.color}`}>
                  {item.value}
                </div>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {item.subValue}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-slate-900/80 to-slate-800/50 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono">风险概览</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-red-500/10">
              <div className="text-xl font-bold text-red-400 font-mono">{riskSummary.highRisk}</div>
              <div className="text-[10px] text-slate-500">高风险</div>
            </div>
            <div className="p-2 rounded bg-amber-500/10">
              <div className="text-xl font-bold text-amber-400 font-mono">{riskSummary.mediumRisk}</div>
              <div className="text-[10px] text-slate-500">中风险</div>
            </div>
            <div className="p-2 rounded bg-green-500/10">
              <div className="text-xl font-bold text-green-400 font-mono">{riskSummary.lowRisk}</div>
              <div className="text-[10px] text-slate-500">低风险</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
