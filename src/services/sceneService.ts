import type { Device, SceneType } from '@/types';

export const applyScene = (sceneId: SceneType, devices: Device[]): Device[] => {
  return devices.map(device => {
    switch (sceneId) {
      case 'home':
        if (device.room === 'living') {
          if (device.type === 'light') return { ...device, isOn: true, brightness: 80 };
          if (device.type === 'ac') return { ...device, isOn: true, temperature: 24 };
          if (device.type === 'curtain') return { ...device, isOn: true, openPercent: 100 };
          if (device.type === 'speaker') return { ...device, isOn: true, volume: 40 };
        }
        if (device.type === 'camera') return { ...device, isRecording: false };
        return device;

      case 'away':
        if (device.type === 'camera') return { ...device, isOn: true, isRecording: true };
        if (device.type === 'curtain') return { ...device, openPercent: 0 };
        return { ...device, isOn: false };

      case 'sleep':
        if (device.type === 'light') return { ...device, isOn: false };
        if (device.room === 'bedroom') {
          if (device.type === 'humidifier') return { ...device, isOn: true, targetHumidity: 60 };
          if (device.type === 'ac') return { ...device, isOn: true, temperature: 26, mode: 'cool' };
        }
        if (device.type === 'curtain') return { ...device, openPercent: 0 };
        if (device.type === 'speaker') return { ...device, isOn: false };
        if (device.type === 'camera') return { ...device, isRecording: true };
        return device;

      case 'party':
        if (device.type === 'light') return { ...device, isOn: true, brightness: 100, color: getRandomColor() };
        if (device.type === 'speaker') return { ...device, isOn: true, volume: 70 };
        if (device.type === 'ac') return { ...device, isOn: true, temperature: 22 };
        if (device.type === 'curtain') return { ...device, openPercent: 50 };
        return device;

      default:
        return device;
    }
  });
};

const getRandomColor = (): string => {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getSceneName = (sceneId: SceneType): string => {
  const names: Record<SceneType, string> = {
    home: '回家模式',
    away: '离家模式',
    sleep: '睡眠模式',
    party: '派对模式',
  };
  return names[sceneId];
};
