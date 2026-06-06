import type { Device, Scene, RoomInfo, EnergyData } from '@/types';

export const initialDevices: Device[] = [
  { id: 'living-light-1', name: '主灯', type: 'light', room: 'living', isOn: false, brightness: 80, color: '#ffffff' },
  { id: 'living-ac-1', name: '空调', type: 'ac', room: 'living', isOn: false, temperature: 24, mode: 'cool' },
  { id: 'living-curtain-1', name: '窗帘', type: 'curtain', room: 'living', isOn: true, openPercent: 100 },
  { id: 'living-speaker-1', name: '音响', type: 'speaker', room: 'living', isOn: false, volume: 50 },
  { id: 'living-camera-1', name: '摄像头', type: 'camera', room: 'living', isOn: true, isRecording: false },
  
  { id: 'bedroom-light-1', name: '卧室灯', type: 'light', room: 'bedroom', isOn: false, brightness: 60, color: '#ffeaa7' },
  { id: 'bedroom-ac-1', name: '空调', type: 'ac', room: 'bedroom', isOn: false, temperature: 26, mode: 'cool' },
  { id: 'bedroom-curtain-1', name: '窗帘', type: 'curtain', room: 'bedroom', isOn: true, openPercent: 0 },
  { id: 'bedroom-humidifier-1', name: '加湿器', type: 'humidifier', room: 'bedroom', isOn: false, humidity: 45, targetHumidity: 60 },
  
  { id: 'kitchen-light-1', name: '厨房灯', type: 'light', room: 'kitchen', isOn: true, brightness: 100, color: '#ffffff' },
  { id: 'kitchen-speaker-1', name: '音响', type: 'speaker', room: 'kitchen', isOn: false, volume: 30 },
  { id: 'kitchen-camera-1', name: '摄像头', type: 'camera', room: 'kitchen', isOn: true, isRecording: true },
  
  { id: 'bathroom-light-1', name: '卫生间灯', type: 'light', room: 'bathroom', isOn: false, brightness: 70, color: '#ffffff' },
  { id: 'bathroom-humidifier-1', name: '换气扇', type: 'humidifier', room: 'bathroom', isOn: false, humidity: 60, targetHumidity: 50 },
];

export const scenes: Scene[] = [
  { id: 'home', name: '回家模式', icon: 'home', description: '开启客厅灯和空调，拉开窗帘' },
  { id: 'away', name: '离家模式', icon: 'log-out', description: '关闭所有设备，开启摄像头录制' },
  { id: 'sleep', name: '睡眠模式', icon: 'moon', description: '关闭灯光，调暗卧室，开启加湿器' },
  { id: 'party', name: '派对模式', icon: 'music', description: '开启所有灯光和音响，炫彩模式' },
];

export const roomInfo: RoomInfo[] = [
  { id: 'living', name: '客厅', x: 50, y: 50, width: 400, height: 300 },
  { id: 'bedroom', name: '卧室', x: 500, y: 50, width: 300, height: 300 },
  { id: 'kitchen', name: '厨房', x: 50, y: 380, width: 300, height: 200 },
  { id: 'bathroom', name: '卫生间', x: 380, y: 380, width: 170, height: 200 },
];

export const generateInitialEnergyData = (): EnergyData[] => {
  const data: EnergyData[] = [];
  const deviceTypes = ['light', 'ac', 'curtain', 'speaker', 'humidifier', 'camera'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    
    const byDevice: Record<string, number> = {};
    let total = 0;
    
    deviceTypes.forEach(type => {
      const value = Math.floor(Math.random() * 3 + 1) * (type === 'ac' ? 3 : 1);
      byDevice[type] = value;
      total += value;
    });
    
    data.push({ date: dateStr, total, byDevice });
  }
  
  return data;
};
