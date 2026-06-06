import { BarChart3, Activity, CircleDashed, Mountain } from 'lucide-react';
import { useAudioStore } from '@/store/audioStore';
import type { VisualMode } from '@/types';

const modes: { id: VisualMode; icon: React.ElementType; label: string }[] = [
  { id: 'spectrum', icon: BarChart3, label: '频谱柱状图' },
  { id: 'waveform', icon: Activity, label: '波形线' },
  { id: 'circular', icon: CircleDashed, label: '圆环旋转' },
  { id: 'mountain', icon: Mountain, label: '3D 山脉' },
];

const VisualModeSwitcher = () => {
  const { visualMode, setVisualMode } = useAudioStore();

  return (
    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
      {modes.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setVisualMode(id)}
          title={label}
          className={`relative p-2.5 rounded-lg transition-all duration-300 group
            ${visualMode === id 
              ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 text-white shadow-lg shadow-cyan-500/20' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <Icon className="w-5 h-5" />
          {visualMode === id && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
          )}
        </button>
      ))}
    </div>
  );
};

export default VisualModeSwitcher;
