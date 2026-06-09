export type DeviceType = 'tv' | 'projector' | 'amplifier' | 'speaker' | 'game_console' | 'streaming_box' | 'blu_ray' | 'other';
export type DeviceStatus = 'online' | 'offline' | 'fault';
export type PortType = 'hdmi' | 'optical' | 'arc' | 'rca' | 'aux' | 'bluetooth' | 'usb' | 'ethernet';
export type PortDirection = 'input' | 'output';

export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: DeviceType;
  photoUrl: string;
  remoteLocation: string;
  status: DeviceStatus;
  createdAt: number;
}

export interface DevicePort {
  id: string;
  deviceId: string;
  portType: PortType;
  portName: string;
  direction: PortDirection;
  connectedToPortId: string | null;
  label: string;
}

export interface Scene {
  id: string;
  name: string;
  icon: string;
  description: string;
  useCount: number;
  createdAt: number;
}

export interface SceneDevice {
  id: string;
  sceneId: string;
  deviceId: string;
  inputSource: string;
  volume: number;
  notes: string;
}

export interface TroubleshootLog {
  id: string;
  symptom: string;
  resolution: string;
  createdAt: number;
  deviceId: string;
}

export interface TopologyPosition {
  deviceId: string;
  x: number;
  y: number;
}

export interface Connection {
  id: string;
  sourcePortId: string;
  targetPortId: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  portType: PortType;
}
