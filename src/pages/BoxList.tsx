import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';
import { useBoxStore } from '../store/useBoxStore';
import { useRiderStore } from '../store/useRiderStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { BOX_STATUS_LABELS, USAGE_TYPE_LABELS } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatDate, getDaysSince } from '../utils/helpers';
import { getReplacementWarning } from '../utils/businessRules';

export function BoxList() {
  const { boxes, fetchBoxes } = useBoxStore();
  const { riders, fetchRiders } = useRiderStore();
  const { maintenanceRecords, fetchMaintenanceRecords } = useMaintenanceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [usageFilter, setUsageFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchBoxes();
    fetchRiders();
    fetchMaintenanceRecords();
  }, [fetchBoxes, fetchRiders, fetchMaintenanceRecords]);

  const getRiderName = (riderId: string) => {
    return riders.find(r => r.id === riderId)?.name || '未分配';
  };

  const filteredBoxes = boxes.filter(box => {
    const matchesSearch = box.boxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRiderName(box.riderId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || box.status === statusFilter;
    const matchesUsage = usageFilter === 'all' || box.usageType === usageFilter;
    return matchesSearch && matchesStatus && matchesUsage;
  });

  const handleDelete = (id: string) => {
    useBoxStore.getState().deleteBox(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">箱子档案</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有保温箱的基础信息</p>
        </div>
        <Link to="/boxes/new">
          <Button>
            <Plus className="w-4 h-4" />
            新增箱子
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="搜索箱子编号、骑手姓名"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: '正常使用' },
                { value: 'pending_cleaning', label: '待清洁' },
                { value: 'maintenance', label: '维修中' },
                { value: 'scrapped', label: '已报废' },
              ]}
            />
          </div>
          <div className="w-40">
            <Select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
              options={[
                { value: 'all', label: '全部用途' },
                { value: 'hot_food', label: '热食专用' },
                { value: 'cold_drink', label: '冷饮专用' },
                { value: 'mixed', label: '混合使用' },
              ]}
            />
          </div>
        </div>
        </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">箱子</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">容量</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用途</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属骑手</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">购买日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预警</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBoxes.map((box) => {
              const warning = getReplacementWarning(box, maintenanceRecords);
              return (
                <tr key={box.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={box.photoUrl}
                        alt={box.boxNumber}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium text-gray-900">{box.boxNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{box.capacity}L</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{USAGE_TYPE_LABELS[box.usageType]}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{getRiderName(box.riderId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{formatDate(box.purchaseDate)}</div>
                    <div className="text-xs text-gray-500">已使用 {getDaysSince(box.purchaseDate)} 天</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={box.status} label={BOX_STATUS_LABELS[box.status]} />
                  </td>
                  <td className="px-6 py-4">
                    {warning.needsReplace && (
                      <span className="text-xs text-red-600 font-medium">
                        {warning.reason}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/boxes/${box.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/boxes/${box.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      {deleteConfirm === box.id ? (
                        <>
                          <Button
                            variant="danger" size="sm"
                            onClick={() => handleDelete(box.id)}
                          >
                              确认
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              取消
                            </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => setDeleteConfirm(box.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
