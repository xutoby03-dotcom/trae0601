import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Trash2, Calendar, Package } from 'lucide-react';
import { useJournalStore } from '@/store/useJournalStore';

export default function Usage() {
  const { usageRecords, usageItems, materials, deleteUsageRecord } = useJournalStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const recordsByDate = usageRecords.reduce<Record<string, typeof usageRecords>>((acc, record) => {
    const dateKey = record.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(record);
    return acc;
  }, {});

  const sortedDates = Object.keys(recordsByDate).sort((a, b) => b.localeCompare(a));

  const getMaterialName = (materialId: string) =>
    materials.find((m) => m.id === materialId)?.name ?? '未知素材';

  const handleDelete = (id: string) => {
    deleteUsageRecord(id);
    setDeleteConfirmId(null);
  };

  if (usageRecords.length === 0) {
    return (
      <div className="page-container">
        <h1 className="page-title">使用记录</h1>
        <div className="card-paper rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-brown-muted/40 mb-4" />
          <p className="text-brown-muted text-lg mb-2">还没有使用记录</p>
          <p className="text-brown-muted/60 text-sm mb-6">记录你每次手账使用的素材吧</p>
          <Link to="/usage/add" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建记录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">使用记录</h1>
        <Link to="/usage/add" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建记录
        </Link>
      </div>

      {sortedDates.map((date) => (
        <div key={date} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-brown-muted" />
            <h2 className="section-title mb-0">{date}</h2>
          </div>

          <div className="space-y-3">
            {recordsByDate[date].map((record) => {
              const items = usageItems.filter((ui) => ui.usageRecordId === record.id);

              return (
                <div key={record.id} className="card-paper rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-serif font-semibold text-brown-dark text-lg">
                        {record.journalName}
                      </h3>
                      {record.note && (
                        <p className="text-brown-muted text-sm mt-1">{record.note}</p>
                      )}
                    </div>

                    {deleteConfirmId === record.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="px-3 py-1 rounded-lg bg-coral/20 text-coral-deep text-sm font-medium hover:bg-coral/30 transition-all"
                        >
                          确认删除
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 rounded-lg bg-cream text-brown-muted text-sm font-medium hover:bg-cream-dark transition-all"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(record.id)}
                        className="p-1.5 rounded-lg text-brown-muted/50 hover:text-coral hover:bg-coral/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {items.length > 0 && (
                    <div className="stitch-line pt-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Package className="w-3.5 h-3.5 text-brown-muted" />
                        <span className="text-xs text-brown-muted">使用素材</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream-dark/40 text-brown-dark text-sm"
                          >
                            {getMaterialName(item.materialId)}
                            <span className="text-brown-muted font-medium">×{item.quantityUsed}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
