import { useEmailStore } from '@/store/useEmailStore';
import { presetTemplates } from '@/utils/templates';
import { X, Sparkles, Megaphone, Rocket, ShoppingCart, Newspaper, PartyPopper, Calendar, Lock, MessageSquare, Gift, BarChart3 } from 'lucide-react';

const templateIcons = [
  <Megaphone size={20} className="text-rose-400" />,
  <Rocket size={20} className="text-blue-400" />,
  <ShoppingCart size={20} className="text-emerald-400" />,
  <Newspaper size={20} className="text-indigo-400" />,
  <PartyPopper size={20} className="text-purple-400" />,
  <Calendar size={20} className="text-amber-400" />,
  <Lock size={20} className="text-red-400" />,
  <MessageSquare size={20} className="text-teal-400" />,
  <Gift size={20} className="text-pink-400" />,
  <BarChart3 size={20} className="text-cyan-400" />,
];

export default function TemplateLibrary() {
  const { showTemplateLibrary, setShowTemplateLibrary, loadPresetTemplate } = useEmailStore();

  if (!showTemplateLibrary) return null;

  const handleSelect = (index: number) => {
    loadPresetTemplate(index);
    setShowTemplateLibrary(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowTemplateLibrary(false)}>
      <div className="bg-[#1a1d23] rounded-xl shadow-2xl w-[680px] max-h-[80vh] flex flex-col border border-[#2a2d35]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2d35]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">模板库</h3>
          </div>
          <button onClick={() => setShowTemplateLibrary(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {presetTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className="flex items-start gap-3 p-4 rounded-xl bg-[#22252d] hover:bg-[#2a2d35] border border-[#2a2d35] hover:border-blue-500/50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {templateIcons[index]}
                </div>
                <div>
                  <div className="text-sm font-medium text-white mb-1">{template.name}</div>
                  <div className="text-[11px] text-gray-500 leading-relaxed">
                    {template.components.length} 个组件 · {template.backgroundColor === '#f3f4f6' ? '浅色' : template.backgroundColor === '#0f172a' ? '深色' : '彩色'}背景
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
