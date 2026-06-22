import { useEffect } from 'react';
import Toolbar from '@/components/Toolbar/Toolbar';
import TacticsCanvas from '@/components/Canvas/TacticsCanvas';
import PropertiesPanel from '@/components/PropertiesPanel/PropertiesPanel';
import Timeline from '@/components/Timeline/Timeline';
import AnalysisPanel, { AnalysisToggle } from '@/components/AnalysisPanel/AnalysisPanel';
import { usePlayback, useAnalysis } from '@/hooks/usePlayback';
import { useTacticsStore } from '@/store/useTacticsStore';

export default function Home() {
  const { play, currentTime, setRouteDrawingPlayer, selectedId, selectedType } = useTacticsStore();

  usePlayback();
  useAnalysis();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      const { setPlaying, setCurrentTime, setTool, isPlaying } = useTacticsStore.getState();

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setPlaying(!isPlaying);
          break;
        case 'ArrowLeft':
          setCurrentTime(Math.max(0, currentTime - 0.5));
          break;
        case 'ArrowRight':
          setCurrentTime(Math.min(play.duration, currentTime + 0.5));
          break;
        case '1':
          setTool('select');
          break;
        case '2':
          setTool('offense');
          break;
        case '3':
          setTool('defense');
          break;
        case '4':
          setTool('disc');
          break;
        case '5':
          setTool('route');
          break;
        case '6':
          setTool('fake');
          break;
        case 'Escape':
          setTool('select');
          setRouteDrawingPlayer(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, play.duration, setRouteDrawingPlayer]);

  useEffect(() => {
    if (selectedType === 'player' && selectedId) {
      const player = play.players.find((p) => p.id === selectedId);
      if (player) {
        const currentTool = useTacticsStore.getState().currentTool;
        if (currentTool === 'route' || currentTool === 'fake') {
          setRouteDrawingPlayer(selectedId);
        }
      }
    }
  }, [selectedId, selectedType, play.players, setRouteDrawingPlayer]);

  return (
    <div className="w-full h-full flex flex-col bg-field-dark">
      <header className="h-12 bg-[#0d1410] border-b border-[#1e2d24] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, #ff6b35, #ffd60a)',
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            F
          </div>
          <h1
            className="text-lg font-bold text-white tracking-wide"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            飞盘战术跑位板
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="text-sm text-white/50"
            style={{ fontFamily: "'Roboto Mono', monospace" }}
          >
            <span className="text-orange-400">
              {play.players.filter((p) => p.type === 'offense').length}
            </span>{' '}
            进攻 ·{' '}
            <span className="text-blue-400">
              {play.players.filter((p) => p.type === 'defense').length}
            </span>{' '}
            防守
          </div>

          <div
            className="px-3 py-1 rounded bg-[#121a16] text-xs text-white/60"
            style={{ fontFamily: "'Roboto Mono', monospace" }}
          >
            空格键播放/暂停
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Toolbar />
        <div className="flex-1 relative overflow-hidden">
          <TacticsCanvas />
          <AnalysisPanel />
          <AnalysisToggle />
        </div>
        <PropertiesPanel />
      </div>

      <Timeline />
    </div>
  );
}
