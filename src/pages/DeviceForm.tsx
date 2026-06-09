import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Camera, ImagePlus, Link2 } from 'lucide-react';
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
  const [photoUrl, setPhotoUrl] = useState('');
  const [remoteLocation, setRemoteLocation] = useState('');
  const [status, setStatus] = useState('online');
  const [ports, setPorts] = useState<PortForm[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const device = store.devices.find((d) => d.id === id);
    if (!device) return;
    setName(device.name);
    setBrand(device.brand);
    setModel(device.model);
    setType(device.type);
    setPhotoUrl(device.photoUrl);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const getAvailableTargetPorts = (currentPortId: string) => {
    return store.ports.filter((p) => {
      if (id && p.deviceId === id) return false;
      const alreadyConnected = store.ports.some(
        (op) => op.id !== currentPortId && op.connectedToPortId === p.id && p.deviceId !== (id || '')
      );
      return true;
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;

    let deviceId: string;
    if (isEdit && id) {
      store.updateDevice(id, { name, brand, model, type, photoUrl, remoteLocation, status: status as Device['status'] });
      deviceId = id;
    } else {
      deviceId = store.addDevice({ name, brand, model, type, photoUrl, remoteLocation, status: status as Device['status'] });
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
          connectedToPortId: p.connectedToPortId,
          label: p.label,
        });
      }
    }

    navigate('/devices');
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6" style={{ background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, margin: 0 }}>{isEdit ? '编辑设备' : '添加设备'}</h1>
        </div>

        <div className="card-glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 120, height: 120, borderRadius: 16, border: '2px dashed rgba(255,255,255,0.15)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s',
                background: photoUrl ? 'transparent' : 'rgba(255,255,255,0.03)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="设备照片" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <ImagePlus size={28} style={{ color: 'var(--text-muted)', marginBottom: 4 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>添加照片</span>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Camera size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              className="input-field"
              value={photoUrl.startsWith('data:') ? '已选择本地照片' : photoUrl}
              onChange={(e) => { if (!photoUrl.startsWith('data:')) setPhotoUrl(e.target.value); }}
              placeholder="或输入图片 URL..."
              readOnly={photoUrl.startsWith('data:')}
              style={{ fontSize: 12 }}
            />
            {photoUrl && (
              <button className="btn-ghost" onClick={() => setPhotoUrl('')} style={{ padding: '4px 8px', fontSize: 12, whiteSpace: 'nowrap' }}>
                清除
              </button>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>设备名称 *</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：索尼 85寸电视" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>品牌</label>
              <input className="input-field" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="例如：Sony" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>型号</label>
              <input className="input-field" value={model} onChange={(e) => setModel(e.target.value)} placeholder="例如：XR-85X95L" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>设备类型</label>
              <select className="input-field" value={type} onChange={(e) => setType(e.target.value as DeviceType)}>
                {Object.entries(deviceTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>状态</label>
              <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>遥控器位置</label>
            <input className="input-field" value={remoteLocation} onChange={(e) => setRemoteLocation(e.target.value)} placeholder="例如：电视柜右侧抽屉" />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontFamily: 'Outfit', fontSize: 16, fontWeight: 600 }}>接口列表</h3>
              <button className="btn-ghost" onClick={addPortRow} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                <Plus size={16} /> 添加接口
              </button>
            </div>

            {ports.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
                暂无接口，点击"添加接口"开始
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ports.map((port) => {
                const targetPorts = getAvailableTargetPorts(port.id);
                return (
                  <div
                    key={port.id}
                    style={{
                      padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <input
                        className="input-field"
                        value={port.portName}
                        onChange={(e) => updatePortField(port.id, 'portName', e.target.value)}
                        placeholder="接口名称 (如 HDMI 1)"
                        style={{ flex: 2 }}
                      />
                      <select
                        className="input-field"
                        value={port.portType}
                        onChange={(e) => updatePortField(port.id, 'portType', e.target.value as PortType)}
                        style={{ flex: 1.5 }}
                      >
                        {Object.entries(portTypeLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <select
                        className="input-field"
                        value={port.direction}
                        onChange={(e) => updatePortField(port.id, 'direction', e.target.value as PortDirection)}
                        style={{ flex: 1 }}
                      >
                        {directionOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <button
                        className="btn-ghost"
                        onClick={() => removePort(port.id)}
                        style={{ padding: 6, color: 'var(--danger)', borderColor: 'transparent' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Link2 size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <select
                        className="input-field"
                        value={port.connectedToPortId || ''}
                        onChange={(e) => updatePortField(port.id, 'connectedToPortId', e.target.value || null)}
                        style={{ flex: 2 }}
                      >
                        <option value="">不连接</option>
                        {targetPorts.map((tp) => {
                          const dev = store.devices.find((d) => d.id === tp.deviceId);
                          return (
                            <option key={tp.id} value={tp.id}>
                              {dev?.name || '未知设备'} - {tp.portName} ({portTypeLabels[tp.portType]} {tp.direction === 'input' ? '输入' : '输出'})
                            </option>
                          );
                        })}
                      </select>
                      <input
                        className="input-field"
                        value={port.label}
                        onChange={(e) => updatePortField(port.id, 'label', e.target.value)}
                        placeholder="连接备注"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 0', display: 'flex', gap: 12 }}>
          <button className="btn-ghost" onClick={() => navigate(-1)} style={{ flex: 1 }}>
            取消
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Save size={18} /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}
