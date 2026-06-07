import { Atmosphere } from './types'

export interface AtmosphereStyle {
  bg: string
  card: string
  border: string
  glow: string
  text: string
  accent: string
  shape: 'wavy' | 'rounded' | 'jagged' | 'floating' | 'blurred'
  emoji: string
}

export const ATMOSPHERE_STYLES: Record<Atmosphere, AtmosphereStyle> = {
  absurd: {
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #4a1942 100%)',
    card: 'linear-gradient(145deg, #3b1d6e, #6b2fa0)',
    border: '#9b59b6',
    glow: 'rgba(155, 89, 182, 0.5)',
    text: '#e8d5f5',
    accent: '#e74c3c',
    shape: 'wavy',
    emoji: '🎭',
  },
  warm: {
    bg: 'linear-gradient(135deg, #2c1810 0%, #3d2317 50%, #4a2c1a 100%)',
    card: 'linear-gradient(145deg, #8b5e3c, #c4956a)',
    border: '#d4a574',
    glow: 'rgba(212, 165, 116, 0.5)',
    text: '#fff3e0',
    accent: '#ff9800',
    shape: 'rounded',
    emoji: '☀️',
  },
  fear: {
    bg: 'linear-gradient(135deg, #0a0a1a 0%, #0d1117 50%, #101820 100%)',
    card: 'linear-gradient(145deg, #1a1a2e, #2d2d44)',
    border: '#4a4a6a',
    glow: 'rgba(74, 74, 106, 0.5)',
    text: '#c0c0d0',
    accent: '#8e44ad',
    shape: 'jagged',
    emoji: '🌑',
  },
  flying: {
    bg: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #2a3a5a 100%)',
    card: 'linear-gradient(145deg, #4a8fe7, #7bb3f0)',
    border: '#87ceeb',
    glow: 'rgba(135, 206, 235, 0.4)',
    text: '#e0f0ff',
    accent: '#00bcd4',
    shape: 'floating',
    emoji: '🕊️',
  },
  lost: {
    bg: 'linear-gradient(135deg, #1a1a0a 0%, #2a2a1a 50%, #3a3a2a 100%)',
    card: 'linear-gradient(145deg, #5a6e4e, #7a8e6e)',
    border: '#8fbc8f',
    glow: 'rgba(143, 188, 143, 0.4)',
    text: '#d0e0c0',
    accent: '#7cb342',
    shape: 'blurred',
    emoji: '🌫️',
  },
}

export function getClipPath(shape: AtmosphereStyle['shape']): string {
  switch (shape) {
    case 'wavy':
      return 'polygon(2% 5%, 8% 0%, 18% 3%, 30% 0%, 45% 4%, 58% 0%, 72% 3%, 85% 0%, 95% 2%, 100% 5%, 98% 95%, 93% 100%, 82% 97%, 70% 100%, 55% 96%, 42% 100%, 28% 98%, 15% 100%, 5% 97%, 0% 95%)'
    case 'rounded':
      return 'ellipse(48% 46% at 50% 50%)'
    case 'jagged':
      return 'polygon(5% 0%, 12% 8%, 20% 0%, 30% 6%, 40% 0%, 50% 5%, 60% 0%, 70% 7%, 80% 0%, 90% 4%, 100% 0%, 100% 92%, 95% 100%, 88% 94%, 80% 100%, 70% 95%, 60% 100%, 50% 96%, 40% 100%, 30% 94%, 20% 100%, 10% 96%, 0% 100%)'
    case 'floating':
      return 'polygon(5% 2%, 15% 0%, 35% 3%, 55% 0%, 75% 2%, 90% 0%, 100% 3%, 98% 15%, 100% 35%, 97% 55%, 100% 75%, 98% 90%, 95% 100%, 80% 97%, 60% 100%, 40% 98%, 20% 100%, 5% 97%, 0% 85%, 2% 65%, 0% 45%, 3% 25%)'
    case 'blurred':
      return 'polygon(3% 3%, 97% 2%, 98% 97%, 2% 98%)'
    default:
      return 'none'
  }
}
