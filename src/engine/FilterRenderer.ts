import type { FilterType } from '@/types/timeline';

export function applyFilter(
  ctx: CanvasRenderingContext2D,
  filter: FilterType,
  width: number,
  height: number
): void {
  if (filter === 'none') return;
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  switch (filter) {
    case 'grayscale':
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      break;
      
    case 'sepia':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      }
      break;
      
    case 'blur':
      const tempData = new Uint8ClampedArray(data);
      const radius = 2;
      for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
          let r = 0, g = 0, b = 0, count = 0;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4;
              r += tempData[idx];
              g += tempData[idx + 1];
              b += tempData[idx + 2];
              count++;
            }
          }
          const idx = (y * width + x) * 4;
          data[idx] = r / count;
          data[idx + 1] = g / count;
          data[idx + 2] = b / count;
        }
      }
      break;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

export function applyColorCorrection(
  ctx: CanvasRenderingContext2D,
  color: { brightness: number; contrast: number; saturation: number },
  width: number,
  height: number
): void {
  const { brightness, contrast, saturation } = color;
  
  if (brightness === 0 && contrast === 0 && saturation === 0) return;
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const brightnessFactor = brightness * 2.55;
  const contrastFactor = (contrast + 100) / 100;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    r += brightnessFactor;
    g += brightnessFactor;
    b += brightnessFactor;
    
    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;
    
    if (saturation !== 0) {
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      const satFactor = saturation / 100 + 1;
      r = gray + (r - gray) * satFactor;
      g = gray + (g - gray) * satFactor;
      b = gray + (b - gray) * satFactor;
    }
    
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  
  ctx.putImageData(imageData, 0, 0);
}
