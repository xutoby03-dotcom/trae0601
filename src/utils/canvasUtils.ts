import type { Point, HistogramData, Layer, TextLayer, DrawingLayer, MosaicLayer, CutoutLayer } from '../types';

export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const getImageDataFromImage = (img: HTMLImageElement): ImageData => {
  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
};

export const imageDataToCanvas = (imageData: ImageData): HTMLCanvasElement => {
  const canvas = createCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

export const loadImage = (src: string | File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    if (src instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(src);
    } else {
      img.src = src;
    }
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const calculateHistogram = (imageData: ImageData): HistogramData => {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      r[data[i]]++;
      g[data[i + 1]]++;
      b[data[i + 2]]++;
    }
  }

  const max = Math.max(...r, ...g, ...b);
  return { r, g, b, max };
};

export const drawTextLayer = (ctx: CanvasRenderingContext2D, layer: TextLayer): void => {
  ctx.save();
  ctx.globalAlpha = layer.opacity / 100;
  ctx.globalCompositeOperation = layer.blendMode;
  ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
  ctx.textBaseline = 'top';
  
  if (layer.shadowBlur > 0) {
    ctx.shadowBlur = layer.shadowBlur;
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowOffsetX = layer.shadowOffsetX;
    ctx.shadowOffsetY = layer.shadowOffsetY;
  }

  if (layer.strokeWidth > 0) {
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineWidth = layer.strokeWidth;
    ctx.strokeText(layer.content, layer.x, layer.y);
  }

  ctx.fillStyle = layer.color;
  ctx.fillText(layer.content, layer.x, layer.y);
  ctx.restore();
};

export const drawDrawingLayer = (ctx: CanvasRenderingContext2D, layer: DrawingLayer): void => {
  ctx.save();
  ctx.globalAlpha = layer.opacity / 100;
  ctx.globalCompositeOperation = layer.blendMode;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const path of layer.paths) {
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.size;
    ctx.beginPath();
    if (path.points.length > 0) {
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        const xc = (path.points[i].x + path.points[i - 1].x) / 2;
        const yc = (path.points[i].y + path.points[i - 1].y) / 2;
        ctx.quadraticCurveTo(path.points[i - 1].x, path.points[i - 1].y, xc, yc);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
};

export const drawMosaicLayer = (ctx: CanvasRenderingContext2D, layer: MosaicLayer, baseImageData: ImageData): void => {
  if (!layer.imageData) return;
  ctx.save();
  ctx.globalAlpha = layer.opacity / 100;
  ctx.globalCompositeOperation = layer.blendMode;

  const tempCanvas = imageDataToCanvas(baseImageData);
  const tempCtx = tempCanvas.getContext('2d')!;

  for (const path of layer.paths) {
    if (path.points.length < 2) continue;
    
    const brushSize = path.brushSize;
    for (const point of path.points) {
      const x = Math.floor(point.x - brushSize / 2);
      const y = Math.floor(point.y - brushSize / 2);
      
      if (x + brushSize > 0 && y + brushSize > 0 && x < layer.width && y < layer.height) {
        const sampleX = Math.max(0, x);
        const sampleY = Math.max(0, y);
        const sampleW = Math.min(brushSize, layer.width - sampleX);
        const sampleH = Math.min(brushSize, layer.height - sampleY);
        
        if (sampleW > 0 && sampleH > 0) {
          const blockData = tempCtx.getImageData(sampleX, sampleY, sampleW, sampleH);
          let r = 0, g = 0, b = 0, a = 0, count = 0;
          
          for (let i = 0; i < blockData.data.length; i += 4) {
            if (blockData.data[i + 3] > 0) {
              r += blockData.data[i];
              g += blockData.data[i + 1];
              b += blockData.data[i + 2];
              a += blockData.data[i + 3];
              count++;
            }
          }
          
          if (count > 0) {
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);
            a = Math.round(a / count);
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
            ctx.fillRect(sampleX, sampleY, sampleW, sampleH);
          }
        }
      }
    }
  }
  ctx.restore();
};

export const drawCutoutLayer = (ctx: CanvasRenderingContext2D, layer: CutoutLayer): void => {
  if (!layer.imageData || !layer.maskData) return;
  ctx.save();
  ctx.globalAlpha = layer.opacity / 100;
  ctx.globalCompositeOperation = layer.blendMode;

  const { data, width, height } = layer.imageData;
  const resultData = new Uint8ClampedArray(data);
  
  for (let i = 0; i < layer.maskData.length; i++) {
    const alphaIdx = i * 4 + 3;
    resultData[alphaIdx] = Math.min(resultData[alphaIdx], layer.maskData[i]);
  }

  const resultImageData = new ImageData(resultData, width, height);
  ctx.putImageData(resultImageData, layer.x, layer.y);
  ctx.restore();
};

export const rotateImageData = (imageData: ImageData, degrees: number): ImageData => {
  const canvas = imageDataToCanvas(imageData);
  const radians = (degrees * Math.PI) / 180;
  
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const newWidth = Math.round(imageData.width * cos + imageData.height * sin);
  const newHeight = Math.round(imageData.width * sin + imageData.height * cos);
  
  const newCanvas = createCanvas(newWidth, newHeight);
  const newCtx = newCanvas.getContext('2d')!;
  
  newCtx.translate(newWidth / 2, newHeight / 2);
  newCtx.rotate(radians);
  newCtx.drawImage(canvas, -imageData.width / 2, -imageData.height / 2);
  
  return newCtx.getImageData(0, 0, newWidth, newHeight);
};

export const flipImageData = (imageData: ImageData, horizontal: boolean): ImageData => {
  const canvas = imageDataToCanvas(imageData);
  const newCanvas = createCanvas(imageData.width, imageData.height);
  const newCtx = newCanvas.getContext('2d')!;
  
  newCtx.save();
  if (horizontal) {
    newCtx.translate(imageData.width, 0);
    newCtx.scale(-1, 1);
  } else {
    newCtx.translate(0, imageData.height);
    newCtx.scale(1, -1);
  }
  newCtx.drawImage(canvas, 0, 0);
  newCtx.restore();
  
  return newCtx.getImageData(0, 0, imageData.width, imageData.height);
};

export const cropImageData = (imageData: ImageData, x: number, y: number, width: number, height: number): ImageData => {
  const canvas = imageDataToCanvas(imageData);
  const newCanvas = createCanvas(width, height);
  const newCtx = newCanvas.getContext('2d')!;
  newCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
  return newCtx.getImageData(0, 0, width, height);
};

export const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to convert canvas to blob'));
    }, type, quality);
  });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getLayerBounds = (layer: Layer): { x: number; y: number; width: number; height: number } => {
  if (layer.type === 'text') {
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d')!;
    ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
    const metrics = ctx.measureText(layer.content);
    const width = metrics.width;
    const height = layer.fontSize * 1.2;
    return { x: layer.x, y: layer.y, width, height };
  }
  return { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
};

export const isPointInLayer = (point: Point, layer: Layer): boolean => {
  const bounds = getLayerBounds(layer);
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
};
