import { useState } from 'react';
import { AlertTriangle, Trash2, ChevronDown, ChevronUp, User, Droplets, Sparkles } from 'lucide-react';
import type { CleaningRecord, LitterBox, Cat } from '@/types';
import { OPERATION_LABELS, ODOR_LABELS, CLUMP_LABELS, ABNORMAL_LABELS } from '@/types';
import { formatDateTime } from '@/utils/calculation';
import ObservationPanel from './ObservationPanel';
import { useAppStore } from '@/store/useAppStore';

interface RecordItemProps {
  record: CleaningRecord;
  litterBox: LitterBox | undefined;
  cat: Cat | undefined;
  delay?: number;
}

export default function RecordItem({ record, litterBox, cat, delay = 0 }: RecordItemProps) {
  const [expanded, setExpanded] = useState(false);
  const deleteCleaningRecord = useAppStore(state => state.deleteCleaningRecord);
  const observationNotes = useAppStore(state => 
    state.observationNotes.filter(n => n.recordId === record.id)
  );

  const handleDelete = () => {
    if (window.confirm('确定要删除这条记录吗？相关的观察记录也会被删除。')) {
      deleteCleaningRecord(record.id);
    }
  };

  return (
    <div
      className={`${record.isAbnormal ? 'card-abnormal' : 'card'} opacity-0 animate-fade-in-up transition-all duration-300`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {cat ? (
            <img src={cat.photoUrl} alt={cat.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">🐱</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {record.isAbnormal && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-coral-200 text-white text-xs rounded-full">
                    <AlertTriangle size={12} />
                    异常
                  </span>
                )}
                <span className="text-sm text-warm-300">
                  {formatDateTime(record.date, record.time)}
                </span>
                {cat && (
                  <span className="text-sm font-medium text-warm-400">{cat.name}</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {record.operationTypes.map(type => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-sand-100 text-sand-400 text-sm rounded-full"
                  >
                    {OPERATION_LABELS[type]}
                  </span>
                ))}
                {(record.deodorizerUsed ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-sand-50 text-sand-400 text-sm rounded-full border border-sand-100">
                    <Sparkles size={12} />
                    除臭珠 ×{record.deodorizerUsed}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 rounded-xl hover:bg-cream-200 transition-colors"
              >
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-xl hover:bg-coral-100 transition-colors"
              >
                <Trash2 size={18} className="text-coral-300" />
              </button>
            </div>
          </div>
          
          {expanded && (
            <div className="mt-4 pt-4 border-t border-warm-100 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-warm-300">猫砂盆：</span>
                  <span className="text-warm-400">{litterBox?.location || '-'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={14} className="text-warm-300" />
                  <span className="text-warm-400">{record.operator}</span>
                </div>
                <div>
                  <span className="text-warm-300">异味：</span>
                  <span className="text-warm-400">{ODOR_LABELS[record.odorLevel]}</span>
                </div>
                <div>
                  <span className="text-warm-300">结团：</span>
                  <span className="text-warm-400">{CLUMP_LABELS[record.clumpCondition]}</span>
                </div>
                {record.litterAdded > 0 && (
                  <div className="flex items-center gap-1">
                    <Droplets size={14} className="text-warm-300" />
                    <span className="text-warm-400">补砂 {record.litterAdded}kg</span>
                  </div>
                )}
                {(record.deodorizerUsed ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <Sparkles size={14} className="text-sand-300" />
                    <span className="text-warm-400">除臭珠 {record.deodorizerUsed}颗</span>
                  </div>
                )}
              </div>
              
              {record.isAbnormal && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-coral-400">异常类型：</p>
                  <div className="flex flex-wrap gap-2">
                    {record.abnormalTypes.map(type => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-coral-100 text-coral-400 text-sm rounded-full"
                      >
                        {ABNORMAL_LABELS[type]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {record.notes && (
                <div>
                  <p className="text-sm text-warm-300">备注：</p>
                  <p className="text-sm text-warm-400 mt-1">{record.notes}</p>
                </div>
              )}
              
              {observationNotes.length > 0 && (
                <ObservationPanel notes={observationNotes} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
