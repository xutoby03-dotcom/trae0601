interface VisualizerProps {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  time: number;
}

const colors = {
  primary: '#00d4ff',
  secondary: '#a855f7',
  accent: '#f472b6',
  background: 'rgba(10, 10, 15, 0.3)',
};

export const drawSpectrum = (props: VisualizerProps) => {
  const { ctx, width, height, frequencyData } = props;
  
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);

  const barCount = 64;
  const barWidth = width / barCount - 2;
  const dataStep = Math.floor(frequencyData.length / barCount);

  for (let i = 0; i < barCount; i++) {
    const dataIndex = i * dataStep;
    const value = frequencyData[dataIndex];
    const barHeight = (value / 255) * height * 0.85;
    const x = i * (barWidth + 2);
    const y = height - barHeight;

    const gradient = ctx.createLinearGradient(x, y, x, height);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.5, colors.secondary);
    gradient.addColorStop(1, colors.accent);

    ctx.fillStyle = gradient;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.shadowBlur = 0;
  }
};

export const drawWaveform = (props: VisualizerProps) => {
  const { ctx, width, height, timeData } = props;

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);

  ctx.lineWidth = 3;
  ctx.strokeStyle = colors.primary;
  ctx.shadowColor = colors.primary;
  ctx.shadowBlur = 15;
  ctx.beginPath();

  const sliceWidth = width / timeData.length;
  let x = 0;

  for (let i = 0; i < timeData.length; i++) {
    const v = timeData[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  ctx.lineTo(width, height / 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
  ctx.beginPath();
  x = 0;
  for (let i = 0; i < timeData.length; i++) {
    const v = timeData[i] / 128.0;
    const y = height - (v * height) / 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.stroke();
};

export const drawCircular = (props: VisualizerProps) => {
  const { ctx, width, height, frequencyData, time } = props;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.25;

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);

  const barCount = 128;
  const dataStep = Math.floor(frequencyData.length / barCount);

  for (let i = 0; i < barCount; i++) {
    const dataIndex = i * dataStep;
    const value = frequencyData[dataIndex];
    const barHeight = (value / 255) * radius * 1.5;
    const angle = (i / barCount) * Math.PI * 2 + time * 0.5;

    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle) * (radius + barHeight);
    const y2 = centerY + Math.sin(angle) * (radius + barHeight);

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, colors.secondary);
    gradient.addColorStop(1, colors.primary);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
  ctx.fill();
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
  const pulse = 1 + Math.sin(time * 3) * 0.1;
  ctx.fillStyle = `rgba(0, 212, 255, ${0.2 + Math.sin(time * 2) * 0.1})`;
  ctx.fill();
};

export const drawMountain = (props: VisualizerProps) => {
  const { ctx, width, height, frequencyData, time } = props;

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);

  const rows = 8;
  const cols = 64;
  const dataStep = Math.floor(frequencyData.length / cols);
  
  const cellWidth = width / cols;
  const horizonY = height * 0.6;

  for (let row = 0; row < rows; row++) {
    const rowDepth = row / rows;
    const yBase = horizonY + row * 30;
    const scale = 1 - rowDepth * 0.6;

    ctx.beginPath();
    ctx.moveTo(0, yBase);

    for (let col = 0; col <= cols; col++) {
      const dataIndex = Math.min(col * dataStep, frequencyData.length - 1);
      const value = frequencyData[dataIndex] || 0;
      const waveOffset = Math.sin(col * 0.1 + time * 2 + row * 0.5) * 20;
      const peakHeight = ((value / 255) * 100 + waveOffset) * scale;
      
      const x = col * cellWidth;
      const y = yBase - peakHeight;
      
      if (col === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.lineTo(width, yBase);
    ctx.lineTo(0, yBase);
    ctx.closePath();

    const alpha = 0.1 + (1 - rowDepth) * 0.3;
    const gradient = ctx.createLinearGradient(0, yBase - 150 * scale, 0, yBase);
    gradient.addColorStop(0, `rgba(0, 212, 255, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(168, 85, 247, ${alpha * 0.7})`);
    gradient.addColorStop(1, `rgba(244, 114, 182, ${alpha * 0.3})`);
    
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = `rgba(0, 212, 255, ${0.3 + (1 - rowDepth) * 0.3})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};
