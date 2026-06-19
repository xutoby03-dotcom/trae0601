import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertTriangle, Wrench, CheckCircle, Trash2, Edit2, Eye } from 'lucide-react';
import { useBoxStore } from '../store/useBoxStore';
import { useRiderStore } from '../store/useRiderStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import {
  ISSUE_TYPE_LABELS, MAINTENANCE_STATUS_LABELS, type MaintenanceStatus, type IssueType } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { formatDate } from '../utils/helpers';
import { AlertBanner } from '../components/ui/AlertBanner';

export function MaintenanceList() {
  const { boxes, fetchBoxes } = useBoxStore();
  const { riders, fetchRiders } = useRiderStore();
  const { maintenanceRecords, fetchMaintenanceRecords, updateMaintenanceRecord } = useMaintenanceStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [issueFilter, setIssueFilter] = useState<string>('all');

  useEffect(() => {
    fetchBoxes();
    fetchRiders();
    fetchMaintenanceRecords();
  }, [fetchBoxes, fetchRiders, fetchMaintenanceRecords]);

  const getBoxNumber = (boxId: string) => {
    return boxes.find(b => b.id === boxId)?.boxNumber || '未知';
  };

  const getRiderName = (boxId: string) => {
    const box = boxes.find(b => b.id === boxId);
    return riders.find(r => r.id === box?.riderId)?.name || '未分配';
  };

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesIssue = issueFilter === 'all' || record.issueType === issueFilter;
    return matchesStatus && matchesIssue;
  });

  const handleStatusChange = (id: string, newStatus: MaintenanceStatus) => {
    const updates: Partial<typeof maintenanceRecords[0]> = { status: newStatus };
    if (newStatus === 'repaired' || newStatus === 'scrapped') {
      updates.resolvedDate = new Date().toISOString().split('T')[0];
    }
    updateMaintenanceRecord(id, updates);

    if (newStatus === 'scrapped') {
      const record = maintenanceRecords.find(r => r.id === id);
      if (record) {
        useBoxStore.getState().updateBox(record.boxId, { status: 'scrapped' });
      }
    }
  };

  const stats = {
    pending: maintenanceRecords.filter(r => r.status === 'pending').length,
    inProgress: maintenanceRecords.filter(r => r.status === 'in_progress').length,
    repaired: maintenanceRecords.filter(r => r.status === 'repaired').length,
    scrapped: maintenanceRecords.filter(r => r.status === 'scrapped').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">维修报废</h1>
          <p className="text-sm text-gray-500 mt-1">管理保温箱的异常情况和维修报废流程</p>
        </div>
        <Link to="/maintenance/new">
          <Button>
            <Plus className="w-4 h-4" />
            上报异常
          </Button>
        </Link>
      </div>

      {stats.pending > 0 && (
        <AlertBanner
          type="warning"
          title="待处理异常"
          message={`当前有 ${stats.pending} 个异常等待处理，请及时审核`}
        />
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待处理</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">处理中</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已维修</p>
              <p className="text-2xl font-bold text-green-600">{stats.repaired}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已报废</p>
              <p className="text-2xl font-bold text-red-600">{stats.scrapped}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'pending', label: '待处理' },
                { value: 'in_progress', label: '处理中' },
                { value: 'repaired', label: '已维修' },
                { value: 'scrapped', label: '已报废' },
              ]}
            />
          </div>
          <div className="w-40">
            <Select
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              options={[
                { value: 'all', label: '全部异常' },
                { value: 'damage', label: '破损' },
                { value: 'odor', label: '异味' },
                { value: 'insulation', label: '保温差' },
                { value: 'leakage', label: '汤汁渗漏' },
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">异常类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上报人</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上报日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">处理结果</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{getBoxNumber(record.boxId)}</span>
                    <span className="text-xs text-gray-500">{getRiderName(record.boxId)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge
                    status={record.issueType}
                    label={ISSUE_TYPE_LABELS[record.issueType]}
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={record.description}>
                  {record.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.reportedBy}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatDate(record.reportedDate)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={record.status} label={MAINTENANCE_STATUS_LABELS[record.status]} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={record.resolution}>
                  {record.resolution || '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {record.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusChange(record.id, 'in_progress')}
                        >
                          <Wrench className="w-4 h-4" />
                          开始处理
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatusChange(record.id, 'scrapped')}
                        >
                          <Trash2 className="w-4 h-4" />
                          直接报废
                        </Button>
                      </>
                    )}
                    {record.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleStatusChange(record.id, 'repaired')}
                        >
                          <CheckCircle className="w-4 h-4" />
                          完成维修
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatusChange(record.id, 'scrapped')}
                        >
                          <Trash2 className="w-4 h-4" />
                          报废
                        </Button>
                      </>
                    )}
                    <Link to={`/maintenance/${record.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  暂无维修记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
