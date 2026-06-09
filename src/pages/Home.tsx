import { Link } from 'react-router-dom';
import { Sticker, Ribbon, StickyNote, Stamp, AlertTriangle, Package, Clock, ChevronRight } from 'lucide-react';
import { useJournalStore } from '@/store/useJournalStore';
import { MATERIAL_TYPE_LABELS, LOW_STOCK_THRESHOLD, OVERSTOCK_THRESHOLD } from '@/types';
import type { MaterialType } from '@/types';

const typeIcons: Record<MaterialType, React.ElementType> = {
  sticker: Sticker,
  tape: Ribbon,
  memo: StickyNote,
  stamp: Stamp,
};

const typeColors: Record<MaterialType, string> = {
  sticker: 'bg-pink-soft/20 text-pink-deep',
  tape: 'bg-mint/20 text-mint-deep',
  memo: 'bg-cream-dark/50 text-brown',
  stamp: 'bg-coral/20 text-coral-deep',
};

function formatToday() {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${year}年${month}月${day}日 星期${weekdays[d.getDay()]}`;
}

export default function Home() {
  const { materials, usageRecords, usageItems } = useJournalStore();

  const typeCounts = (['sticker', 'tape', 'memo', 'stamp'] as MaterialType[]).map((type) => ({
    type,
    count: materials.filter((m) => m.type === type).length,
  }));

  const lowStock = materials.filter((m) => m.quantity <= LOW_STOCK_THRESHOLD);
  const overstock = materials.filter((m) => m.quantity >= OVERSTOCK_THRESHOLD);

  const recentRecords = [...usageRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((record) => {
      const items = usageItems.filter((ui) => ui.usageRecordId === record.id);
      const usedMaterials = items
        .map((ui) => {
          const mat = materials.find((m) => m.id === ui.materialId);
          return mat ? mat.name : '';
        })
        .filter(Boolean);
      return { ...record, usedMaterials };
    });

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold text-brown-dark">你好呀 ✨</h1>
        <p className="text-brown-muted mt-1 text-sm">{formatToday()}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {typeCounts.map(({ type, count }) => {
          const Icon = typeIcons[type];
          return (
            <Link
              key={type}
              to={`/materials?type=${type}`}
              className="card-paper rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColors[type]}`}>
                <Icon size={20} />
              </div>
              <span className="font-serif text-sm font-medium text-brown-dark">
                {MATERIAL_TYPE_LABELS[type]}
              </span>
              <span className="text-2xl font-serif font-bold text-brown">{count}</span>
              <span className="text-[10px] text-brown-muted flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                查看详情 <ChevronRight size={10} />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mb-8">
        <h2 className="section-title flex items-center gap-2">
          <AlertTriangle size={18} className="text-coral" />
          库存预警
        </h2>

        {lowStock.length === 0 && overstock.length === 0 ? (
          <div className="card-paper rounded-xl p-6 text-center text-brown-muted text-sm">
            暂无预警信息，库存状态良好 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {lowStock.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-coral-deep flex items-center gap-1">
                  <AlertTriangle size={12} /> 快用完的素材
                </p>
                {lowStock.map((m) => (
                  <div
                    key={m.id}
                    className="card-paper rounded-lg p-3 flex items-center justify-between border-l-4 border-l-coral"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-brown-dark">{m.name}</span>
                      <span className={`badge-${m.type}`}>{MATERIAL_TYPE_LABELS[m.type]}</span>
                    </div>
                    <span className="text-coral font-serif font-bold text-lg">{m.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            {overstock.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-blue-500 flex items-center gap-1">
                  <Package size={12} /> 囤积过多的素材
                </p>
                {overstock.map((m) => (
                  <div
                    key={m.id}
                    className="card-paper rounded-lg p-3 flex items-center justify-between border-l-4 border-l-blue-400"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-brown-dark">{m.name}</span>
                      <span className={`badge-${m.type}`}>{MATERIAL_TYPE_LABELS[m.type]}</span>
                    </div>
                    <span className="text-blue-500 font-serif font-bold text-lg">{m.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="stitch-line mb-6" />

      <div>
        <h2 className="section-title flex items-center gap-2">
          <Clock size={18} className="text-brown-light" />
          最近使用
        </h2>

        {recentRecords.length === 0 ? (
          <div className="card-paper rounded-xl p-6 text-center text-brown-muted text-sm">
            还没有使用记录，快去记录你的手账吧 ✏️
          </div>
        ) : (
          <div className="space-y-2">
            {recentRecords.map((record) => (
              <div key={record.id} className="card-paper rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-brown-dark">{record.journalName}</span>
                  <span className="text-xs text-brown-muted">{record.date}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {record.usedMaterials.map((name, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-cream-dark/40 text-brown"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
