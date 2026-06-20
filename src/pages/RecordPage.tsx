import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  PenLine, Star, Eye, EyeOff, AlertOctagon, Layers, Save,
  Camera, Settings, ChevronDown, ChevronUp, CheckCircle2, Calendar,
  X, Image, Clock, Zap
} from 'lucide-react';
import { useAstroStore } from '@/store/useAstroStore';
import { DEEP_SKY_TARGETS } from '@/data/constellations';
import { formatDateChinese } from '@/utils/astro';
import type { DeepSkyTarget, FailReason, ObservationRecord } from '@/types';

function getTargetById(id: string): DeepSkyTarget | undefined {
  return DEEP_SKY_TARGETS.find(t => t.id === id);
}

const FAIL_REASONS: { key: FailReason; label: string; icon: string }[] = [
  { key: 'weather', label: '天气突变', icon: '🌧️' },
  { key: 'equipment', label: '设备故障', icon: '🔧' },
  { key: 'too_low', label: '目标过低', icon: '📉' },
  { key: 'light_pollution', label: '光污染严重', icon: '💡' },
  { key: 'fatigue', label: '体力不支', icon: '😴' },
  { key: 'other', label: '其他原因', icon: '❓' },
];

const SOFTWARE_OPTIONS = ['DeepSkyStacker', 'PixInsight', 'Siril', 'Photoshop', 'Lightroom', 'Affinity Photo', '其他'];

function createEmptyRecord(date: string, targetId: string, targetName: string): Omit<ObservationRecord, 'id' | 'createdAt'> {
  return {
    date,
    targetId,
    targetName,
    seen: true,
    seeing: 3,
    iso: '',
    shutter: '',
    aperture: '',
    frames: 0,
    darkFrames: '',
    flatFrames: '',
    biasFrames: '',
    failReason: '',
    failReasonLabel: '',
    stackNotes: '',
    software: '',
    totalExposure: '',
    notes: '',
  };
}

function TargetRecordForm({
  target,
  date,
  existingRecord,
}: {
  target: { id: string; name: string; commonName?: string };
  date: string;
  existingRecord?: ObservationRecord;
}) {
  const saveRecord = useAstroStore(s => s.saveRecord);
  const updateRecord = useAstroStore(s => s.updateRecord);

  const [form, setForm] = useState<Omit<ObservationRecord, 'id' | 'createdAt'>>(
    existingRecord
      ? (({ id: _id, createdAt: _c, ...rest }) => rest)(existingRecord)
      : createEmptyRecord(date, target.id, target.name)
  );
  const [expanded, setExpanded] = useState(!existingRecord);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const handleSave = () => {
    if (existingRecord) {
      updateRecord(existingRecord.id, form);
    } else {
      saveRecord(form);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fullTarget = getTargetById(target.id);

  return (
    <div className={`glass-card overflow-hidden ${!form.seen && form.failReason ? 'border-red-500/20 bg-red-500/[0.02]' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${existingRecord || saved
              ? 'bg-aurora-green/15 border border-aurora-green/30'
              : 'bg-white/5 border border-white/10'}`}>
            {existingRecord || saved ? (
              <CheckCircle2 className="w-5 h-5 text-aurora-green" />
            ) : (
              <PenLine className="w-5 h-5 text-white/60" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white truncate">{target.name}</p>
              {!form.seen && form.failReason && (
                <span className="chip chip-hard text-[10px]">未成功</span>
              )}
              {form.seen && (existingRecord || saved) && (
                <span className="chip chip-easy text-[10px]">已观测</span>
              )}
            </div>
            {target.commonName && (
              <p className="text-xs text-white/50 truncate">{target.commonName}{fullTarget ? ` · ${fullTarget.constellation}` : ''}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {form.seen && form.frames > 0 && (
            <span className="chip bg-white/5 border-white/10 text-[10px] text-white/60">
              {form.frames}张
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-white/40" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/40" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-aurora-green" />
                观测情况
              </h4>

              <div className="flex gap-2">
                <button
                  onClick={() => update('seen', true)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5
                    ${form.seen
                      ? 'bg-aurora-green/20 text-aurora-green border border-aurora-green/30'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'}`}
                >
                  <Eye className="w-3.5 h-3.5" /> 成功看到
                </button>
                <button
                  onClick={() => update('seen', false)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5
                    ${!form.seen
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'}`}
                >
                  <EyeOff className="w-3.5 h-3.5" /> 未观测到
                </button>
              </div>

              {form.seen && (
                <div>
                  <p className="text-[11px] text-white/50 mb-2">视宁度 Seeing（1-5，越高越稳定）</p>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => {
                      const active = form.seeing >= n;
                      return (
                        <button
                          key={n}
                          onClick={() => update('seeing', n)}
                          className={`flex-1 py-2 rounded-lg transition-all text-sm
                            ${active
                              ? 'bg-moonlight/20 border border-moonlight/30 text-moonlight'
                              : 'bg-white/5 border border-white/10 text-white/30 hover:bg-white/10'}`}
                        >
                          <Star className={`w-4 h-4 mx-auto ${active ? 'fill-current' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-white/40 text-center mt-1.5">
                    {form.seeing <= 2 ? '较差，抖动明显' : form.seeing === 3 ? '中等，可接受' : form.seeing === 4 ? '良好，较为稳定' : '极佳，稳如磐石'}
                  </p>
                </div>
              )}

              {!form.seen && (
                <div>
                  <p className="text-[11px] text-white/50 mb-2 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    失败原因
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FAIL_REASONS.map(r => {
                      const active = form.failReason === r.key;
                      return (
                        <button
                          key={r.key}
                          onClick={() => {
                            update('failReason', active ? '' : r.key);
                            update('failReasonLabel', active ? '' : r.label);
                          }}
                          className={`px-2.5 py-2 rounded-lg text-[11px] transition-all flex items-center gap-1.5
                            ${active
                              ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                              : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'}`}
                        >
                          <span>{r.icon}</span>
                          <span>{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-nebula-purple" />
                曝光参数
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-white/40 mb-1 block">ISO</label>
                  <select
                    value={form.iso}
                    onChange={(e) => update('iso', e.target.value)}
                    className="input-field !py-2 text-sm"
                  >
                    <option value="" className="bg-space-900">选择</option>
                    {[100, 200, 400, 800, 1600, 3200, 6400, 12800].map(v => (
                      <option key={v} value={String(v)} className="bg-space-900">ISO {v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 mb-1 block">光圈</label>
                  <select
                    value={form.aperture}
                    onChange={(e) => update('aperture', e.target.value)}
                    className="input-field !py-2 text-sm"
                  >
                    <option value="" className="bg-space-900">选择</option>
                    {['f/1.4', 'f/1.8', 'f/2', 'f/2.8', 'f/4', 'f/5.6', 'f/6.3', 'f/8', 'f/10'].map(v => (
                      <option key={v} value={v} className="bg-space-900">{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 mb-1 block">单张快门</label>
                  <select
                    value={form.shutter}
                    onChange={(e) => update('shutter', e.target.value)}
                    className="input-field !py-2 text-sm"
                  >
                    <option value="" className="bg-space-900">选择</option>
                    {['5s', '10s', '15s', '20s', '30s', '45s', '60s', '90s', '120s', '180s', '240s', '300s'].map(v => (
                      <option key={v} value={v} className="bg-space-900">{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 mb-1 block">光张数</label>
                  <input
                    type="number"
                    min="0"
                    value={form.frames || ''}
                    onChange={(e) => update('frames', Number(e.target.value) || 0)}
                    placeholder="张数"
                    className="input-field !py-2 text-sm"
                  />
                </div>
              </div>

              <p className="text-[11px] text-white/40 flex items-center gap-1.5 pt-1 border-t border-white/5">
                <Settings className="w-3.5 h-3.5" /> 校准帧（可选）
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 mb-1 block">暗场</label>
                  <input
                    value={form.darkFrames}
                    onChange={(e) => update('darkFrames', e.target.value)}
                    placeholder="如50x30s"
                    className="input-field !py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 mb-1 block">平场</label>
                  <input
                    value={form.flatFrames}
                    onChange={(e) => update('flatFrames', e.target.value)}
                    placeholder="如40x2s"
                    className="input-field !py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 mb-1 block">偏置</label>
                  <input
                    value={form.biasFrames}
                    onChange={(e) => update('biasFrames', e.target.value)}
                    placeholder="如100张"
                    className="input-field !py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-nebula-cyan" />
              叠加后期
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-white/40 mb-1.5 block flex items-center gap-1.5">
                  <Image className="w-3 h-3" /> 后期处理软件
                </label>
                <select
                  value={form.software}
                  onChange={(e) => update('software', e.target.value)}
                  className="input-field !py-2 text-sm"
                >
                  <option value="" className="bg-space-900">选择软件</option>
                  {SOFTWARE_OPTIONS.map(s => (
                    <option key={s} value={s} className="bg-space-900">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-white/40 mb-1.5 block flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> 总累计曝光
                </label>
                <input
                  value={form.totalExposure}
                  onChange={(e) => update('totalExposure', e.target.value)}
                  placeholder="如 3小时 或 180分钟"
                  className="input-field !py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1.5 block">叠加/处理备注</label>
              <textarea
                rows={2}
                value={form.stackNotes}
                onChange={(e) => update('stackNotes', e.target.value)}
                placeholder="叠加过程中的问题、预处理注意事项、调色心得、降噪技巧..."
                className="input-field !py-2 text-sm resize-none"
              />
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-moonlight" />
                心得备注
              </h4>
              {fullTarget && (
                <span className="text-[11px] text-white/40">
                  建议参数：{fullTarget.exposureSuggestion}
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="这次观测的心得：寻星过程、构图灵感、下次改进建议..."
              className="input-field !py-2 text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setExpanded(false)}
              className="btn-secondary !py-2 text-sm"
            >
              <X className="w-4 h-4" /> 收起
            </button>
            <button
              onClick={handleSave}
              className={`btn-primary !py-2 text-sm ${saved ? '!bg-aurora-green !from-aurora-green !to-aurora-green' : ''}`}
            >
              <Save className="w-4 h-4" />
              {saved ? '已保存 ✓' : '保存记录'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecordPage() {
  const params = useParams<{ date: string }>();
  const date = params.date ?? useAstroStore(s => s.selectedDate);

  const checklistTargets = useAstroStore(s => s.checklistTargets);
  const records = useAstroStore(s => s.records);
  const getRecordsByDate = useAstroStore(s => s.getRecordsByDate);
  const setSelectedDate = useAstroStore(s => s.setSelectedDate);

  const existing = useMemo(() => {
    const list = getRecordsByDate(date);
    const map = new Map<string, ObservationRecord>();
    list.forEach(r => map.set(r.targetId, r));
    return map;
  }, [records, date]);

  useMemo(() => {
    if (date) setSelectedDate(date);
  }, [date]);

  const targetsToShow = checklistTargets.length > 0
    ? [...checklistTargets].sort((a, b) => a.order - b.order)
        .map(c => ({ id: c.targetId, name: c.target.name, commonName: c.target.commonName }))
    : [];

  return (
    <div className="space-y-8">
      <section>
        <div className="inline-flex items-center gap-2 chip bg-aurora-green/15 border border-aurora-green/30 text-aurora-green mb-3 px-3 py-1.5">
          <PenLine className="w-3.5 h-3.5" />
          <span className="font-medium">现场记录</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
          <span className="text-gradient">观测记录</span>
        </h1>
        <p className="text-white/50 text-base flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {formatDateChinese(date)} · 已记录 {existing.size} / {targetsToShow.length || '?'} 个目标
        </p>
      </section>

      {targetsToShow.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white/5 flex items-center justify-center text-5xl">
            📝
          </div>
          <p className="text-white/60 mb-2">这天的观测清单是空的</p>
          <p className="text-xs text-white/40 mb-5">
            请先在「观测清单」中添加你计划观测的目标
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="#/"
              onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; }}
              className="btn-secondary"
            >
              返回观测计划
            </a>
            <a
              href="#/checklist"
              onClick={(e) => { e.preventDefault(); window.location.hash = '#/checklist'; }}
              className="btn-primary"
            >
              去准备清单
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {targetsToShow.map(t => (
            <TargetRecordForm
              key={t.id}
              target={t}
              date={date}
              existingRecord={existing.get(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
