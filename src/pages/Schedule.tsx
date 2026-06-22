import { useState, useMemo } from 'react';
import {
  ClipboardList,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Clock,
  User as UserIcon,
  Lightbulb,
  ChevronRight,
  Play,
  Pause,
  Download,
  Sparkles,
  Eye,
  Ghost,
  Shield,
  ThermometerSun,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  GHOST_LEVEL_LABELS,
  OCCLUSION_LEVEL_LABELS,
  COLOR_TEMP_LABELS,
  type GhostLevel,
  type OcclusionLevel,
  type ColorTempBias,
} from '@/types';

const chartColors = ['#8B4513', '#D4AF37', '#4A7C59', '#8B0000', '#2E5EAA', '#6B4C9A'];

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function Schedule() {
  const {
    puppets,
    lightPositions,
    lamps,
    calibrations,
    scenes,
    addScene,
    updateScene,
    removeScene,
    characterEntries,
    addCharacterEntry,
    updateCharacterEntry,
    removeCharacterEntry,
  } = useAppStore();

  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    scenes[0]?.id || null
  );
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [playingEntryId, setPlayingEntryId] = useState<string | null>(null);

  const handleAddScene = () => {
    const newScene = {
      name: `场次 ${scenes.length + 1}`,
      act: '第一幕',
      durationSec: 180,
    };
    addScene(newScene);
  };

  const activeScene = scenes.find((s) => s.id === activeSceneId);
  const sceneEntries = characterEntries.filter(
    (e) => e.sceneId === activeSceneId
  ).sort((a, b) => a.startTimeSec - b.startTimeSec);

  const validLightPositions = lightPositions.filter((lp) => {
    const lamp = lamps.find((l) => l.id === lp.lampId);
    return !!lp.lampId && !!lamp;
  });

  const ghostScore: Record<GhostLevel, number> = { none: 3, light: 1, severe: 0 };
  const occlusionScore: Record<OcclusionLevel, number> = { none: 3, partial: 1, full: 0 };
  const colorTempScore: Record<ColorTempBias, number> = { normal: 2, cool: 1, warm: 1 };

  const recommendedLp = useMemo(() => {
    const scored = validLightPositions
      .map((lp) => {
        const cal = calibrations.find((c) => c.lightPositionId === lp.id);
        if (!cal) return { lp, score: -1, cal: null };
        const score =
          cal.sharpnessScore * 2 +
          ghostScore[cal.ghostLevel] * 5 +
          occlusionScore[cal.occlusionLevel] * 5 +
          colorTempScore[cal.colorTempBias] * 3;
        return { lp, score, cal };
      })
      .filter((s) => s.score >= 0)
      .sort((a, b) => b.score - a.score);
    return scored.length > 0 ? scored[0] : null;
  }, [validLightPositions, calibrations]);

  const hasCalibratedLp = validLightPositions.some((lp) =>
    calibrations.some((c) => c.lightPositionId === lp.id)
  );

  const handleAddEntry = () => {
    if (!activeSceneId) return;
    const lastEnd =
      sceneEntries.length > 0
        ? Math.max(...sceneEntries.map((e) => e.endTimeSec))
        : 0;
    addCharacterEntry({
      sceneId: activeSceneId,
      puppetId: puppets[0]?.id || '',
      lightPositionId: validLightPositions[0]?.id || '',
      startTimeSec: lastEnd,
      endTimeSec: lastEnd + 30,
      notes: '',
    });
  };

  const handleExport = () => {
    if (!activeScene) return;
    const lines: string[] = [];
    lines.push(`【${activeScene.act} - ${activeScene.name}】光位切换表`);
    lines.push(`总时长: ${formatTime(activeScene.durationSec)}`);
    lines.push('');
    lines.push('序号\t时间\t角色\t灯位方案\t备注');
    sceneEntries.forEach((e, i) => {
      const puppet = puppets.find((p) => p.id === e.puppetId);
      const lp = lightPositions.find((l) => l.id === e.lightPositionId);
      lines.push(
        `${i + 1}\t${formatTime(e.startTimeSec)}-${formatTime(e.endTimeSec)}\t${
          puppet?.name || '未知'
        }\t${lp?.name || '未设置'}\t${e.notes || ''}`
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeScene.name}-光位切换表.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ocher-700 mb-2">光位切换表</h1>
        <p className="text-ocher-500">按场次编排角色出场顺序，为每个出场时段匹配最优光位方案</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 场次列表 */}
        <aside className="lg:col-span-1">
          <div className="paper-card !p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-ocher-700 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gold-400" strokeWidth={1.8} />
                场次列表
              </h2>
              <button
                className="p-1.5 bg-ocher-500 text-white rounded-lg hover:bg-ocher-600 transition-colors"
                onClick={handleAddScene}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {scenes.length === 0 && (
                <p className="text-center py-8 text-ocher-400 text-sm">
                  暂无场次
                </p>
              )}
              {scenes.map((scene) => {
                const count = characterEntries.filter(
                  (e) => e.sceneId === scene.id
                ).length;
                return (
                  <div
                    key={scene.id}
                    onClick={() => setActiveSceneId(scene.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      activeSceneId === scene.id
                        ? 'bg-ocher-500 text-white border-ocher-400 shadow-md'
                        : 'bg-white/60 hover:bg-white border-ocher-200/50'
                    }`}
                  >
                    {editingSceneId === scene.id ? (
                      <div className="space-y-2">
                        <input
                          className={`w-full px-2 py-1.5 rounded text-sm ${
                            activeSceneId === scene.id
                              ? 'bg-ocher-600/50 text-white placeholder-white/50'
                              : 'bg-ocher-50 text-ocher-800'
                          } border-0 outline-none`}
                          value={scene.act}
                          onChange={(e) => updateScene(scene.id, { act: e.target.value })}
                          placeholder="幕次"
                        />
                        <input
                          className={`w-full px-2 py-1.5 rounded text-sm ${
                            activeSceneId === scene.id
                              ? 'bg-ocher-600/50 text-white placeholder-white/50'
                              : 'bg-ocher-50 text-ocher-800'
                          } border-0 outline-none`}
                          value={scene.name}
                          onChange={(e) => updateScene(scene.id, { name: e.target.value })}
                          placeholder="场次名称"
                        />
                        <input
                          type="number"
                          className={`w-full px-2 py-1.5 rounded text-sm ${
                            activeSceneId === scene.id
                              ? 'bg-ocher-600/50 text-white placeholder-white/50'
                              : 'bg-ocher-50 text-ocher-800'
                          } border-0 outline-none`}
                          value={scene.durationSec}
                          onChange={(e) =>
                            updateScene(scene.id, { durationSec: Number(e.target.value) })
                          }
                          placeholder="时长(秒)"
                        />
                        <div className="flex justify-end">
                          <button
                            className={`p-1 rounded ${
                              activeSceneId === scene.id
                                ? 'hover:bg-ocher-600'
                                : 'hover:bg-ocher-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSceneId(null);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p
                              className={`text-xs ${
                                activeSceneId === scene.id
                                  ? 'text-gold-200'
                                  : 'text-ocher-400'
                              }`}
                            >
                              {scene.act}
                            </p>
                            <p
                              className={`font-medium ${
                                activeSceneId === scene.id ? 'text-white' : 'text-ocher-700'
                              }`}
                            >
                              {scene.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              className={`p-1 rounded transition-colors ${
                                activeSceneId === scene.id
                                  ? 'hover:bg-ocher-600 text-white'
                                  : 'hover:bg-ocher-100 text-ocher-500'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSceneId(scene.id);
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className={`p-1 rounded transition-colors ${
                                activeSceneId === scene.id
                                  ? 'hover:bg-red-500/50 text-white'
                                  : 'hover:bg-red-50 text-crimson/70'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeScene(scene.id);
                                characterEntries
                                  .filter((ce) => ce.sceneId === scene.id)
                                  .forEach((ce) => removeCharacterEntry(ce.id));
                                if (activeSceneId === scene.id) {
                                  setActiveSceneId(null);
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-3 mt-2 text-xs ${
                            activeSceneId === scene.id ? 'text-gold-200' : 'text-ocher-500'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(scene.durationSec)}
                          </span>
                          <span>{count} 个角色出场</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* 右侧：当前场次详情 */}
        <section className="lg:col-span-3 space-y-6">
          {!activeScene ? (
            <div className="paper-card text-center py-16">
              <p className="text-ocher-500">请先在左侧选择或创建一个场次</p>
            </div>
          ) : (
            <>
              {/* 场次头部 */}
              <div className="paper-card">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-ocher-500">{activeScene.act}</p>
                    <h2 className="font-serif text-2xl font-bold text-ocher-700">
                      {activeScene.name}
                    </h2>
                    <p className="text-sm text-ocher-500 mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      总时长 {formatTime(activeScene.durationSec)} · {sceneEntries.length} 个角色出场
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-secondary flex items-center gap-2"
                      onClick={handleExport}
                    >
                      <Download className="w-4 h-4" />
                      导出切换表
                    </button>
                    <button
                      className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleAddEntry}
                      disabled={puppets.length === 0 || validLightPositions.length === 0}
                    >
                      <Plus className="w-4 h-4" />
                      添加角色出场
                    </button>
                  </div>
                </div>
                {(puppets.length === 0 || validLightPositions.length === 0) && (
                  <div className="mt-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                    ⚠️ 
                    {puppets.length === 0 && '请先在「设备登记」中添加皮影角色。'}
                    {puppets.length > 0 && validLightPositions.length === 0 &&
                      (lightPositions.length === 0
                        ? '请先在「光学校准」中配置灯位方案。'
                        : '当前灯位方案均未绑定有效灯具，请先在「光学校准」中为灯位关联灯具。')}
                  </div>
                )}
              </div>

              {/* 甘特时间轴 */}
              {sceneEntries.length > 0 && (
                <div className="paper-card">
                  <h3 className="font-serif text-lg font-semibold text-ocher-700 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold-400" strokeWidth={1.8} />
                    光位切换时间轴
                  </h3>
                  <div className="relative">
                    {/* 时间刻度 */}
                    <div className="flex border-b border-ocher-200/50 pb-2 mb-3 ml-32">
                      {Array.from({
                        length: Math.ceil(activeScene.durationSec / 30) + 1,
                      }).map((_, i) => {
                        const t = i * 30;
                        if (t > activeScene.durationSec) return null;
                        return (
                          <div
                            key={i}
                            className="text-xs text-ocher-500 flex-shrink-0"
                            style={{
                              width: `${(30 / activeScene.durationSec) * 100}%`,
                            }}
                          >
                            {formatTime(t)}
                          </div>
                        );
                      })}
                    </div>

                    {/* 时间轴条目 */}
                    <div className="space-y-2">
                      {sceneEntries.map((entry, idx) => {
                        const puppet = puppets.find((p) => p.id === entry.puppetId);
                        const lp = lightPositions.find((l) => l.id === entry.lightPositionId);
                        const lpLamp = lp ? lamps.find((l) => l.id === lp.lampId) : null;
                        const hasValidLp = !!lp && !!lpLamp;
                        const color = hasValidLp
                          ? chartColors[idx % chartColors.length]
                          : '#9CA3AF';
                        const left = (entry.startTimeSec / activeScene.durationSec) * 100;
                        const width = Math.max(
                          ((entry.endTimeSec - entry.startTimeSec) / activeScene.durationSec) *
                            100,
                          2
                        );
                        const isPlaying = playingEntryId === entry.id;

                        return (
                          <div key={entry.id} className="flex items-center gap-3 group">
                            <div className="w-32 flex-shrink-0 text-right">
                              <p className="text-sm font-medium text-ocher-700 truncate">
                                {puppet?.name || '未设置'}
                              </p>
                              <p className={`text-xs ${hasValidLp ? 'text-ocher-500' : 'text-crimson'}`}>
                                {formatTime(entry.startTimeSec)}-{formatTime(entry.endTimeSec)}
                                {!hasValidLp && ' · ⚠ 无效灯位'}
                              </p>
                            </div>
                            <div className="flex-1 relative h-10 bg-ocher-50/50 rounded-lg overflow-hidden">
                              <div
                                className={`absolute h-full rounded-lg flex items-center px-3 gap-2 cursor-pointer transition-all ${
                                  isPlaying ? 'ring-2 ring-offset-2 ring-ocher-400' : ''
                                } ${!hasValidLp ? 'opacity-60 border-2 border-dashed border-crimson/60' : ''}`}
                                style={{
                                  left: `${left}%`,
                                  width: `${width}%`,
                                  backgroundColor: color,
                                }}
                                onClick={() =>
                                  setPlayingEntryId(isPlaying ? null : entry.id)
                                }
                              >
                                {isPlaying ? (
                                  <Pause className="w-4 h-4 text-white" />
                                ) : (
                                  <Play className="w-4 h-4 text-white" />
                                )}
                                <span className="text-white text-sm font-medium truncate">
                                  {hasValidLp ? lp?.name : '⚠ 无效灯位'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 角色出场列表 */}
              <div className="paper-card">
                <h3 className="font-serif text-lg font-semibold text-ocher-700 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gold-400" strokeWidth={1.8} />
                  角色出场序列
                </h3>

                {sceneEntries.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-ocher-400 text-sm mb-4">
                      暂无角色出场，点击上方「添加角色出场」开始编排
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sceneEntries.map((entry, idx) => {
                      const puppet = puppets.find((p) => p.id === entry.puppetId);
                      const lp = lightPositions.find((l) => l.id === entry.lightPositionId);
                      const lpLamp = lp ? lamps.find((l) => l.id === lp.lampId) : null;
                      const hasValidLp = !!lp && !!lpLamp;
                      const color = chartColors[idx % chartColors.length];

                      return (
                        <div
                          key={entry.id}
                          className={`border rounded-xl overflow-hidden bg-white/50 ${
                            hasValidLp ? 'border-ocher-200/50' : 'border-red-300/60 bg-red-50/30'
                          }`}
                        >
                          {editingEntryId === entry.id ? (
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div>
                                  <label className="label-text">皮影角色</label>
                                  <select
                                    className="input-field text-sm"
                                    value={entry.puppetId}
                                    onChange={(e) =>
                                      updateCharacterEntry(entry.id, { puppetId: e.target.value })
                                    }
                                  >
                                    {puppets.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                  <label className="label-text">对应灯位</label>
                                  <div className="flex gap-2">
                                    <select
                                      className="input-field text-sm flex-1"
                                      value={entry.lightPositionId}
                                      onChange={(e) =>
                                        updateCharacterEntry(entry.id, {
                                          lightPositionId: e.target.value,
                                        })
                                      }
                                    >
                                      {validLightPositions.length === 0 && (
                                        <option value="">暂无有效灯位</option>
                                      )}
                                      {validLightPositions.map((l) => (
                                        <option key={l.id} value={l.id}>
                                          {l.name}
                                        </option>
                                      ))}
                                    </select>
                                    {recommendedLp && (
                                      <button
                                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-gold-300/20 to-ocher-300/20 border border-gold-300/40 text-ocher-700 hover:from-gold-300/30 hover:to-ocher-300/30 transition-colors"
                                        onClick={() =>
                                          updateCharacterEntry(entry.id, {
                                            lightPositionId: recommendedLp.lp.id,
                                          })
                                        }
                                        title={`推荐 ${recommendedLp.lp.name}：清晰度${recommendedLp.cal!.sharpnessScore}/10 · ${GHOST_LEVEL_LABELS[recommendedLp.cal!.ghostLevel]} · ${OCCLUSION_LEVEL_LABELS[recommendedLp.cal!.occlusionLevel]} · 色温${COLOR_TEMP_LABELS[recommendedLp.cal!.colorTempBias]}`}
                                      >
                                        <Sparkles className="w-4 h-4 text-gold-400" />
                                        推荐
                                      </button>
                                    )}
                                  </div>
                                  {recommendedLp && (
                                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-ocher-500">
                                      <span className="flex items-center gap-1 bg-gold-300/10 rounded px-1.5 py-0.5">
                                        <Sparkles className="w-3 h-3 text-gold-400" />
                                        推荐 <strong className="text-ocher-700">{recommendedLp.lp.name}</strong>
                                      </span>
                                      <span className="flex items-center gap-1 bg-ocher-100/60 rounded px-1.5 py-0.5">
                                        <Eye className="w-3 h-3" />
                                        清晰度 {recommendedLp.cal!.sharpnessScore}/10
                                      </span>
                                      <span className="flex items-center gap-1 bg-ocher-100/60 rounded px-1.5 py-0.5">
                                        <Ghost className="w-3 h-3" />
                                        {GHOST_LEVEL_LABELS[recommendedLp.cal!.ghostLevel]}
                                      </span>
                                      <span className="flex items-center gap-1 bg-ocher-100/60 rounded px-1.5 py-0.5">
                                        <Shield className="w-3 h-3" />
                                        {OCCLUSION_LEVEL_LABELS[recommendedLp.cal!.occlusionLevel]}
                                      </span>
                                      <span className="flex items-center gap-1 bg-ocher-100/60 rounded px-1.5 py-0.5">
                                        <ThermometerSun className="w-3 h-3" />
                                        色温{COLOR_TEMP_LABELS[recommendedLp.cal!.colorTempBias]}
                                      </span>
                                    </div>
                                  )}
                                  {!hasCalibratedLp && validLightPositions.length > 0 && (
                                    <p className="mt-1.5 text-xs text-ocher-400">
                                      暂无校准数据可推荐，请先在「光学校准」中录入评分
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="label-text">开始时间(秒)</label>
                                  <input
                                    type="number"
                                    min={0}
                                    className="input-field text-sm"
                                    value={entry.startTimeSec}
                                    onChange={(e) =>
                                      updateCharacterEntry(entry.id, {
                                        startTimeSec: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="label-text">结束时间(秒)</label>
                                  <input
                                    type="number"
                                    min={0}
                                    className="input-field text-sm"
                                    value={entry.endTimeSec}
                                    onChange={(e) =>
                                      updateCharacterEntry(entry.id, {
                                        endTimeSec: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="label-text">备注</label>
                                  <input
                                    className="input-field text-sm"
                                    value={entry.notes || ''}
                                    onChange={(e) =>
                                      updateCharacterEntry(entry.id, { notes: e.target.value })
                                    }
                                    placeholder="备注..."
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  className="btn-secondary !px-3 !py-1.5 text-sm flex items-center gap-1"
                                  onClick={() => setEditingEntryId(null)}
                                >
                                  <Save className="w-4 h-4" />
                                  保存
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4">
                              {!hasValidLp && (
                                <div className="mb-3 flex items-center gap-2 text-sm text-crimson bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                  <span className="font-bold">⚠️</span>
                                  <span>
                                    <strong>灯位无效</strong>：该出场使用的灯位方案未绑定有效灯具，
                                    请在「光学校准」中修复或重新选择灯位。
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between flex-wrap gap-3">
                              <div className="flex items-center gap-4 flex-wrap">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                  style={{ backgroundColor: color }}
                                >
                                  {idx + 1}
                                </div>
                                <ChevronRight className="w-4 h-4 text-ocher-300" />
                                <div>
                                  <p className="text-xs text-ocher-500">皮影角色</p>
                                  <p className="font-medium text-ocher-700 flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-ocher-400" />
                                    {puppet?.name || '未设置'}
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-ocher-300" />
                                <div>
                                  <p className="text-xs text-ocher-500">出场时段</p>
                                  <p className="font-medium text-ocher-700 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-ocher-400" />
                                    {formatTime(entry.startTimeSec)} -{' '}
                                    {formatTime(entry.endTimeSec)} (
                                    {entry.endTimeSec - entry.startTimeSec}秒)
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-ocher-300" />
                                <div>
                                  <p className="text-xs text-ocher-500">灯位方案</p>
                                  <p className={`font-medium flex items-center gap-2 ${hasValidLp ? 'text-ocher-700' : 'text-crimson'}`}>
                                    <Lightbulb className={`w-4 h-4 ${hasValidLp ? 'text-gold-400' : 'text-crimson'}`} />
                                    {hasValidLp ? lp?.name : '⚠ 无效灯位'}
                                  </p>
                                </div>
                                {entry.notes && (
                                  <div className="ml-4">
                                    <p className="text-xs text-ocher-400">备注</p>
                                    <p className="text-sm text-ocher-600">{entry.notes}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  className="p-2 text-ocher-500 hover:text-ocher-700 hover:bg-ocher-100 rounded-lg transition-colors"
                                  onClick={() => setEditingEntryId(entry.id)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-2 text-crimson/70 hover:text-crimson hover:bg-red-50 rounded-lg transition-colors"
                                  onClick={() => removeCharacterEntry(entry.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
