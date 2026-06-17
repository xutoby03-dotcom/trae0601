import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppStore } from '../../store/useAppStore';

export function DeptBorrowChart() {
  const borrowRecords = useAppStore((s) => s.borrowRecords);
  const data = useMemo(() => {
    const stats: Record<string, number> = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    borrowRecords.forEach((r) => {
      const d = new Date(r.createdAt);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        stats[r.borrowerDepartment] = (stats[r.borrowerDepartment] || 0) + 1;
      }
    });
    const allDepts = ['行政部', '财务部', '市场部', '法务部', '人事部', '审计部'];
    return allDepts.map((d) => ({ department: d, count: stats[d] || 0 }));
  }, [borrowRecords]);
  const colors = ['#1e3a5f', '#334e68', '#486581', '#627d98', '#829ab1', '#d4a853'];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-base font-semibold text-navy-900">本月各部门借阅量</h3>
        <span className="text-xs text-gray-500">单位：箱次</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
            <XAxis
              dataKey="department"
              tick={{ fill: '#627d98', fontSize: 12 }}
              axisLine={{ stroke: '#d9e2ec' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#627d98', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#f0f4f8' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e4e7eb',
                boxShadow: '0 4px 12px rgba(30, 58, 95, 0.08)',
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value} 箱次`, '借阅量']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
