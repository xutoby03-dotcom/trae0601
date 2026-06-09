import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useStore } from '@/store';
import { deviceTypeLabels, portTypeLabels } from '@/utils/icons';
import type { Device, DeviceType, PortType, PortDirection } from '@/types';

interface PortForm {
  id: string;
  isNew: boolean;
  portName: string;
  portType: PortType;
  direction: PortDirection;
  connectedToPortId: string | null;
  label: string;
}

const statusOptions: { value: string; label: string }[] = [
  { value: 'online', label: '在线' },
  { value: 'offline', label: '离线' },
  { value: 'fault', label: '故障' },
];

const directionOptions: { value: PortDirection; label: string }[] = [
  { value: 'input', label: '输入' },
  { value: 'output', label: '输出' },
];

export default function DeviceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useStore();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState<DeviceType>('other');
  const [remoteLocation, setRemoteLocation] = useState('');
  const [status, setStatus] = useState('online');
  const [ports, setPorts] = useState<PortForm[]>([]);

  useEffect(() => {
    if (!id) return;
    const device = store.devices.find((d) => d.id === id);
    if (!device) return;
    setName(device.name);
    setBrand(device.brand);
    setModel(device.model);
    setType(device.type);
    setRemoteLocation(device.remoteLocation);
    setStatus(device.status);
    const existing = store.getDevicePorts(id);
    setPorts(
      existing.map((p) => ({
        id: p.id,
        isNew: false,
        portName: p.portName,
        portType: p.portType,
        direction: p.direction,
        connectedToPortId: p.connectedToPortId,
        label: p.label,
      }))
    );
  }, [id]);

  const addPortRow = () => {
    setPorts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        isNew: true,
        portName: '',
        portType: 'hdmi',
        direction: 'input',
        connectedToPortId: null,
        label: '',
      },
    ]);
  };

  const updatePortField = <K extends keyof PortForm>(portId: string, key: K, value: PortForm[K]) => {
    setPorts((prev) => prev.map((p) => (p.id === portId ? { ...p, [key]: value } : p)));
  };

  const removePort = (portId: string) => {
    setPorts((prev) => prev.filter((p) => p.id !== portId));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    let deviceId: string;
    if (isEdit && id) {
      store.updateDevice(id, { name, brand, model, type, remoteLocation, status: status as Device['status'] });
      deviceId = id;
    } else {
      deviceId = store.addDevice({ name, brand, model, type, photoUrl: '', remoteLocation, status: status as Device['status'] });
    }

    const originalPorts = id ? store.getDevicePorts(id) : [];
    const remainingIds = new Set(ports.filter((p) => !p.isNew).map((p) => p.id));

    for (const op of originalPorts) {
      if (!remainingIds.has(op.id)) {
        store.deletePort(op.id);
      }
    }

    for (const p of ports) {
      if (p.isNew) {
        store.addPort({
          deviceId,
          portName: p.portName,
          portType: p.portType,
          direction: p.direction,
          connectedToPortId: p.connectedToPortId,
          label: p.label,
        });
      } else {
        store.updatePort(p.id, {
          portName: p.portName,
          portType: p.portType,
          direction: p.direction,
        });
      }
    }

    navigate('/devices');
  };

  return (
    <div className="page-scrollable">
      <div className="page-header">
        <button className="btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title">{isEdit ? '编辑设备' : '添加设备'}</h1>
      </div>

      <div className="card-glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label>设备名称 *</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：索尼 85寸电视" />
        </div>

        <div className="form-group">
          <label>品牌</label>
          <input className="input-field" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="例如：Sony" />
        </div>

        <div className="form-group">
          <label>型号</label>
          <input className="input-field" value={model} onChange={(e) => setModel(e.target.value)} placeholder="例如：XR-85X95L" />
        </div>

        <div className="form-group">
          <label>设备类型</label>
          <select className="input-field" value={type} onChange={(e) => setType(e.target.value as DeviceType)}>
            {Object.entries(deviceTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>遥控器位置</label>
          <input className="input-field" value={remoteLocation} onChange={(e) => setRemoteLocation(e.target.value)} placeholder="例如：电视柜右侧抽屉" />
        </div>

        <div className="form-group">
          <label>状态</label>
          <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>接口列表</h3>
            <button className="btn-ghost" onClick={addPortRow} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={16} /> 添加
            </button>
          </div>

          {ports.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>暂无接口，点击添加</p>
          )}

          {ports.map((port) => (
            <div key={port.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input
                className="input-field"
                value={port.portName}
                onChange={(e) => updatePortField(port.id, 'portName', e.target.value)}
                placeholder="接口名称"
                style={{ flex: 2 }}
              />
              <select
                className="input-field"
                value={port.portType}
                onChange={(e) => updatePortField(port.id, 'portType', e.target.value as PortType)}
                style={{ flex: 2 }}
              >
                {Object.entries(portTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                className="input-field"
                value={port.direction}
                onChange={(e) => updatePortField(port.id, 'direction', e.target.value as PortDirection)}
                style={{ flex: 1.2 }}
              >
                {directionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {port.connectedToPortId && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1, textAlign: 'center' }}>已连接</span>
              )}
              <button className="btn-ghost" onClick={() => removePort(port.id)} style={{ padding: 4 }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 0', display: 'flex', gap: 12 }}>
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ flex: 1 }}>
          取消
        </button>
        <button className="btn-primary" onClick={handleSave} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Save size={18} /> 保存
        </button>
      </div>
    </div>
  );
}
