import { useSmartHomeStore } from '@/store/useSmartHomeStore';
import { X, Power, Sun, Thermometer, Blinds, Volume2, Droplets, Video } from 'lucide-react';

export const DeviceModal = () => {
  const { selectedDevice, selectDevice, updateDevice } = useSmartHomeStore();

  if (!selectedDevice) return null;

  const handleClose = () => selectDevice(null);

  const handleToggle = () => {
    updateDevice(selectedDevice.id, { isOn: !selectedDevice.isOn });
  };

  const handleUpdate = (updates: Record<string, unknown>) => {
    updateDevice(selectedDevice.id, updates);
  };

  const renderControls = () => {
    switch (selectedDevice.type) {
      case 'light':
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                <Sun className="w-4 h-4" />
                亮度: {selectedDevice.brightness}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedDevice.brightness || 50}
                onChange={(e) => handleUpdate({ brightness: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-3 block">颜色</label>
              <div className="flex gap-3">
                {['#ffffff', '#ffeaa7', '#ff6b6b', '#4ecdc4', '#a29bfe', '#fd79a8'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleUpdate({ color })}
                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                      selectedDevice.color === color ? 'border-cyan-400 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'ac':
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                <Thermometer className="w-4 h-4" />
                温度: {selectedDevice.temperature}°C
              </label>
              <input
                type="range"
                min="16"
                max="30"
                value={selectedDevice.temperature || 24}
                onChange={(e) => handleUpdate({ temperature: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-3 block">模式</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cool', label: '制冷' },
                  { id: 'heat', label: '制热' },
                  { id: 'auto', label: '自动' },
                  { id: 'fan', label: '送风' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleUpdate({ mode: mode.id })}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      selectedDevice.mode === mode.id
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'curtain':
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                <Blinds className="w-4 h-4" />
                开启: {selectedDevice.openPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedDevice.openPercent || 0}
                onChange={(e) => handleUpdate({ openPercent: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdate({ openPercent: 100 })}
                className="flex-1 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                全开
              </button>
              <button
                onClick={() => handleUpdate({ openPercent: 0 })}
                className="flex-1 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                全关
              </button>
            </div>
          </div>
        );

      case 'speaker':
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                <Volume2 className="w-4 h-4" />
                音量: {selectedDevice.volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedDevice.volume || 50}
                onChange={(e) => handleUpdate({ volume: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        );

      case 'humidifier':
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                <Droplets className="w-4 h-4" />
                当前湿度: {selectedDevice.humidity}%
              </label>
              <div className="h-2 bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${selectedDevice.humidity || 50}%` }}
                />
              </div>
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-3 block">
                目标湿度: {selectedDevice.targetHumidity}%
              </label>
              <input
                type="range"
                min="30"
                max="80"
                value={selectedDevice.targetHumidity || 60}
                onChange={(e) => handleUpdate({ targetHumidity: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        );

      case 'camera':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Video className={`w-5 h-5 ${selectedDevice.isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                <span className="text-gray-300">录制状态</span>
              </div>
              <button
                onClick={() => handleUpdate({ isRecording: !selectedDevice.isRecording })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDevice.isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {selectedDevice.isRecording ? '录制中' : '开始录制'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md mx-4 bg-gray-900/90 border border-gray-700 rounded-2xl p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">{selectedDevice.name}</h3>
            <p className="text-gray-400 text-sm">设备控制</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-8 p-4 bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-3">
            <Power className={`w-5 h-5 ${selectedDevice.isOn ? 'text-emerald-400' : 'text-gray-500'}`} />
            <span className={`font-medium ${selectedDevice.isOn ? 'text-emerald-400' : 'text-gray-400'}`}>
              {selectedDevice.isOn ? '已开启' : '已关闭'}
            </span>
          </div>
          <button
            onClick={handleToggle}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              selectedDevice.isOn ? 'bg-emerald-500' : 'bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                selectedDevice.isOn ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {selectedDevice.isOn && renderControls()}
      </div>
    </div>
  );
};
