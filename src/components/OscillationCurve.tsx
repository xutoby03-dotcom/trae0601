import { useRef, useEffect, useCallback } from 'react';
import type { TickInterval, AnomalyMark } from '@/types/calibration';
import { ANOMALY_COLORS } from '@/types/calibration';

interface OscillationCurveProps {
  ticks: TickInterval[];
  anomalies: AnomalyMark[];
}

export default function OscillationCurve({ ticks, anomalies }: OscillationCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    ctx.fillStyle = '#0D0B08';
    ctx.fillRect(0, 0, W, H);

    const gridColor = 'rgba(212,168,71,0.08)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    const centerY = H / 2;
    ctx.strokeStyle = 'rgba(212,168,71,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(W, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(245,240,232,0.3)';
    ctx.font = '10px monospace';
    ctx.fillText('0ms', 4, centerY - 4);
    ctx.fillText('+振幅', 4, 14);
    ctx.fillText('-振幅', 4, H - 6);

    if (ticks.length === 0) {
      ctx.fillStyle = 'rgba(245,240,232,0.2)';
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText('录入参数后显示摆动曲线', W / 2, centerY);
      ctx.textAlign = 'start';
      return;
    }

    const padX = 40;
    const padY = 30;
    const plotW = W - padX * 2;
    const plotH = H - padY * 2;

    const intervals = ticks.map((t) => t.interval);
    const maxInterval = Math.max(...intervals, 1);
    const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;

    const deviationData = ticks.map((t) => ({
      index: t.index,
      deviation: t.interval - avgInterval,
      direction: t.direction,
      raw: t.interval,
    }));

    const maxDev = Math.max(
      Math.max(...deviationData.map((d) => Math.abs(d.deviation))),
      1
    );

    const anomalyPositions = new Map<number, string>();
    for (const a of anomalies) {
      anomalyPositions.set(a.position, a.type);
    }

    const grad = ctx.createLinearGradient(padX, 0, padX + plotW, 0);
    grad.addColorStop(0, 'rgba(212,168,71,0.9)');
    grad.addColorStop(0.5, 'rgba(212,168,71,0.6)');
    grad.addColorStop(1, 'rgba(212,168,71,0.9)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < deviationData.length; i++) {
      const x = padX + (i / (deviationData.length - 1)) * plotW;
      const y = centerY - (deviationData[i].deviation / maxDev) * (plotH / 2);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const fillGrad = ctx.createLinearGradient(0, padY, 0, H - padY);
    fillGrad.addColorStop(0, 'rgba(212,168,71,0.15)');
    fillGrad.addColorStop(0.5, 'rgba(212,168,71,0.02)');
    fillGrad.addColorStop(1, 'rgba(212,168,71,0.15)');
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    for (let i = 0; i < deviationData.length; i++) {
      const x = padX + (i / (deviationData.length - 1)) * plotW;
      const y = centerY - (deviationData[i].deviation / maxDev) * (plotH / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(padX + plotW, centerY);
    ctx.lineTo(padX, centerY);
    ctx.closePath();
    ctx.fill();

    const phase = phaseRef.current;
    for (let i = 0; i < deviationData.length; i++) {
      const x = padX + (i / (deviationData.length - 1)) * plotW;
      const y = centerY - (deviationData[i].deviation / maxDev) * (plotH / 2);
      const anomalyType = anomalyPositions.get(deviationData[i].index);

      if (anomalyType) {
        const color = ANOMALY_COLORS[anomalyType as keyof typeof ANOMALY_COLORS];
        const pulse = 0.5 + Math.sin(phase * 3 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 4 + pulse * 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6 + pulse * 0.4;
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (i % 5 === 0) {
        const pulse = 0.5 + Math.sin(phase * 2 + i * 0.1) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + pulse * 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,71,${0.3 + pulse * 0.3})`;
        ctx.fill();
      }
    }

    const pendulumX = W / 2 + Math.sin(phase * 1.5) * 40;
    const pendulumY = 25;
    ctx.strokeStyle = 'rgba(212,168,71,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, 10);
    ctx.lineTo(pendulumX, pendulumY + 15);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pendulumX, pendulumY + 18, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#D4A847';
    ctx.fill();
    ctx.strokeStyle = 'rgba(139,105,20,0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(245,240,232,0.4)';
    ctx.font = '9px monospace';
    ctx.fillText(`间隔范围: ${Math.min(...intervals).toFixed(1)}ms ~ ${maxInterval.toFixed(1)}ms`, padX, H - 8);
    ctx.fillText(`平均间隔: ${avgInterval.toFixed(1)}ms`, padX + 220, H - 8);

    const legendX = W - 200;
    const legendY = H - 8;
    ctx.font = '9px sans-serif';
    const legendItems: [string, string][] = [
      ['偏摆', ANOMALY_COLORS.OFF_BEAT],
      ['停摆', ANOMALY_COLORS.STOPPED],
      ['回摆无力', ANOMALY_COLORS.WEAK_RETURN],
      ['齿轮卡滞', ANOMALY_COLORS.GEAR_JAM],
    ];
    legendItems.forEach(([label, color], idx) => {
      const x = legendX + idx * 48;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, legendY - 3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(245,240,232,0.5)';
      ctx.fillText(label, x + 5, legendY);
    });
  }, [ticks, anomalies]);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      phaseRef.current += 0.02;
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  return (
    <div className="relative w-full h-full min-h-[280px] rounded-xl overflow-hidden border border-[rgba(212,168,71,0.2)] bg-[#0D0B08]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
