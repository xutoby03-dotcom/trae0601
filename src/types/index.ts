export type DeviceType = 'light' | 'ac' | 'curtain' | 'speaker' | 'humidifier' | 'camera';

export type RoomType = 'living' | 'bedroom' | 'kitchen' | 'bathroom';

export type ACMode = 'cool' | 'heat' | 'auto' | 'fan';

export type SceneType = 'home' | 'away' | 'sleep' | 'party';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  room: RoomType;
  isOn: boolean;
  brightness?: number;
  color?: string;
  temperature?: number;
  mode?: ACMode;
  openPercent?: number;
  volume?: number;
  humidity?: number;
  targetHumidity?: number;
  isRecording?: boolean;
}

export interface Scene {
  id: SceneType;
  name: string;
  icon: string;
  description: string;
}

export interface DeviceLog {
  id: string;
  deviceId: string;
  deviceName: string;
  room: RoomType;
  action: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

export interface EnergyData {
  date: string;
  total: number;
  byDevice: Record<string, number>;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface RoomInfo {
  id: RoomType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
