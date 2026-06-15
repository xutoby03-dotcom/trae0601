import { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus, UserPlus, Check, Camera, Trash2, Save, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { compressImage, cn, generateId, todayStr } from '../utils/helpers';

interface FormData {
  lockName: string; lockLocation: string; totalQuantity: number; trusteeId: string;
  storageLocation: string; deliveryDate: string; lastVerifiedDate: string; photos: string[];
}
interface TForm { name: string; relation: string; phone: string; address: string; }

const KeyFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const trustees = useStore((s) => s.trustees);
  const keyArchives = useStore((s) => s.keyArchives);
  const addTrustee = useStore((s) => s.addTrustee);
  const addKeyArchive = useStore((s) => s.addKeyArchive);
  const updateKeyArchive = useStore((s) => s.updateKeyArchive);
  const existing = useMemo(() => keyArchives.find((k) => k.id === id), [keyArchives, id]);
  const today = todayStr();

  const [form, setForm] = useState<FormData>({
    lockName: existing?.lockName ?? '', lockLocation: existing?.lockLocation ?? '',
    totalQuantity: existing?.totalQuantity ?? 1, trusteeId: existing?.trusteeId ?? '',
    storageLocation: existing?.storageLocation ?? '', deliveryDate: existing?.deliveryDate ?? today,
    lastVerifiedDate: existing?.lastVerifiedDate ?? today, photos: existing?.photos ?? [],
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [tForm, setTForm] = useState<TForm>({ name: '', relation: '', phone: '', address: '' });
  const [tErr, setTErr] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const selT = trustees.find((t) => t.id === form.trusteeId);

  const upd = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: false }));
  };
  const updT = <K extends keyof TForm>(k: K, v: TForm[K]) => {
    setTForm((f) => ({ ...f, [k]: v }));
    if (tErr[k]) setTErr((e) => ({ ...e, [k]: false }));
  };

  const validate = () => {
    const e: Record<string, boolean> = {};
    if (!form.lockName.trim()) e.lockName = true;
    if (!form.totalQuantity || form.totalQuantity < 1) e.totalQuantity = true;
    if (!form.trusteeId) e.trusteeId = true;
    if (!form.storageLocation.trim()) e.storageLocation = true;
    if (!form.deliveryDate) e.deliveryDate = true;
    setErrors(e);
    return !Object.keys(e).length;
  };
  const validateT = () => {
    const e: Record<string, boolean> = {};
    if (!tForm.name.trim()) e.name = true;
    if (!tForm.relation.trim()) e.relation = true;
    if (!tForm.phone.trim()) e.phone = true;
    setTErr(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && existing) { updateKeyArchive(existing.id, form); navigate(`/keys/${existing.id}`); }
      else {
        addKeyArchive(form);
        const a = useStore.getState().keyArchives;
        navigate(`/keys/${a[a.length - 1]?.id ?? generateId()}`);
      }
    } finally { setLoading(false); }
  };

  const handlePhotos = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files).filter((x) => x.type.startsWith('image/'))) {
      try {
        const compressed = await compressImage(f, 500);
        setForm((p) => ({ ...p, photos: [...p.photos, compressed] }));
      } catch {
        void 0;
      }
    }
  };
  const removePhoto = (i: number) => setForm((f) => ({ ...f, photos: f.photos.filter((_, x) => x !== i) }));
  const onDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type !== 'dragleave'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); handlePhotos(e.dataTransfer.files); };

  const addT = () => {
    if (!validateT()) return;
    addTrustee({ ...tForm, isFamily: false, movedFlag: false });
    const ts = useStore.getState().trustees;
    if (ts.length) upd('trusteeId', ts[ts.length - 1].id);
    setShowModal(false);
    setTForm({ name: '', relation: '', phone: '', address: '' });
  };

  const ie = (k: string) => errors[k] && 'input-error';
  const te = (k: string) => tErr[k] && 'input-error';
  const L = (t: string, req?: boolean) => <label className="label">{t}{req && <span className="text-coral-500">*</span>}</label>;

  return (
    <div className="space-y-5 pb-safe">
      <div className="flex items-center justify-between animate-fade-in-up">
        <Link to={isEdit && existing ? `/keys/${existing.id}` : '/keys'} className="btn-ghost !px-3">
          <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">返回</span>
        </Link>
        <h1 className="font-serif text-xl md:text-2xl font-bold text-navy-800">{isEdit ? '编辑钥匙' : '新增钥匙'}</h1>
        <div className="w-[72px]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl mx-auto">
        <section className="card p-5 md:p-6 space-y-5 animate-fade-in-up">
          <h2 className="title-serif text-lg flex items-center gap-2"><span className="w-1 h-6 bg-amber-400 rounded-full" />基本信息</h2>
          <div className="space-y-4">
            <div>{L('门锁名称', true)}<input type="text" value={form.lockName} onChange={(e) => upd('lockName', e.target.value)} placeholder="如：大门防盗门锁" className={cn('input h-[56px] text-base', ie('lockName'))} /></div>
            <div>{L('门锁位置')}<input type="text" value={form.lockLocation} onChange={(e) => upd('lockLocation', e.target.value)} placeholder="如：正门·防盗门锁" className="input h-[56px] text-base" /></div>
            <div>{L('钥匙数量', true)}<input type="number" min={1} value={form.totalQuantity} onChange={(e) => upd('totalQuantity', parseInt(e.target.value) || 1)} className={cn('input h-[56px] text-base', ie('totalQuantity'))} /></div>
          </div>
        </section>

        <section className="card p-5 md:p-6 space-y-5 animate-fade-in-up">
          <h2 className="title-serif text-lg flex items-center gap-2"><span className="w-1 h-6 bg-amber-400 rounded-full" />托管信息</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="label !mb-0">托管人 <span className="text-coral-500">*</span></div>
                <button type="button" onClick={() => setShowModal(true)} className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                  <UserPlus className="w-4 h-4" />新增托管人
                </button>
              </div>
              <select value={form.trusteeId} onChange={(e) => upd('trusteeId', e.target.value)} className={cn('appearance-none input h-[56px] text-base cursor-pointer pr-10', ie('trusteeId'))}>
                <option value="">请选择托管人</option>
                {trustees.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.relation}</option>)}
              </select>
              {selT && (
                <div className="mt-3 p-4 rounded-xl bg-amber-50 border border-amber-100 animate-fade-in-up">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-xl shrink-0">{selT.name.charAt(0)}</div>
                    <div className="min-w-0 flex-1 space-y-1 text-sm">
                      <p className="font-semibold text-navy-800">{selT.name} <span className="text-navy-400 font-normal">· {selT.relation}</span></p>
                      <p className="text-navy-600">📞 {selT.phone}</p>
                      {selT.address && <p className="text-navy-500 truncate">📍 {selT.address}</p>}
                      {selT.movedFlag && <span className="badge bg-coral-100 text-coral-700">已搬家</span>}
                    </div>
                    <Check className="w-5 h-5 text-mint-500 shrink-0" />
                  </div>
                </div>
              )}
            </div>
            <div>{L('存放位置', true)}<textarea value={form.storageLocation} onChange={(e) => upd('storageLocation', e.target.value)} placeholder="如：鞋柜抽屉铁盒子里" rows={3} className={cn('input text-base resize-none', ie('storageLocation'))} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>{L('交付日期', true)}<input type="date" value={form.deliveryDate} onChange={(e) => upd('deliveryDate', e.target.value)} className={cn('input h-[56px] text-base', ie('deliveryDate'))} /></div>
              <div>{L('上次核对日期')}<input type="date" value={form.lastVerifiedDate} onChange={(e) => upd('lastVerifiedDate', e.target.value)} className="input h-[56px] text-base" /></div>
            </div>
          </div>
        </section>

        <section className="card p-5 md:p-6 space-y-5 animate-fade-in-up">
          <h2 className="title-serif text-lg flex items-center gap-2"><span className="w-1 h-6 bg-amber-400 rounded-full" />照片资料</h2>
          <div className="space-y-4">
            <div onClick={() => fileRef.current?.click()} onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop}
              className={cn('cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200',
                dragActive ? 'border-amber-400 bg-amber-50' : 'border-cream-300 bg-cream-50 hover:border-amber-300 hover:bg-amber-50/50')}>
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3"><Camera className="w-8 h-8 text-amber-500" /></div>
              <p className="font-medium text-navy-700">点击或拖拽上传照片</p>
              <p className="text-sm text-navy-400 mt-1">支持多张，自动压缩至 500KB</p>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => handlePhotos(e.target.files)} className="hidden" />
            </div>
            {!!form.photos.length && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.photos.map((p, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-cream-200">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-coral-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-coral-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="sticky bottom-0 pt-2 -mx-4 px-4 pb-4 md:static md:p-0 bg-gradient-to-t from-cream-100 via-cream-100/90 to-transparent md:bg-transparent">
          <button type="submit" disabled={loading} className="btn-accent btn-lg w-full shadow-glow-gold">
            {loading ? <Upload className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEdit ? '保存修改' : '创建档案'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </form>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-navy-900/50 backdrop-blur-sm animate-fade-in-up p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-cream-200">
              <h3 className="title-serif text-lg flex items-center gap-2"><UserPlus className="w-5 h-5 text-amber-500" />新增托管人</h3>
              <button type="button" onClick={() => { setShowModal(false); setTErr({}); }} className="p-2 rounded-lg hover:bg-cream-100 text-navy-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>{L('姓名', true)}<input type="text" value={tForm.name} onChange={(e) => updT('name', e.target.value)} placeholder="请输入姓名" className={cn('input h-[52px]', te('name'))} /></div>
              <div>{L('关系', true)}<input type="text" value={tForm.relation} onChange={(e) => updT('relation', e.target.value)} placeholder="如：邻居、亲戚" className={cn('input h-[52px]', te('relation'))} /></div>
              <div>{L('电话', true)}<input type="tel" value={tForm.phone} onChange={(e) => updT('phone', e.target.value)} placeholder="请输入联系电话" className={cn('input h-[52px]', te('phone'))} /></div>
              <div>{L('地址')}<input type="text" value={tForm.address} onChange={(e) => updT('address', e.target.value)} placeholder="请输入地址（可选）" className="input h-[52px]" /></div>
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button type="button" onClick={() => { setShowModal(false); setTErr({}); }} className="btn-secondary flex-1">取消</button>
              <button type="button" onClick={addT} className="btn-accent flex-1"><Plus className="w-4 h-4" />添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyFormPage;
