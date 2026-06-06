import { useEffect, useRef } from 'react';
import { Waves } from 'lucide-react';
import AudioUploader from '@/components/AudioUploader';
import VisualModeSwitcher from '@/components/VisualModeSwitcher';
import Visualizer from '@/components/Visualizer';
import InfoPanel from '@/components/InfoPanel';
import Equalizer from '@/components/Equalizer';
import PlayerControls from '@/components/PlayerControls';
import PlaylistPanel from '@/components/PlaylistPanel';
import MarkersListPanel from '@/components/MarkersListPanel';
import SlicerPanel from '@/components/SlicerPanel';
import { useAudioStore } from '@/store/audioStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';

function App() {
  const { analyser, setAudioData } = useAudioStore();
  const { getAudioData } = useAudioEngine();
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const updateAudioData = () => {
      const { frequency, time } = getAudioData();
      setAudioData(frequency, time);
      animationRef.current = requestAnimationFrame(updateAudioData);
    };

    if (analyser) {
      animationRef.current = requestAnimationFrame(updateAudioData);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, getAudioData, setAudioData]);

  return (
    <div className="h-screen w-screen bg-[#0a0a0f] text-white overflow-hidden flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AudioViz Pro
            </h1>
            <p className="text-xs text-gray-500">音频可视化分析工具</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <AudioUploader />
          <div className="w-px h-8 bg-white/10" />
          <VisualModeSwitcher />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-80 p-4 space-y-4 overflow-y-auto border-r border-white/5 bg-black/20">
          <InfoPanel />
          <Equalizer />
        </aside>

        <section className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <div className="h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/5">
              <Visualizer />
            </div>
          </div>
          <PlayerControls />
        </section>

        <aside className="w-80 p-4 space-y-4 overflow-y-auto border-l border-white/5 bg-black/20">
          <PlaylistPanel />
          <MarkersListPanel />
          <SlicerPanel />
        </aside>
      </main>
    </div>
  );
}

export default App;
