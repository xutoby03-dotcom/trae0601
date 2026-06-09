import type { DeviceType, PortType } from '@/types';
import {
  Tv, Projector, AudioLines, Speaker, Gamepad2, Radio, Disc3, HelpCircle,
  Cable, Bluetooth, Usb, Wifi
} from 'lucide-react';

const deviceIconMap: Record<DeviceType, React.ElementType> = {
  tv: Tv,
  projector: Projector,
  amplifier: AudioLines,
  speaker: Speaker,
  game_console: Gamepad2,
  streaming_box: Radio,
  blu_ray: Disc3,
  other: HelpCircle,
};

export function DeviceIcon({ type, size = 20, className = '' }: { type: DeviceType; size?: number; className?: string }) {
  const Icon = deviceIconMap[type] || HelpCircle;
  return <Icon size={size} className={className} />;
}

const portColorMap: Record<PortType, string> = {
  hdmi: '#f59e0b',
  optical: '#06b6d4',
  arc: '#8b5cf6',
  rca: '#22c55e',
  aux: '#3b82f6',
  bluetooth: '#3b82f6',
  usb: '#6b7280',
  ethernet: '#a3a3a3',
};

export function portColor(type: PortType): string {
  return portColorMap[type] || '#6b7280';
}

const portIconMap: Record<PortType, React.ElementType> = {
  hdmi: Cable,
  optical: Wifi,
  arc: Cable,
  rca: Cable,
  aux: Cable,
  bluetooth: Bluetooth,
  usb: Usb,
  ethernet: Wifi,
};

export function PortIcon({ type, size = 14 }: { type: PortType; size?: number }) {
  const Icon = portIconMap[type] || Cable;
  return <Icon size={size} style={{ color: portColor(type) }} />;
}

export const deviceTypeLabels: Record<DeviceType, string> = {
  tv: '电视',
  projector: '投影仪',
  amplifier: '功放',
  speaker: '音响',
  game_console: '游戏机',
  streaming_box: '流媒体盒',
  blu_ray: '蓝光播放器',
  other: '其他',
};

export const portTypeLabels: Record<PortType, string> = {
  hdmi: 'HDMI',
  optical: '光纤',
  arc: 'HDMI ARC',
  rca: 'RCA',
  aux: 'AUX',
  bluetooth: '蓝牙',
  usb: 'USB',
  ethernet: '网线',
};
