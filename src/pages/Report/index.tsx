import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Users, AlertTriangle, Clock, Heart, TrendingUp, Building, FileText, Download, PieChart as PieChartIcon } from 'lucide-react';
import { useElderlyStore } from '@/store/elderlyStore';
import { useCheckInStore } from '@/store/checkInStore';
import { useExceptionStore } from '@/store/exceptionStore';
import { useReportStore } from '@/store/reportStore';
import { mockGrids } from '@/data/grids';
import { getWeekRange } from '@/utils/date';

export default function ReportPage() {
  const { elderlyList, initElderly } = useElderlyStore();
  const { checkInRecords, initCheckIns } = useCheckInStore();
  const { exceptions, initExceptions } = useExceptionStore();
  const { getAllWeeklyReports, getFocusList } = useReportStore();
  const [selectedGrid, setSelectedGrid] = useState<string>('all');

  useEffect(() => {
    initElderly();
    initCheckIns();
    initExceptions();
  }, [initElderly, initCheckIns, initExceptions]);

  const { start, end } = getWeekRange();
  const weeklyReports = getAllWeeklyReports(elderlyList, exceptions, checkInRecords);
  const focusList = getFocusList(elderlyList, exceptions, checkInRecords);

  const filteredReports = selectedGrid === 'all'
    ? weeklyReports
    : weeklyReports.filter(r => r.gridId === selectedGrid);

  const chartData = filteredReports.map(report => ({
    name: mockGrids.find(g => g.id === report.gridId)?.name || '未知',
    未报人数: report.unreportedCount,
    连续异常: report.continuousExceptionCount,
    总人数: report.totalElderly,
  }));

  const pieData = [
    { name: '已确认', value: elderlyList.length - filteredReports.reduce((sum, r) => sum + r.unreportedCount, 0) },
    { name: '未报平安', value: filteredReports.reduce((sum, r) => sum + r.unreportedCount, 0) },
    { name: '连续异常', value: filteredReports.reduce((sum, r) => sum + r.continuousExceptionCount, 0) },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const totalStats = {
    totalElderly: filteredReports.reduce((sum, r) => sum + r.totalElderly, 0),
    unreportedCount: filteredReports.reduce((sum, r) => sum + r.unreportedCount, 0),
    continuousExceptionCount: filteredReports.reduce((sum, r) => sum + r.continuousExceptionCount, 0),
    avgHandlingTime: filteredReports.length > 0
      ? Math.round(filteredReports.reduce((sum, r) => sum + r.avgHandlingTime, 0) / filteredReports.length)
      : 0,
  };

  const filteredFocusList = selectedGrid === 'all'
    ? focusList
    : focusList.filter(e => e.gridId === selectedGrid);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Calendar size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">本周统计报告</h3>
            <p className="text-sm text-slate-500">{start} 至 {end}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedGrid}
            onChange={(e) => setSelectedGrid(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            <option value="all">全部网格</option>
            {mockGrids.map(grid => (
              <option key={grid.id} value={grid.id}>{grid.name}</option>
            ))}
          </select>
          <button className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Download size={18} />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm">服务老人总数</span>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalStats.totalElderly}</p>
          <p className="text-xs text-slate-400 mt-1">位老人</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm">未报平安人数</span>
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-600">{totalStats.unreportedCount}</p>
          <p className="text-xs text-slate-400 mt-1">本周内有未记录</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm">连续异常人数</span>
            <div className="bg-red-100 p-2 rounded-lg">
              <TrendingUp size={20} className="text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{totalStats.continuousExceptionCount}</p>
          <p className="text-xs text-slate-400 mt-1">连续3天及以上</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm">平均处理耗时</span>
            <div className="bg-green-100 p-2 rounded-lg">
              <Clock size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{totalStats.avgHandlingTime}</p>
          <p className="text-xs text-slate-400 mt-1">分钟</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building size={20} className="text-blue-600" />
            各网格数据对比
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="总人数" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="未报人数" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="连续异常" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <PieChartIcon size={20} className="text-blue-600" />
            本周状态分布
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredReports.map(report => {
          const grid = mockGrids.find(g => g.id === report.gridId);
          const gridFocusElderly = filteredFocusList.filter(e => e.gridId === report.gridId);
          
          return (
            <div key={report.gridId} className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Building size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{grid?.name}</h4>
                    <p className="text-xs text-slate-500">网格员：{grid?.managerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">{report.totalElderly}</p>
                  <p className="text-xs text-slate-400">服务老人</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">{report.unreportedCount}</p>
                  <p className="text-xs text-orange-600">未报人数</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{report.continuousExceptionCount}</p>
                  <p className="text-xs text-red-600">连续异常</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{report.avgHandlingTime || '-'}</p>
                  <p className="text-xs text-green-600">平均耗时(分)</p>
                </div>
              </div>

              {gridFocusElderly.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Heart size={16} className="text-red-500" />
                    重点关注对象
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {gridFocusElderly.map(elderly => (
                      <div
                        key={elderly.id}
                        className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200"
                      >
                        <span>{elderly.avatar}</span>
                        <span className="text-sm text-red-700 font-medium">{elderly.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Heart size={20} className="text-red-500" />
          重点关注名单
          <span className="text-sm font-normal text-slate-500">
            （连续3天以上未确认或有严重慢病）
          </span>
        </h4>
        
        {filteredFocusList.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart size={32} className="text-green-500" />
            </div>
            <p className="text-slate-500">本周无重点关注对象</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">老人信息</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">住址</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">紧急联系人</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">慢病备注</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">所属网格</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">关注原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFocusList.map(elderly => {
                  const hasSeriousDisease = elderly.chronicDiseases.includes('阿尔茨海默症') || 
                                           elderly.chronicDiseases.includes('心脏病') || 
                                           elderly.chronicDiseases.includes('肾病');
                  const elderExceptions = exceptions.filter(e => e.elderlyId === elderly.id && e.exceptionDate >= start);
                  
                  return (
                    <tr key={elderly.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{elderly.avatar}</span>
                          <div>
                            <p className="font-semibold text-slate-800">{elderly.name}</p>
                            <p className="text-sm text-slate-500">{elderly.gender === 'female' ? '女' : '男'} · {elderly.age}岁</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-600">{elderly.building} {elderly.unit} {elderly.roomNumber}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{elderly.emergencyContactName}</p>
                          <p className="text-xs text-slate-500 font-mono">{elderly.emergencyContactPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                          {elderly.chronicDiseases || '无'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-600">{mockGrids.find(g => g.id === elderly.gridId)?.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {hasSeriousDisease && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              严重慢病
                            </span>
                          )}
                          {elderExceptions.length >= 3 && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                              连续{elderExceptions.length}天未确认
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
