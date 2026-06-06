import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import { ReadingRecord } from '@/types';
import { TarotCard } from '@/components/TarotCard';
import { deleteRecord } from '@/utils/storage';

export default function History() {
  const navigate = useNavigate();
  const { history, loadHistory } = useReadingStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条记录吗？')) {
      deleteRecord(id);
      loadHistory();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 text-gold hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回首页</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 text-gradient-gold">
            历史记录
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            共 {history.length} 条记录
          </p>
        </motion.div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-glass card-shadow rounded-2xl border border-gold"
          >
            <div className="text-6xl mb-4">📜</div>
            <p className="text-lg mb-2">暂无历史记录</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              完成一次占卜后，记录将保存在这里
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-glass card-shadow rounded-2xl border border-gold overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-opacity-50 transition-all"
                  onClick={() => toggleExpand(record.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getSpreadIcon(record.spreadId)}</span>
                        <h3 className="font-display text-xl font-bold text-gradient-gold">
                          {record.spreadName}
                        </h3>
                      </div>
                      <p className="mb-2" style={{ color: 'var(--text-primary)' }}>
                        {record.question}
                      </p>
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(record.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => handleDelete(record.id, e)}
                        className="p-2 rounded-full hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                      {expandedId === record.id ? (
                        <ChevronUp className="w-5 h-5 text-gold" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gold" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === record.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 border-t border-gold border-opacity-30 pt-4">
                        <div className="flex flex-wrap gap-3 mb-6 justify-center">
                          {record.cards.map((dc, i) => (
                            <TarotCard
                              key={i}
                              card={dc.card}
                              isFlipped={true}
                              isReversed={dc.isReversed}
                              size="sm"
                            />
                          ))}
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                          {record.interpretation}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getSpreadIcon(spreadId: string): string {
  const icons: Record<string, string> = {
    'three-card': '✨',
    'celtic-cross': '⚔️',
    'time-flow': '⏳',
    'soul-mirror': '🪞'
  };
  return icons[spreadId] || '🔮';
}
