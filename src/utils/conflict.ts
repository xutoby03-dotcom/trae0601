import { Device, BorrowRecord, ConflictAlternative, Room } from '@/types';
import { rooms } from '@/data/rooms';

export const isTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  
  return s1 < e2 && s2 < e1;
};

export const isDeviceAvailable = (
  deviceId: string,
  startTime: string,
  endTime: string,
  records: BorrowRecord[]
): boolean => {
  const activeRecords = records.filter(
    (r) =>
      r.deviceId === deviceId &&
      (r.status === 'borrowed' || r.status === 'pending')
  );
  
  return !activeRecords.some((r) =>
    isTimeOverlap(startTime, endTime, r.startTime, r.endTime)
  );
};

export const getAvailableDevices = (
  devices: Device[],
  records: BorrowRecord[],
  startTime: string,
  endTime: string,
  type?: string,
  roomId?: string
): Device[] => {
  let filtered = devices.filter((d) => d.status === 'available');
  
  if (type) {
    filtered = filtered.filter((d) => d.type === type);
  }
  
  if (roomId) {
    filtered = filtered.filter((d) => d.roomId === roomId);
  }
  
  return filtered.filter((d) =>
    isDeviceAvailable(d.id, startTime, endTime, records)
  );
};

export const getConflictAlternatives = (
  roomId: string,
  deviceType: string,
  startTime: string,
  endTime: string,
  devices: Device[],
  records: BorrowRecord[],
  allRooms: Room[]
): ConflictAlternative[] => {
  const alternatives: ConflictAlternative[] = [];
  
  const currentRoom = allRooms.find((r) => r.id === roomId);
  if (!currentRoom) return alternatives;
  
  const sameFloorRooms = allRooms.filter(
    (r) => r.floor === currentRoom.floor && r.id !== roomId
  );
  
  for (const room of sameFloorRooms) {
    const availableInRoom = getAvailableDevices(
      devices,
      records,
      startTime,
      endTime,
      deviceType,
      room.id
    );
    if (availableInRoom.length > 0) {
      alternatives.push({
        type: 'room',
        title: `${room.name} 有可用转接头`,
        description: `${room.floor} · 容纳${room.capacity}人 · 共 ${availableInRoom.length} 个${deviceType}转接头可用`,
        roomId: room.id,
        deviceId: availableInRoom[0].id,
      });
    }
  }
  
  const otherTypeDevices = getAvailableDevices(
    devices,
    records,
    startTime,
    endTime,
    undefined,
    roomId
  ).filter((d) => d.type !== deviceType);
  
  if (otherTypeDevices.length > 0) {
    alternatives.push({
      type: 'device',
      title: '其他类型转接头可用',
      description: `该会议室有 ${otherTypeDevices.length} 个其他类型转接头可用，可考虑备用方案`,
      deviceId: otherTypeDevices[0].id,
    });
  }
  
  const laterAvailable = devices.filter(
    (d) => d.type === deviceType && d.roomId === roomId && d.status === 'available'
  );
  
  if (laterAvailable.length > 0) {
    const device = laterAvailable[0];
    const deviceRecords = records
      .filter(
        (r) =>
          r.deviceId === device.id &&
          (r.status === 'borrowed' || r.status === 'pending')
      )
      .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
    
    if (deviceRecords.length > 0) {
      const nextAvailable = deviceRecords[0].endTime;
      alternatives.push({
        type: 'time',
        title: '建议调整会议时间',
        description: `该转接头将于 ${formatTimeShort(nextAvailable)} 后可用`,
        suggestedTime: nextAvailable,
      });
    }
  }
  
  return alternatives.slice(0, 3);
};

const formatTimeShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRoomById = (roomId: string): Room | undefined => {
  return rooms.find((r) => r.id === roomId);
};
