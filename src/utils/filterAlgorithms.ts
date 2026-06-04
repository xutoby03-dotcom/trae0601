import type { FilterSettings } from '../types';

const clamp = (value: number, min = 0, max = 255): number => Math.max(min, Math.min(max, value));

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

export const applyBrightness = (data: Uint8ClampedArray, value: number): Uint8ClampedArray => {
  const adjustment = value * 2.55;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + adjustment);
    data[i + 1] = clamp(data[i + 1] + adjustment);
    data[i + 2] = clamp(data[i + 2] + adjustment);
  }
  return data;
};

export const applyContrast = (data: Uint8ClampedArray, value: number): Uint8ClampedArray => {
  const factor = (value / 50 + 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp((data[i] - 128) * factor + 128);
    data[i + 1] = clamp((data[i + 1] - 128) * factor + 128);
    data[i + 2] = clamp((data[i + 2] - 128) * factor + 128);
  }
  return data;
};

export const applySaturation = (data: Uint8ClampedArray, value: number): Uint8ClampedArray => {
  for (let i = 0; i < data.length; i += 4) {
    let [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    s = clamp(s + value, 0, 100);
    const [r, g, b] = hslToRgb(h, s, l);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  return data;
};

export const applyHue = (data: Uint8ClampedArray, value: number): Uint8ClampedArray => {
  for (let i = 0; i < data.length; i += 4) {
    let [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    h = (h + value + 360) % 360;
    const [r, g, b] = hslToRgb(h, s, l);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  return data;
};

export const applyGrayscale = (data: Uint8ClampedArray, value: number): Uint8ClampedArray => {
  const factor = value / 100;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = clamp(data[i] * (1 - factor) + gray * factor);
    data[i + 1] = clamp(data[i + 1] * (1 - factor) + gray * factor);
    data[i + 2] = clamp(data[i + 2] * (1 - factor) + gray * factor);
  }
  return data;
};

export const applyInvert = (data: Uint8ClampedArray, value: number): Uint8ClampedArray => {
  const factor = value / 100;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] * (1 - factor) + (255 - data[i]) * factor);
    data[i + 1] = clamp(data[i + 1] * (1 - factor) + (255 - data[i + 1]) * factor);
    data[i + 2] = clamp(data[i + 2] * (1 - factor) + (255 - data[i + 2]) * factor);
  }
  return data;
};

export const applyBlur = (data: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray => {
  if (radius === 0) return data;
  const result = new Uint8ClampedArray(data);
  const kernelSize = Math.floor(radius) * 2 + 1;
  const weights = new Array(kernelSize).fill(1);
  const weightSum = kernelSize;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -Math.floor(radius); ky <= Math.floor(radius); ky++) {
        const yy = Math.max(0, Math.min(height - 1, y + ky));
        for (let kx = -Math.floor(radius); kx <= Math.floor(radius); kx++) {
          const xx = Math.max(0, Math.min(width - 1, x + kx));
          const idx = (yy * width + xx) * 4;
          r += data[idx] * weights[ky + Math.floor(radius)] * weights[kx + Math.floor(radius)];
          g += data[idx + 1] * weights[ky + Math.floor(radius)] * weights[kx + Math.floor(radius)];
          b += data[idx + 2] * weights[ky + Math.floor(radius)] * weights[kx + Math.floor(radius)];
        }
      }
      const idx = (y * width + x) * 4;
      const div = weightSum * weightSum;
      result[idx] = clamp(r / div);
      result[idx + 1] = clamp(g / div);
      result[idx + 2] = clamp(b / div);
    }
  }
  return result;
};

export const applySharpen = (data: Uint8ClampedArray, width: number, height: number, value: number): Uint8ClampedArray => {
  if (value === 0) return data;
  const result = new Uint8ClampedArray(data);
  const strength = value / 50;
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const kidx = (ky + 1) * 3 + (kx + 1);
          const idx = ((y + ky) * width + (x + kx)) * 4;
          r += data[idx] * kernel[kidx];
          g += data[idx + 1] * kernel[kidx];
          b += data[idx + 2] * kernel[kidx];
        }
      }
      const idx = (y * width + x) * 4;
      result[idx] = clamp(data[idx] * (1 - strength) + r * strength);
      result[idx + 1] = clamp(data[idx + 1] * (1 - strength) + g * strength);
      result[idx + 2] = clamp(data[idx + 2] * (1 - strength) + b * strength);
    }
  }
  return result;
};

export const applyNostalgia = (data: Uint8ClampedArray, value: number): Uint8ClampedArray => {
  const factor = value / 100;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const tr = clamp(r * 0.393 + g * 0.769 + b * 0.189);
    const tg = clamp(r * 0.349 + g * 0.686 + b * 0.168);
    const tb = clamp(r * 0.272 + g * 0.534 + b * 0.131);
    data[i] = clamp(r * (1 - factor) + tr * factor);
    data[i + 1] = clamp(g * (1 - factor) + tg * factor);
    data[i + 2] = clamp(b * (1 - factor) + tb * factor);
  }
  return data;
};

export const applyLomo = (data: Uint8ClampedArray, width: number, height: number, value: number): Uint8ClampedArray => {
  const factor = value / 100;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const vignette = clamp(1 - (dist / maxDist) * 0.7, 0.3, 1);

      let r = data[idx], g = data[idx + 1], b = data[idx + 2];
      
      const contrastFactor = 1.2 * factor;
      r = clamp((r - 128) * contrastFactor + 128);
      g = clamp((g - 128) * contrastFactor + 128);
      b = clamp((b - 128) * contrastFactor + 128);

      const satFactor = 1.3 * factor;
      let [h, s, l] = rgbToHsl(r, g, b);
      s = clamp(s * satFactor, 0, 100);
      [r, g, b] = hslToRgb(h, s, l);

      const vFactor = vignette * factor + (1 - factor);
      r = clamp(r * vFactor);
      g = clamp(g * vFactor);
      b = clamp(b * vFactor);

      data[idx] = clamp(data[idx] * (1 - factor) + r * factor);
      data[idx + 1] = clamp(data[idx + 1] * (1 - factor) + g * factor);
      data[idx + 2] = clamp(data[idx + 2] * (1 - factor) + b * factor);
    }
  }
  return data;
};

export const applyAllFilters = (
  imageData: ImageData,
  filters: FilterSettings
): ImageData => {
  const { data, width, height } = imageData;
  const resultData = new Uint8ClampedArray(data);

  if (filters.brightness !== 0) applyBrightness(resultData, filters.brightness);
  if (filters.contrast !== 0) applyContrast(resultData, filters.contrast);
  if (filters.saturation !== 0) applySaturation(resultData, filters.saturation);
  if (filters.hue !== 0) applyHue(resultData, filters.hue);
  if (filters.grayscale > 0) applyGrayscale(resultData, filters.grayscale);
  if (filters.invert > 0) applyInvert(resultData, filters.invert);
  if (filters.nostalgia > 0) applyNostalgia(resultData, filters.nostalgia);
  if (filters.blur > 0) {
    const blurred = applyBlur(resultData, width, height, filters.blur);
    for (let i = 0; i < resultData.length; i++) {
      resultData[i] = blurred[i];
    }
  }
  if (filters.sharpen > 0) {
    const sharpened = applySharpen(resultData, width, height, filters.sharpen);
    for (let i = 0; i < resultData.length; i++) {
      resultData[i] = sharpened[i];
    }
  }
  if (filters.lomo > 0) applyLomo(resultData, width, height, filters.lomo);

  return new ImageData(resultData, width, height);
};
