import { useState, useEffect } from 'react';
import { Wrench, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useAppStore } from '../../store';
import { DamageStatusBadge } from '../../components/common/StatusBadge';
import { formatDateChinese } from '../../utils/timeUtils';
import type { DamageType } from '../../types';

export default function Damages() {
  const { damageRecords, tables, updateDamageStatus, createDamageRecord, refreshData } = useAppStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDamage, setNewDamage] = useState({
    tableId: '',
    type: 'racket' as DamageType,
    description: '',
  });

  useEffect(() => {
    refreshData();
  }, []);

  const pendingCount = damageRecords.filter((d) => d.status === 'pending').length;
  const resolvedCount = damageRecords.filter((d) => d.status === 'resolved').length;

  const getTableName = (tableId: string) => {
    return tables.find((t) => t.id === tableId)?.name || '未知球桌';
  };

  const getTypeLabel = (type: DamageType) => {
    const labels = {
      racket: '球拍',
      net: '球网',
      table: '球桌',
      ball: '乒乓球',
    };
    return labels[type];
  };

  const handleResolve = (recordId: string) => {
    if (confirm('确认标记为已修复？')) {
      updateDamageStatus(recordId, 'resolved');
      refreshData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDamage.tableId || !newDamage.description) {
      alert('请填写完整信息');
      return;
    }

    createDamageRecord(newDamage);
    setShowAddForm(false);
    setNewDamage({ tableId: '', type: 'racket', description: '' });
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">器材损坏管理</h2>
          <p className="text-gray-500">记录和追踪所有器材损坏情况</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          登记损坏
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{pendingCount}</div>
              <div className="text-xs text-gray-500">待处理</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{resolvedCount}</div>
              <div className="text-xs text-gray-500">已修复</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <Wrench size={20} className="text-primary-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{damageRecords.length}</div>
              <div className="text-xs text-gray-500">总记录</div>
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="card p-6 animate-slide-in">
          <h3 className="font-display text-lg font-bold text-gray-800 mb-4">登记损坏</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">球桌</label>
                <select
                  value={newDamage.tableId}
                  onChange={(e) => setNewDamage({ ...newDamage, tableId: e.target.value })}
                  className="input-field"
                >
                  <option value="">请选择球桌</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">损坏类型</label>
                <select
                  value={newDamage.type}
                  onChange={(e) => setNewDamage({ ...newDamage, type: e.target.value as DamageType })}
                  className="input-field"
                >
                  <option value="racket">球拍</option>
                  <option value="net">球网</option>
                  <option value="table">球桌</option>
                  <option value="ball">乒乓球</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">损坏描述</label>
              <textarea
                value={newDamage.description}
                onChange={(e) => setNewDamage({ ...newDamage, description: e.target.value })}
                placeholder="请详细描述损坏情况..."
                className="input-field h-24 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 btn-outline"
              >
                取消
              </button>
              <button type="submit" className="flex-1 btn-primary">
                提交
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-6">
        {damageRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Wrench size={48} className="mx-auto mb-4 text-gray-300" />
            <p>暂无损坏记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...damageRecords]
              .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))
              .map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    record.status === 'pending'
                      ? 'border-red-100 bg-red-50/50'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-800">
                          {getTableName(record.tableId)}
                        </span>
                        <span className="badge bg-primary-100 text-primary-700">
                          {getTypeLabel(record.type)}
                        </span>
                        <DamageStatusBadge status={record.status} />
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{record.description}</p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>
                          上报: {formatDateChinese(record.reportedAt)}
                        </span>
                        {record.resolvedAt && (
                          <span>
                            修复: {formatDateChinese(record.resolvedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    {record.status === 'pending' && (
                      <button
                        onClick={() => handleResolve(record.id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full transition-colors"
                      >
                        标记修复
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
