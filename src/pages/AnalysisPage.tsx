import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from 'recharts';
import {
  AlertTriangle,
  Wrench,
  RefreshCw,
  Volume2,
  TrendingDown,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Disc,
  CalendarDays,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Alert } from '../types';

const typeLabels: Record<string, { label: string; icon: typeof Wrench; color: string }> = {
  realignment: { label: '重新调平', icon: RefreshCw, color: 'bg-amber-500' },
  replace_stylus: { label: '更换针尖', icon: Wrench, color: 'bg-red-500' },
  channel_balance: { label: '声道平衡', icon: Volume2, color: 'bg-sky-500' },
};

export default function AnalysisPage() {
  const equipments = useAppStore((s) => s.equipments);
  const calibrations = useAppStore((s) => s.calibrations);
  const listeningTests = useAppStore((s) => s.listeningTests);
  const generateAlerts = useAppStore((s) => s.generateAlerts);
  const getEquipmentName = useAppStore((s) => s.getEquipmentName);
  const getCalibrationsByEquipment = useAppStore((s) => s.getCalibrationsByEquipment);
  const getTestsByEquipment = useAppStore((s) => s.getTestsByEquipment);
  const getEquipment = useAppStore((s) => s.getEquipment);

  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipments[0]?.id || '');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const alerts = useMemo(() => generateAlerts(), [equipments, calibrations, listeningTests, generateAlerts]);
  const dangerAlerts = alerts.filter((a) => a.severity === 'danger');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  const forceDeviationData = useMemo(() => {
    if (!selectedEquipmentId) return [];
    const cals = getCalibrationsByEquipment(selectedEquipmentId).slice().reverse();
    return cals.map((c) => ({
      date: c.calibrationDate.slice(5),
      目标针压: c.targetForce,
      实测针压: c.measuredForce,
      偏差: +(c.measuredForce - c.targetForce).toFixed(2),
    }));
  }, [selectedEquipmentId, getCalibrationsByEquipment]);

  const listeningScoreData = useMemo(() => {
    return equipments.map((eq) => {
      const eqAlerts = alerts.filter((a) => a.equipmentId === eq.id);
      const realignmentCount = eqAlerts.filter((a) => a.type === 'realignment' || a.type === 'channel_balance').length;
      const replaceStylusCount = eqAlerts.filter((a) => a.type === 'replace_stylus').length;
      const dangerCount = eqAlerts.filter((a) => a.severity === 'danger').length;
      const warningCount = eqAlerts.filter((a) => a.severity === 'warning').length;

      const tests = getTestsByEquipment(eq.id);
      const latestTest = tests[0];

      if (tests.length === 0) {
        return {
          id: eq.id,
          name: eq.cartridgeModel,
          turntable: eq.turntableModel,
          fullName: getEquipmentName(eq.id),
          跳针评分: 0,
          齿音评分: 0,
          声道偏差: 0,
          综合评分: 0,
          realignmentCount,
          replaceStylusCount,
          dangerCount,
          warningCount,
          hasAlert: eqAlerts.length > 0,
          alerts: eqAlerts,
          latestTest: null,
        };
      }
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const jumpAvg = avg(tests.map((t) => t.jumpLevel));
      const sibAvg = avg(tests.map((t) => t.sibilanceLevel));
      const chAvg = avg(tests.map((t) => Math.abs(t.leftChannelDb - t.rightChannelDb)));
      const jumpScore = +(5 - jumpAvg).toFixed(1);
      const sibScore = +(5 - sibAvg).toFixed(1);
      const chScore = +Math.max(0, 5 - chAvg).toFixed(1);
      const overallScore = +((jumpScore + sibScore + chScore) / 3).toFixed(1);
      return {
        id: eq.id,
        name: eq.cartridgeModel,
        turntable: eq.turntableModel,
        fullName: getEquipmentName(eq.id),
        跳针评分: jumpScore,
        齿音评分: sibScore,
        声道偏差: chScore,
        综合评分: overallScore,
        realignmentCount,
        replaceStylusCount,
        dangerCount,
        warningCount,
        hasAlert: eqAlerts.length > 0,
        alerts: eqAlerts,
        latestTest: latestTest
          ? {
              date: latestTest.testDate,
              recordName: latestTest.recordName || '未指定唱片',
              jumpLevel: latestTest.jumpLevel,
              sibilanceLevel: latestTest.sibilanceLevel,
              leftDb: latestTest.leftChannelDb,
              rightDb: latestTest.rightChannelDb,
            }
          : null,
      };
    }).sort((a, b) => a.综合评分 - b.综合评分);
  }, [equipments, getTestsByEquipment, getEquipmentName, alerts]);

  const radarData = useMemo(() => {
    if (!selectedEquipmentId) return [];
    const eq = getEquipment(selectedEquipmentId);
    if (!eq) return [];
    const tests = getTestsByEquipment(selectedEquipmentId);
    if (tests.length === 0) {
      return [
        { subject: '针压稳定', A: 5 },
        { subject: '抗跳针', A: 5 },
        { subject: '齿音控制', A: 5 },
        { subject: '声道平衡', A: 5 },
        { subject: '校准频率', A: 5 },
      ];
    }
    const cals = getCalibrationsByEquipment(selectedEquipmentId);
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const jumpAvg = avg(tests.map((t) => t.jumpLevel));
    const sibAvg = avg(tests.map((t) => t.sibilanceLevel));
    const chDiff = avg(tests.map((t) => Math.abs(t.leftChannelDb - t.rightChannelDb)));
    const forceDev = avg(
      cals.map((c) => Math.abs(c.measuredForce - c.targetForce))
    );
    const forceScore = Math.max(0, 5 - forceDev * 5);
    const calFreqScore = Math.min(5, cals.length * 1.5);
    return [
      { subject: '针压稳定', A: +Math.max(0, forceScore).toFixed(1) },
      { subject: '抗跳针', A: +(5 - jumpAvg).toFixed(1) },
      { subject: '齿音控制', A: +(5 - sibAvg).toFixed(1) },
      { subject: '声道平衡', A: +Math.max(0, 5 - chDiff).toFixed(1) },
      { subject: '校准频率', A: +calFreqScore.toFixed(1) },
    ];
  }, [selectedEquipmentId, getEquipment, getTestsByEquipment, getCalibrationsByEquipment]);

  const comparisonData = useMemo(() => {
    if (!selectedEquipmentId) return [];
    const tests = getTestsByEquipment(selectedEquipmentId).slice().reverse().slice(-10);
    return tests.map((t) => ({
      date: t.testDate.slice(5),
      跳针等级: t.jumpLevel,
      齿音等级: t.sibilanceLevel,
      声道偏差: +Math.abs(t.leftChannelDb - t.rightChannelDb).toFixed(1),
    }));
  }, [selectedEquipmentId, getTestsByEquipment]);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-serif text-xl font-bold text-oak-800">设备维护告警汇总</h3>
            <p className="text-sm text-ink-400">
              根据针压偏差、试听质量自动生成的维护建议
            </p>
          </div>
        </div>
        <div className="card-body">
          {alerts.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-forest-600" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-forest-700 mb-2">
                所有设备状态良好
              </h4>
              <p className="text-sm text-ink-400">继续保持定期校准和试听记录</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                  <p className="text-sm text-red-600 mb-1">严重告警</p>
                  <p className="text-3xl font-serif font-bold text-red-700">{dangerAlerts.length}</p>
                  <p className="text-xs text-red-500 mt-1">需立即处理</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                  <p className="text-sm text-amber-700 mb-1">注意事项</p>
                  <p className="text-3xl font-serif font-bold text-amber-700">{warningAlerts.length}</p>
                  <p className="text-xs text-amber-600 mt-1">建议近期处理</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-forest-50 to-forest-100 border border-forest-200">
                  <p className="text-sm text-forest-700 mb-1">健康设备</p>
                  <p className="text-3xl font-serif font-bold text-forest-700">
                    {equipments.length - new Set(alerts.map((a) => a.equipmentId)).size}
                  </p>
                  <p className="text-xs text-forest-600 mt-1">无告警设备数</p>
                </div>
              </div>

              <div className="space-y-3">
                {alerts.map((alert: Alert) => {
                  const info = typeLabels[alert.type] || { label: '告警', icon: AlertTriangle, color: 'bg-gray-500' };
                  const TypeIcon = info.icon;
                  const bgClass =
                    alert.severity === 'danger'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200';
                  const barColor =
                    alert.severity === 'danger' ? 'bg-red-500' : 'bg-amber-500';
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border ${bgClass} flex items-start gap-4`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${info.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <TypeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`badge ${alert.severity === 'danger' ? 'badge-danger' : 'badge-warning'}`}>
                            {alert.severity === 'danger' ? '严重' : '注意'}
                          </span>
                          <span className="badge badge-info">{info.label}</span>
                          <span className="text-sm font-semibold text-oak-700">
                            {getEquipmentName(alert.equipmentId)}
                          </span>
                        </div>
                        <p className="text-oak-700 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full`}
                              style={{ width: alert.severity === 'danger' ? '85%' : '55%' }}
                            />
                          </div>
                          <span className="text-xs text-ink-500">优先级</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-oak-500" />
        <h3 className="font-serif text-lg font-bold text-oak-800">选择设备查看详细分析</h3>
        <select
          value={selectedEquipmentId}
          onChange={(e) => setSelectedEquipmentId(e.target.value)}
          className="select-field !w-auto min-w-[280px]"
        >
          {equipments.map((e) => (
            <option key={e.id} value={e.id}>
              {e.turntableModel} / {e.cartridgeModel}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-serif text-lg font-bold text-oak-800">针压校准趋势</h3>
            <p className="text-xs text-ink-400 mt-0.5">目标针压 vs 实测针压 (mN)</p>
          </div>
          <div className="card-body">
            {forceDeviationData.length === 0 ? (
              <div className="py-16 text-center text-ink-400 text-sm">暂无校准数据</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={forceDeviationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD2" />
                  <XAxis dataKey="date" stroke="#8B6914" fontSize={12} />
                  <YAxis stroke="#8B6914" fontSize={12} domain={['dataMin - 0.3', 'dataMax + 0.3']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#3E2723',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F5E6BF',
                      fontSize: '13px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="目标针压"
                    stroke="#B8860B"
                    strokeWidth={2.5}
                    dot={{ fill: '#B8860B', r: 4 }}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="实测针压"
                    stroke="#2E7D32"
                    strokeWidth={3}
                    dot={{ fill: '#2E7D32', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-serif text-lg font-bold text-oak-800">设备性能雷达图</h3>
            <p className="text-xs text-ink-400 mt-0.5">5分制 · 越高越好 (满分5分)</p>
          </div>
          <div className="card-body">
            {radarData.length === 0 ? (
              <div className="py-16 text-center text-ink-400 text-sm">暂无试听数据</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <PolarGrid stroke="#D4BFA8" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#5D4037', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#8B6914', fontSize: 10 }} />
                  <Radar
                    name="得分"
                    dataKey="A"
                    stroke="#B8860B"
                    strokeWidth={2}
                    fill="#B8860B"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card xl:col-span-2">
          <div className="card-header">
            <h3 className="font-serif text-lg font-bold text-oak-800">试听质量趋势</h3>
            <p className="text-xs text-ink-400 mt-0.5">跳针/齿音等级越低越好，声道偏差越低越好</p>
          </div>
          <div className="card-body">
            {comparisonData.length === 0 ? (
              <div className="py-16 text-center text-ink-400 text-sm">暂无试听记录</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD2" />
                  <XAxis dataKey="date" stroke="#8B6914" fontSize={12} />
                  <YAxis stroke="#8B6914" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#3E2723',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F5E6BF',
                      fontSize: '13px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="跳针等级" fill="#FF8F00" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="齿音等级" fill="#D32F2F" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="声道偏差" fill="#1976D2" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-oak-800">设备健康度一览</h3>
            <p className="text-xs text-ink-400 mt-0.5">按综合表现排序 · 点击卡片切换上方详情 · 有告警可展开看说明</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="badge badge-danger">
              <Wrench className="w-3 h-3" /> 更换针尖
            </span>
            <span className="badge badge-warning">
              <RefreshCw className="w-3 h-3" /> 重新调平
            </span>
            <span className="badge badge-info">
              <Volume2 className="w-3 h-3" /> 声道平衡
            </span>
          </div>
        </div>
        <div className="card-body">
          {listeningScoreData.length === 0 ? (
            <div className="py-16 text-center text-ink-400 text-sm">暂无设备数据</div>
          ) : (
            <div className="space-y-3">
              {listeningScoreData.map((item, idx) => {
                const isSelected = item.id === selectedEquipmentId;
                const isExpanded = expandedId === item.id;
                const scoreColor =
                  item.综合评分 >= 4
                    ? 'bg-forest-500'
                    : item.综合评分 >= 3
                    ? 'bg-brass-500'
                    : 'bg-red-500';
                const scoreText =
                  item.综合评分 >= 4
                    ? 'text-forest-700'
                    : item.综合评分 >= 3
                    ? 'text-brass-700'
                    : 'text-red-700';
                const bgClass = item.hasAlert
                  ? item.dangerCount > 0
                    ? 'bg-red-50/60 border-red-200 hover:bg-red-50'
                    : 'bg-amber-50/60 border-amber-200 hover:bg-amber-50'
                  : 'bg-forest-50/30 border-forest-100 hover:bg-forest-50/50';

                const jumpLevelColors = ['bg-forest-500', 'bg-forest-400', 'bg-lime-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-600'];
                const sibLevelColors = ['bg-forest-500', 'bg-forest-400', 'bg-teal-500', 'bg-sky-500', 'bg-purple-500', 'bg-red-600'];

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border-2 transition-all duration-200 ${bgClass} ${
                      isSelected ? 'ring-2 ring-brass-400 ring-offset-2 border-brass-400' : ''
                    }`}
                  >
                    <div
                      onClick={() => setSelectedEquipmentId(item.id)}
                      className="p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-ink-400">#{idx + 1}</span>
                            <h4 className="font-serif font-bold text-oak-800 text-base">{item.name}</h4>
                            {item.dangerCount > 0 && (
                              <span className="badge badge-danger animate-pulse-slow">
                                {item.dangerCount} 个严重
                              </span>
                            )}
                            {item.warningCount > 0 && item.dangerCount === 0 && (
                              <span className="badge badge-warning">
                                {item.warningCount} 个注意
                              </span>
                            )}
                            {!item.hasAlert && (
                              <span className="badge badge-success">状态良好</span>
                            )}
                          </div>
                          <p className="text-xs text-ink-400 truncate max-w-sm">
                            {item.turntable}
                          </p>

                          {item.latestTest && (
                            <div className="mt-3 p-2.5 rounded-lg bg-white/60 border border-oak-100">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Disc className="w-3.5 h-3.5 text-brass-600" />
                                <span className="text-xs font-medium text-oak-700 truncate">
                                  {item.latestTest.recordName}
                                </span>
                                <span className="text-[10px] text-ink-400 ml-auto flex items-center gap-1 shrink-0">
                                  <CalendarDays className="w-3 h-3" />
                                  {item.latestTest.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px]">
                                <span className="flex items-center gap-1">
                                  <span className={`w-2 h-2 rounded-full ${jumpLevelColors[item.latestTest.jumpLevel]}`} />
                                  跳针 {item.latestTest.jumpLevel} 级
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className={`w-2 h-2 rounded-full ${sibLevelColors[item.latestTest.sibilanceLevel]}`} />
                                  齿音 {item.latestTest.sibilanceLevel} 级
                                </span>
                                <span className="text-ink-400">
                                  声道 {Math.abs(item.latestTest.leftDb - item.latestTest.rightDb).toFixed(1)} dB
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <div className="flex gap-2">
                            {item.replaceStylusCount > 0 && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium shadow-sm">
                                <Wrench className="w-4 h-4" />
                                <span>换针尖</span>
                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">
                                  {item.replaceStylusCount}
                                </span>
                              </div>
                            )}
                            {item.realignmentCount > 0 && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium shadow-sm">
                                <RefreshCw className="w-4 h-4" />
                                <span>重调平</span>
                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">
                                  {item.realignmentCount}
                                </span>
                              </div>
                            )}
                            {!item.hasAlert && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-500 text-white text-sm font-medium shadow-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>无需维护</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-full sm:w-auto sm:min-w-[280px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-ink-500">综合评分</span>
                            <span className={`text-sm font-bold font-mono ${scoreText}`}>
                              {item.综合评分.toFixed(1)} / 5.0
                            </span>
                          </div>
                          <div className="h-2.5 bg-oak-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${scoreColor} rounded-full transition-all duration-500`}
                              style={{ width: `${(item.综合评分 / 5) * 100}%` }}
                            />
                          </div>
                          <div className="flex gap-3 mt-2 text-[11px] text-ink-500">
                            <span>跳针 {item.跳针评分.toFixed(1)}</span>
                            <span>齿音 {item.齿音评分.toFixed(1)}</span>
                            <span>声道 {item.声道偏差.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.hasAlert && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : item.id);
                        }}
                        className="w-full px-4 py-2 flex items-center justify-center gap-1.5 text-xs text-oak-600 hover:text-oak-800 border-t border-oak-100/50 hover:bg-oak-50/50 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            收起告警详情
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            展开 {item.alerts.length} 条告警详情
                          </>
                        )}
                      </button>
                    )}

                    {isExpanded && item.hasAlert && (
                      <div className="px-4 pb-4 pt-1 space-y-2 border-t border-oak-100/50">
                        {item.alerts.map((alert: Alert) => {
                          const info = typeLabels[alert.type] || { label: '告警', icon: AlertTriangle, color: 'bg-gray-500' };
                          const TypeIcon = info.icon;
                          const alertBg =
                            alert.severity === 'danger'
                              ? 'bg-white/80 border-red-200'
                              : 'bg-white/60 border-amber-200';
                          return (
                            <div
                              key={alert.id}
                              className={`p-3 rounded-lg border ${alertBg} flex items-start gap-3`}
                            >
                              <div className={`w-8 h-8 rounded-lg ${info.color} flex items-center justify-center shrink-0`}>
                                <TypeIcon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  <span className={`badge ${alert.severity === 'danger' ? 'badge-danger' : 'badge-warning'} !py-0.5`}>
                                    {alert.severity === 'danger' ? '严重' : '注意'}
                                  </span>
                                  <span className="text-xs font-semibold text-oak-700">
                                    {info.label}
                                  </span>
                                </div>
                                <p className="text-xs text-oak-600">{alert.message}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
