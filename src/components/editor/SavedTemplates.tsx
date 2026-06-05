import { useEffect } from 'react';
import { useEmailStore } from '@/store/useEmailStore';
import { X, Trash2, FileText, Clock } from 'lucide-react';
import { EmailTemplate } from '@/types/email';

function getFirstTextSummary(t: EmailTemplate): string {
  for (const c of t.components) {
    if (c.properties.text) return c.properties.text.split('\n')[0].substring(0, 12);
  }
  return '空白模板';
}

function ThumbnailSlot({ t }: { t: EmailTemplate }) {
  if (t.thumbnail) {
    return (
      <img
        src={t.thumbnail}
        alt={t.name}
        className="w-20 h-14 rounded-lg shrink-0 border border-[#2a2d35] object-cover"
      />
    );
  }
  return (
    <div
      className="w-20 h-14 rounded-lg shrink-0 border border-[#2a2d35] flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: t.backgroundColor }}
    >
      <span className="text-[8px] text-gray-400 text-center px-1 leading-tight relative z-10 drop-shadow-sm">
        {getFirstTextSummary(t)}
      </span>
    </div>
  );
}

export default function SavedTemplates() {
  const { showSavedList, setShowSavedList, savedTemplates, loadSavedTemplate, deleteSavedTemplate, loadSavedTemplates } = useEmailStore();

  useEffect(() => {
    if (showSavedList) loadSavedTemplates();
  }, [showSavedList]);

  if (!showSavedList) return null;

  const handleLoad = (id: string) => {
    loadSavedTemplate(id);
    setShowSavedList(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteSavedTemplate(id);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSavedList(false)}>
      <div className="bg-[#1a1d23] rounded-xl shadow-2xl w-[520px] max-h-[70vh] flex flex-col border border-[#2a2d35]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2d35]">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">已保存的模板</h3>
            <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full">{savedTemplates.length}</span>
          </div>
          <button onClick={() => setShowSavedList(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-3">
          {savedTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <FileText size={24} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">还没有保存的模板</p>
              <p className="text-xs text-gray-600 mt-1">点击工具栏"保存"按钮保存当前模板</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedTemplates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleLoad(t.id)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#22252d] hover:bg-[#2a2d35] border border-[#2a2d35] hover:border-emerald-500/30 cursor-pointer transition-all group"
                >
                  <ThumbnailSlot t={t} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{t.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                      <Clock size={10} />
                      {formatDate(t.updatedAt)}
                      <span className="mx-1">·</span>
                      {t.components.length} 个组件
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, t.id)}
                    className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
