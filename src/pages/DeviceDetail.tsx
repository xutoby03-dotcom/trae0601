import { useStore } from '@/store';
import { DeviceIcon, deviceTypeLabels, portTypeLabels, PortIcon, portColor } from '@/utils/icons';
import { ArrowLeft, Edit3, Trash2, MapPin, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

const statusConfig: Record<string, { label: string; color: string }> = {
  online: { label: '在线', color: 'bg-green-500' },
  offline: { label: '离线', color: 'bg-gray-400' },
  fault: { label: '故障', color: 'bg-red-500' },
};

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const devices = useStore((s) => s.devices);
  const ports = useStore((s) => s.ports);
  const deleteDevice = useStore((s) => s.deleteDevice);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const device = devices.find((d) => d.id === id);
  const devicePorts = ports.filter((p) => p.deviceId === id);

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-gray-400">
        <Info size={48} />
        <p className="text-lg">设备未找到</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
        >
          返回
        </button>
      </div>
    );
  }

  const status = statusConfig[device.status] || statusConfig.offline;

  function findConnectedInfo(portId: string | null) {
    if (!portId) return null;
    const targetPort = ports.find((p) => p.id === portId);
    if (!targetPort) return null;
    const targetDevice = devices.find((d) => d.id === targetPort.deviceId);
    if (!targetDevice) return null;
    return { deviceName: targetDevice.name, portName: targetPort.portName };
  }

  function handleDelete() {
    deleteDevice(device.id);
    navigate('/');
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 backdrop-blur-md bg-black/40 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/10 text-white transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-white truncate mx-4">{device.name}</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/devices/${device.id}`)}
            className="p-2 rounded-lg hover:bg-white/10 text-white transition"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {confirmDelete && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <span className="text-red-300 text-sm">确认删除此设备？</span>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 text-sm rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              删除
            </button>
          </div>
        </div>
      )}

      <div className="card-glass mx-4 mt-4 p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <DeviceIcon type={device.type} size={32} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{device.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{device.brand} · {device.model}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-white/10 text-gray-300">
                {deviceTypeLabels[device.type]}
              </span>
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full text-white`}>
                <span className={`w-2 h-2 rounded-full ${status.color}`} />
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {device.remoteLocation && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
            <MapPin size={14} className="shrink-0" />
            <span>遥控器位置：{device.remoteLocation}</span>
          </div>
        )}
      </div>

      <div className="card-glass mx-4 mt-4 p-5">
        <h3 className="text-base font-semibold text-white mb-3">接口列表</h3>
        {devicePorts.length === 0 ? (
          <p className="text-sm text-gray-500">暂无接口</p>
        ) : (
          <div className="grid gap-3">
            {devicePorts.map((port) => {
              const connected = findConnectedInfo(port.connectedToPortId);
              return (
                <div
                  key={port.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                  style={{ borderLeft: `3px solid ${portColor(port.portType)}` }}
                >
                  <PortIcon type={port.portType} size={18} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{port.portName}</span>
                      <span className="text-xs text-gray-500">{portTypeLabels[port.portType]}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        port.direction === 'input'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {port.direction === 'input' ? '输入' : '输出'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {connected
                        ? `→ ${connected.deviceName} ${connected.portName}`
                        : <span className="text-gray-600">未连接</span>
                      }
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
