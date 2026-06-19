import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { CleaningRecord } from '@/types';
import RecordItem from '@/components/RecordItem';
import RecordForm from '@/components/RecordForm';

type FilterType = 'all' | 'normal' | 'abnormal';

export default function CleaningRecords() {
  const { litterBoxes, cats, cleaningRecords, addCleaningRecord } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredRecords = cleaningRecords.filter(record => {
    if (filter === 'normal') return !record.isAbnormal;
    if (filter === 'abnormal') return record.isAbnormal;
    return true;
  });

  const handleSubmit = (data: Omit<CleaningRecord, 'id' | 'isAbnormal' | 'abnormalTypes' | 'createdAt'>) => {
    addCleaningRecord(data);
    setShowForm(false);
  };

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: cleaningRecords.length },
    { value: 'normal', label: '正常', count: cleaningRecords.filter(r => !r.isAbnormal).length },
    { value: 'abnormal', label: '异常', count: cleaningRecords.filter(r => r.isAbnormal).length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">📝 清理记录</h1>
          <p className="text-warm-300 mt-1">记录每次清理，关注猫咪健康</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
          disabled={litterBoxes.length === 0}
        >
          <Plus size={20} />
          记录清理
        </button>
      </div>

      {litterBoxes.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-display mb-2">请先添加猫砂盆</h3>
          <p className="text-warm-300 mb-6">在记录清理之前，需要先添加猫砂盆档案</p>
          <a href="/litter-boxes" className="btn-primary inline-block">
            去添加猫砂盆
          </a>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Filter size={18} className="text-warm-300 flex-shrink-0" />
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.value
                    ? 'bg-sand-200 text-white'
                    : 'bg-white text-warm-400 hover:bg-cream-200'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {filteredRecords.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-display mb-2">
                {filter === 'all' ? '暂无清理记录' : filter === 'abnormal' ? '暂无异常记录' : '暂无正常记录'}
              </h3>
              <p className="text-warm-300 mb-6">
                {filter === 'all' ? '点击右上角按钮，记录第一次清理吧' : '继续保持良好的观察习惯'}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  记录第一次清理
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record, index) => {
                const box = litterBoxes.find(b => b.id === record.litterBoxId);
                const cat = cats.find(c => c.id === record.catId);
                
                return (
                  <RecordItem
                    key={record.id}
                    record={record}
                    litterBox={box}
                    cat={cat}
                    delay={index * 80}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {showForm && (
        <RecordForm
          litterBoxes={litterBoxes}
          cats={cats}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
