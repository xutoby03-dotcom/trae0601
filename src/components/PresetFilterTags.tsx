import type { FilterPreset } from '@/types';

interface PresetFilterTagsProps {
  presets: FilterPreset[];
  activePresetId: string | null;
  onSelectPreset: (presetId: string) => void;
  onClearPreset: () => void;
}

export function PresetFilterTags({
  presets,
  activePresetId,
  onSelectPreset,
  onClearPreset,
}: PresetFilterTagsProps) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-[#8B5A3C] mb-3">智能筛选方案</h4>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              if (activePresetId === preset.id) {
                onClearPreset();
              } else {
                onSelectPreset(preset.id);
              }
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activePresetId === preset.id
                ? 'bg-gradient-to-r from-[#8B5A3C] to-[#3D5A45] text-white shadow-md'
                : 'bg-white text-[#8B5A3C] border border-[#8B5A3C]/20 hover:border-[#8B5A3C]/40 hover:bg-[#8B5A3C]/5'
            }`}
          >
            「{preset.name}」
          </button>
        ))}
      </div>
      {activePresetId && (
        <p className="mt-2 text-xs text-[#8B5A3C]/60">
          {presets.find((p) => p.id === activePresetId)?.description}
        </p>
      )}
    </div>
  );
}
