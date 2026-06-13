import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaintStore } from '@/store/useComplaintStore';
import { useStatistics } from '@/hooks/useStatistics';
import { BUILDINGS, NOISE_TYPE_LABELS } from '@/types';
import { getBuildingComplaintCount, getHeatmapColor } from '@/utils/statistics';
import { formatDateTime } from '@/utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, FileText, X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function Heatmap() {
  const navigate = useNavigate();
  const complaints = useComplaintStore((state) => state.complaints);
  const statistics = useStatistics();

  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const buildingComplaints = selectedBuilding
    ? complaints.filter((c) => c.building === selectedBuilding).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const maxCount = Math.max(...BUILDINGS.map((b) => getBuildingComplaintCount(complaints, b)), 1);

  const chartData = statistics.buildingStats.map((item) => ({
    name: item.building.replace('号楼', '#'),
    count: item.count,
  }));

  const pieData = statistics.noiseTypeStats.map((item) => ({
    name: item.label,
    value: item.count,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            楼栋热力图
          </h1>
          <p className="text-slate-400 text-sm">直观展示各楼栋噪音投诉分布情况</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              投诉分布热力图
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-700/50" />
                <span className="text-slate-400">0 件</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600/60" />
                <span className="text-slate-400">1-3 件</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-yellow-500/60" />
                <span className="text-slate-400">4-6 件</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-500/70" />
                <span className="text-slate-400">7-10 件</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500/80" />
                <span className="text-slate-400">10+ 件</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BUILDINGS.map((building) => {
              const count = getBuildingComplaintCount(complaints, building);
              const percentage = (count / maxCount) * 100;
              const isSelected = selectedBuilding === building;

              return (
                <button
                  key={building}
                  onClick={() => setSelectedBuilding(isSelected ? null : building)}
                  className={cn(
                    'relative group p-6 rounded-2xl border transition-all duration-300',
                    getHeatmapColor(count),
                    isSelected
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                      : 'border-transparent hover:border-slate-600 hover:scale-102'
                  )}
                >
                  <div className="flex flex-col items-center">
                    <Building2 className={cn(
                      'w-8 h-8 mb-2 transition-colors',
                      count > 0 ? 'text-white/80' : 'text-slate-500'
                    )} />
                    <span className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {building}
                    </span>
                    <span className={cn(
                      'text-3xl font-bold mt-2 transition-colors',
                      count > 0 ? 'text-white' : 'text-slate-500',
                      {
                        'text-emerald-300': count > 0 && count <= 3,
                        'text-yellow-300': count >= 4 && count <= 6,
                        'text-orange-300': count >= 7 && count <= 10,
                        'text-red-300': count > 10,
                      }
                    )}>
                      {count}
                    </span>
                    <span className="text-xs text-white/60 mt-1">投诉</span>
                  </div>
                  {count > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-2xl overflow-hidden">
                      <div
                        className="h-full bg-white/30 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedBuilding && (
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {selectedBuilding} 投诉记录
                  <span className="ml-2 text-sm text-slate-400 font-normal">
                    共 {buildingComplaints.length} 条
                  </span>
                </h3>
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {buildingComplaints.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>该楼栋暂无投诉记录</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {buildingComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      onClick={() => navigate(`/complaints/${complaint.id}`)}
                      className="flex items-center gap-4 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{complaint.unit}</span>
                          <span className="text-xs bg-slate-600 px-2 py-0.5 rounded text-slate-300">
                            {NOISE_TYPE_LABELS[complaint.noiseType]}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">{complaint.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-500">{formatDateTime(complaint.createdAt)}</p>
                        <p className="text-xs text-slate-500">{complaint.complainant}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              楼栋投诉排行
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#f1f5f9',
                    }}
                    formatter={(value: number) => [`${value} 件`, '投诉量']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              噪音类型分布
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#f1f5f9',
                    }}
                    formatter={(value: number, name: string) => [`${value} 件`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-white">数据洞察</h3>
            </div>
            <div className="space-y-3">
              {statistics.buildingStats[0] && statistics.buildingStats[0].count > 0 && (
                <p className="text-sm text-slate-300">
                  <span className="text-blue-400 font-medium">{statistics.buildingStats[0].building}</span> 投诉量最高，共{' '}
                  <span className="text-blue-400 font-medium">{statistics.buildingStats[0].count}</span> 件，需重点关注。
                </p>
              )}
              {statistics.noiseTypeStats[0] && statistics.noiseTypeStats[0].count > 0 && (
                <p className="text-sm text-slate-300">
                  <span className="text-purple-400 font-medium">{statistics.noiseTypeStats[0].label}</span> 是主要噪音源，占比最高。
                </p>
              )}
              {statistics.overdueCount > 0 && (
                <p className="text-sm text-slate-300">
                  当前有 <span className="text-red-400 font-medium">{statistics.overdueCount}</span> 件投诉超期未回访，请尽快处理。
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
