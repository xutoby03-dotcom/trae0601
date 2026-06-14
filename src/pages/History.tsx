import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, Search, Calendar, Check, Droplets, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../utils/helpers';
import { RecordStatus, ClothesRecord } from '../types';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { records, initStore } = useStore();
  const [filter, setFilter] = useState<RecordStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    initStore();
  }, [initStore]);

  const filteredRecords = records
    .filter(r => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          r.clothingTypeLabel.toLowerCase().includes(searchLower) ||
          r.responsiblePerson.toLowerCase().includes(searchLower) ||
          r.location.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const getStatusBadge = (record: ClothesRecord) => {
    if (record.status === 'drying') {
      return <span className="chip-sky">☀️ 晾晒中</span>;
    }
    if (record.needsRedry) {
      return <span className="chip-danger">🌊 需二次晾晒</span>;
    }
    if (record.isDamp) {
      return <span className="chip-warning">💧 轻微返潮</span>;
    }
    if (record.isDry) {
      return <span className="chip-success">☀️ 已干完美</span>;
    }
    return <span className="chip">已收取</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 pb-24 md:pb-8 md:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/50 transition-all"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold font-display text-gray-800">
            📋 晾晒历史
          </h1>
        </div>

        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索衣物类型、负责人、位置..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'drying', 'collected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? '全部' : f === 'drying' ? '晾晒中' : '已收取'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="space-y-3">
            {filteredRecords.map(record => (
              <div
                key={record.id}
                className="card p-4 card-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl animate-float" style={{ animationDelay: `${Math.random()}s` }}>
                    {record.clothingTypeIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {record.clothingTypeLabel} × {record.quantity}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            {record.responsiblePersonAvatar} {record.responsiblePerson}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span>{record.location}</span>
                          {record.isThick && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="chip-warm text-xs">🧥 厚衣</span>
                            </>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(record)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar size={14} />
                        <span>开始 {formatDateTime(record.startTime)}</span>
                      </div>
                      {record.collectedAt && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Check size={14} />
                          <span>收取 {formatDateTime(record.collectedAt)}</span>
                        </div>
                      )}
                      {record.remindCount > 0 && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <RefreshCw size={14} />
                          <span>被提醒 {record.remindCount} 次</span>
                        </div>
                      )}
                    </div>

                    {record.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        📝 {record.notes}
                      </div>
                    )}

                    {record.status === 'collected' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {record.isDry && (
                          <span className="chip-success text-xs">
                            <Check size={12} className="inline mr-1" />
                            已干
                          </span>
                        )}
                        {record.isDamp && (
                          <span className="chip-warning text-xs">
                            <Droplets size={12} className="inline mr-1" />
                            返潮
                          </span>
                        )}
                        {record.needsRedry && (
                          <span className="chip-danger text-xs">
                            <RefreshCw size={12} className="inline mr-1" />
                            需二次晾晒
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2 font-display">暂无记录</h3>
            <p className="text-gray-500">
              {search || filter !== 'all' ? '没有找到符合条件的记录' : '还没有任何晾晒记录'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
