import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  AlertTriangle,
  Download,
  Edit2,
  Save,
} from 'lucide-react';
import { useAppStore } from '../store';
import { getTrendData, getSummaryStats, generateCSV, downloadCSV } from '../services/exportService';
import { getDaysUntilVisit } from '../services/alertService';
import { cn } from '../lib/utils';
import AlertBanner from '../components/AlertBanner';

export default function Trends() {
  const { measurements, device, settings, updateSettings } = useAppStore();
  const [isEditingVisit, setIsEditingVisit] = useState(false);
  const [visitDateInput, setVisitDateInput] = useState(settings.nextVisitDate || '');

  const trendData = getTrendData(measurements, settings.nextVisitDate);
  const summaryStats = getSummaryStats(measurements, settings.nextVisitDate);
  const daysUntilVisit = getDaysUntilVisit(settings.nextVisitDate);

  const handleSaveVisitDate = () => {
    updateSettings({ nextVisitDate: visitDateInput });
    setIsEditingVisit(false);
  };

  const handleExportReport = () => {
    const content = generateCSV(measurements, device, settings);
    const filename = `血压报告_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(content, filename);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.value}
                {entry.name !== '测量次数' && ' mmHg'}
                {entry.name === '心率' && ' bpm'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">趋势分析</h1>
          <p className="text-gray-500">查看您的血压变化趋势，为复诊做好准备</p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-200"
        >
          <Download className="w-5 h-5" />
          导出报告
        </button>
      </div>

      <AlertBanner />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium opacity-90 mb-1">下次复诊</h3>
                {isEditingVisit ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={visitDateInput}
                      onChange={(e) => setVisitDateInput(e.target.value)}
                      className="px-4 py-2 rounded-xl text-gray-900 font-medium"
                    />
                    <button
                      onClick={handleSaveVisitDate}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-6 h-6 opacity-80" />
                      <span className="text-3xl font-bold">
                        {settings.nextVisitDate || '未设置'}
                      </span>
                    </div>
                    {daysUntilVisit !== null && (
                      <span className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        daysUntilVisit <= 7
                          ? 'bg-red-400/30'
                          : daysUntilVisit <= 14
                          ? 'bg-amber-400/30'
                          : 'bg-white/20'
                      )}>
                        {daysUntilVisit > 0 ? `还有 ${daysUntilVisit} 天` : '已到复诊日期'}
                      </span>
                    )}
                    <button
                      onClick={() => setIsEditingVisit(true)}
                      className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <p className="text-sm opacity-75 mt-2">
                  {settings.nextVisitDate
                    ? `以下展示 ${settings.nextVisitDate} 前 30 天的数据趋势`
                    : '请设置下次复诊日期，系统将为您生成复诊周期内的趋势报告'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {summaryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">平均收缩压</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summaryStats.avgSystolic}</p>
            <p className="text-xs text-gray-400 mt-1">
              最高 {summaryStats.maxSystolic} / 最低 {summaryStats.minSystolic}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-500">平均舒张压</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summaryStats.avgDiastolic}</p>
            <p className="text-xs text-gray-400 mt-1">
              最高 {summaryStats.maxDiastolic} / 最低 {summaryStats.minDiastolic}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <span className="text-sm text-gray-500">平均心率</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summaryStats.avgHeartRate}</p>
            <p className="text-xs text-gray-400 mt-1">次/分钟</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                summaryStats.abnormalCount > 0 ? 'bg-red-100' : 'bg-emerald-100'
              )}>
                <AlertTriangle className={cn(
                  'w-5 h-5',
                  summaryStats.abnormalCount > 0 ? 'text-red-600' : 'text-emerald-600'
                )} />
              </div>
              <span className="text-sm text-gray-500">异常次数</span>
            </div>
            <p className={cn(
              'text-3xl font-bold',
              summaryStats.abnormalCount > 0 ? 'text-red-600' : 'text-emerald-600'
            )}>
              {summaryStats.abnormalCount}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              异常率 {summaryStats.abnormalRate}% · 共 {summaryStats.totalMeasurements} 次
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">血压趋势图</h3>
            {trendData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} domain={[50, 180]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <ReferenceLine y={settings.systolicHigh} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '收缩压高限', position: 'right', fill: '#EF4444', fontSize: 11 }} />
                    <ReferenceLine y={settings.systolicLow} stroke="#3B82F6" strokeDasharray="3 3" label={{ value: '收缩压低限', position: 'right', fill: '#3B82F6', fontSize: 11 }} />
                    <ReferenceLine y={settings.diastolicHigh} stroke="#F97316" strokeDasharray="3 3" label={{ value: '舒张压高限', position: 'right', fill: '#F97316', fontSize: 11 }} />
                    <ReferenceLine y={settings.diastolicLow} stroke="#8B5CF6" strokeDasharray="3 3" label={{ value: '舒张压低限', position: 'right', fill: '#8B5CF6', fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      name="收缩压"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      name="舒张压"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无足够数据生成趋势图</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">心率趋势</h3>
            {trendData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" fontSize={12} domain={[50, 120]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      name="心率"
                      stroke="#EC4899"
                      strokeWidth={3}
                      dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p className="text-sm">暂无数据</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">每日测量次数</h3>
            {trendData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="measurementCount"
                      name="测量次数"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                <p className="text-sm">暂无数据</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">医生复诊提示</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-medium text-blue-800 mb-2">📋 复诊需携带</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 导出的血压记录报告</li>
              <li>• 血压计设备（如需校准）</li>
              <li>• 记录的异常情况说明</li>
              <li>• 正在服用的药物清单</li>
            </ul>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl">
            <h4 className="font-medium text-emerald-800 mb-2">💬 可以咨询医生</h4>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• 血压波动较大的原因</li>
              <li>• 是否需要调整药物剂量</li>
              <li>• 生活方式改善建议</li>
              <li>• 下次复诊时间安排</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
