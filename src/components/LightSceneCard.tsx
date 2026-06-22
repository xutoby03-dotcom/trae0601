import { useRef } from 'react';
import { useTrialStore } from '@/store/trialStore';
import { LIGHT_SCENE_META, RISK_META, RISK_LEVELS, type LightSceneKey } from '@/types';
import RiskMarker from './RiskMarker';
import {
  Camera as CameraIcon,
  Upload,
  StickyNote,
  Sun,
  Flame,
  Snowflake,
  Sparkles,
  X,
} from 'lucide-react';

const ICON_MAP = {
  Sun,
  Flame,
  Snowflake,
  Sparkles,
};

interface Props {
  scene: LightSceneKey;
  index: number;
}

export default function LightSceneCard({ scene, index }: Props) {
  const { record, setScenePhoto, setSceneNotes } = useTrialStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const meta = LIGHT_SCENE_META[scene];
  const data = record[scene];
  const Icon = ICON_MAP[meta.icon as keyof typeof ICON_MAP];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScenePhoto(scene, ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setScenePhoto(scene, '');
    if (inputRef.current) inputRef.current.value = '';
  };

  const riskScore = data.risks.reduce(
    (sum, r) => sum + RISK_LEVELS.find((l) => l.id === r.level)!.weight,
    0
  );
  const hasSevere = data.risks.some((r) => r.level === 'severe');

  return (
    <div
      className="card overflow-hidden flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between border-b border-cream-200"
        style={{
          background: `linear-gradient(135deg, ${meta.color}55 0%, ${meta.color}15 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: meta.color }}
          >
            <Icon className="w-5 h-5 text-espresso" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold text-espresso leading-tight">
              {meta.name}
            </div>
            <div className="text-xs text-espresso/60">{meta.colorTemp}</div>
          </div>
        </div>

        {data.risks.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {data.risks.map((r) => (
                <div
                  key={r.type}
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: RISK_META[r.type].color }}
                  title={RISK_META[r.type].name}
                />
              ))}
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                hasSevere
                  ? 'bg-red-100 text-red-700'
                  : riskScore >= 4
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-cream-100 text-espresso/70'
              }`}
            >
              {riskScore} 分
            </span>
          </div>
        )}
      </div>

      {/* Photo area */}
      <div className="p-4">
        <div
          onClick={() => !data.photoUrl && inputRef.current?.click()}
          className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed transition-all duration-200 ${
            data.photoUrl
              ? 'border-cream-200'
              : 'border-cream-300 bg-cream-50 hover:border-rose-gold hover:bg-rose-gold/5 cursor-pointer'
          }`}
        >
          {data.photoUrl ? (
            <>
              <img
                src={data.photoUrl}
                alt={meta.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Risk overlays */}
              {data.risks.length > 0 && (
                <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                  {data.risks.map((r) => {
                    const rm = RISK_META[r.type];
                    return (
                      <span
                        key={r.type}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-md"
                        style={{ backgroundColor: rm.color }}
                      >
                        {rm.name} · {RISK_LEVELS.find((l) => l.id === r.level)!.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-espresso/40">
              <CameraIcon className="w-8 h-8 mb-2" />
              <div className="flex items-center gap-1 text-sm font-medium">
                <Upload className="w-3.5 h-3.5" />
                点击上传照片
              </div>
              <div className="text-xs mt-1 opacity-70">拍摄时保持面部角度一致</div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 space-y-4 flex-1 flex flex-col">
        {/* Notes */}
        <div>
          <label className="input-label flex items-center gap-1.5 text-xs">
            <StickyNote className="w-3.5 h-3.5" />
            备注
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => setSceneNotes(scene, e.target.value)}
            placeholder="记录底妆在该灯光下的实际表现…"
            rows={3}
            className="input-field resize-none text-sm py-2.5"
          />
        </div>

        {/* Risk markers */}
        <div className="pt-2 border-t border-cream-100">
          <RiskMarker scene={scene} />
        </div>
      </div>
    </div>
  );
}
