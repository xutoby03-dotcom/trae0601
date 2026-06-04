import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTimelineStore } from '@/store/useTimelineStore';
import type { FilterType, TransitionType } from '@/types/timeline';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-700">
      <button
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium text-zinc-200">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

function Slider({ label, value, min, max, step = 0.1, onChange }: SliderProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs text-zinc-400">{label}</label>
        <span className="text-xs text-zinc-300 font-mono w-16 text-right">
          {value.toFixed(step < 1 ? 1 : 0)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
      />
    </div>
  );
}

export function PropertiesPanel() {
  const {
    clips,
    selectedClipId,
    setClipTransform,
    setClipOpacity,
    setClipSpeed,
    setClipReverse,
    setClipColor,
    setClipFilter,
    setClipTransition,
    setClipVolume,
    updateSubtitleText,
    updateSubtitleStyle,
    mediaItems,
  } = useTimelineStore();

  const selectedClip = clips.find((c) => c.id === selectedClipId);
  const isSubtitle = selectedClip && 'text' in selectedClip;

  if (!selectedClip) {
    return (
      <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-700">
        <div className="p-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold text-white">属性</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 text-sm">选择一个片段查看属性</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-700 overflow-y-auto">
      <div className="p-4 border-b border-zinc-700">
        <h2 className="text-lg font-semibold text-white">属性</h2>
        <p className="text-xs text-zinc-400 mt-1 truncate">
          {isSubtitle
            ? (selectedClip as any).text
            : mediaItems.find((m) => m.id === (selectedClip as any).mediaItemId)?.name ||
              '未命名片段'}
        </p>
      </div>

      {isSubtitle ? (
        <Section title="字幕">
          <div className="mb-3">
            <label className="block text-xs text-zinc-400 mb-1">文字</label>
            <textarea
              value={(selectedClip as any).text}
              onChange={(e) => updateSubtitleText(selectedClip.id, e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
              rows={3}
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-zinc-400 mb-1">字体大小</label>
            <input
              type="number"
              value={(selectedClip as any).style.fontSize}
              onChange={(e) =>
                updateSubtitleStyle(selectedClip.id, { fontSize: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-zinc-400 mb-1">颜色</label>
            <input
              type="color"
              value={(selectedClip as any).style.color}
              onChange={(e) =>
                updateSubtitleStyle(selectedClip.id, { color: e.target.value })
              }
              className="w-full h-8 bg-zinc-800 border border-zinc-700 rounded cursor-pointer"
            />
          </div>
        </Section>
      ) : (
        <>
          <Section title="变换">
            <Slider
              label="缩放"
              value={selectedClip.transform.scale}
              min={0.1}
              max={3}
              step={0.1}
              onChange={(v) => setClipTransform(selectedClip.id, { scale: v })}
            />
            <Slider
              label="旋转"
              value={selectedClip.transform.rotation}
              min={-180}
              max={180}
              step={1}
              onChange={(v) => setClipTransform(selectedClip.id, { rotation: v })}
            />
            <Slider
              label="位置 X"
              value={selectedClip.transform.positionX}
              min={-500}
              max={500}
              step={1}
              onChange={(v) => setClipTransform(selectedClip.id, { positionX: v })}
            />
            <Slider
              label="位置 Y"
              value={selectedClip.transform.positionY}
              min={-500}
              max={500}
              step={1}
              onChange={(v) => setClipTransform(selectedClip.id, { positionY: v })}
            />
            <Slider
              label="透明度"
              value={selectedClip.opacity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setClipOpacity(selectedClip.id, v)}
            />
          </Section>

          <Section title="速度">
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1">播放速度</label>
              <select
                value={selectedClip.speed}
                onChange={(e) => setClipSpeed(selectedClip.id, parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="1">1x (正常)</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
                <option value="4">4x</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">反向播放</span>
              <button
                className={`w-10 h-5 rounded-full transition-colors ${
                  selectedClip.reverse ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
                onClick={() => setClipReverse(selectedClip.id, !selectedClip.reverse)}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    selectedClip.reverse ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </Section>

          <Section title="调色">
            <Slider
              label="亮度"
              value={selectedClip.color.brightness}
              min={-100}
              max={100}
              step={1}
              onChange={(v) => setClipColor(selectedClip.id, { brightness: v })}
            />
            <Slider
              label="对比度"
              value={selectedClip.color.contrast}
              min={-100}
              max={100}
              step={1}
              onChange={(v) => setClipColor(selectedClip.id, { contrast: v })}
            />
            <Slider
              label="饱和度"
              value={selectedClip.color.saturation}
              min={-100}
              max={100}
              step={1}
              onChange={(v) => setClipColor(selectedClip.id, { saturation: v })}
            />
          </Section>

          <Section title="滤镜">
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1">滤镜效果</label>
              <select
                value={selectedClip.filter}
                onChange={(e) => setClipFilter(selectedClip.id, e.target.value as FilterType)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="none">无</option>
                <option value="grayscale">黑白</option>
                <option value="sepia">怀旧</option>
                <option value="blur">模糊</option>
              </select>
            </div>
          </Section>

          <Section title="过渡">
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1">过渡效果</label>
              <select
                value={selectedClip.transition?.type || 'none'}
                onChange={(e) => {
                  if (e.target.value === 'none') {
                    setClipTransition(selectedClip.id, undefined);
                  } else {
                    setClipTransition(selectedClip.id, {
                      type: e.target.value as TransitionType,
                      duration: selectedClip.transition?.duration || 1,
                    });
                  }
                }}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="none">无</option>
                <option value="fade">淡入淡出</option>
                <option value="dissolve">交叉溶解</option>
                <option value="push">推拉</option>
                <option value="slide">滑动</option>
              </select>
            </div>
            {selectedClip.transition && (
              <Slider
                label="过渡时长"
                value={selectedClip.transition.duration}
                min={0.1}
                max={3}
                step={0.1}
                onChange={(v) =>
                  setClipTransition(selectedClip.id, {
                    ...selectedClip.transition!,
                    duration: v,
                  })
                }
              />
            )}
          </Section>

          <Section title="音频">
            <Slider
              label="音量"
              value={selectedClip.volume ?? 1}
              min={0}
              max={2}
              step={0.1}
              onChange={(v) => setClipVolume(selectedClip.id, v)}
            />
          </Section>
        </>
      )}
    </div>
  );
}
