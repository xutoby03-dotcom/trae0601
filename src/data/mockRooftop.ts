import { Rooftop, Sensor, Point } from '../types';

const outline: Point[] = [
  { x: 50, y: 50 },
  { x: 550, y: 50 },
  { x: 600, y: 150 },
  { x: 600, y: 350 },
  { x: 500, y: 400 },
  { x: 100, y: 400 },
  { x: 50, y: 350 },
  { x: 50, y: 50 },
];

export const mockRooftop: Rooftop = {
  id: 'rooftop-001',
  name: '城市商业中心屋顶',
  width: 650,
  height: 450,
  outline,
};

export const mockSensors: Sensor[] = [
  { id: 'sensor-001', x: 120, y: 120, type: 'anemometer' },
  { id: 'sensor-002', x: 480, y: 120, type: 'wind_vane' },
  { id: 'sensor-003', x: 320, y: 320, type: 'noise' },
  { id: 'sensor-004', x: 550, y: 280, type: 'anemometer' },
];
