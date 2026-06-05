import { useEmailStore } from '@/store/useEmailStore';
import { VARIABLE_LIST } from '@/types/email';
import { Variable, X } from 'lucide-react';

export default function VariableInsert() {
  const { showVariableInsert, setShowVariableInsert, insertVariable, variables, setVariable } = useEmailStore();

  if (!showVariableInsert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowVariableInsert(false)}>
      <div className="bg-[#1a1d23] rounded-xl shadow-2xl w-[360px] border border-[#2a2d35]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2d35]">
          <div className="flex items-center gap-2">
            <Variable size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">插入变量</h3>
          </div>
          <button onClick={() => setShowVariableInsert(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-3 space-y-1.5">
          {VARIABLE_LIST.map((v) => (
            <button
              key={v.key}
              onClick={() => insertVariable(v.key)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-[#22252d] hover:bg-[#2a2d35] border border-transparent hover:border-amber-500/30 transition-all text-left group"
            >
              <code className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                {`{{${v.key}}}`}
              </code>
              <div className="flex-1">
                <div className="text-xs text-gray-300">{v.label}</div>
                <div className="text-[10px] text-gray-600">示例: {v.example}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-[#2a2d35]">
          <div className="text-[10px] text-gray-500 mb-1.5">自定义变量值（预览用）</div>
          <div className="grid grid-cols-2 gap-1.5">
            {VARIABLE_LIST.map((v) => (
              <div key={v.key}>
                <label className="text-[10px] text-gray-500">{v.key}</label>
                <input
                  type="text"
                  value={variables[v.key] || ''}
                  onChange={(e) => setVariable(v.key, e.target.value)}
                  className="w-full bg-[#0d0f12] border border-[#2a2d35] rounded px-1.5 py-1 text-[10px] text-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
