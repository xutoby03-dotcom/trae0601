import { useEffect, useState } from 'react';
import { Droplets, RefreshCw, Clock, CheckCircle, Play, Search, User } from 'lucide-react';
import { useStore } from '../store';
import { STATUS_COLORS } from '../../shared/types';

export default function Cleaning() {
  const { cleaningRecords, fetchCleaning, startCleaning, completeCleaning, loading } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CleaningRecord | null>(null);

  useEffect(() => {
    fetchCleaning();
  }, [fetchCleaning]);

  const queueCount = cleaningRecords.filter(r => r.status === '排队中').length;
  const cleaningCount = cleaningRecords.filter(r => r.status === '清洗中').length;
  const completedCount = cleaningRecords.filter(r => r.status === '已完成').length;

  const filteredRecords = cleaningRecords.filter(r => {
    const matchStatus = filterStatus === '' || r.status === filterStatus;
    const matchSearch = searchTerm === '' ||
      r.costumeId.includes(searchTerm) ||
      r.costume?.type?.includes(searchTerm) ||
      r.costume?.size?.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const groupedRecords = {
    queue: filteredRecords.filter(r => r.status === '排队中'),
    cleaning: filteredRecords.filter(r => r.status === '清洗中'),
    completed: filteredRecords.filter(r => r.status === '已完成'),
  };

  const handleStartCleaning = async () => {
    if (selectedRecord && operatorName.trim()) {
      await startCleaning(selectedRecord.id, operatorName.trim());
      setShowStartModal(false);
      setSelectedRecord(null);
      setOperatorName('');
    }
  };

  const handleCompleteCleaning = async (id: string) => {
    if (confirm('确定要标记为清洗完成吗？完成后服装将可以再次预约。')) {
      await completeCleaning(id);
    }
  };

  const RecordCard = ({ record }: { record: CleaningRecord }) => (
    <div className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`status-badge ${STATUS_COLORS[record.status]}`}>
              {record.status}
            </span>
            <span className="font-semibold text-gray-800">
              {record.costume?.type} - {record.costume?.size}
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-500">
            <p>编号：#{record.costumeId}</p>
            <p>入队时间：{record.queuedAt}</p>
            {record.startedAt && (
              <p>开始清洗：{record.startedAt}</p>
            )}
            {record.completedAt && (
              <p>完成时间：{record.completedAt}</p>
            )}
            {record.operator && (
              <p className="flex items-center gap-1">
                <User className="w-3 h-3" />
                操作员：{record.operator}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {record.status === '排队中' && (
            <button
              onClick={() => {
                setSelectedRecord(record);
                setShowStartModal(true);
              }}
              className="btn-primary flex items-center gap-1 text-sm py-1.5 px-3"
            >
              <Play className="w-4 h-4" />
              开始清洗
            </button>
          )}
          {record.status === '清洗中' && (
            <button
              onClick={() => handleCompleteCleaning(record.id)}
              className="btn-gold flex items-center gap-1 text-sm py-1.5 px-3"
            >
              <CheckCircle className="w-4 h-4" />
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">清洗管理</h1>
          <p className="text-gray-500 mt-1">管理清洗队列，未清洗服装不可再次预约</p>
        </div>
        <button
          onClick={() => fetchCleaning()}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-orange-600 text-sm">排队中</p>
              <p className="text-2xl font-bold text-orange-800">{queueCount}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-purple-600 text-sm">清洗中</p>
              <p className="text-2xl font-bold text-purple-800">{cleaningCount}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-green-600 text-sm">已完成</p>
              <p className="text-2xl font-bold text-green-800">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="font-serif text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary-500" />
            清洗队列
          </h2>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索编号、类型、尺码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 min-w-[200px]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input min-w-[120px]"
            >
              <option value="">全部状态</option>
              <option value="排队中">排队中</option>
              <option value="清洗中">清洗中</option>
              <option value="已完成">已完成</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-orange-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                排队中 ({groupedRecords.queue.length})
              </h3>
              <div className="space-y-3">
                {groupedRecords.queue.map((record, index) => (
                  <div key={record.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <RecordCard record={record} />
                  </div>
                ))}
                {groupedRecords.queue.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    暂无排队
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                清洗中 ({groupedRecords.cleaning.length})
              </h3>
              <div className="space-y-3">
                {groupedRecords.cleaning.map((record, index) => (
                  <div key={record.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <RecordCard record={record} />
                  </div>
                ))}
                {groupedRecords.cleaning.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    暂无清洗中
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                已完成 ({groupedRecords.completed.length})
              </h3>
              <div className="space-y-3">
                {groupedRecords.completed.slice(0, 10).map((record, index) => (
                  <div key={record.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <RecordCard record={record} />
                  </div>
                ))}
                {groupedRecords.completed.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    暂无已完成
                  </div>
                )}
                {groupedRecords.completed.length > 10 && (
                  <p className="text-center text-xs text-gray-400">
                    仅显示最近10条
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showStartModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="p-6">
              <h3 className="font-serif text-xl font-semibold text-gray-800 mb-4">
                开始清洗
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="font-semibold text-gray-800">
                    {selectedRecord.costume?.type} - {selectedRecord.costume?.size}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    #{selectedRecord.costumeId}
                  </p>
                </div>

                <div>
                  <label className="label">操作员姓名</label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="input"
                    placeholder="请输入操作员姓名"
                  />
                </div>

                <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800">
                  <p>开始清洗后，服装状态将更新为"清洗中"</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowStartModal(false);
                    setSelectedRecord(null);
                    setOperatorName('');
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleStartCleaning}
                  disabled={!operatorName.trim() || loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  开始清洗
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
