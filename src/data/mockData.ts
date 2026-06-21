import type { AirspaceInfo, WeatherInfo, RthInfo, Battery, ShotItem } from '@/types';

const locationData: Record<string, { airspace: AirspaceInfo; weather: WeatherInfo; rth: RthInfo }> = {
  '北京故宫': {
    airspace: {
      noFlyZones: [
        { name: '首都机场禁飞区', type: 'airport', radius: 8000, lat: 40.08, lng: 116.58 },
        { name: '中南海禁飞区', type: 'government', radius: 3000, lat: 39.915, lng: 116.38 },
        { name: '天安门广场禁飞区', type: 'population', radius: 2000, lat: 39.9054, lng: 116.3976 },
      ],
      altitudeLimit: 0,
      distanceToNearestZone: 0,
      status: 'danger',
    },
    weather: {
      windSpeed: 3.2,
      windDirection: 225,
      temperature: 18,
      visibility: 12,
      windStatus: 'safe',
    },
    rth: {
      homePoint: { name: '景山公园西门', lat: 39.9235, lng: 116.3925 },
      alternatives: [
        { name: '北海公园北门', location: { name: '北海公园北门', lat: 39.931, lng: 116.388 }, distance: 850, direction: '西北' },
        { name: '中山公园东门', location: { name: '中山公园东门', lat: 39.908, lng: 116.392 }, distance: 420, direction: '正南' },
      ],
    },
  },
  '上海外滩': {
    airspace: {
      noFlyZones: [
        { name: '虹桥机场禁飞区', type: 'airport', radius: 10000, lat: 31.1979, lng: 121.3363 },
        { name: '浦东机场禁飞区', type: 'airport', radius: 10000, lat: 31.1443, lng: 121.8083 },
      ],
      altitudeLimit: 120,
      distanceToNearestZone: 12000,
      status: 'caution',
    },
    weather: {
      windSpeed: 6.8,
      windDirection: 90,
      temperature: 22,
      visibility: 8,
      windStatus: 'caution',
    },
    rth: {
      homePoint: { name: '外滩观景平台', lat: 31.2400, lng: 121.4900 },
      alternatives: [
        { name: '陆家嘴中心绿地', location: { name: '陆家嘴中心绿地', lat: 31.2355, lng: 121.5055 }, distance: 1500, direction: '正东' },
        { name: '人民广场', location: { name: '人民广场', lat: 31.2304, lng: 121.4737 }, distance: 2200, direction: '正西' },
      ],
    },
  },
  '深圳湾': {
    airspace: {
      noFlyZones: [
        { name: '深圳宝安机场禁飞区', type: 'airport', radius: 10000, lat: 22.639, lng: 113.814 },
        { name: '香港边境限飞区', type: 'government', radius: 5000, lat: 22.53, lng: 114.07 },
      ],
      altitudeLimit: 150,
      distanceToNearestZone: 15000,
      status: 'safe',
    },
    weather: {
      windSpeed: 4.5,
      windDirection: 180,
      temperature: 28,
      visibility: 15,
      windStatus: 'safe',
    },
    rth: {
      homePoint: { name: '深圳湾公园A区', lat: 22.517, lng: 113.945 },
      alternatives: [
        { name: '红树林保护区停车场', location: { name: '红树林保护区停车场', lat: 22.523, lng: 113.955 }, distance: 650, direction: '东北' },
        { name: '人才公园', location: { name: '人才公园', lat: 22.510, lng: 113.938 }, distance: 1100, direction: '西南' },
      ],
    },
  },
  '成都天府广场': {
    airspace: {
      noFlyZones: [
        { name: '双流机场禁飞区', type: 'airport', radius: 8000, lat: 30.578, lng: 103.947 },
        { name: '天府广场限飞区', type: 'population', radius: 3000, lat: 30.657, lng: 104.066 },
      ],
      altitudeLimit: 50,
      distanceToNearestZone: 2000,
      status: 'danger',
    },
    weather: {
      windSpeed: 2.1,
      windDirection: 315,
      temperature: 20,
      visibility: 6,
      windStatus: 'safe',
    },
    rth: {
      homePoint: { name: '人民公园南门', lat: 30.659, lng: 104.056 },
      alternatives: [
        { name: '浣花溪公园', location: { name: '浣花溪公园', lat: 30.660, lng: 104.037 }, distance: 1800, direction: '正西' },
        { name: '望江楼公园', location: { name: '望江楼公园', lat: 30.641, lng: 104.080 }, distance: 2600, direction: '东南' },
      ],
    },
  },
  '杭州西湖': {
    airspace: {
      noFlyZones: [
        { name: '萧山机场禁飞区', type: 'airport', radius: 10000, lat: 30.234, lng: 120.433 },
      ],
      altitudeLimit: 120,
      distanceToNearestZone: 25000,
      status: 'safe',
    },
    weather: {
      windSpeed: 8.2,
      windDirection: 270,
      temperature: 16,
      visibility: 10,
      windStatus: 'danger',
    },
    rth: {
      homePoint: { name: '断桥残雪停车场', lat: 30.259, lng: 120.152 },
      alternatives: [
        { name: '苏堤南端', location: { name: '苏堤南端', lat: 30.241, lng: 120.140 }, distance: 2200, direction: '西南' },
        { name: '曲院风荷', location: { name: '曲院风荷', lat: 30.255, lng: 120.137 }, distance: 1300, direction: '正西' },
      ],
    },
  },
};

export function getLocationNames(): string[] {
  return Object.keys(locationData);
}

export function getLocationData(name: string) {
  return locationData[name] || null;
}

export const defaultBatteries: Battery[] = [
  { id: 'bat-1', name: '电池 A', cycleCount: 45, health: 92, estimatedFlightTime: 28, status: 'good' },
  { id: 'bat-2', name: '电池 B', cycleCount: 128, health: 74, estimatedFlightTime: 22, status: 'warning' },
  { id: 'bat-3', name: '电池 C', cycleCount: 210, health: 55, estimatedFlightTime: 16, status: 'critical' },
];

export const defaultShots: ShotItem[] = [
  {
    id: 'shot-1',
    order: 1,
    name: '开场全景',
    description: '从东南方向 200m 高度俯拍主体建筑全景，缓慢向前推进',
    requiredAltitude: 200,
    maxWindSpeed: 8,
    batteryId: 'bat-1',
    status: 'safe',
    issues: [],
    alternatives: [],
  },
  {
    id: 'shot-2',
    order: 2,
    name: '低空环绕',
    description: '30m 高度环绕主体建筑飞行一圈，展现建筑细节与周边环境',
    requiredAltitude: 30,
    maxWindSpeed: 5,
    batteryId: 'bat-1',
    status: 'safe',
    issues: [],
    alternatives: [],
  },
  {
    id: 'shot-3',
    order: 3,
    name: '高空延时',
    description: '150m 高度悬停拍摄 10 分钟延时，记录光影变化',
    requiredAltitude: 150,
    maxWindSpeed: 6,
    batteryId: 'bat-2',
    status: 'safe',
    issues: [],
    alternatives: [],
  },
  {
    id: 'shot-4',
    order: 4,
    name: '穿越走廊',
    description: '10m 高度沿主通道直线穿越，展现空间纵深感',
    requiredAltitude: 10,
    maxWindSpeed: 4,
    batteryId: 'bat-1',
    status: 'safe',
    issues: [],
    alternatives: [],
  },
  {
    id: 'shot-5',
    order: 5,
    name: '日落逆光',
    description: '80m 高度从西面向东拍摄逆光剪影效果',
    requiredAltitude: 80,
    maxWindSpeed: 10,
    batteryId: 'bat-2',
    status: 'safe',
    issues: [],
    alternatives: [],
  },
];

export function evaluateShots(shots: ShotItem[], altitudeLimit: number, windSpeed: number): ShotItem[] {
  return shots.map((shot) => {
    const issues: string[] = [];
    const alternatives: ShotItem['alternatives'] = [];

    if (altitudeLimit > 0 && shot.requiredAltitude > altitudeLimit) {
      issues.push(`限高 ${altitudeLimit}m，镜头需 ${shot.requiredAltitude}m`);
      alternatives.push({
        name: '降低高度拍摄',
        description: `在 ${altitudeLimit}m 高度以更大广角拍摄，后期裁剪`,
        altitude: altitudeLimit,
        reason: `当前限高 ${altitudeLimit}m，降低后可在合规高度完成类似构图`,
      });
      alternatives.push({
        name: '远处高点拍摄',
        description: `在 ${Math.min(altitudeLimit, shot.requiredAltitude * 0.6)}m 高度从远处高地拍摄`,
        altitude: Math.min(altitudeLimit, Math.round(shot.requiredAltitude * 0.6)),
        reason: '利用地形高差弥补限高不足',
      });
    }

    if (windSpeed > shot.maxWindSpeed) {
      issues.push(`风速 ${windSpeed}m/s，镜头要求 ≤${shot.maxWindSpeed}m/s`);
      alternatives.push({
        name: '等待风小时段',
        description: '推迟该镜头至风速降低后拍摄',
        altitude: shot.requiredAltitude,
        reason: '当前风速超出镜头安全要求，等待条件改善',
      });
    }

    let status: ShotItem['status'] = 'safe';
    if (issues.length > 0) {
      const hasAltitudeIssue = issues.some((i) => i.includes('限高'));
      const hasWindIssue = issues.some((i) => i.includes('风速'));
      status = hasAltitudeIssue ? 'danger' : hasWindIssue ? 'caution' : 'safe';
    }

    return { ...shot, issues, alternatives, status };
  });
}
