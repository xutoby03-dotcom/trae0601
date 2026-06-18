import { useEffect, useMemo } from 'react';
import { Shirt, Users, Droplets, AlertTriangle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../store/useStore';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { COAT_SIZES } from '../types';
import { formatDate, getDaysOverdue } from '../utils/helpers';
import { Link } from 'react-router-dom';

const PIE_COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'];

export function Dashboard() {
  const {
    coats,
    lendings,
    damageRecords,
    updateOverdueStatus,
    getOverdueLendings,
  } = useStore();

  useEffect(() => {
    updateOverdueStatus();
  }, [updateOverdueStatus]);

  const stats = useMemo(() => {
    const total = coats.length;
    const available = coats.filter((c) => c.status === 'available').length;
    const inUse = lendings.filter((l) => l.status === 'active' || l.status === 'overdue').length;
    const pendingCleaning = coats.filter((c) => c.status === 'pending_cleaning' || c.status === 'cleaning').length;
    const overdue = getOverdueLendings().length;
    return { total, available, inUse, pendingCleaning, overdue };
  }, [coats, lendings, getOverdueLendings]);

  const sizeInventoryData = useMemo(() => {
    return COAT_SIZES.map((size) => ({
      size,
      可用: coats.filter((c) => c.size === size && c.status === 'available').length,
      使用中: coats.filter((c) => c.size === size && c.status === 'in_use').length,
      清洗中: coats.filter((c) => c.size === size && (c.status === 'pending_cleaning' || c.status === 'cleaning')).length,
    }));
  }, [coats]);

  const damageCauseData = useMemo(() => {
    const stainCount = damageRecords.filter((d) => d.hasStain).length;
    const holeCount = damageRecords.filter((d) => d.hasHole).length;
    const buttonCount = damageRecords.filter((d) => d.missingButton).length;
    const pocketCount = damageRecords.filter((d) => d.pocketResidue).length;
    const hazardCount = damageRecords.filter((d) => d.contactHazard).length;

    const data = [
      { name: '污渍', value: stainCount },
      { name: '破洞', value: holeCount },
      { name: '扣子缺失', value: buttonCount },
      { name: '口袋残留', value: pocketCount },
      { name: '接触危险试剂', value: hazardCount },
    ];
    return data.filter((d) => d.value > 0);
  }, [damageRecords]);

  const overdueList = useMemo(() => {
    return getOverdueLendings()
      .map((l) => {
        const coat = coats.find((c) => c.id === l.coatId);
        return { ...l, coat };
      })
      .slice(0, 5);
  }, [getOverdueLendings, coats]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="库存总数"
          value={stats.total}
          icon={Shirt}
          iconColor="text-slate-600"
          description="所有实验服档案"
        />
        <StatCard
          title="可领用"
          value={stats.available}
          icon={BarChart3}
          iconColor="text-emerald-600"
          description="当前可领用数量"
        />
        <StatCard
          title="使用中"
          value={stats.inUse}
          icon={Users}
          iconColor="text-blue-600"
          description="学生已领用"
        />
        <StatCard
          title="待清洗"
          value={stats.pendingCleaning}
          icon={Droplets}
          iconColor="text-purple-600"
          description="等待或正在清洗"
        />
        <StatCard
          title="逾期未还"
          value={stats.overdue}
          icon={AlertTriangle}
          iconColor="text-red-600"
          description="超过预计归还日期"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">各尺码库存分布</h3>
            <span className="text-xs text-gray-400">单位：件</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sizeInventoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="size" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="可用" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="使用中" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="清洗中" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">高频破损原因</h3>
            <span className="text-xs text-gray-400">累计 {damageRecords.length} 次记录</span>
          </div>
          {damageCauseData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={damageCauseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {damageCauseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
              暂无破损记录
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">逾期未还列表</h3>
          <Link
            to="/lendings"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            查看全部 →
          </Link>
        </div>
        {overdueList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实验服编号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学生姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">课程</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预计归还</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">逾期天数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overdueList.map((lending) => (
                  <tr key={lending.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lending.coat?.code || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{lending.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lending.studentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lending.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lending.expectedReturn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-red-600">
                        {getDaysOverdue(lending.expectedReturn)} 天
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge type="lending" status={lending.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400 text-sm">
            暂无逾期未还的实验服
          </div>
        )}
      </div>
    </div>
  );
}
