import { Waves, Shirt, Camera, Aperture, Layers, Anchor } from 'lucide-react';
import type { WeightPlan } from '@/types';
import { CAMERA_HOUSING_PRESETS, LENS_PORT_PRESETS, BUOYANCY_ARM_PRESETS } from '@/types';

interface PlanSummaryProps {
  plan: WeightPlan;
  title?: string;
  compact?: boolean;
}

export default function PlanSummary({ plan, title, compact = false }: PlanSummaryProps) {
  const isCustom = (value: string, presets: string[]) => !presets.includes(value);

  const avgRating = (
    (plan.pitchForward +
      plan.pitchBackward +
      plan.roll +
      plan.ascentSpeed +
      plan.handling) /
    5
  ).toFixed(1);

  const configItems = [
    { label: '盐度', value: plan.salinity, icon: Waves, isCustom: false },
    { label: '湿衣', value: plan.wetsuitThickness, icon: Shirt, isCustom: false },
    { label: '壳体', value: plan.cameraHousing, icon: Camera, isCustom: isCustom(plan.cameraHousing, CAMERA_HOUSING_PRESETS) },
    { label: '镜头罩', value: plan.lensPort, icon: Aperture, isCustom: isCustom(plan.lensPort, LENS_PORT_PRESETS) },
    { label: '浮力臂', value: plan.buoyancyArm, icon: Layers, isCustom: isCustom(plan.buoyancyArm, BUOYANCY_ARM_PRESETS) },
    { label: '铅块', value: plan.leadPosition, icon: Anchor, isCustom: false },
  ];

  if (compact) {
    return (
      <div className="space-y-3">
        {title && (
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-300">{title}</h4>
            <span className="text-amber-400 text-sm font-semibold">{avgRating} ★</span>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {configItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs">
              <item.icon size={12} className="text-cyan-400 flex-shrink-0" />
              <span className="text-slate-500">{item.label}:</span>
              <span className="text-slate-200 truncate" title={item.value}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-white">{title}</h4>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <span className="text-amber-400 font-bold">{avgRating}</span>
            <span className="text-amber-400 text-sm">★</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {configItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/40"
          >
            <div className="p-1.5 rounded-md bg-cyan-500/10">
              <item.icon size={14} className="text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-500">{item.label}</p>
              <p className="text-sm text-white font-medium truncate flex items-center gap-1">
                <span className="truncate">{item.value}</span>
                {item.isCustom && (
                  <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded flex-shrink-0">
                    自定义
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 评分摘要 */}
      <div className="pt-2 border-t border-slate-700/40">
        <p className="text-[11px] text-slate-500 mb-2">下潜反馈</p>
        <div className="grid grid-cols-5 gap-1">
          {[
            { label: '前倾', value: plan.pitchForward },
            { label: '后仰', value: plan.pitchBackward },
            { label: '侧翻', value: plan.roll },
            { label: '上浮', value: plan.ascentSpeed },
            { label: '手感', value: plan.handling },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-sm font-semibold text-amber-400">{item.value}</p>
              <p className="text-[10px] text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
