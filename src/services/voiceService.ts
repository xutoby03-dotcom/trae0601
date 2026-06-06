import type { Device, RoomType, DeviceType } from '@/types';

interface ParsedCommand {
  room?: RoomType;
  deviceType?: DeviceType;
  action: 'on' | 'off' | 'adjust';
  params?: Record<string, unknown>;
}

const roomMap: Record<string, RoomType> = {
  '客厅': 'living',
  '卧室': 'bedroom',
  '厨房': 'kitchen',
  '卫生间': 'bathroom',
  '厕所': 'bathroom',
  '洗手间': 'bathroom',
};

const deviceMap: Record<string, DeviceType> = {
  '灯': 'light',
  '灯光': 'light',
  '空调': 'ac',
  '窗帘': 'curtain',
  '音响': 'speaker',
  '加湿器': 'humidifier',
  '换气扇': 'humidifier',
  '摄像头': 'camera',
};

export const parseVoiceCommand = (command: string): ParsedCommand | null => {
  const cmd = command.trim();
  
  let room: RoomType | undefined;
  let deviceType: DeviceType | undefined;
  let action: 'on' | 'off' | 'adjust' = 'on';
  const params: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(roomMap)) {
    if (cmd.includes(key)) {
      room = value;
      break;
    }
  }

  for (const [key, value] of Object.entries(deviceMap)) {
    if (cmd.includes(key)) {
      deviceType = value;
      break;
    }
  }

  if (cmd.includes('打开') || cmd.includes('开启') || cmd.includes('启动')) {
    action = 'on';
  } else if (cmd.includes('关闭') || cmd.includes('关掉') || cmd.includes('停止')) {
    action = 'off';
  } else if (cmd.includes('调节') || cmd.includes('调整') || cmd.includes('设置') || cmd.includes('调到')) {
    action = 'adjust';
    
    const tempMatch = cmd.match(/(\d+)\s*度/);
    if (tempMatch) {
      params.temperature = parseInt(tempMatch[1], 10);
    }
    
    const brightMatch = cmd.match(/亮度\s*(\d+)/) || cmd.match(/(\d+)\s*%?\s*亮度/);
    if (brightMatch) {
      params.brightness = parseInt(brightMatch[1], 10);
    }
  }

  if (!deviceType && !room) {
    return null;
  }

  return { room, deviceType, action, params: Object.keys(params).length > 0 ? params : undefined };
};

export const executeParsedCommand = (
  parsed: ParsedCommand,
  devices: Device[]
): { devices: Device[]; message: string; success: boolean } => {
  const targetDevices = devices.filter(d => {
    const roomMatch = !parsed.room || d.room === parsed.room;
    const typeMatch = !parsed.deviceType || d.type === parsed.deviceType;
    return roomMatch && typeMatch;
  });

  if (targetDevices.length === 0) {
    return { devices, message: '未找到匹配的设备', success: false };
  }

  const updatedDevices = devices.map(d => {
    if (!targetDevices.find(td => td.id === d.id)) return d;
    
    if (parsed.action === 'on') {
      return { ...d, isOn: true };
    } else if (parsed.action === 'off') {
      return { ...d, isOn: false };
    } else if (parsed.action === 'adjust' && parsed.params) {
      return { ...d, ...parsed.params };
    }
    return d;
  });

  const roomName = parsed.room ? Object.keys(roomMap).find(k => roomMap[k] === parsed.room) : '';
  const deviceName = parsed.deviceType ? Object.keys(deviceMap).find(k => deviceMap[k] === parsed.deviceType) : '';
  const actionName = parsed.action === 'on' ? '打开' : parsed.action === 'off' ? '关闭' : '调节';

  return {
    devices: updatedDevices,
    message: `${actionName}${roomName}${deviceName}成功`,
    success: true,
  };
};
