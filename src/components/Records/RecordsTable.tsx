import { useCoffeeStore } from '@/store/coffeeStore';
import RecordRow from './RecordRow';
import { Coffee } from 'lucide-react';
import { useMemo } from 'react';

export default function RecordsTable() {
  const records = useCoffeeStore((s) => s.records);
  const filters = useCoffeeStore((s) => s.filters);

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => !filters.beanName || r.beanName.includes(filters.beanName))
      .filter((r) => filters.roastLevel === 'all' || r.roastLevel === filters.roastLevel)
      .filter((r) => !filters.grinder || r.grinder === filters.grinder)
      .filter((r) => !filters.dripper || r.dripper === filters.dripper)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [records, filters]);

  if (filteredRecords.length === 0) {
    return (
      <div className="card">
        <div className="p-12 text-center">
          <Coffee className="w-12 h-12 mx-auto text-coffee-300 mb-3" strokeWidth={1.5} />
          <h3 className="font-display text-lg font-semibold text-coffee-600 mb-1">暂无参数记录</h3>
          <p className="text-sm text-coffee-500">点击右上角「新增记录」开始记录你的第一组参数</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="border-b border-coffee-200">
            <tr>
              <th className="table-header w-48">豆子 / 烘焙 / 批次</th>
              <th className="table-header w-36">磨豆机 / 滤杯</th>
              <th className="table-header w-20">刻度</th>
              <th className="table-header w-20">水温</th>
              <th className="table-header w-20">粉水比</th>
              <th className="table-header w-20">注水</th>
              <th className="table-header w-20">出杯</th>
              <th className="table-header">风味 / 备注</th>
              <th className="table-header w-36 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <RecordRow key={record.id} record={record} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
