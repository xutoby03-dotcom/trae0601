import { useState } from 'react';
import Header from '../components/Header';
import { SectionTitle } from '../components/ui';
import { useAppStore } from '../store';
import type { SeasonType, AlertThresholds } from '../types';
import {
  TrendingUp,
  Cat,
  Flower2,
  Sliders,
  Clock,
  Package,
  Wind,
  AlertTriangle,
  Gauge,
  Save,
  RotateCcw,
  Settings2,
  Info,
  Zap,
} from 'lucide-react';
import { mockThresholds } from '../data/mock';

const seasonMeta: Record<SeasonType, {
  label: string;
  description: string;
  icon: typeof Cat;
  iconBg: string;
  iconColor: string;
}> = {
  pet_shedding: {
    label: '宠物掉毛季',
    description: '换毛季毛发增多，滤芯堵塞更快',
    icon: Cat,
    iconBg: 'bg-warn-50',
    iconColor: 'text-warn-500',
  },
  pollen: {
    label: '花粉季',
    description: '花粉浓度高，滤芯负载加大',
    icon: Flower2,
    iconBg: 'bg-air-poor/15',
    iconColor: 'text-air-poor',
  },
};

const thresholdMeta: Array<{
  key: keyof AlertThresholds;
  label: string;
  description: string;
  icon: typeof Clock;
  unit: string;
  min?: number;
  max?: number;
}> = [
  {
    key: 'filterExpiringDays',
    label: '滤芯临期天数',
    description: '剩余天数 ≤ 此值时触发临期告警',
    icon: Clock,
    unit: '天',
    min: 1,
    max: 90,
  },
  {
    key: 'safeStockPerSpec',
    label: '安全库存数量',
    description: '每规格库存低于此值时触发库存告警',
    icon: Package,
    unit: '件',
    min: 0,
    max: 20,
  },
  {
    key: 'cleanReminderDays',
    label: '清灰提醒间隔',
    description: '距上次清灰超过此值时触发清灰告警',
    icon: Wind,
    unit: '天',
    min: 7,
    max: 180,
  },
  {
    key: 'pm25AccelerateThreshold',
    label: 'PM2.5 加速阈值',
    description: 'PM2.5 超过此值时滤芯消耗 ×1.4',
    icon: AlertTriangle,
    unit: 'μg/m³',
    min: 35,
    max: 300,
  },
  {
    key: 'odorAccelerateLevel',
    label: '异味加速等级',
    description: '异味等级 ≥ 此值时滤芯消耗 ×1.3',
    icon: Gauge,
    unit: '级',
    min: 0,
    max: 3,
  },
];

export default function Settings() {
  const seasonalSettings = useAppStore((s) => s.seasonalSettings);
  const updateSeasonalSettings = useAppStore((s) => s.updateSeasonalSettings);
  const thresholds = useAppStore((s) => s.thresholds);
  const updateAlertThresholds = useAppStore((s) => s.updateAlertThresholds);
  const isInSeason = useAppStore((s) => s.isInSeason);

  const [localThresholds, setLocalThresholds] = useState<AlertThresholds>(thresholds);
  const [saved, setSaved] = useState(false);

  const handleSeasonToggle = (type: SeasonType) => {
    const next = seasonalSettings.map((s) =>
      s.type === type ? { ...s, enabled: !s.enabled } : s,
    );
    updateSeasonalSettings(next);
  };

  const handleSeasonChange = (type: SeasonType, key: 'startMonth' | 'endMonth' | 'consumptionFactor', value: number) => {
    const next = seasonalSettings.map((s) =>
      s.type === type ? { ...s, [key]: value } : s,
    );
    updateSeasonalSettings(next);
  };

  const handleThresholdChange = (key: keyof AlertThresholds, value: number) => {
    setLocalThresholds((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSaveThresholds = () => {
    updateAlertThresholds(localThresholds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setLocalThresholds(mockThresholds);
    setSaved(false);
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const factorOptions = [1.1, 1.2, 1.3, 1.5, 1.8, 2.0];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title="告警与提醒设置" subtitle="配置消耗因子、告警阈值和季节加速" />

      <div className="px-8 py-6 flex flex-col gap-8 max-w-5xl mx-auto w-full">
        {/* 季节消耗加速 */}
        <section className="base-card p-6 animate-fade-in-up stagger-1">
          <SectionTitle
            icon={TrendingUp}
            title="季节消耗加速"
            desc="宠物换毛、花粉季等特殊时期自动加速滤芯消耗估算"
          />

          <div className="space-y-4">
            {seasonalSettings.map((setting) => {
              const meta = seasonMeta[setting.type];
              const Icon = meta.icon;
              const active = setting.enabled && isInSeason(setting.type);

              return (
                <div
                  key={setting.type}
                  className={`p-5 rounded-2xl border transition-all duration-300 ${
                    setting.enabled
                      ? 'bg-brand-50/70 border-2 border-brand-200'
                      : 'bg-white border border-surface-border opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${meta.iconBg} flex items-center justify-center ${meta.iconColor}`}>
                        <Icon className="w-6 h-6" strokeWidth={1.8} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-brand-800">{meta.label}</h4>
                          {active && (
                            <span className="tag bg-air-excellent/15 text-air-excellent border border-air-excellent/30 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-air-excellent" />
                              当前生效中
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-brand-500 mt-0.5">{meta.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSeasonToggle(setting.type)}
                      className={`relative w-14 h-8 rounded-full transition-colors duration-300 shrink-0 ${
                        setting.enabled ? 'bg-brand-500' : 'bg-brand-200'
                      }`}
                      aria-label="切换启用"
                    >
                      <span
                        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                          setting.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div
                    className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-5 pt-4 border-t ${
                      setting.enabled ? 'border-brand-100' : 'border-surface-border opacity-50 pointer-events-none'
                    }`}
                  >
                    <div>
                      <label className="label-base">开始月份</label>
                      <select
                        value={setting.startMonth}
                        onChange={(e) => handleSeasonChange(setting.type, 'startMonth', Number(e.target.value))}
                        className="input-base"
                      >
                        {months.map((m) => (
                          <option key={m} value={m}>
                            {m} 月
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-base">结束月份</label>
                      <select
                        value={setting.endMonth}
                        onChange={(e) => handleSeasonChange(setting.type, 'endMonth', Number(e.target.value))}
                        className="input-base"
                      >
                        {months.map((m) => (
                          <option key={m} value={m}>
                            {m} 月
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-base">消耗加速倍率</label>
                      <select
                        value={setting.consumptionFactor}
                        onChange={(e) => handleSeasonChange(setting.type, 'consumptionFactor', Number(e.target.value))}
                        className="input-base"
                      >
                        {factorOptions.map((f) => (
                          <option key={f} value={f}>
                            × {f.toFixed(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 告警阈值配置 */}
        <section className="base-card p-6 animate-fade-in-up stagger-3">
          <SectionTitle
            icon={Sliders}
            title="告警阈值配置"
            desc="调整触发各类告警的临界条件，修改后需点击保存生效"
            action={
              <div className="flex items-center gap-2">
                <button className="secondary-btn" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
                  恢复默认
                </button>
                <button className="primary-btn" onClick={handleSaveThresholds}>
                  {saved ? (
                    <>
                      <span className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center text-brand-600 text-xs">✓</span>
                      已保存
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" strokeWidth={1.8} />
                      保存设置
                    </>
                  )}
                </button>
              </div>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {thresholdMeta.map((item) => {
              const Icon = item.icon;
              const value = localThresholds[item.key];

              return (
                <div
                  key={item.key}
                  className="p-5 rounded-2xl bg-brand-50/50 border border-brand-100 hover:border-brand-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-white border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
                      <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
                    </div>
                    <h4 className="text-sm font-bold text-brand-800">{item.label}</h4>
                  </div>
                  <p className="text-xs text-brand-500 mb-3 pl-11.5">{item.description}</p>

                  <div className="flex items-center gap-2 pl-11.5">
                    <input
                      type="number"
                      min={item.min}
                      max={item.max}
                      value={value}
                      onChange={(e) => handleThresholdChange(item.key, Number(e.target.value))}
                      className="input-base font-mono font-bold text-base"
                    />
                    <span className="text-sm font-medium text-brand-600 w-14 shrink-0">
                      {item.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 消耗计算说明 */}
        <section className="base-card p-6 animate-fade-in-up stagger-5">
          <SectionTitle
            icon={Settings2}
            title="消耗计算说明"
            desc="滤芯剩余寿命计算方式一目了然"
          />

          <div className="space-y-3">
            {[
              { icon: Cat, title: '宠物掉毛季', desc: '启用且当前日期在设定月份范围内时，消耗乘以对应倍率' },
              { icon: Flower2, title: '花粉季', desc: '启用且当前日期在设定月份范围内时，消耗乘以对应倍率' },
              { icon: AlertTriangle, title: 'PM2.5 超标', desc: `当设备 PM2.5 > 阈值时，消耗额外 × 1.4` },
              { icon: Gauge, title: '异味明显', desc: `当设备异味等级 ≥ 阈值时，消耗额外 × 1.3` },
              { icon: Zap, title: '总倍率上限', desc: '所有因素叠加相乘后，最高倍率不超过 2.5，防止估算失控' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-brand-50/40 border border-brand-100/60"
                style={{ animationDelay: `${(i + 1) * 50}ms` }}
              >
                <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brand-800">{title}</p>
                  <p className="text-xs text-brand-600 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-warn-50 border border-warn-200">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-warn-500 shrink-0 mt-0.5" strokeWidth={1.8} />
              <p className="text-sm text-warn-700 leading-relaxed">
                <span className="font-bold">计算公式：</span>
                有效使用天数 = 实际安装天数 × 消耗倍率；
                剩余天数 = 滤芯标准寿命 - 有效使用天数。
                季节因素之间为相乘关系，例如同时处于宠物季 ×1.5 和花粉季 ×1.3 时，总倍率为 ×1.95。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
