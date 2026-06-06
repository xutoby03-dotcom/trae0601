import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Device, DeviceLog, ToastItem, SceneType, EnergyData } from '@/types';
import { initialDevices, generateInitialEnergyData } from '@/data/initialData';
import { addLog, getLogs } from '@/services/dbService';
import { parseVoiceCommand, executeParsedCommand } from '@/services/voiceService';
import { applyScene } from '@/services/sceneService';

interface SmartHomeState {
  devices: Device[];
  logs: DeviceLog[];
  toasts: ToastItem[];
  energyData: EnergyData[];
  selectedDevice: Device | null;
  activeScene: SceneType | null;
  showEnergyPanel: boolean;
  showLogPanel: boolean;
  
  updateDevice: (id: string, updates: Partial<Device>) => void;
  toggleDevice: (id: string) => void;
  selectDevice: (device: Device | null) => void;
  
  executeVoiceCommand: (command: string) => void;
  applySceneMode: (sceneId: SceneType) => void;
  
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  loadLogs: () => Promise<void>;
  setShowEnergyPanel: (show: boolean) => void;
  setShowLogPanel: (show: boolean) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useSmartHomeStore = create<SmartHomeState>()(
  persist(
    (set, get) => ({
      devices: initialDevices,
      logs: [],
      toasts: [],
      energyData: generateInitialEnergyData(),
      selectedDevice: null,
      activeScene: null,
      showEnergyPanel: false,
      showLogPanel: false,

      updateDevice: (id: string, updates: Partial<Device>) => {
        const device = get().devices.find(d => d.id === id);
        if (!device) return;

        set(state => ({
          devices: state.devices.map(d => 
            d.id === id ? { ...d, ...updates } : d
          ),
        }));

        const updatedDevice = { ...device, ...updates };
        const action = updates.isOn !== undefined 
          ? (updates.isOn ? '开启' : '关闭')
          : '调节';
        
        const log: DeviceLog = {
          id: generateId(),
          deviceId: id,
          deviceName: device.name,
          room: device.room,
          action,
          timestamp: Date.now(),
          details: Object.keys(updates).reduce((acc, key) => {
            if (key !== 'isOn') acc[key] = updates[key as keyof Partial<Device>];
            return acc;
          }, {} as Record<string, unknown>),
        };

        addLog(log).catch(console.error);
        get().loadLogs();
      },

      toggleDevice: (id: string) => {
        const device = get().devices.find(d => d.id === id);
        if (!device) return;
        get().updateDevice(id, { isOn: !device.isOn });
        get().addToast(`${device.name}已${!device.isOn ? '开启' : '关闭'}`, 'success');
      },

      selectDevice: (device: Device | null) => {
        set({ selectedDevice: device });
      },

      executeVoiceCommand: (command: string) => {
        const parsed = parseVoiceCommand(command);
        if (!parsed) {
          get().addToast('无法识别指令，请重新输入', 'error');
          return;
        }

        const result = executeParsedCommand(parsed, get().devices);
        
        if (result.success) {
          const updatedDevices = result.devices;
          set({ devices: updatedDevices });
          
          updatedDevices.forEach(d => {
            const log: DeviceLog = {
              id: generateId(),
              deviceId: d.id,
              deviceName: d.name,
              room: d.room,
              action: parsed.action === 'on' ? '开启' : parsed.action === 'off' ? '关闭' : '调节',
              timestamp: Date.now(),
              details: parsed.params,
            };
            addLog(log).catch(console.error);
          });
          
          get().addToast(result.message, 'success');
          get().loadLogs();
        } else {
          get().addToast(result.message, 'error');
        }
      },

      applySceneMode: (sceneId: SceneType) => {
        const updatedDevices = applyScene(sceneId, get().devices);
        set({ devices: updatedDevices, activeScene: sceneId });
        
        updatedDevices.forEach(d => {
          const log: DeviceLog = {
            id: generateId(),
            deviceId: d.id,
            deviceName: d.name,
            room: d.room,
            action: '场景控制',
            timestamp: Date.now(),
            details: { scene: sceneId },
          };
          addLog(log).catch(console.error);
        });

        const sceneNames: Record<SceneType, string> = {
          home: '回家模式',
          away: '离家模式',
          sleep: '睡眠模式',
          party: '派对模式',
        };
        
        get().addToast(`${sceneNames[sceneId]}已激活`, 'success');
        get().loadLogs();
      },

      addToast: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = generateId();
        set(state => ({
          toasts: [...state.toasts, { id, message, type }],
        }));
        setTimeout(() => get().removeToast(id), 3000);
      },

      removeToast: (id: string) => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id),
        }));
      },

      loadLogs: async () => {
        try {
          const logs = await getLogs(50);
          set({ logs });
        } catch (error) {
          console.error('Failed to load logs:', error);
        }
      },

      setShowEnergyPanel: (show: boolean) => {
        set({ showEnergyPanel: show });
      },

      setShowLogPanel: (show: boolean) => {
        set({ showLogPanel: show });
      },
    }),
    {
      name: 'smart-home-storage',
      partialize: (state) => ({
        devices: state.devices,
        activeScene: state.activeScene,
        energyData: state.energyData,
      }),
    }
  )
);
