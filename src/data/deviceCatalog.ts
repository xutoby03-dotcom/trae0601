import type { DeviceCatalogItem } from '@/types';

export const DEVICE_CATALOG: DeviceCatalogItem[] = [
  {
    id: 'profoto-b10-plus',
    type: 'main_light',
    name: 'Profoto B10 Plus',
    model: 'B10 Plus 500 AirTTL',
    defaultColorTemp: 5500,
    maxPower: 500,
  },
  {
    id: 'profoto-d2',
    type: 'main_light',
    name: 'Profoto D2',
    model: 'D2 1000 AirTTL',
    defaultColorTemp: 5400,
    maxPower: 1000,
  },
  {
    id: 'elinchrom-five',
    type: 'fill_light',
    name: 'Elinchrom FIVE',
    model: 'FIVE Monolight',
    defaultColorTemp: 5500,
    maxPower: 516,
  },
  {
    id: 'godox-ad600',
    type: 'fill_light',
    name: 'Godox AD600 Pro',
    model: 'AD600 Pro II',
    defaultColorTemp: 5600,
    maxPower: 600,
  },
  {
    id: 'aputure-600d',
    type: 'rim_light',
    name: 'Aputure 600D',
    model: 'LS 600d Pro',
    defaultColorTemp: 5600,
    maxPower: 720,
  },
  {
    id: 'nanlite-forza',
    type: 'rim_light',
    name: 'NanLite Forza 500',
    model: 'Forza 500 II',
    defaultColorTemp: 5600,
    maxPower: 500,
  },
  {
    id: 'reflector-gold-110',
    type: 'reflector',
    name: '金色反光板 110cm',
    model: '金/银双面 圆形 110cm',
  },
  {
    id: 'reflector-white-150',
    type: 'reflector',
    name: '白色反光板 150cm',
    model: '白/银/金/黑 五合一 150cm',
  },
  {
    id: 'bg-paper-white',
    type: 'background',
    name: '背景纸 纯白色',
    model: 'Super White 2.72×11m',
  },
  {
    id: 'bg-paper-gray',
    type: 'background',
    name: '背景纸 灰色渐变',
    model: 'Gray Gradient 2.72×11m',
  },
  {
    id: 'bg-paper-black',
    type: 'background',
    name: '背景纸 纯黑',
    model: 'Deep Black 2.72×11m',
  },
];

export const getDeviceCatalog = (type: DeviceCatalogItem['type'] | 'all' = 'all') => {
  if (type === 'all') return DEVICE_CATALOG;
  return DEVICE_CATALOG.filter((d) => d.type === type);
};
