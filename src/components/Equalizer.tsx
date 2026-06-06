import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useAudioStore } from '@/store/audioStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useEffect } from 'react';

const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const EQ_LABELS = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1K', '2K', '4K', '8K', '16K'];

const Equalizer = () => {
  const { eqGains, setEqGain, resetEq } = useAudioStore();
  const { updateEqGain } = useAudioEngine();

  const handleGainChange = (index: number, value: number) => {
    setEqGain(index, value);
    updateEqGain(index, value);
  };

  const handleReset = () => {
    resetEq();
    eqGains.forEach((_, i) => updateEqGain(i, 0));
  };

  const presets = [
    { name: 'Flat', values: new Array(10).fill(0) },
    { name: 'Bass', values: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0] },
    { name: 'Treble', values: [0, 0, 0, 0, 0, 0, 2, 4, 6, 8] },
    { name: 'Vocal', values: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2] },
    { name: 'Rock', values: [5, 4, 2, 0, -2, -2, 0, 2, 4, 5] },
  ];

  const applyPreset = (values: number[]) => {
    values.forEach((v, i) => {
      setEqGain(i, v);
      updateEqGain(i, v);
    });
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-purple-400" />
          均衡器
        </h3>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white 
                     bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
      </div>

      <div className="flex gap-2 justify-between mb-6">
        {EQ_FREQUENCIES.map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="text-xs text-cyan-400 font-mono">
              {eqGains[index] > 0 ? '+' : ''}{eqGains[index].toFixed(0)}dB
            </div>
            <div className="relative h-32 w-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 via-purple-500 to-pink-500 rounded-full transition-all duration-150"
                  style={{ height: `${((eqGains[index] + 12) / 24) * 100}%` }}
                />
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eqGains[index]}
                onChange={(e) => handleGainChange(index, parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{EQ_LABELS[index]}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset.values)}
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-cyan-500/20 text-gray-400 
                       hover:text-cyan-400 rounded-lg border border-white/10 hover:border-cyan-500/30
                       transition-all duration-300"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Equalizer;
