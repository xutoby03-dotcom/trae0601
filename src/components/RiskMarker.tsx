import { useTrialStore } from '@/store/trialStore';
import { RISK_META, RISK_LEVELS, type LightSceneKey, type RiskType, type RiskLevel } from '@/types';
import { AlertTriangle, Check } from 'lucide-react';

interface Props {
  scene: LightSceneKey;
}

export default function RiskMarker({ scene }: Props) {
  const { record, toggleRisk, updateRiskLevel } = useTrialStore();
  const sceneRisks = record[scene].risks;

  const isSelected = (type: RiskType) =>
    sceneRisks.some((r) => r.type === type);

  const getLevel = (type: RiskType): RiskLevel | null => {
    const found = sceneRisks.find((r) => r.type === type);
    return found ? found.level : null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-espresso/70">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-gold" />
        风险标记
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(RISK_META) as RiskType[]).map((type) => {
          const meta = RISK_META[type];
          const selected = isSelected(type);
          const level = getLevel(type);

          return (
            <div key={type} className="space-y-1.5">
              <button
                type="button"
                onClick={() =>
                  toggleRisk(scene, { type, level: level || 'mild' })
                }
                className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all duration-200 ${
                  selected
                    ? 'text-white shadow-md'
                    : 'bg-cream-50 text-espresso/60 border border-cream-200 hover:bg-cream-100'
                }`}
                style={
                  selected
                    ? { backgroundColor: meta.color }
                    : undefined
                }
              >
                <span>{meta.name}</span>
                {selected && <Check className="w-3.5 h-3.5" />}
              </button>

              {selected && (
                <div className="flex gap-1">
                  {RISK_LEVELS.map((lv) => (
                    <button
                      key={lv.id}
                      type="button"
                      onClick={() => updateRiskLevel(scene, type, lv.id)}
                      className={`flex-1 py-1 text-[10px] font-semibold rounded transition-all duration-150 ${
                        level === lv.id
                          ? 'text-white'
                          : 'bg-cream-100 text-espresso/50 hover:bg-cream-200'
                      }`}
                      style={
                        level === lv.id
                          ? { backgroundColor: meta.color, opacity: 0.5 + lv.weight * 0.25 }
                          : undefined
                      }
                    >
                      {lv.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
