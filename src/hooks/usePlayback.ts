import { useEffect } from 'react';
import { useTacticsStore } from '@/store/useTacticsStore';

export function usePlayback() {
  const {
    isPlaying,
    currentTime,
    playbackSpeed,
    play,
    setCurrentTime,
    setPlaying,
  } = useTacticsStore();

  useEffect(() => {
    let animationId: number | null = null;
    let lastTime = performance.now();

    const animate = (timestamp: number) => {
      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      const state = useTacticsStore.getState();
      const newTime = state.currentTime + delta * state.playbackSpeed;

      if (newTime >= state.play.duration) {
        useTacticsStore.setState({
          currentTime: state.play.duration,
          isPlaying: false,
        });
        return;
      }

      useTacticsStore.setState({ currentTime: newTime });
      animationId = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      lastTime = performance.now();
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying]);

  return null;
}

export function useAnalysis() {
  const { play, recalculateAnalysis, calculateDeviations } = useTacticsStore();

  useEffect(() => {
    recalculateAnalysis();
    calculateDeviations();
  }, [
    play.players.length,
    play.routes.length,
    play.duration,
    play.disc.position.x,
    play.disc.holderId,
    play.actualPositions.length,
    recalculateAnalysis,
    calculateDeviations,
  ]);
}
