import type { Point } from '../types';
import { createCanvas, imageDataToCanvas } from './canvasUtils';

export const sobelEdgeDetect = (imageData: ImageData): Float32Array => {
  const { data, width, height } = imageData;
  const gradients = new Float32Array(width * height);

  const gx = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];
  const gy = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0, sumY = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sumX += gray * gx[ky + 1][kx + 1];
          sumY += gray * gy[ky + 1][kx + 1];
        }
      }
      gradients[y * width + x] = Math.sqrt(sumX * sumX + sumY * sumY);
    }
  }

  return gradients;
};

export const findNearestEdge = (
  point: Point,
  gradients: Float32Array,
  width: number,
  height: number,
  searchRadius: number
): Point => {
  let bestPoint = { ...point };
  let maxGradient = -1;

  for (let dy = -searchRadius; dy <= searchRadius; dy++) {
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      const nx = Math.round(point.x + dx);
      const ny = Math.round(point.y + dy);
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const grad = gradients[ny * width + nx];
        if (grad > maxGradient) {
          maxGradient = grad;
          bestPoint = { x: nx, y: ny };
        }
      }
    }
  }

  return bestPoint;
};

export const applyMagneticLasso = (
  rawPoints: Point[],
  imageData: ImageData,
  edgeThreshold: number = 30
): Point[] => {
  if (rawPoints.length < 2) return rawPoints;

  const gradients = sobelEdgeDetect(imageData);
  const { width, height } = imageData;
  const adjustedPoints: Point[] = [];
  const searchRadius = 15;

  for (let i = 0; i < rawPoints.length; i++) {
    const point = rawPoints[i];
    const grad = gradients[Math.round(point.y) * width + Math.round(point.x)];

    if (grad > edgeThreshold) {
      const snapped = findNearestEdge(point, gradients, width, height, searchRadius);
      adjustedPoints.push(snapped);
    } else {
      adjustedPoints.push({ ...point });
    }
  }

  return simplifyPath(adjustedPoints, 2);
};

export const simplifyPath = (points: Point[], tolerance: number): Point[] => {
  if (points.length <= 2) return points;

  const result: Point[] = [points[0]];
  let lastPoint = points[0];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = Math.hypot(points[i].x - lastPoint.x, points[i].y - lastPoint.y);
    if (dist >= tolerance) {
      result.push(points[i]);
      lastPoint = points[i];
    }
  }

  result.push(points[points.length - 1]);
  return result;
};

export const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
};

export const createMaskFromPath = (
  path: Point[],
  width: number,
  height: number
): Uint8ClampedArray => {
  const mask = new Uint8ClampedArray(width * height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isPointInPolygon({ x, y }, path)) {
        mask[y * width + x] = 255;
      } else {
        mask[y * width + x] = 0;
      }
    }
  }

  return featherMask(mask, width, height, 3);
};

export const featherMask = (
  mask: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray => {
  if (radius === 0) return mask;

  const result = new Uint8ClampedArray(mask.length);
  const kernelSize = radius * 2 + 1;
  const weights: number[] = [];
  let weightSum = 0;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      const w = Math.max(0, 1 - dist / radius);
      weights.push(w);
      weightSum += w;
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let wi = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            sum += mask[ny * width + nx] * weights[wi];
          }
          wi++;
        }
      }
      result[y * width + x] = Math.round(sum / weightSum);
    }
  }

  return result;
};

export const applyMaskToImageData = (
  imageData: ImageData,
  mask: Uint8ClampedArray
): ImageData => {
  const resultData = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < mask.length; i++) {
    const alphaIdx = i * 4 + 3;
    resultData[alphaIdx] = Math.min(resultData[alphaIdx], mask[i]);
  }

  return new ImageData(resultData, imageData.width, imageData.height);
};

export const createCutoutLayerData = (
  originalImageData: ImageData,
  lassoPath: Point[],
  useMagnetic: boolean = true
): { cutoutData: ImageData; maskData: Uint8ClampedArray } => {
  const adjustedPath = useMagnetic
    ? applyMagneticLasso(lassoPath, originalImageData)
    : lassoPath;

  const closedPath = adjustedPath.length > 0 && adjustedPath[0] !== adjustedPath[adjustedPath.length - 1]
    ? [...adjustedPath, adjustedPath[0]]
    : adjustedPath;

  const mask = createMaskFromPath(closedPath, originalImageData.width, originalImageData.height);
  const cutoutData = applyMaskToImageData(originalImageData, mask);

  return { cutoutData, maskData: mask };
};

export const drawPathOnCanvas = (
  ctx: CanvasRenderingContext2D,
  path: Point[],
  color: string = '#3b82f6',
  lineWidth: number = 2
): void => {
  if (path.length < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = color;
  for (const point of path) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};
