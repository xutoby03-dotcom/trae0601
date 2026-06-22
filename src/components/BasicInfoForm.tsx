import { useTrialStore } from '@/store/trialStore';
import { SKIN_TONES, FOUNDATION_SHADES, FILL_ANGLES } from '@/types';
import { Palette, ThermometerSun, Move3d, Camera, Sparkles } from 'lucide-react';

export default function BasicInfoForm() {
  const { record, setBasicInfo } = useTrialStore();

  return (
    <div className="space-y-7">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-gold" />
          试妆基础信息
        </h2>
        <p className="section-subtitle">记录模特与拍摄参数，便于对比参考</p>
      </div>

      {/* 肤色选择 */}
      <div>
        <label className="input-label flex items-center gap-1.5">
          <Palette className="w-4 h-4" />
          模特肤色
        </label>
        <div className="grid grid-cols-6 gap-2">
          {SKIN_TONES.map((tone) => {
            const selected = record.modelSkinTone === tone.id;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => setBasicInfo('modelSkinTone', tone.id)}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200 ${
                  selected
                    ? 'bg-cream-100 ring-2 ring-rose-gold shadow-sm'
                    : 'hover:bg-cream-50'
                }`}
              >
                <div
                  className={`w-full aspect-square rounded-full shadow-inner border-2 transition-all ${
                    selected ? 'border-rose-gold scale-105' : 'border-white'
                  }`}
                  style={{ backgroundColor: tone.color }}
                />
                <span
                  className={`text-xs font-medium ${
                    selected ? 'text-espresso' : 'text-espresso/60'
                  }`}
                >
                  {tone.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 粉底色号 */}
      <div>
        <label className="input-label flex items-center gap-1.5">
          <Palette className="w-4 h-4" />
          粉底色号
        </label>
        <div className="flex flex-wrap gap-2">
          {FOUNDATION_SHADES.map((shade) => {
            const selected = record.foundationShade === shade;
            return (
              <button
                key={shade}
                type="button"
                onClick={() => setBasicInfo('foundationShade', shade)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selected
                    ? 'bg-rose-gold text-white shadow-md'
                    : 'bg-cream-50 text-espresso/70 border border-cream-200 hover:bg-cream-100 hover:text-espresso'
                }`}
              >
                {shade}
              </button>
            );
          })}
        </div>
      </div>

      {/* 灯具色温 */}
      <div>
        <label className="input-label flex items-center gap-1.5">
          <ThermometerSun className="w-4 h-4" />
          灯具色温
          <span className="ml-auto text-rose-gold font-bold">
            {record.colorTemperature}K
          </span>
        </label>
        <input
          type="range"
          min="2000"
          max="10000"
          step="100"
          value={record.colorTemperature}
          onChange={(e) =>
            setBasicInfo('colorTemperature', Number(e.target.value))
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-espresso/50 mt-1">
          <span>2000K 暖黄</span>
          <span>5500K 日光</span>
          <span>10000K 冷蓝</span>
        </div>
      </div>

      {/* 补光角度 */}
      <div>
        <label className="input-label flex items-center gap-1.5">
          <Move3d className="w-4 h-4" />
          补光角度
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FILL_ANGLES.map((angle) => {
            const selected = record.fillAngle === angle.id;
            return (
              <button
                key={angle.id}
                type="button"
                onClick={() => setBasicInfo('fillAngle', angle.id)}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  selected
                    ? 'bg-rose-gold/10 border-rose-gold ring-1 ring-rose-gold'
                    : 'bg-cream-50 border border-cream-200 hover:bg-cream-100'
                }`}
              >
                <div
                  className={`text-sm font-semibold ${
                    selected ? 'text-rose-goldDark' : 'text-espresso'
                  }`}
                >
                  {angle.name}
                </div>
                <div className="text-xs text-espresso/50 mt-0.5">{angle.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 相机白平衡 */}
      <div>
        <label className="input-label flex items-center gap-1.5">
          <Camera className="w-4 h-4" />
          相机白平衡
          <span className="ml-auto text-rose-gold font-bold">
            {record.cameraWhiteBalance}K
          </span>
        </label>
        <input
          type="range"
          min="2500"
          max="10000"
          step="100"
          value={record.cameraWhiteBalance}
          onChange={(e) =>
            setBasicInfo('cameraWhiteBalance', Number(e.target.value))
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-espresso/50 mt-1">
          <span>2500K 钨丝</span>
          <span>5500K 自动</span>
          <span>10000K 阴影</span>
        </div>
      </div>
    </div>
  );
}
