import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/store/audioStore';
import { drawSpectrum, drawWaveform, drawCircular, drawMountain } from '@/utils/visualizers';

const Visualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const { visualMode, analyser } = useAudioStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth * window.devicePixelRatio;
        canvas.height = parent.clientHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const state = useAudioStore.getState();
      const frequencyData = state.frequencyData || new Uint8Array(0);
      const timeData = state.timeData || new Uint8Array(0);

      timeRef.current += 0.016;

      switch (visualMode) {
        case 'spectrum':
          drawSpectrum({ ctx, width, height, frequencyData, timeData, time: timeRef.current });
          break;
        case 'waveform':
          drawWaveform({ ctx, width, height, frequencyData, timeData, time: timeRef.current });
          break;
        case 'circular':
          drawCircular({ ctx, width, height, frequencyData, timeData, time: timeRef.current });
          break;
        case 'mountain':
          drawMountain({ ctx, width, height, frequencyData, timeData, time: timeRef.current });
          break;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [visualMode, analyser]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-50" />
    </div>
  );
};

export default Visualizer;
