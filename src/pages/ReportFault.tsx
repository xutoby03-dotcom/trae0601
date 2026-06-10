import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import ElevatorSelector from '@/components/ElevatorSelector';
import type { ElevatorId, FaultPhenomenon } from '@/shared/types';
import { PHENOMENON_OPTIONS } from '@/shared/constants';
import {
  ArrowLeft,
  Upload,
  X,
  Clock,
  AlertTriangle,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  User,
  Info,
} from 'lucide-react';

const NOW_TS = Date.now();

const TIME_OPTIONS = [
  { label: '刚刚（5分钟内）', offset: 0 },
  { label: '10分钟前', offset: 10 },
  { label: '30分钟前', offset: 30 },
  { label: '1小时前', offset: 60 },
  { label: '2小时前', offset: 120 },
  { label: '半天前', offset: 720 },
  { label: '自定义', offset: -1 },
];

export default function ReportFault() {
  const nav = useNavigate();
  const { addTicket } = useAppStore();

  const [elevator, setElevator] = useState<ElevatorId>({ building: '', unit: '', elevatorNo: '' });
  const [phenomenon, setPhenomenon] = useState<FaultPhenomenon | ''>('');
  const [description, setDescription] = useState('');
  const [hasTrapped, setHasTrapped] = useState(false);
  const [trappedCount, setTrappedCount] = useState<number | ''>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [reportedBy, setReportedBy] = useState('');
  const [timeIdx, setTimeIdx] = useState(0);
  const [customTime, setCustomTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function occurredAt(): number {
    if (timeIdx === 6) {
      return customTime ? new Date(customTime).getTime() : NOW_TS;
    }
    return NOW_TS - TIME_OPTIONS[timeIdx].offset * 60 * 1000;
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4 - photos.length);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((p) => [...p, reader.result as string].slice(0, 4));
      };
      reader.readAsDataURL(f);
    });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!elevator.building) e.building = '请选择楼栋';
    if (!elevator.unit) e.unit = '请选择单元';
    if (!elevator.elevatorNo) e.elevatorNo = '请选择电梯';
    if (!phenomenon) e.phenomenon = '请选择故障现象';
    if (!description.trim()) e.description = '请描述故障情况';
    else if (description.trim().length < 5) e.description = '描述至少5个字，便于维修判断';
    if (hasTrapped && (trappedCount === '' || (trappedCount as number) < 1)) e.trappedCount = '请填写被困人数';
    if (!reportedBy.trim()) e.reportedBy = '请填写您的称呼或房号';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    const id = addTicket({
      elevator,
      phenomenon: phenomenon as FaultPhenomenon,
      description: description.trim(),
      hasTrapped,
      trappedCount: hasTrapped ? (trappedCount as number) : undefined,
      photos,
      occurredAt: occurredAt(),
      reportedBy: reportedBy.trim(),
    });
    setSubmitting(false);
    nav(`/fault/${id}?reported=1`, { replace: true });
  }

  return (
    <div className="container max-w-4xl py-6 pb-28 md:pb-10">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => nav(-1)} className="btn-ghost -ml-3">
          <ArrowLeft size={18} />
          返回
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">上报电梯故障</h1>
          <p className="text-xs text-slate-500 mt-0.5">请如实填写信息，您的每一次上报都能帮助邻居更快获得帮助</p>
        </div>
      </div>

      {hasTrapped && (
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 flex items-start gap-3 animate-fade-in">
          <AlertTriangle size={22} className="text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800 leading-relaxed">
            <div className="font-bold mb-0.5">涉及人员被困请注意</div>
            请同时拨打物业 24 小时电话 <span className="font-mono font-bold">400-800-8888</span> 或报警
            <span className="font-mono font-bold">119</span>。此系统用于信息同步，不作为紧急求救渠道。
          </div>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <section className="card p-5 md:p-6 space-y-5">
          <div className="section-title">
            <div className="w-1 h-5 rounded-full bg-brand-500" />
            电梯位置
          </div>
          <ElevatorSelector value={elevator} onChange={setElevator} />
          {(errors.building || errors.unit || errors.elevatorNo) && (
            <div className="text-xs text-red-500 -mt-2">
              {errors.building || errors.unit || errors.elevatorNo}
            </div>
          )}
        </section>

        <section className="card p-5 md:p-6 space-y-5">
          <div className="section-title">
            <div className="w-1 h-5 rounded-full bg-orange-500" />
            故障现象
          </div>

          <div>
            <label className="label">现象分类 <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PHENOMENON_OPTIONS.map((p) => {
                const active = phenomenon === p.value;
                return (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => setPhenomenon(p.value)}
                    className={`chip text-xs sm:text-sm justify-center ${active
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-card'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-500'}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            {errors.phenomenon && <div className="text-xs text-red-500 mt-1.5">{errors.phenomenon}</div>}
          </div>

          <div>
            <label className="label">情况描述 <span className="text-red-500">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="input resize-none"
              placeholder="请尽量详细描述：比如停在几楼、有无异响、按哪些键没反应等，500字以内"
            />
            <div className="flex justify-between mt-1 text-xs">
              <span className={errors.description ? 'text-red-500' : 'text-slate-400'}>
                {errors.description || '示例：电梯从12楼下行到8楼突然停下，按键无反应'}
              </span>
              <span className="text-slate-400 tabular-nums">{description.length}/500</span>
            </div>
          </div>

          <div>
            <label className="label">现场照片（最多4张）</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group"
                >
                  <img src={p} alt="现场" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {photos.length < 4 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-brand-500 hover:bg-brand-50/50 transition-all cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-brand-500">
                  <Upload size={24} className="mb-1" />
                  <span className="text-xs">上传图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>
        </section>

        <section className="card p-5 md:p-6 space-y-5">
          <div className="section-title">
            <div className="w-1 h-5 rounded-full bg-red-500" />
            人员安全
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
            <input
              type="checkbox"
              checked={hasTrapped}
              onChange={(e) => setHasTrapped(e.target.checked)}
              className="mt-1 w-4 h-4 accent-red-500"
            />
            <div className="flex-1">
              <div className="font-semibold text-slate-800 text-sm">有人员被困在电梯内</div>
              <div className="text-xs text-slate-500 mt-0.5">如遇被困请同时拨打物业紧急电话或 119</div>
            </div>
          </label>

          {hasTrapped && (
            <div className="animate-fade-in">
              <label className="label">被困人数</label>
              <input
                type="number"
                min={1}
                max={20}
                value={trappedCount}
                onChange={(e) => setTrappedCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="input max-w-xs"
                placeholder="例如：2"
              />
              {errors.trappedCount && <div className="text-xs text-red-500 mt-1.5">{errors.trappedCount}</div>}
            </div>
          )}
        </section>

        <section className="card p-5 md:p-6 space-y-5">
          <div className="section-title">
            <div className="w-1 h-5 rounded-full bg-emerald-500" />
            其他信息
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Clock size={13} />
              发生时间
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((t, i) => (
                <button
                  type="button"
                  key={t.label}
                  onClick={() => setTimeIdx(i)}
                  className={`chip text-xs ${timeIdx === i
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-400'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {timeIdx === 6 && (
              <input
                type="datetime-local"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="input mt-3 max-w-xs"
              />
            )}
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <User size={13} />
              称呼 / 房号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              maxLength={20}
              className="input max-w-xs"
              placeholder="例如：李先生 / A1栋1802"
            />
            {errors.reportedBy && <div className="text-xs text-red-500 mt-1.5">{errors.reportedBy}</div>}
          </div>
        </section>

        <div className="flex items-start gap-2 p-4 rounded-xl bg-brand-50/60 border border-brand-100 text-xs text-brand-700">
          <Info size={14} className="mt-0.5 shrink-0" />
          <div>
            提交后信息将对全小区可见，物业人员会尽快接单处理；请不要虚报或恶作剧，以免占用公共资源。
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end sticky bottom-4 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-3 shadow-pop">
          <button type="button" onClick={() => nav(-1)} className="btn-outline sm:min-w-[120px]">
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className={`btn-primary sm:min-w-[160px] ${submitting ? 'opacity-80' : ''}`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" opacity=".25" />
                  <path d="M22 12a10 10 0 0 1-10 10" strokeLinecap="round" />
                </svg>
                提交中...
              </>
            ) : (
              <>
                <Send size={16} />
                提交故障工单
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
