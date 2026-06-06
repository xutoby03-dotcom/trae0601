import { useState } from 'react';
import { useSmartHomeStore } from '@/store/useSmartHomeStore';
import { Mic, Send } from 'lucide-react';

export const VoiceControl = () => {
  const [command, setCommand] = useState('');
  const { executeVoiceCommand } = useSmartHomeStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      executeVoiceCommand(command);
      setCommand('');
    }
  };

  const suggestions = [
    '打开客厅灯',
    '关闭卧室空调',
    '打开所有灯',
    '调节客厅空调26度',
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-2xl backdrop-blur-md shadow-lg focus-within:border-cyan-500/50 transition-colors">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="输入语音指令，如：打开客厅灯"
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!command.trim()}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setCommand(suggestion)}
              className="px-3 py-1 text-xs text-gray-400 bg-gray-800/60 border border-gray-700 rounded-full hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
