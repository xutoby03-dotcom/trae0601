import React from 'react';
import { Keyboard } from 'lucide-react';

export const HelpPanel: React.FC = () => {
  const shortcuts = [
    { key: '1-7', description: '输入对应音符 (do-si)' },
    { key: '空格', description: '输入休止符' },
    { key: '↑', description: '选中音符升高八度' },
    { key: '↓', description: '选中音符降低八度' },
    { key: 'Shift + ↑', description: '升半音 #' },
    { key: 'Shift + ↓', description: '降半音 b' },
    { key: 'Delete/Backspace', description: '删除选中音符' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Keyboard className="w-5 h-5" />
        键盘快捷键
      </h3>
      <div className="space-y-2">
        {shortcuts.map((item) => (
          <div key={item.key} className="flex items-center justify-between text-sm">
            <kbd className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-mono text-xs">
              {item.key}
            </kbd>
            <span className="text-gray-600">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
