import { useLightingStore } from '@/store/useLightingStore';
import {
  DEVICE_TYPE_COLORS,
  DEVICE_TYPE_LABELS,
  type DeviceType,
  ANNOTATION_COLORS,
  ANNOTATION_LABELS,
  type AnnotationType,
} from '@/types';
import { formatDateTime } from '@/utils/common';
import HistoryPanel from '@/components/history/HistoryPanel';
import ConflictModal from '@/components/booking/ConflictModal';
import TopBar from '@/components/layout/TopBar';
import {
  ArrowLeft,
  CalendarDays,
  User,
  Tag,
  Lightbulb,
  Camera,
  MessageSquare,
  Image as ImageIcon,
  Video,
  CopyPlus,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_ORDER: DeviceType[] = [
  'main_light',
  'fill_light',
  'rim_light',
  'reflector',
  'background',
];

export default function HistoryLibrary() {
  const navigate = useNavigate();
  const setups = useLightingStore((s) => s.historySetups);
  const duplicateSetup = useLightingStore((s) => s.duplicateSetup);
  const loadSetup = useLightingStore((s) => s.loadSetup);

  return (
    <div className="h-full w-full flex flex-col bg-studio-950 text-studio-200 overflow-hidden">
      <header className="shrink-0 h-16 bg-studio-900/80 backdrop-blur-md border-b border-studio-800 flex items-center px-6 gap-4">
        <button
          onClick={() => navigate('/')}
          className="studio-btn-ghost !px-3 !py-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          返回布光复盘
        </button>
        <div className="w-px h-8 bg-studio-800" />
        <div>
          <h1 className="text-xl font-bold text-studio-100 font-display">
            历史布光方案库
          </h1>
          <p className="text-[11px] text-studio-500">
            共归档 {setups.length} 套完整方案 · 可一键复制复用
          </p>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-[1600px] mx-auto">
          {setups.map((s, idx) => {
            const deviceByType = new Map<DeviceType, number>();
            s.devices.forEach((d) =>
              deviceByType.set(d.type, (deviceByType.get(d.type) ?? 0) + 1)
            );
            const finalAnns = s.annotations.filter((a) => a.imageType === 'final').length;
            const btsAnns = s.annotations.filter((a) => a.imageType === 'bts').length;

            return (
              <article
                key={s.id}
                className="group studio-card overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-20px_rgba(245,158,11,0.25)] hover:-translate-y-1"
                style={{
                  animation: `slide-down 0.6s cubic-bezier(.16,1,.3,1) ${idx * 80}ms both`,
                }}
              >
                <div className="relative h-48 overflow-hidden bg-studio-900">
                  <img
                    src={s.finalImage}
                    alt={s.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-studio-900 via-studio-900/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {s.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="chip bg-studio-950/60 border-studio-600/50 text-studio-300 backdrop-blur-sm"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-white font-display truncate drop-shadow-lg">
                      {s.name}
                    </h3>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {TYPE_ORDER.filter((t) => deviceByType.has(t)).map((t) => (
                      <div
                        key={t}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border backdrop-blur-sm"
                        title={`${DEVICE_TYPE_LABELS[t]} × ${deviceByType.get(t)}`}
                        style={{
                          background: `${DEVICE_TYPE_COLORS[t]}22`,
                          borderColor: `${DEVICE_TYPE_COLORS[t]}80`,
                          color: DEVICE_TYPE_COLORS[t],
                        }}
                      >
                        {deviceByType.get(t)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-studio-400">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      拍摄: {s.shootDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {s.author}
                    </span>
                  </div>

                  {s.client && (
                    <p className="text-[12px] text-studio-300 truncate">
                      <span className="text-studio-500">客户：</span>
                      {s.client}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-studio-800/60 border border-studio-700/50">
                      <div className="flex items-center gap-1.5 text-[10px] text-studio-500 mb-1">
                        <Lightbulb className="w-3 h-3" />
                        灯具与道具
                      </div>
                      <div className="text-[13px] font-bold text-studio-200 font-mono">
                        {s.devices.length}
                        <span className="text-[10px] text-studio-500 ml-1 font-sans">件</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-studio-800/60 border border-studio-700/50">
                      <div className="flex items-center gap-1.5 text-[10px] text-studio-500 mb-1">
                        <Camera className="w-3 h-3" />
                        曝光参数
                      </div>
                      <div className="text-[11px] font-semibold text-amber-glow font-mono truncate">
                        {s.camera.aperture} · {s.camera.shutterSpeed}s
                      </div>
                    </div>
                  </div>

                  {s.annotations.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-studio-800/40 border border-studio-700/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-studio-500 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          复盘标注
                        </span>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-studio-400 flex items-center gap-0.5">
                            <ImageIcon className="w-2.5 h-2.5" />
                            {finalAnns}
                          </span>
                          <span className="text-studio-400 flex items-center gap-0.5">
                            <Video className="w-2.5 h-2.5" />
                            {btsAnns}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(
                          new Set(s.annotations.slice(0, 5).map((a) => a.type))
                        ).map((t) => (
                          <span
                            key={t}
                            className="chip !py-0 text-[10px]"
                            style={{
                              borderColor: `${ANNOTATION_COLORS[t as AnnotationType]}50`,
                              background: `${ANNOTATION_COLORS[t as AnnotationType]}12`,
                              color: ANNOTATION_COLORS[t as AnnotationType],
                            }}
                          >
                            {ANNOTATION_LABELS[t as AnnotationType]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-stretch border-t border-studio-800 bg-studio-900/60">
                  <button
                    onClick={() => {
                      loadSetup(s.id);
                      navigate('/');
                    }}
                    className="flex-1 px-3 py-2.5 text-[12px] font-semibold text-studio-300
                               hover:text-amber-glow hover:bg-amber-glow/10 transition-colors
                               flex items-center justify-center gap-1.5 border-r border-studio-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    加载编辑
                  </button>
                  <button
                    onClick={() => {
                      duplicateSetup(s.id);
                      setTimeout(() => navigate('/'), 200);
                    }}
                    className="flex-1 px-3 py-2.5 text-[12px] font-semibold bg-amber-glow/10 text-amber-glow
                               hover:bg-amber-glow/20 transition-colors
                               flex items-center justify-center gap-1.5"
                  >
                    <CopyPlus className="w-3.5 h-3.5" />
                    一键复用
                  </button>
                </div>

                <div className="px-4 py-2 border-t border-studio-800 text-[10px] text-studio-600 flex items-center justify-between">
                  <span>创建: {formatDateTime(s.createdAt).slice(5)}</span>
                  <span>更新: {formatDateTime(s.updatedAt).slice(5)}</span>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <HistoryPanel />
      <ConflictModal />
    </div>
  );
}
