import { Plus, Edit2, Trash2, Power, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Badge } from '../../types';
import { useBadgeStore } from '../../store/useBadgeStore';
import { formatDateTime } from '../../utils/time';

interface BadgeTableProps {
  onEdit: (badge: Badge) => void;
  onNew: () => void;
}

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: '启用中', className: 'tag-success' },
  inactive: { label: '已停用', className: 'tag-neutral' },
  lost: { label: '已遗失', className: 'tag-danger' },
};

export const BadgeTable = ({ onEdit, onNew }: BadgeTableProps) => {
  const badges = useBadgeStore((s) => s.badges);
  const toggleBadgeStatus = useBadgeStore((s) => s.toggleBadgeStatus);
  const deleteBadge = useBadgeStore((s) => s.deleteBadge);

  const [search, setSearch] = useState('');

  const filteredBadges = useMemo(() => {
    if (!search) return badges;
    const query = search.toLowerCase();
    return badges.filter(
      (b) =>
        b.number.toLowerCase().includes(query) ||
        b.color.toLowerCase().includes(query) ||
        b.allowedArea.toLowerCase().includes(query)
    );
  }, [badges, search]);

  return (
    <div className="card">
      <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-lg font-semibold text-neutral-800">
          临时工牌管理
          <span className="ml-2 text-sm font-normal text-neutral-500">
            共 {badges.length} 张
          </span>
        </h2>
        <div className="flex-1" />
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="搜索编号/颜色/区域"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 w-64"
          />
        </div>
        <button onClick={onNew} className="btn-primary">
          <Plus size={18} className="mr-1.5" />
          新 增
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="table-base">
          <thead>
            <tr>
              <th>工牌</th>
              <th>颜色</th>
              <th>可进区域</th>
              <th>押金</th>
              <th>状态</th>
              <th>创建时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredBadges.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-neutral-500">
                  暂无工牌数据
                </td>
              </tr>
            ) : (
              filteredBadges.map((badge) => {
                const status = statusMap[badge.status] || statusMap.active;
                const isLost = badge.status === 'lost';

                return (
                  <tr key={badge.id} className="hover:bg-neutral-50 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-12 rounded-md text-white text-xs font-bold flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: badge.colorHex }}
                        >
                          {badge.number}
                        </span>
                        <span className="font-medium text-neutral-800">{badge.number}</span>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-sm text-neutral-700">
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: badge.colorHex }}
                        />
                        {badge.color}
                      </span>
                    </td>
                    <td className="text-neutral-700">{badge.allowedArea}</td>
                    <td className="text-neutral-700 font-mono">¥ {badge.deposit}</td>
                    <td>
                      <span className={status.className}>{status.label}</span>
                    </td>
                    <td className="text-neutral-500 font-mono text-xs">
                      {formatDateTime(badge.createdAt)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(badge)}
                          className="p-1.5 rounded-md text-neutral-500 hover:text-primary hover:bg-primary/10 transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={16} />
                        </button>
                        {!isLost && (
                          <button
                            onClick={() => toggleBadgeStatus(badge.id)}
                            className={`p-1.5 rounded-md transition-colors ${
                              badge.status === 'active'
                                ? 'text-warning hover:bg-warning/10'
                                : 'text-success hover:bg-success/10'
                            }`}
                            title={badge.status === 'active' ? '停用' : '启用'}
                          >
                            <Power size={16} />
                          </button>
                        )}
                        {!isLost && (
                          <button
                            onClick={() => {
                              if (confirm(`确定删除工牌 ${badge.number}?`)) {
                                deleteBadge(badge.id);
                              }
                            }}
                            className="p-1.5 rounded-md text-neutral-500 hover:text-danger hover:bg-danger/10 transition-colors"
                            title="删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
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
