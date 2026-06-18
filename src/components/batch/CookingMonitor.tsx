import { useState } from 'react';
import { Plus, Thermometer, Droplets, MessageSquare, Clock } from 'lucide-react';
import type { Batch, SkimStatus, CookingRecord } from '@/types';
import { useBatchStore } from '@/store/useBatchStore';
import StatusBadge from '@/components/common/StatusBadge';
import ProgressBar from '@/components/common/ProgressBar';
import { SKIM_STATUS_LABEL, SKIM_STATUS_COLOR, COOKING_DURATION_MIN } from '@/utils/soupConfig';
import { formatDateTime, formatDuration, getDurationMinutes } from '@/utils/helpers';

interface Props {
  batch: Batch;
}

const SKIM_OPTIONS: SkimStatus[] = ['not-done', 'partial', 'thorough'];
const TASTE_PRESETS = ['味道正好', '略偏咸', '偏咸', '略偏淡', '偏淡', '油腻', '香气浓郁', '汤色清亮'];

export default function CookingMonitor({ batch }: Props) {
  const addCookingRecord = useBatchStore((s) => s.addCookingRecord);
  const [showForm, setShowForm] = useState(false);
  const [temp, setTemp] = useState(batch.cookingRecords.length ? batch.cookingRecords[batch.cookingRecords.length - 1].temperature : 92);
  const [salinity, setSalinity] = useState(batch.cookingRecords.length ? batch.cookingRecords[batch.cookingRecords.length - 1].salinity : 0.8);
  const [waterAdded, setWaterAdded] = useState(0);
  const [skim, setSkim] = useState<SkimStatus>('partial');
  const [taste, setTaste] = useState('');

  const elapsed = getDurationMinutes(batch.startTime, batch.finishTime);
  const total = COOKING_DURATION_MIN[batch.soupType] || 180;
  const latest = batch.cookingRecords[batch.cookingRecords.length - 1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCookingRecord(batch.id, {
      temperature: temp,
      salinity,
      waterAddedL: waterAdded,
      skimStatus: skim,
      tasteComment: taste || '未记录',
    });
    setShowForm(false);
    setWaterAdded(0);
    setTaste('');
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-broth-800">熬制进度</h3>
          {(batch.status === 'cooking' || batch.status === 'preparing') && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary !py-2 flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4" />
              添加记录
            </button>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-broth-500">已熬制 <span className="font-semibold text-broth-800">{formatDuration(elapsed)}</span></span>
            <span className="text-broth-500">预计总时长 <span className="font-semibold text-broth-800">{formatDuration(total)}</span></span>
          </div>
          <ProgressBar value={elapsed} max={total} color="fire" size="lg" />
        </div>

        {latest && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-broth-50">
            <div className="text-center p-3 rounded-xl bg-fire-50">
              <Thermometer className="w-5 h-5 text-fire-500 mx-auto mb-1" />
              <p className="text-xs text-broth-500">当前温度</p>
              <p className="font-display text-2xl font-bold text-broth-800">{latest.temperature}<span className="text-sm">°C</span></p>
            </div>
            <div className="text-center p-3 rounded-xl bg-soup-50">
              <Droplets className="w-5 h-5 text-soup-600 mx-auto mb-1" />
              <p className="text-xs text-broth-500">盐度</p>
              <p className="font-display text-2xl font-bold text-broth-800">{latest.salinity.toFixed(2)}<span className="text-sm">%</span></p>
            </div>
            <div className="text-center p-3 rounded-xl bg-blue-50">
              <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-broth-500">累计补水</p>
              <p className="font-display text-2xl font-bold text-broth-800">
                {batch.cookingRecords.reduce((s, r) => s + r.waterAddedL, 0)}<span className="text-sm">L</span>
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-green-50">
              <MessageSquare className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-broth-500">记录次数</p>
              <p className="font-display text-2xl font-bold text-broth-800">{batch.cookingRecords.length}</p>
            </div>
          </div>
        )}
      </div>

      {showForm && (batch.status === 'cooking' || batch.status === 'preparing') && (
        <div className="card bg-gradient-to-br from-soup-50 to-white">
          <h4 className="font-bold text-broth-800 mb-4">记录熬制数据</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-fire-500" />温度 (°C)
              </label>
              <input
                type="number"
                step="0.5"
                className="input-field"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-soup-600" />盐度 (%)
              </label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={salinity}
                onChange={(e) => setSalinity(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">补水量 (L)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="input-field"
                value={waterAdded}
                onChange={(e) => setWaterAdded(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">撇油情况</label>
              <div className="grid grid-cols-3 gap-2">
                {SKIM_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSkim(s)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${
                      skim === s
                        ? `${SKIM_STATUS_COLOR[s]} ring-2 ring-offset-1`
                        : 'bg-broth-50 text-broth-500 hover:bg-broth-100'
                    }`}
                  >
                    {SKIM_STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">试味评价</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {TASTE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTaste(taste === p ? '' : p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      taste === p
                        ? 'bg-fire-500 text-white'
                        : 'bg-broth-50 text-broth-600 hover:bg-broth-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="input-field"
                placeholder="或输入详细评价..."
                value={taste}
                onChange={(e) => setTaste(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
              <button type="submit" className="btn-primary">保存记录</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="font-display text-lg font-bold text-broth-800 mb-4">熬制记录时间线</h3>
        {batch.cookingRecords.length === 0 ? (
          <div className="py-10 text-center text-broth-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>暂无熬制记录</p>
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-fire-300 to-soup-200" />
            {[...batch.cookingRecords].reverse().map((r, idx) => (
              <CookingRecordItem key={r.id} record={r} isLast={idx === batch.cookingRecords.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CookingRecordItem({ record, isLast }: { record: CookingRecord; isLast: boolean }) {
  return (
    <div className="relative pb-5">
      <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 border-white ${isLast ? 'bg-fire-500 animate-pulse' : 'bg-soup-400'} shadow-md`} />
      <div className="bg-broth-50/70 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <p className="text-sm font-semibold text-broth-800">{formatDateTime(record.recordTime)}</p>
          <StatusBadge type="skim" value={record.skimStatus} />
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm mb-2">
          <div>
            <span className="text-broth-500 text-xs">温度</span>
            <p className="font-semibold text-broth-800">{record.temperature}°C</p>
          </div>
          <div>
            <span className="text-broth-500 text-xs">盐度</span>
            <p className="font-semibold text-broth-800">{record.salinity.toFixed(2)}%</p>
          </div>
          <div>
            <span className="text-broth-500 text-xs">补水</span>
            <p className="font-semibold text-broth-800">{record.waterAddedL > 0 ? `${record.waterAddedL}L` : '—'}</p>
          </div>
        </div>
        <p className="text-sm text-broth-600 italic">「{record.tasteComment}」</p>
      </div>
    </div>
  );
}
