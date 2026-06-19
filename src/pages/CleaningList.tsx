import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useBoxStore } from '../store/useBoxStore';
import { useRiderStore } from '../store/useRiderStore';
import { useCleaningStore } from '../store/useCleaningStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { BOX_STATUS_LABELS } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatDate, getTodayString } from '../utils/helpers';
import { isFullyCleaned, canAssignHotFood } from '../utils/businessRules';
import { AlertBanner } from '../components/ui/AlertBanner';

export function CleaningList() {
  const { boxes, fetchBoxes } = useBoxStore();
  const { riders, fetchRiders } = useRiderStore();
  const { cleaningRecords, fetchCleaningRecords } = useCleaningStore();
  const { maintenanceRecords, fetchMaintenanceRecords } = useMaintenanceStore();
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBoxes();
    fetchRiders();
    fetchCleaningRecords();
    fetchMaintenanceRecords();
  }, [fetchBoxes, fetchRiders, fetchCleaningRecords, fetchMaintenanceRecords]);

  const getRiderName = (riderId: string) => {
    return riders.find(r => r.id === riderId)?.name || '未分配';
  };

  const getCleaningRecord = (boxId: string) => {
    return cleaningRecords.find(
      r => r.boxId === boxId && r.cleaningDate === selectedDate
    );
  };

  const filteredBoxes = boxes.filter(box => {
    if (box.status === 'scrapped') return false;
    const matchesSearch = box.boxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRiderName(box.riderId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: filteredBoxes.length,
    completed: filteredBoxes.filter(b => {
      const record = getCleaningRecord(b.id);
      return record && isFullyCleaned(record);
    }).length,
    pending: filteredBoxes.filter(b => {
      const record = getCleaningRecord(b.id);
      return !record || !isFullyCleaned(record);
    }).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">清洁记录</h1>
          <p className="text-sm text-gray-500 mt-1">管理保温箱的每日清洁记录</p>
        </div>
      </div>

      <AlertBanner
        type="warning"
        title="业务规则提醒"
        message="未完成今日清洁的箱子禁止分配热食订单，必须完成全部6项清洁步骤"
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">应清洁箱子</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已完成清洁</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待清洁</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-48">
            <Input
              label="选择日期"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px] flex items-end">
            <Input
              placeholder="搜索箱子编号、骑手姓名"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">箱子</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属骑手</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">箱子状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">清洁状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">清洁步骤</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">热食分配</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBoxes.map((box) => {
              const record = getCleaningRecord(box.id);
              const isClean = record && isFullyCleaned(record);
              const assignmentCheck = canAssignHotFood(box.id, boxes, cleaningRecords, maintenanceRecords, selectedDate);

              const cleaningSteps = [
                { key: 'residueRemoved', label: '倒残渣' },
                { key: 'interiorWiped', label: '擦内胆' },
                { key: 'disinfected', label: '消毒' },
                { key: 'dried', label: '晾干' },
                { key: 'zipperChecked', label: '查拉链' },
                { key: 'odorChecked', label: '闻味道' },
              ];

              return (
                <tr key={box.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={box.photoUrl}
                        alt={box.boxNumber}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="font-medium text-gray-900">{box.boxNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{getRiderName(box.riderId)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={box.status} label={BOX_STATUS_LABELS[box.status]} />
                  </td>
                  <td className="px-6 py-4">
                    {isClean ? (
                      <StatusBadge status="active" label="清洁完成" />
                    ) : (
                      <StatusBadge status="pending_cleaning" label={record ? "部分清洁" : "未清洁"} />
                    )}
                    {record && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(record.createdAt, 'HH:mm')} 提交
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {cleaningSteps.map((step) => {
                        const completed = record?.[step.key as keyof typeof record];
                        return (
                          <div
                            key={step.key}
                            title={step.label}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              completed
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {completed ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {assignmentCheck.allowed ? (
                      <span className="text-sm text-green-600 font-medium">✓ 可分配</span>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">✗ 禁止分配</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {box.status !== 'scrapped' && box.status !== 'maintenance' && (
                      <Link to={`/cleaning/${box.id}`}>
                        <Button size="sm" variant={isClean ? "secondary" : "primary"}>
                          <Plus className="w-4 h-4" />
                          {record ? '编辑清洁' : '登记清洁'}
                        </Button>
                      </Link>
                    )}
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
