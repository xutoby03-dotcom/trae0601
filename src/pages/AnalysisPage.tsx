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
      const tests = getTestsByEquipment(eq.id);
      if (tests.length === 0) {
        return {
          name: eq.cartridgeModel.length > 10 ? eq.cartridgeModel.slice(0, 10) + '…' : eq.cartridgeModel,
          fullName: getEquipmentName(eq.id),
          跳针评分: 0,
          齿音评分: 0,
          声道偏差: 0,
        };
      }
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const jumpAvg = avg(tests.map((t) => t.jumpLevel));
      const sibAvg = avg(tests.map((t) => t.sibilanceLevel));
      const chAvg = avg(tests.map((t) => Math.abs(t.leftChannelDb - t.rightChannelDb)));
      return {
        name: eq.cartridgeModel.length > 10 ? eq.cartridgeModel.slice(0, 10) + '…' : eq.cartridgeModel,
        fullName: getEquipmentName(eq.id),
        跳针评分: +(5 - jumpAvg).toFixed(1),
        齿音评分: +(5 - sibAvg).toFixed(1),
        声道偏差: +Math.max(0, 5 - chAvg).toFixed(1),
      };
    });
  }, [equipments, getTestsByEquipment, getEquipmentName]);

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
        <div className="card-header">
          <h3 className="font-serif text-lg font-bold text-oak-800">多设备综合对比</h3>
          <p className="text-xs text-ink-400 mt-0.5">所有设备的平均试听表现对比（满分5分，越高越好）</p>
        </div>
        <div className="card-body">
          {listeningScoreData.length === 0 || listeningScoreData.every((d) => d.跳针评分 === 0 && d.齿音评分 === 0) ? (
            <div className="py-16 text-center text-ink-400 text-sm">暂无试听数据用于对比</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={listeningScoreData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD2" />
                <XAxis dataKey="name" stroke="#8B6914" fontSize={12}>
                  <Tooltip />
                </XAxis>
                <YAxis stroke="#8B6914" fontSize={12} domain={[0, 5]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = listeningScoreData.find((d) => d.name === label);
                    return (
                      <div className="p-3 rounded-lg bg-oak-800 text-brass-100 text-xs shadow-xl">
                        <p className="font-semibold text-brass-200 mb-2 border-b border-oak-600 pb-1">
                          {item?.fullName || label}
                        </p>
                        {payload.map((entry: { name: string; value: number; color: string }, idx: number) => (
                          <p key={idx} className="flex items-center justify-between gap-4 py-0.5">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: entry.color }} />
                              {entry.name}
                            </span>
                            <span className="font-mono font-semibold">{entry.value}</span>
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                {['跳针评分', '齿音评分', '声道偏差'].map((key, idx) => {
                  const palette = ['#2E7D32', '#B8860B', '#1976D2'];
                  return (
                    <Bar key={key} dataKey={key} fill={palette[idx]} radius={[6, 6, 0, 0]}>
                      {listeningScoreData.map((_, index) => {
                        const colors = ['#2E7D32', '#66BB6A', '#81C784', '#1B5E20'];
                        return <Cell key={index} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
