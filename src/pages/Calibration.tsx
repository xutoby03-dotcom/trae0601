import { useState, useMemo } from 'react';
import {
  Lightbulb,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Eye,
  Ghost,
  Shield,
  ThermometerSun,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useAppStore } from '@/store';
import {
  GHOST_LEVEL_LABELS,
  OCCLUSION_LEVEL_LABELS,
  COLOR_TEMP_LABELS,
  type GhostLevel,
  type OcclusionLevel,
  type ColorTempBias,
} from '@/types';

const ghostValue: Record<GhostLevel, number> = { none: 10, light: 5, severe: 0 };
const occlusionValue: Record<OcclusionLevel, number> = { none: 10, partial: 5, full: 0 };
const colorTempValue: Record<ColorTempBias, number> = { normal: 10, cool: 5, warm: 5 };

const ghostColors: Record<GhostLevel, string> = {
  none: 'bg-green-100 text-green-700',
  light: 'bg-yellow-100 text-yellow-700',
  severe: 'bg-red-100 text-red-700',
};
const occlusionColors: Record<OcclusionLevel, string> = {
  none: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  full: 'bg-red-100 text-red-700',
};
const colorTempColors: Record<ColorTempBias, string> = {
  normal: 'bg-green-100 text-green-700',
  cool: 'bg-blue-100 text-blue-700',
  warm: 'bg-orange-100 text-orange-700',
};

export default function Calibration() {
  const {
    lamps,
    lightPositions,
    addLightPosition,
    updateLightPosition,
    removeLightPosition,
    calibrations,
    addCalibration,
    updateCalibration,
    removeCalibration,
  } = useAppStore();

  const [editingLpId, setEditingLpId] = useState<string | null>(null);
  const [expandedLpId, setExpandedLpId] = useState<string | null>(null);
  const [editingCalId, setEditingCalId] = useState<string | null>(null);

  const handleAddLightPosition = () => {
    addLightPosition({
      name: `灯位方案 ${lightPositions.length + 1}`,
      lampId: lamps[0]?.id || '',
      distanceCm: 150,
      angleDeg: 0,
      heightCm: 200,
      brightness: 7,
    });
  };

  const handleAddCalibration = (lightPositionId: string) => {
    addCalibration({
      lightPositionId,
      sharpnessScore: 7,
      ghostLevel: 'light',
      occlusionLevel: 'none',
      colorTempBias: 'normal',
      notes: '',
    });
  };

  const radarData = useMemo(() => {
    const indicators = [
      { key: 'sharpness', label: '清晰度' },
      { key: 'ghost', label: '无重影' },
      { key: 'occlusion', label: '无遮挡' },
      { key: 'colorTemp', label: '色温准确' },
    ];
    return indicators.map((ind) => {
      const row: Record<string, string | number> = { dimension: ind.label };
      lightPositions.forEach((lp) => {
        const cal = calibrations.find((c) => c.lightPositionId === lp.id);
        if (cal) {
          if (ind.key === 'sharpness') row[lp.name] = cal.sharpnessScore;
          if (ind.key === 'ghost') row[lp.name] = ghostValue[cal.ghostLevel];
          if (ind.key === 'occlusion') row[lp.name] = occlusionValue[cal.occlusionLevel];
          if (ind.key === 'colorTemp') row[lp.name] = colorTempValue[cal.colorTempBias];
        } else {
          row[lp.name] = 0;
        }
      });
      return row;
    });
  }, [lightPositions, calibrations]);

  const chartColors = ['#8B4513', '#D4AF37', '#4A7C59', '#8B0000', '#2E5EAA'];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ocher-700 mb-2">光学校准</h1>
        <p className="text-ocher-500">
          配置不同灯位方案，评估影像清晰度、重影、遮挡和色温偏差，筛选最优光位
        </p>
      </div>

      {/* 可视化对比雷达图 */}
      {lightPositions.length > 0 && calibrations.length > 0 && (
        <section className="paper-card">
          <h2 className="section-title">
            <Eye className="w-5 h-5 text-gold-400" strokeWidth={1.8} />
            灯位对比雷达图
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#E8CCAA" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6B3410', fontSize: 13 }} />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fill: '#8B6914', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF3E6',
                    border: '1px solid #E8CCAA',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', color: '#6B3410' }} />
                {lightPositions.map((lp, i) => (
                  <Radar
                    key={lp.id}
                    name={lp.name}
                    dataKey={lp.name}
                    stroke={chartColors[i % chartColors.length]}
                    fill={chartColors[i % chartColors.length]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* 灯位列表 */}
      <section className="paper-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title !mb-0">
            <Lightbulb className="w-5 h-5 text-gold-400" strokeWidth={1.8} />
            灯位方案
          </h2>
          <button className="btn-primary flex items-center gap-2" onClick={handleAddLightPosition}>
            <Plus className="w-4 h-4" />
            添加灯位
          </button>
        </div>

        {lamps.length === 0 && (
          <div className="text-center py-6 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-yellow-700 text-sm">
              ⚠️ 请先在「设备登记」中添加灯具，才能配置灯位方案
            </p>
          </div>
        )}

        <div className="space-y-4">
          {lightPositions.length === 0 && (
            <p className="text-center py-10 text-ocher-400 text-sm">暂无灯位方案，请点击右上角添加</p>
          )}
          {lightPositions.map((lp, idx) => {
            const lamp = lamps.find((l) => l.id === lp.lampId);
            const cal = calibrations.find((c) => c.lightPositionId === lp.id);
            const isExpanded = expandedLpId === lp.id;

            return (
              <div
                key={lp.id}
                className="border border-ocher-200/60 rounded-xl overflow-hidden bg-white/50 transition-all"
              >
                {/* 灯位头部 */}
                <div className="p-4 hover:bg-white/70 transition-colors">
                  {editingLpId === lp.id ? (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                      <div className="col-span-2">
                        <label className="label-text">方案名称</label>
                        <input
                          className="input-field text-sm"
                          value={lp.name}
                          onChange={(e) => updateLightPosition(lp.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label-text">对应灯具</label>
                        <select
                          className="input-field text-sm"
                          value={lp.lampId}
                          onChange={(e) => updateLightPosition(lp.id, { lampId: e.target.value })}
                        >
                          {lamps.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.model}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label-text">距离(cm)</label>
                        <input
                          type="number"
                          className="input-field text-sm"
                          value={lp.distanceCm}
                          onChange={(e) =>
                            updateLightPosition(lp.id, { distanceCm: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <label className="label-text">角度(°)</label>
                        <input
                          type="number"
                          className="input-field text-sm"
                          value={lp.angleDeg}
                          onChange={(e) =>
                            updateLightPosition(lp.id, { angleDeg: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <label className="label-text">高度(cm)</label>
                        <input
                          type="number"
                          className="input-field text-sm"
                          value={lp.heightCm}
                          onChange={(e) =>
                            updateLightPosition(lp.id, { heightCm: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="col-span-2 md:col-span-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <label className="label-text !mb-0">亮度:</label>
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={lp.brightness}
                            onChange={(e) =>
                              updateLightPosition(lp.id, { brightness: Number(e.target.value) })
                            }
                            className="w-48 accent-ocher-500"
                          />
                          <span className="text-sm font-medium text-ocher-700">{lp.brightness}/10</span>
                        </div>
                        <button
                          className="btn-secondary !px-3 !py-1.5 text-sm"
                          onClick={() => setEditingLpId(null)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-ocher-700">{lp.name}</h3>
                            <p className="text-xs text-ocher-500">
                              灯具: {lamp?.model || '未选择'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="tag-badge bg-ocher-100 text-ocher-700">
                            距幕 {lp.distanceCm}cm
                          </span>
                          <span className="tag-badge bg-ocher-100 text-ocher-700">
                            角度 {lp.angleDeg}°
                          </span>
                          <span className="tag-badge bg-ocher-100 text-ocher-700">
                            高 {lp.heightCm}cm
                          </span>
                          <span className="tag-badge bg-gold-100 text-gold-500">
                            亮度 {lp.brightness}/10
                          </span>
                        </div>
                        {cal && (
                          <div className="flex gap-1.5 ml-2">
                            <span className={`tag-badge ${ghostColors[cal.ghostLevel]}`}>
                              <Ghost className="w-3 h-3 mr-1" />
                              {GHOST_LEVEL_LABELS[cal.ghostLevel]}
                            </span>
                            <span className={`tag-badge ${occlusionColors[cal.occlusionLevel]}`}>
                              <Shield className="w-3 h-3 mr-1" />
                              {OCCLUSION_LEVEL_LABELS[cal.occlusionLevel]}
                            </span>
                            <span className={`tag-badge ${colorTempColors[cal.colorTempBias]}`}>
                              <ThermometerSun className="w-3 h-3 mr-1" />
                              {COLOR_TEMP_LABELS[cal.colorTempBias]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 text-ocher-500 hover:text-ocher-700 hover:bg-ocher-100 rounded-lg transition-colors"
                          onClick={() => setExpandedLpId(isExpanded ? null : lp.id)}
                          title="展开校准详情"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          className="p-2 text-ocher-500 hover:text-ocher-700 hover:bg-ocher-100 rounded-lg transition-colors"
                          onClick={() => setEditingLpId(lp.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-crimson/70 hover:text-crimson hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => {
                            removeLightPosition(lp.id);
                            calibrations
                              .filter((c) => c.lightPositionId === lp.id)
                              .forEach((c) => removeCalibration(c.id));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 校准详情 */}
                {isExpanded && (
                  <div className="border-t border-ocher-200/50 bg-ocher-50/30 p-5">
                    {!cal ? (
                      <div className="text-center py-6">
                        <p className="text-ocher-500 text-sm mb-4">尚未校准该灯位</p>
                        <button
                          className="btn-primary flex items-center gap-2 mx-auto"
                          onClick={() => handleAddCalibration(lp.id)}
                        >
                          <Plus className="w-4 h-4" />
                          添加校准记录
                        </button>
                      </div>
                    ) : editingCalId === cal.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="label-text flex items-center gap-1.5">
                            <Eye className="w-4 h-4" /> 清晰度 (1-10)
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={1}
                              max={10}
                              value={cal.sharpnessScore}
                              onChange={(e) =>
                                updateCalibration(cal.id, {
                                  sharpnessScore: Number(e.target.value),
                                })
                              }
                              className="flex-1 accent-ocher-500"
                            />
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-4 h-4 ${
                                    cal.sharpnessScore >= s * 2
                                      ? 'fill-gold-300 text-gold-300'
                                      : 'text-ocher-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-ocher-700 w-8 text-right">
                              {cal.sharpnessScore}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="label-text flex items-center gap-1.5">
                            <Ghost className="w-4 h-4" /> 重影程度
                          </label>
                          <select
                            className="input-field text-sm"
                            value={cal.ghostLevel}
                            onChange={(e) =>
                              updateCalibration(cal.id, {
                                ghostLevel: e.target.value as GhostLevel,
                              })
                            }
                          >
                            {(['none', 'light', 'severe'] as GhostLevel[]).map((g) => (
                              <option key={g} value={g}>
                                {GHOST_LEVEL_LABELS[g]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label-text flex items-center gap-1.5">
                            <Shield className="w-4 h-4" /> 遮挡情况
                          </label>
                          <select
                            className="input-field text-sm"
                            value={cal.occlusionLevel}
                            onChange={(e) =>
                              updateCalibration(cal.id, {
                                occlusionLevel: e.target.value as OcclusionLevel,
                              })
                            }
                          >
                            {(['none', 'partial', 'full'] as OcclusionLevel[]).map((o) => (
                              <option key={o} value={o}>
                                {OCCLUSION_LEVEL_LABELS[o]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label-text flex items-center gap-1.5">
                            <ThermometerSun className="w-4 h-4" /> 色温偏差
                          </label>
                          <select
                            className="input-field text-sm"
                            value={cal.colorTempBias}
                            onChange={(e) =>
                              updateCalibration(cal.id, {
                                colorTempBias: e.target.value as ColorTempBias,
                              })
                            }
                          >
                            {(['cool', 'normal', 'warm'] as ColorTempBias[]).map((c) => (
                              <option key={c} value={c}>
                                {COLOR_TEMP_LABELS[c]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2 lg:col-span-4">
                          <label className="label-text">备注说明</label>
                          <div className="flex gap-3">
                            <input
                              className="input-field text-sm flex-1"
                              placeholder="记录该灯位的观察笔记、特殊情况..."
                              value={cal.notes || ''}
                              onChange={(e) => updateCalibration(cal.id, { notes: e.target.value })}
                            />
                            <button
                              className="btn-secondary !px-3 !py-2 text-sm flex items-center gap-1"
                              onClick={() => setEditingCalId(null)}
                            >
                              <Save className="w-4 h-4" />
                              完成
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-white/60 rounded-lg p-4 border border-ocher-200/40">
                            <p className="text-xs text-ocher-500 flex items-center gap-1 mb-2">
                              <Eye className="w-3.5 h-3.5" /> 清晰度
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold text-ocher-700">
                                {cal.sharpnessScore}
                              </p>
                              <p className="text-sm text-ocher-400">/10</p>
                              <div className="flex gap-0.5 ml-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      cal.sharpnessScore >= s * 2
                                        ? 'fill-gold-300 text-gold-300'
                                        : 'text-ocher-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="bg-white/60 rounded-lg p-4 border border-ocher-200/40">
                            <p className="text-xs text-ocher-500 flex items-center gap-1 mb-2">
                              <Ghost className="w-3.5 h-3.5" /> 重影
                            </p>
                            <span className={`tag-badge ${ghostColors[cal.ghostLevel]}`}>
                              {GHOST_LEVEL_LABELS[cal.ghostLevel]}
                            </span>
                          </div>
                          <div className="bg-white/60 rounded-lg p-4 border border-ocher-200/40">
                            <p className="text-xs text-ocher-500 flex items-center gap-1 mb-2">
                              <Shield className="w-3.5 h-3.5" /> 遮挡
                            </p>
                            <span className={`tag-badge ${occlusionColors[cal.occlusionLevel]}`}>
                              {OCCLUSION_LEVEL_LABELS[cal.occlusionLevel]}
                            </span>
                          </div>
                          <div className="bg-white/60 rounded-lg p-4 border border-ocher-200/40">
                            <p className="text-xs text-ocher-500 flex items-center gap-1 mb-2">
                              <ThermometerSun className="w-3.5 h-3.5" /> 色温
                            </p>
                            <span className={`tag-badge ${colorTempColors[cal.colorTempBias]}`}>
                              {COLOR_TEMP_LABELS[cal.colorTempBias]}
                            </span>
                          </div>
                        </div>
                        {cal.notes && (
                          <p className="text-sm text-ocher-600 bg-ocher-50 rounded-lg px-4 py-3 border border-ocher-200/30 mb-4">
                            📝 {cal.notes}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            className="btn-secondary !px-3 !py-1.5 text-sm flex items-center gap-1"
                            onClick={() => setEditingCalId(cal.id)}
                          >
                            <Edit2 className="w-4 h-4" />
                            编辑校准
                          </button>
                          <button
                            className="btn-danger !px-3 !py-1.5 text-sm flex items-center gap-1"
                            onClick={() => removeCalibration(cal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            删除记录
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
