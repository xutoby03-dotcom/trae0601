import { useStore } from '@/store';
import { DeviceIcon, deviceTypeLabels } from '@/utils/icons';
import { ArrowLeft, Save, Plus, Trash2, Volume2, Play, Film, Gamepad2, Music, Tv, Headphones, Radio, BookOpen, Coffee } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const sceneIconMap: Record<string, React.ElementType> = {
  Film, Gamepad2, Music, Tv, Headphones, Radio, BookOpen, Coffee,
};

export default function SceneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const scenes = useStore((s) => s.scenes);
  const sceneDevices = useStore((s) => s.sceneDevices);
  const devices = useStore((s) => s.devices);
  const activateScene = useStore((s) => s.activateScene);
  const deleteScene = useStore((s) => s.deleteScene);
  const activeSceneId = useStore((s) => s.activeSceneId);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const scene = scenes.find((s) => s.id === id);
  const sds = sceneDevices.filter((sd) => sd.sceneId === id);
  const isActive = activeSceneId === id;

  if (!scene) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
        场景不存在
      </div>
    );
  }

  const Icon = sceneIconMap[scene.icon] || Film;
  const getDevice = (deviceId: string) => devices.find((d) => d.id === deviceId);

  const handleDelete = () => {
    deleteScene(scene.id);
    navigate('/scenes');
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="btn-ghost p-2" onClick={() => navigate('/scenes')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-display font-bold">{scene.name}</h1>
          {isActive && (
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
              已激活
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-sm" onClick={() => navigate(`/scenes/${id}/edit`)}>
            编辑
          </button>
          {!confirmDelete ? (
            <button
              className="btn-ghost text-sm text-red-400 border-red-400/20 hover:bg-red-500/10"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} className="inline mr-1" />
              删除
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">确认删除？</span>
              <button
                className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded"
                onClick={handleDelete}
              >
                确认
              </button>
              <button
                className="text-xs bg-white/5 text-[var(--text-secondary)] px-2 py-1 rounded"
                onClick={() => setConfirmDelete(false)}
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl space-y-5">
        <div className="card-glass p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/60'
            }`}>
              <Icon size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{scene.name}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{scene.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">已使用 {scene.useCount} 次</span>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => activateScene(scene.id)}
            >
              <Play size={14} />
              激活场景
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            设备配置 ({sds.length})
          </h3>
          <div className="space-y-3">
            {sds.map((sd) => {
              const device = getDevice(sd.deviceId);
              if (!device) return null;

              return (
                <div key={sd.id} className="card-glass p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <DeviceIcon type={device.type} size={18} />
                    <span className="font-medium">{device.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{device.brand}</span>
                  </div>
                  <div className="ml-7 space-y-2">
                    {sd.inputSource && (
                      <div className="text-xs text-[var(--text-secondary)]">
                        输入源：<span className="text-[var(--text-primary)]">{sd.inputSource}</span>
                      </div>
                    )}
                    {sd.volume > 0 && (
                      <div className="flex items-center gap-2">
                        <Volume2 size={12} className="text-[var(--text-muted)]" />
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent)] rounded-full"
                            style={{ width: `${sd.volume}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--text-muted)] w-8 text-right">{sd.volume}</span>
                      </div>
                    )}
                    {sd.notes && (
                      <div className="text-xs text-[var(--text-muted)]">{sd.notes}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
