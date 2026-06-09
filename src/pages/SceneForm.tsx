import { useStore } from '@/store';
import { DeviceIcon, deviceTypeLabels } from '@/utils/icons';
import { ArrowLeft, Save, Plus, Trash2, Volume2, Play, Film, Gamepad2, Music, Tv, Headphones, Radio, BookOpen, Coffee } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const iconOptions = [
  { value: 'Film', label: '电影', Icon: Film },
  { value: 'Gamepad2', label: '游戏', Icon: Gamepad2 },
  { value: 'Music', label: '音乐', Icon: Music },
  { value: 'Tv', label: '电视', Icon: Tv },
  { value: 'Headphones', label: '耳机', Icon: Headphones },
  { value: 'Radio', label: '广播', Icon: Radio },
  { value: 'BookOpen', label: '阅读', Icon: BookOpen },
  { value: 'Coffee', label: '休闲', Icon: Coffee },
];

interface DeviceConfig {
  checked: boolean;
  inputSource: string;
  volume: number;
  notes: string;
}

export default function SceneForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const devices = useStore((s) => s.devices);
  const scenes = useStore((s) => s.scenes);
  const sceneDevices = useStore((s) => s.sceneDevices);
  const addScene = useStore((s) => s.addScene);
  const updateScene = useStore((s) => s.updateScene);
  const addSceneDevice = useStore((s) => s.addSceneDevice);
  const deleteSceneDevice = useStore((s) => s.deleteSceneDevice);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Film');
  const [description, setDescription] = useState('');
  const [deviceConfigs, setDeviceConfigs] = useState<Record<string, DeviceConfig>>({});

  useEffect(() => {
    if (isEdit) {
      const scene = scenes.find((s) => s.id === id);
      if (scene) {
        setName(scene.name);
        setIcon(scene.icon);
        setDescription(scene.description);
      }
      const existing = sceneDevices.filter((sd) => sd.sceneId === id);
      const configs: Record<string, DeviceConfig> = {};
      existing.forEach((sd) => {
        configs[sd.deviceId] = {
          checked: true,
          inputSource: sd.inputSource,
          volume: sd.volume,
          notes: sd.notes,
        };
      });
      setDeviceConfigs(configs);
    }
  }, [id]);

  const toggleDevice = (deviceId: string) => {
    setDeviceConfigs((prev) => {
      const current = prev[deviceId];
      if (current) {
        if (current.checked) {
          const { [deviceId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [deviceId]: { ...current, checked: true } };
      }
      return { ...prev, [deviceId]: { checked: true, inputSource: '', volume: 50, notes: '' } };
    });
  };

  const updateConfig = (deviceId: string, field: keyof DeviceConfig, value: string | number) => {
    setDeviceConfigs((prev) => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], [field]: value },
    }));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    let sceneId: string;
    if (isEdit) {
      updateScene(id!, { name, icon, description });
      sceneId = id!;
      sceneDevices
        .filter((sd) => sd.sceneId === id)
        .forEach((sd) => deleteSceneDevice(sd.id));
    } else {
      sceneId = addScene({ name, icon, description });
    }

    Object.entries(deviceConfigs).forEach(([deviceId, config]) => {
      if (config.checked) {
        addSceneDevice({
          sceneId,
          deviceId,
          inputSource: config.inputSource,
          volume: config.volume,
          notes: config.notes,
        });
      }
    });

    navigate('/scenes');
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button className="btn-ghost p-2" onClick={() => navigate('/scenes')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-display font-bold">
          {isEdit ? '编辑场景' : '创建场景'}
        </h1>
      </div>

      <div className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">场景名称</label>
          <input
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入场景名称"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">图标</label>
          <select className="input-field" value={icon} onChange={(e) => setIcon(e.target.value)}>
            {iconOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">描述</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入场景描述"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">选择设备</label>
          <div className="space-y-3">
            {devices.map((device) => {
              const config = deviceConfigs[device.id];
              const checked = config?.checked ?? false;

              return (
                <div key={device.id} className="card-glass p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDevice(device.id)}
                      className="w-4 h-4 accent-[var(--accent)]"
                    />
                    <DeviceIcon type={device.type} size={18} />
                    <span className="font-medium">{device.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{device.brand}</span>
                  </label>

                  {checked && config && (
                    <div className="mt-3 ml-7 space-y-3">
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">输入源</label>
                        <input
                          className="input-field text-sm"
                          value={config.inputSource}
                          onChange={(e) => updateConfig(device.id, 'inputSource', e.target.value)}
                          placeholder="如 HDMI 1"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
                          <Volume2 size={12} />
                          音量
                          <span className="text-[var(--accent)]">{config.volume}</span>
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={config.volume}
                          onChange={(e) => updateConfig(device.id, 'volume', Number(e.target.value))}
                          className="w-full accent-[var(--accent)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">备注</label>
                        <input
                          className="input-field text-sm"
                          value={config.notes}
                          onChange={(e) => updateConfig(device.id, 'notes', e.target.value)}
                          placeholder="备注信息"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2" onClick={handleSave}>
          <Save size={16} />
          保存场景
        </button>
      </div>
    </div>
  );
}
