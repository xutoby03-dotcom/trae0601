import { useRef, useEffect } from 'react';
import { useAnnealingStore } from '@/store/useAnnealingStore';
import {
  calculateCurve,
  getTotalDuration,
  getDominantGlassType,
  GLASS_TYPE_LABELS,
  formatDuration,
  CurvePoint,
} from '@/utils/annealing';

export default function TemperatureCurve() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentSession } = useAnnealingStore();
  const { works } = currentSession;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.fillStyle = '#1a1714';
    ctx.fillRect(0, 0, w, h);

    const pad = { top: 30, right: 20, bottom: 40, left: 55 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    ctx.strokeStyle = '#3d362e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (i / 5) * plotH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const x = pad.left + (i / 6) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + plotH);
      ctx.stroke();
    }

    if (works.length === 0) {
      ctx.fillStyle = '#8b7355';
      ctx.font = '14px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('录入作品后将显示退火曲线', w / 2, h / 2);
      drawAxesLabels(ctx, pad, plotW, plotH, w, h, 0, 600);
      return;
    }

    const curve = calculateCurve(works);
    const totalHours = getTotalDuration(works);
    const maxTemp = Math.max(...curve.map((p) => p.temp));
    const yMax = Math.ceil(maxTemp / 100) * 100 + 100;

    drawAxesLabels(ctx, pad, plotW, plotH, w, h, totalHours, yMax);

    const toX = (t: number) => pad.left + (t / totalHours) * plotW;
    const toY = (temp: number) => pad.top + plotH - (temp / yMax) * plotH;

    const phases = [
      { phase: 'heating' as const, color: '#ff6b2b', label: '升温' },
      { phase: 'soaking' as const, color: '#fbbf24', label: '保温' },
      { phase: 'cooling' as const, color: '#60a5fa', label: '降温' },
    ];

    for (const { phase, color } of phases) {
      const phasePoints = curve.filter((p) => p.phase === phase);
      if (phasePoints.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(toX(phasePoints[0].time), toY(phasePoints[0].temp));
      for (let i = 1; i < phasePoints.length; i++) {
        ctx.lineTo(toX(phasePoints[i].time), toY(phasePoints[i].temp));
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
      gradient.addColorStop(0, color + '20');
      gradient.addColorStop(1, color + '05');

      ctx.beginPath();
      ctx.moveTo(toX(phasePoints[0].time), toY(phasePoints[0].temp));
      for (let i = 1; i < phasePoints.length; i++) {
        ctx.lineTo(toX(phasePoints[i].time), toY(phasePoints[i].temp));
      }
      ctx.lineTo(toX(phasePoints[phasePoints.length - 1].time), pad.top + plotH);
      ctx.lineTo(toX(phasePoints[0].time), pad.top + plotH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    drawPhaseLabels(ctx, curve, toX, toY, pad, plotH);
    drawKeyPoints(ctx, curve, toX, toY);
  }, [works]);

  const dominantType = getDominantGlassType(works);
  const totalHours = getTotalDuration(works);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-amber-100">退火曲线</h3>
        {works.length > 0 && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-amber-300/50">
              类型: {GLASS_TYPE_LABELS[dominantType]}
            </span>
            <span className="text-amber-300/50">
              总时长: {formatDuration(totalHours)}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-1">
        <div className="flex items-center gap-1.5 text-xs text-amber-300/60">
          <div className="w-3 h-1 rounded-full bg-[#ff6b2b]" />
          升温
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-300/60">
          <div className="w-3 h-1 rounded-full bg-[#fbbf24]" />
          保温
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-300/60">
          <div className="w-3 h-1 rounded-full bg-[#60a5fa]" />
          降温
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-lg border border-furnace-ash/20"
        style={{ height: '240px' }}
      />
    </div>
  );
}

function drawAxesLabels(
  ctx: CanvasRenderingContext2D,
  pad: { top: number; right: number; bottom: number; left: number },
  plotW: number,
  plotH: number,
  _w: number,
  _h: number,
  totalHours: number,
  yMax: number
) {
  ctx.fillStyle = '#8b7355';
  ctx.font = '10px "DM Sans", sans-serif';
  ctx.textAlign = 'right';

  for (let i = 0; i <= 5; i++) {
    const temp = Math.round((i / 5) * yMax);
    const y = pad.top + plotH - (i / 5) * plotH;
    ctx.fillText(`${temp}°C`, pad.left - 8, y + 3);
  }

  ctx.textAlign = 'center';
  for (let i = 0; i <= 6; i++) {
    const hours = ((i / 6) * totalHours).toFixed(1);
    const x = pad.left + (i / 6) * plotW;
    ctx.fillText(`${hours}h`, x, pad.top + plotH + 18);
  }

  ctx.save();
  ctx.translate(14, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8b7355';
  ctx.font = '11px "DM Sans", sans-serif';
  ctx.fillText('温度 (°C)', 0, 0);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8b7355';
  ctx.font = '11px "DM Sans", sans-serif';
  ctx.fillText('时间 (小时)', pad.left + plotW / 2, pad.top + plotH + 34);
}

function drawPhaseLabels(
  ctx: CanvasRenderingContext2D,
  curve: CurvePoint[],
  toX: (t: number) => number,
  toY: (temp: number) => number,
  pad: { top: number },
  _plotH: number
) {
  const phases = [
    { phase: 'heating' as const, color: '#ff6b2b', label: '升温' },
    { phase: 'soaking' as const, color: '#fbbf24', label: '保温' },
    { phase: 'cooling' as const, color: '#60a5fa', label: '降温' },
  ];

  for (const { phase, color, label } of phases) {
    const phasePoints = curve.filter((p) => p.phase === phase);
    if (phasePoints.length < 2) continue;

    const midIdx = Math.floor(phasePoints.length / 2);
    const midPoint = phasePoints[midIdx];
    const x = toX(midPoint.time);
    const y = Math.max(pad.top + 15, toY(midPoint.temp) - 12);

    ctx.fillStyle = color;
    ctx.font = 'bold 11px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y);
  }
}

function drawKeyPoints(
  ctx: CanvasRenderingContext2D,
  curve: CurvePoint[],
  toX: (t: number) => number,
  toY: (temp: number) => number
) {
  const keyPoints: { time: number; temp: number; label: string; color: string }[] = [];

  const soaking = curve.filter((p) => p.phase === 'soaking');
  if (soaking.length > 0) {
    keyPoints.push({
      time: soaking[0].time,
      temp: soaking[0].temp,
      label: `${Math.round(soaking[0].temp)}°C`,
      color: '#fbbf24',
    });
  }

  const heating = curve.filter((p) => p.phase === 'heating');
  if (heating.length > 0) {
    const peak = heating[heating.length - 1];
    keyPoints.push({
      time: peak.time,
      temp: peak.temp,
      label: `${Math.round(peak.temp)}°C`,
      color: '#ff6b2b',
    });
  }

  for (const kp of keyPoints) {
    const x = toX(kp.time);
    const y = toY(kp.temp);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = kp.color;
    ctx.fill();
    ctx.strokeStyle = '#1a1714';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 10px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(kp.label, x, y - 10);
  }
}
