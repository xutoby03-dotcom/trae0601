export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 0, s: 0, l: 0 }

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

export function colorDistance(hex1: string, hex2: string): number {
  const hsl1 = hexToHsl(hex1)
  const hsl2 = hexToHsl(hex2)

  let dh = Math.abs(hsl1.h - hsl2.h)
  if (dh > 180) dh = 360 - dh
  dh = dh / 180

  const ds = Math.abs(hsl1.s - hsl2.s) / 100
  const dl = Math.abs(hsl1.l - hsl2.l) / 100

  return Math.sqrt(dh * dh * 2 + ds * ds + dl * dl)
}

export function findSimilarColors(targetHex: string, materials: { id: string; colorHex: string }[], threshold: number = 0.4): string[] {
  return materials
    .filter(m => colorDistance(targetHex, m.colorHex) <= threshold)
    .sort((a, b) => colorDistance(targetHex, a.colorHex) - colorDistance(targetHex, b.colorHex))
    .map(m => m.id)
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export const COLOR_PRESETS = [
  { name: '红色', hex: '#E74C3C' },
  { name: '珊瑚', hex: '#FF6B6B' },
  { name: '橙色', hex: '#E67E22' },
  { name: '琥珀', hex: '#F59E0B' },
  { name: '黄色', hex: '#F1C40F' },
  { name: '柠檬', hex: '#A3D977' },
  { name: '绿色', hex: '#2ECC71' },
  { name: '薄荷', hex: '#6BBF8A' },
  { name: '青色', hex: '#1ABC9C' },
  { name: '湖蓝', hex: '#3498DB' },
  { name: '天蓝', hex: '#5DADE2' },
  { name: '蓝色', hex: '#2980B9' },
  { name: '靛蓝', hex: '#3F51B5' },
  { name: '紫色', hex: '#9B59B6' },
  { name: '薰衣草', hex: '#BB8FCE' },
  { name: '粉红', hex: '#E8A0BF' },
  { name: '玫红', hex: '#C0392B' },
  { name: '棕色', hex: '#8B5E3C' },
  { name: '米色', hex: '#D4B896' },
  { name: '灰色', hex: '#95A5A6' },
  { name: '白色', hex: '#FFFFFF' },
  { name: '黑色', hex: '#2C3E50' },
  { name: '透明', hex: '#F0F0F0' },
]

export function getColorName(hex: string): string {
  const hsl = hexToHsl(hex)
  if (hsl.s < 10) {
    if (hsl.l > 90) return '白色'
    if (hsl.l < 10) return '黑色'
    return '灰色'
  }

  let hueName = ''
  if (hsl.h < 15) hueName = '红色'
  else if (hsl.h < 40) hueName = '橙色'
  else if (hsl.h < 65) hueName = '黄色'
  else if (hsl.h < 150) hueName = '绿色'
  else if (hsl.h < 190) hueName = '青色'
  else if (hsl.h < 250) hueName = '蓝色'
  else if (hsl.h < 290) hueName = '紫色'
  else if (hsl.h < 335) hueName = '粉色'
  else hueName = '红色'

  let prefix = ''
  if (hsl.s < 30) prefix = '浅'
  else if (hsl.l < 30) prefix = '深'
  else if (hsl.l > 70) prefix = '浅'

  return prefix + hueName
}
