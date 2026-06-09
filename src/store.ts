import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Device, DevicePort, Scene, SceneDevice, TroubleshootLog, TopologyPosition, Connection } from '@/types';

const uid = () => crypto.randomUUID();

const MOCK_DEVICES: Device[] = [
  { id: 'd1', name: '索尼 85寸电视', brand: 'Sony', model: 'XR-85X95L', type: 'tv', photoUrl: '', remoteLocation: '电视柜右侧抽屉', status: 'online', createdAt: Date.now() - 86400000 * 30 },
  { id: 'd2', name: '爱普生投影仪', brand: 'Epson', model: 'CH-TW7100', type: 'projector', photoUrl: '', remoteLocation: '投影仪旁边小盒', status: 'offline', createdAt: Date.now() - 86400000 * 25 },
  { id: 'd3', name: '天龙功放', brand: 'Denon', model: 'AVR-X3800H', type: 'amplifier', photoUrl: '', remoteLocation: '电视柜左侧抽屉', status: 'online', createdAt: Date.now() - 86400000 * 20 },
  { id: 'd4', name: 'KEF 音响', brand: 'KEF', model: 'LS50 Meta', type: 'speaker', photoUrl: '', remoteLocation: '', status: 'online', createdAt: Date.now() - 86400000 * 15 },
  { id: 'd5', name: 'PS5', brand: 'Sony', model: 'PlayStation 5', type: 'game_console', photoUrl: '', remoteLocation: '电视柜中层', status: 'online', createdAt: Date.now() - 86400000 * 10 },
  { id: 'd6', name: 'Apple TV', brand: 'Apple', model: 'Apple TV 4K', type: 'streaming_box', photoUrl: '', remoteLocation: '电视柜右侧抽屉', status: 'online', createdAt: Date.now() - 86400000 * 5 },
  { id: 'd7', name: '蓝光播放器', brand: 'Panasonic', model: 'DP-UB9000', type: 'blu_ray', photoUrl: '', remoteLocation: '电视柜中层', status: 'offline', createdAt: Date.now() - 86400000 * 2 },
];

const MOCK_PORTS: DevicePort[] = [
  { id: 'p1', deviceId: 'd1', portType: 'hdmi', portName: 'HDMI 1', direction: 'input', connectedToPortId: 'p14', label: 'ARC' },
  { id: 'p2', deviceId: 'd1', portType: 'hdmi', portName: 'HDMI 2', direction: 'input', connectedToPortId: 'p9', label: 'PS5' },
  { id: 'p3', deviceId: 'd1', portType: 'hdmi', portName: 'HDMI 3', direction: 'input', connectedToPortId: 'p11', label: 'Apple TV' },
  { id: 'p4', deviceId: 'd1', portType: 'optical', portName: '光纤输出', direction: 'output', connectedToPortId: null, label: '' },
  { id: 'p5', deviceId: 'd2', portType: 'hdmi', portName: 'HDMI 1', direction: 'input', connectedToPortId: 'p15', label: '功放输出' },
  { id: 'p6', deviceId: 'd3', portType: 'hdmi', portName: 'HDMI OUT', direction: 'output', connectedToPortId: 'p1', label: '→ 电视' },
  { id: 'p7', deviceId: 'd3', portType: 'hdmi', portName: 'HDMI OUT 2', direction: 'output', connectedToPortId: 'p5', label: '→ 投影' },
  { id: 'p8', deviceId: 'd3', portType: 'hdmi', portName: 'HDMI IN 1', direction: 'input', connectedToPortId: 'p10', label: 'PS5' },
  { id: 'p9', deviceId: 'd3', portType: 'hdmi', portName: 'HDMI IN 2', direction: 'input', connectedToPortId: 'p12', label: 'Apple TV' },
  { id: 'p10', deviceId: 'd3', portType: 'hdmi', portName: 'HDMI IN 3', direction: 'input', connectedToPortId: 'p13', label: '蓝光' },
  { id: 'p11', deviceId: 'd3', portType: 'optical', portName: '光纤输出', direction: 'output', connectedToPortId: null, label: '' },
  { id: 'p12', deviceId: 'd4', portType: 'rca', portName: 'L输入', direction: 'input', connectedToPortId: null, label: '→ 功放' },
  { id: 'p13', deviceId: 'd4', portType: 'rca', portName: 'R输入', direction: 'input', connectedToPortId: null, label: '→ 功放' },
  { id: 'p14', deviceId: 'd5', portType: 'hdmi', portName: 'HDMI OUT', direction: 'output', connectedToPortId: 'p8', label: '→ 功放' },
  { id: 'p15', deviceId: 'd6', portType: 'hdmi', portName: 'HDMI OUT', direction: 'output', connectedToPortId: 'p9', label: '→ 功放' },
  { id: 'p16', deviceId: 'd7', portType: 'hdmi', portName: 'HDMI OUT', direction: 'output', connectedToPortId: 'p10', label: '→ 功放' },
];

const MOCK_POSITIONS: TopologyPosition[] = [
  { deviceId: 'd5', x: 150, y: 80 },
  { deviceId: 'd6', x: 150, y: 220 },
  { deviceId: 'd7', x: 150, y: 360 },
  { deviceId: 'd3', x: 480, y: 220 },
  { deviceId: 'd1', x: 810, y: 120 },
  { deviceId: 'd2', x: 810, y: 360 },
  { deviceId: 'd4', x: 480, y: 400 },
];

const MOCK_SCENES: Scene[] = [
  { id: 's1', name: '看电影', icon: 'Film', description: '投影+功放+蓝光，沉浸式观影', useCount: 42, createdAt: Date.now() - 86400000 * 30 },
  { id: 's2', name: '打游戏', icon: 'Gamepad2', description: '电视+功放+PS5，大屏畅玩', useCount: 38, createdAt: Date.now() - 86400000 * 25 },
  { id: 's3', name: '听音乐', icon: 'Music', description: '功放+音响，纯粹听觉享受', useCount: 15, createdAt: Date.now() - 86400000 * 20 },
  { id: 's4', name: '看剧', icon: 'Tv', description: '电视+功放+Apple TV，追剧模式', useCount: 27, createdAt: Date.now() - 86400000 * 10 },
];

const MOCK_SCENE_DEVICES: SceneDevice[] = [
  { id: 'sd1', sceneId: 's1', deviceId: 'd2', inputSource: 'HDMI 1', volume: 65, notes: '投影幕布放下' },
  { id: 'sd2', sceneId: 's1', deviceId: 'd3', inputSource: 'HDMI IN 3', volume: 70, notes: '' },
  { id: 'sd3', sceneId: 's1', deviceId: 'd7', inputSource: '', volume: 0, notes: '放入光盘' },
  { id: 'sd4', sceneId: 's1', deviceId: 'd4', inputSource: '', volume: 0, notes: '' },
  { id: 'sd5', sceneId: 's2', deviceId: 'd1', inputSource: 'HDMI 2', volume: 55, notes: '' },
  { id: 'sd6', sceneId: 's2', deviceId: 'd3', inputSource: 'HDMI IN 1', volume: 60, notes: '游戏模式' },
  { id: 'sd7', sceneId: 's2', deviceId: 'd5', inputSource: '', volume: 0, notes: '' },
  { id: 'sd8', sceneId: 's2', deviceId: 'd4', inputSource: '', volume: 0, notes: '' },
  { id: 'sd9', sceneId: 's3', deviceId: 'd3', inputSource: '蓝牙', volume: 45, notes: '' },
  { id: 'sd10', sceneId: 's3', deviceId: 'd4', inputSource: '', volume: 0, notes: '' },
  { id: 'sd11', sceneId: 's4', deviceId: 'd1', inputSource: 'HDMI 3', volume: 40, notes: '' },
  { id: 'sd12', sceneId: 's4', deviceId: 'd3', inputSource: 'HDMI IN 2', volume: 45, notes: '' },
  { id: 'sd13', sceneId: 's4', deviceId: 'd6', inputSource: '', volume: 0, notes: '' },
];

const MOCK_TROUBLESHOOT: TroubleshootLog[] = [
  { id: 't1', symptom: '有画面没声音', resolution: '功放输入源选错了，切回HDMI IN 3后恢复', createdAt: Date.now() - 86400000 * 5, deviceId: 'd3' },
  { id: 't2', symptom: '遥控器找不到', resolution: '在沙发垫下面找到的', createdAt: Date.now() - 86400000 * 3, deviceId: 'd1' },
  { id: 't3', symptom: 'HDMI口占用', resolution: '把PS5换到HDMI 2口解决', createdAt: Date.now() - 86400000 * 1, deviceId: 'd1' },
];

interface AppState {
  devices: Device[];
  ports: DevicePort[];
  scenes: Scene[];
  sceneDevices: SceneDevice[];
  troubleshootLogs: TroubleshootLog[];
  positions: TopologyPosition[];
  activeSceneId: string | null;

  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => string;
  updateDevice: (id: string, data: Partial<Device>) => void;
  deleteDevice: (id: string) => void;

  addPort: (port: Omit<DevicePort, 'id'>) => string;
  updatePort: (id: string, data: Partial<DevicePort>) => void;
  deletePort: (id: string) => void;
  getDevicePorts: (deviceId: string) => DevicePort[];

  addScene: (scene: Omit<Scene, 'id' | 'createdAt' | 'useCount'>) => string;
  updateScene: (id: string, data: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  activateScene: (id: string) => void;

  addSceneDevice: (sd: Omit<SceneDevice, 'id'>) => string;
  updateSceneDevice: (id: string, data: Partial<SceneDevice>) => void;
  deleteSceneDevice: (id: string) => void;
  getSceneDevices: (sceneId: string) => SceneDevice[];

  addTroubleshootLog: (log: Omit<TroubleshootLog, 'id' | 'createdAt'>) => void;

  updatePosition: (deviceId: string, x: number, y: number) => void;

  getConnections: () => Connection[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      devices: MOCK_DEVICES,
      ports: MOCK_PORTS,
      scenes: MOCK_SCENES,
      sceneDevices: MOCK_SCENE_DEVICES,
      troubleshootLogs: MOCK_TROUBLESHOOT,
      positions: MOCK_POSITIONS,
      activeSceneId: null,

      addDevice: (data) => {
        const id = uid();
        set((s) => ({ devices: [...s.devices, { ...data, id, createdAt: Date.now() }] }));
        return id;
      },
      updateDevice: (id, data) => set((s) => ({ devices: s.devices.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
      deleteDevice: (id) => set((s) => ({
        devices: s.devices.filter((d) => d.id !== id),
        ports: s.ports.filter((p) => p.deviceId !== id),
        positions: s.positions.filter((p) => p.deviceId !== id),
      })),

      addPort: (data) => {
        const id = uid();
        set((s) => ({ ports: [...s.ports, { ...data, id }] }));
        return id;
      },
      updatePort: (id, data) => set((s) => ({ ports: s.ports.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
      deletePort: (id) => set((s) => ({ ports: s.ports.filter((p) => p.id !== id) })),
      getDevicePorts: (deviceId) => get().ports.filter((p) => p.deviceId === deviceId),

      addScene: (data) => {
        const id = uid();
        set((s) => ({ scenes: [...s.scenes, { ...data, id, useCount: 0, createdAt: Date.now() }] }));
        return id;
      },
      updateScene: (id, data) => set((s) => ({ scenes: s.scenes.map((sc) => (sc.id === id ? { ...sc, ...data } : sc)) })),
      deleteScene: (id) => set((s) => ({
        scenes: s.scenes.filter((sc) => sc.id !== id),
        sceneDevices: s.sceneDevices.filter((sd) => sd.sceneId !== id),
      })),
      activateScene: (id) => set((s) => ({
        activeSceneId: id,
        scenes: s.scenes.map((sc) => (sc.id === id ? { ...sc, useCount: sc.useCount + 1 } : sc)),
      })),

      addSceneDevice: (data) => {
        const id = uid();
        set((s) => ({ sceneDevices: [...s.sceneDevices, { ...data, id }] }));
        return id;
      },
      updateSceneDevice: (id, data) => set((s) => ({ sceneDevices: s.sceneDevices.map((sd) => (sd.id === id ? { ...sd, ...data } : sd)) })),
      deleteSceneDevice: (id) => set((s) => ({ sceneDevices: s.sceneDevices.filter((sd) => sd.id !== id) })),
      getSceneDevices: (sceneId) => get().sceneDevices.filter((sd) => sd.sceneId === sceneId),

      addTroubleshootLog: (data) => set((s) => ({ troubleshootLogs: [...s.troubleshootLogs, { ...data, id: uid(), createdAt: Date.now() }] })),

      updatePosition: (deviceId, x, y) => set((s) => ({
        positions: s.positions.some((p) => p.deviceId === deviceId)
          ? s.positions.map((p) => (p.deviceId === deviceId ? { ...p, x, y } : p))
          : [...s.positions, { deviceId, x, y }],
      })),

      getConnections: () => {
        const { ports } = get();
        const connections: Connection[] = [];
        const seen = new Set<string>();
        for (const port of ports) {
          if (port.connectedToPortId) {
            const target = ports.find((p) => p.id === port.connectedToPortId);
            if (target) {
              const key = [port.id, target.id].sort().join('-');
              if (!seen.has(key)) {
                seen.add(key);
                connections.push({
                  id: key,
                  sourcePortId: port.direction === 'output' ? port.id : target.id,
                  targetPortId: port.direction === 'output' ? target.id : port.id,
                  sourceDeviceId: port.direction === 'output' ? port.deviceId : target.deviceId,
                  targetDeviceId: port.direction === 'output' ? target.deviceId : port.deviceId,
                  portType: port.portType,
                });
              }
            }
          }
        }
        return connections;
      },
    }),
    { name: 'home-av-hub' }
  )
);
