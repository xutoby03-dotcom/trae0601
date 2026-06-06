import { useEffect, useState } from 'react';
import { useSmartHomeStore } from '@/store/useSmartHomeStore';
import { X, Clock, Lightbulb, Thermometer, Blinds, Speaker, Droplets, Camera, Filter, ChevronDown } from 'lucide-react';
import type { DeviceType, RoomType } from '@/types';

const deviceIcons: Record<DeviceType, React.ReactNode> = {
  light: <Lightbulb className="w-4 h-4" />,
  ac: <Thermometer className="w-4 h-4" />,
  curtain: <Blinds className="w-4 h-4" />,
  speaker: <Speaker className="w-4 h-4" />,
  humidifier: <Droplets className="w-4 h-4" />,
  camera: <Camera className="w-4 h-4" />,
};

const roomNames: Record<RoomType, string> = {
  living: '客厅',
  bedroom: '卧室',
  kitchen: '厨房',
  bathroom: '卫生间',
};

const deviceTypeNames: Record<DeviceType, string> = {
  light: '灯光',
  ac: '空调',
  curtain: '窗帘',
  speaker: '音响',
  humidifier: '加湿器',
  camera: '摄像头',
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  
  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }
  
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const getDeviceTypeFromId = (deviceId: string): DeviceType => {
  if (deviceId.includes('light')) return 'light';
  if (deviceId.includes('ac')) return 'ac';
  if (deviceId.includes('curtain')) return 'curtain';
  if (deviceId.includes('speaker')) return 'speaker';
  if (deviceId.includes('humidifier')) return 'humidifier';
  if (deviceId.includes('camera')) return 'camera';
  return 'light';
};

export const DeviceLog = () => {
  const { logs, showLogPanel, setShowLogPanel, loadLogs } = useSmartHomeStore();
  const [selectedRoom, setSelectedRoom] = useState<RoomType | 'all'>('all');
  const [selectedType, setSelectedType] = useState<DeviceType | 'all'>('all');

  useEffect(() => {
    if (showLogPanel) {
      loadLogs();
    }
  }, [showLogPanel, loadLogs]);

  if (!showLogPanel) return null;

  const filteredLogs = logs.filter((log) => {
    const roomMatch = selectedRoom === 'all' || log.room === selectedRoom;
    const deviceType = getDeviceTypeFromId(log.deviceId);
    const typeMatch = selectedType === 'all' || deviceType === selectedType;
    return roomMatch && typeMatch;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 max-w-full">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogPanel(false)} />
      <div className="absolute right-0 inset-y-0 w-full bg-gray-900/95 border-l border-gray-700 shadow-2xl overflow-hidden animate-slide-in-right">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">设备日志</h3>
                  <p className="text-gray-400 text-sm">最近操作记录</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogPanel(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Filter className="w-4 h-4" />
                <span className="text-xs">筛选:</span>
              </div>
              
              <div className="relative flex-1">
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value as RoomType | 'all')}
                  className="w-full appearance-none bg-gray-800 text-white text-sm py-2 px-3 pr-8 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="all">全部房间</option>
                  {Object.entries(roomNames).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative flex-1">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DeviceType | 'all')}
                  className="w-full appearance-none bg-gray-800 text-white text-sm py-2 px-3 pr-8 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="all">全部设备</option>
                  {Object.entries(deviceTypeNames).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {(selectedRoom !== 'all' || selectedType !== 'all') && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">筛选结果: {filteredLogs.length} 条</span>
                <button
                  onClick={() => {
                    setSelectedRoom('all');
                    setSelectedType('all');
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  清除筛选
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Clock className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-500">暂无操作记录</p>
                <p className="text-gray-600 text-sm mt-1">操作设备后将在此显示</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => {
                  const deviceType = getDeviceTypeFromId(log.deviceId);
                  return (
                    <div
                      key={log.id}
                      className="flex gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-cyan-400">
                          {deviceIcons[deviceType]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-white font-medium truncate">
                            {roomNames[log.room]} {log.deviceName}
                          </span>
                          <span className="text-gray-500 text-xs flex-shrink-0">
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          {log.action}
                          {log.details && Object.keys(log.details).length > 0 && (
                            <span className="text-gray-500 ml-2">
                              ({Object.entries(log.details)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ')})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
