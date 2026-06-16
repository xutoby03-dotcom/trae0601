import { useMemo, useState } from 'react';
import { Search, RotateCcw, ArrowRight } from 'lucide-react';
import type { Visitor, Badge, VisitorFilter } from '../../types';
import { useBadgeStore } from '../../store/useBadgeStore';
import { formatDateTime, getDuration } from '../../utils/time';

interface VisitorTableProps {
  onReturn: (visitor: Visitor) => void;
  onReportLost: (visitor: Visitor) => void;
}

const FILTERS: { key: VisitorFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'visiting', label: '在场' },
  { key: 'returned', label: '已离场' },
  { key: 'overtime', label: '超时' },
];

const statusMap: Record<string, { label: string; className: string }> = {
  visiting: { label: '在场', className: 'tag-warning' },
  returned: { label: '已离场', className: 'tag-success' },
  overtime: { label: '超时', className: 'tag-danger' },
  lost: { label: '遗失', className: 'tag-neutral' },
};

export const VisitorTable = ({ onReturn, onReportLost }: VisitorTableProps) => {
  const getTodayVisitors = useBadgeStore((s) => s.getTodayVisitors);
  const getBadgeById = useBadgeStore((s) => s.getBadgeById);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<VisitorFilter>('all');

  const visitors = getTodayVisitors();

  const filteredVisitors = useMemo(() => {
    return visitors
      .filter((v) => {
        if (filter !== 'all' && v.status !== filter) return false;
        if (search) {
          const query = search.toLowerCase();
          return (
            v.name.toLowerCase().includes(query) ||
            v.company.toLowerCase().includes(query) ||
            v.hostName.toLowerCase().includes(query) ||
            v.phone.includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  }, [visitors, search, filter]);

  const getBadgeInfo = (badgeId: string): Badge | undefined => {
    return getBadgeById(badgeId);
  };

  return (
    <div className="card">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-neutral-800">今日访客</h2>
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  filter === f.key
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索姓名/公司/接待人"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin max-h-[500px]">
        <table className="table-base">
          <thead className="sticky top-0 z-10">
            <tr>
              <th>访客信息</th>
              <th>工牌</th>
              <th>拜访对象</th>
              <th>入场时间</th>
              <th>预计离开</th>
              <th>实际离场</th>
              <th>停留时长</th>
              <th>状态</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-neutral-500">
                  暂无访客记录
                </td>
              </tr>
            ) : (
              filteredVisitors.map((visitor) => {
                const badge = getBadgeInfo(visitor.badgeId);
                const status = statusMap[visitor.status] || statusMap.visiting;
                const canReturn = visitor.status === 'visiting' || visitor.status === 'overtime';

                return (
                  <tr key={visitor.id} className="hover:bg-neutral-50 transition-colors">
                    <td>
                      <div>
                        <div className="font-medium text-neutral-800">{visitor.name}</div>
                        <div className="text-xs text-neutral-500">{visitor.company}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-md text-white text-xs font-bold flex items-center justify-center"
                          style={{ backgroundColor: badge?.colorHex }}
                          title={badge?.number}
                        >
                          {badge?.number.slice(-2)}
                        </span>
                        <span className="text-sm text-neutral-700">{badge?.number}</span>
                      </div>
                    </td>
                    <td className="text-neutral-700">{visitor.hostName}</td>
                    <td className="text-neutral-600 font-mono text-xs">
                      {formatDateTime(visitor.checkInTime)}
                    </td>
                    <td className="text-neutral-600 font-mono text-xs">
                      {formatDateTime(visitor.expectedLeaveTime)}
                    </td>
                    <td className="text-neutral-600 font-mono text-xs">
                      {visitor.actualLeaveTime
                        ? formatDateTime(visitor.actualLeaveTime)
                        : '—'}
                    </td>
                    <td className="text-neutral-700 font-mono text-xs">
                      {getDuration(visitor.checkInTime, visitor.actualLeaveTime)}
                    </td>
                    <td>
                      <span className={status.className}>{status.label}</span>
                    </td>
                    <td className="text-right">
                      {canReturn && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onReturn(visitor)}
                            className="btn-success text-xs py-1 px-3"
                          >
                            归还
                            <ArrowRight size={12} className="ml-1" />
                          </button>
                          <button
                            onClick={() => onReportLost(visitor)}
                            className="btn-secondary text-xs py-1 px-2"
                          >
                            遗失
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
