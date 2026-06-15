import { useRef, useState } from 'react';
import { Users, Settings2, Edit2, Trash2, UserPlus, Home, Download, Upload, RefreshCw, Check, Info, Phone, User, Tag, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/helpers';
import type { FamilyMember, KeyTrustee } from '../types';

const EMOJIS = ['👨','👩','👦','👧','👴','👵','🧑','👱','🧔','👰','🧓','🧒'];
const COLORS = ['#2d5c8e','#c98f30','#32b5ac','#ff6b6b','#789cbd','#85591e','#1d6e69','#e52e2e'];
type ModalMode = 'add' | 'edit';
interface MemberForm { name:string; relation:string; avatarEmoji:string; phone:string; colorTag:string; }
interface TrusteeForm { name:string; relation:string; phone:string; address:string; }

const SettingsPage = () => {
  const familyMembers = useStore((st) => st.familyMembers);
  const trustees = useStore((st) => st.trustees);
  const settings = useStore((st) => st.settings);
  const addFamilyMember = useStore((st) => st.addFamilyMember);
  const updateFamilyMember = useStore((st) => st.updateFamilyMember);
  const deleteFamilyMember = useStore((st) => st.deleteFamilyMember);
  const updTR = useStore((st) => st.updateTrustee);
  const updCfg = useStore((st) => st.updateSettings);
  const genRem = useStore((st) => st.generateReminders);
  const fileRef = useRef<HTMLInputElement>(null);
  const [threshold, setThreshold] = useState(settings.unverifiedDaysThreshold);

  const [mmOpen, setMmOpen] = useState(false);
  const [mmMode, setMmMode] = useState<ModalMode>('add');
  const [editFMId, setEditFMId] = useState<string | null>(null);
  const [mForm, setMForm] = useState<MemberForm>({ name:'', relation:'', avatarEmoji:'👨', phone:'', colorTag:COLORS[0] });

  const [tmOpen, setTmOpen] = useState(false);
  const [editTRId, setEditTRId] = useState<string | null>(null);
  const [tForm, setTForm] = useState<TrusteeForm>({ name:'', relation:'', phone:'', address:'' });

  const openAddFM = () => { setMmMode('add'); setEditFMId(null); setMForm({ name:'', relation:'', avatarEmoji:'👨', phone:'', colorTag:COLORS[0] }); setMmOpen(true); };
  const openEditFM = (m:FamilyMember) => { setMmMode('edit'); setEditFMId(m.id); setMForm({ name:m.name, relation:m.relation, avatarEmoji:m.avatarEmoji, phone:m.phone, colorTag:m.colorTag }); setMmOpen(true); };
  const saveFM = () => { if (!mForm.name.trim()) return; mmMode==='add' ? addFamilyMember(mForm) : editFMId && updateFamilyMember(editFMId, mForm); setMmOpen(false); };
  const handleDeleteMember = (id:string) => { if (window.confirm('确定删除该家庭成员吗？')) deleteFamilyMember(id); };
  const openEditTR = (t:KeyTrustee) => { setEditTRId(t.id); setTForm({ name:t.name, relation:t.relation, phone:t.phone, address:t.address }); setTmOpen(true); };
  const saveTR = () => { if (!tForm.name.trim() || !editTRId) return; updTR(editTRId, tForm); setTmOpen(false); };
  const toggleMoved = (t:KeyTrustee) => { const a=t.movedFlag?'取消':'标记'; if (window.confirm(`确定${a}"${t.name}"为搬家状态吗？`)) updTR(t.id,{ movedFlag:!t.movedFlag }); };
  const changeThr = (v:number) => { const c=Math.max(7,Math.min(365,v)); setThreshold(c); updCfg({ unverifiedDaysThreshold:c }); };
  const doScan = () => { if (window.confirm('立即扫描所有钥匙档案生成提醒？')) { genRem(); alert('扫描完成！'); } };
  const doExport = () => {
    const st = useStore.getState(); const d = { familyMembers:st.familyMembers, trustees:st.trustees, keyArchives:st.keyArchives, borrowRecords:st.borrowRecords, reminders:st.reminders, settings:st.settings, exportedAt:new Date().toISOString() };
    const blob = new Blob([JSON.stringify(d,null,2)],{ type:'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `key-keeper-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const doImport = (e:React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target?.result as string);
        if (window.confirm('导入将覆盖所有数据，确定继续？此操作不可撤销。')) {
          useStore.setState({ familyMembers:d.familyMembers||[], trustees:d.trustees||[], keyArchives:d.keyArchives||[], borrowRecords:d.borrowRecords||[], reminders:d.reminders||[], settings:d.settings||settings });
          alert('导入成功！');
        }
      } catch { alert('文件格式错误，请选择有效的备份文件。'); }
    }; r.readAsText(f); e.target.value = '';
  };

  const ST = ({ icon:Icon, title }:{ icon:typeof Users; title:string }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-amber-500" strokeWidth={2.2} />
      </div>
      <h2 className="font-serif text-xl md:text-2xl font-bold text-navy-800">{title}</h2>
    </div>
  );

  const Modal = ({ open, title, onClose, children, onSave, saveText }:{ open:boolean; title:string; onClose:()=>void; children:React.ReactNode; onSave:()=>void; saveText:string }) => open && (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-navy-900/60 backdrop-blur-sm animate-fade-in-up p-0 md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-cream-200 p-5 flex items-center justify-between rounded-t-3xl md:rounded-t-2xl z-10">
          <h3 className="font-serif text-lg font-bold text-navy-800">{title}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-cream-100 flex items-center justify-center"><X className="w-5 h-5 text-navy-500" /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
        <div className="sticky bottom-0 bg-white border-t border-cream-200 p-5 flex gap-3 rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary flex-1">取消</button>
          <button onClick={onSave} className="btn-accent flex-1"><Check className="w-4 h-4" /> {saveText}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-safe">
      <div className="animate-fade-in-up">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy-800 mb-1">⚙️ 系统设置</h1>
        <p className="text-navy-500 text-sm">管理家庭成员、托管人及系统配置</p>
      </div>

      <section className="animate-fade-in-up stagger-1">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <ST icon={Users} title="家庭成员管理" />
          <button onClick={openAddFM} className="btn-accent btn-sm"><UserPlus className="w-4 h-4" /> 新增成员</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {familyMembers.length===0 ? (
            <div className="col-span-full card p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-cream-200 flex items-center justify-center text-3xl mb-3">👨‍👩‍👧</div>
              <p className="text-navy-500">暂无家庭成员，点击右上角添加</p>
            </div>
          ) : familyMembers.map((m,i)=>(
            <div key={m.id} className={cn('card relative overflow-hidden animate-fade-in-up',`stagger-${(i%6)+1}`)}>
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor:m.colorTag }} />
              <div className="p-5 pl-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 border-white shadow-inner" style={{ backgroundColor:m.colorTag+'20' }}>{m.avatarEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><h3 className="font-serif text-lg font-bold text-navy-800">{m.name}</h3><span className="badge bg-cream-100 text-navy-600">{m.relation}</span></div>
                    <div className="mt-2 space-y-1 text-sm text-navy-500">
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-navy-400 shrink-0" /><span className="font-mono">{m.phone}</span></div>
                      <div className="flex items-center gap-2"><Tag className="w-3.5 h-3.5 shrink-0" style={{ color:m.colorTag }} /><span className="badge" style={{ backgroundColor:m.colorTag+'20', color:m.colorTag }}>标签</span></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-end gap-2">
                  <button onClick={()=>openEditFM(m)} className="btn-ghost btn-sm"><Edit2 className="w-3.5 h-3.5" /> 编辑</button>
                  <button onClick={()=>handleDeleteMember(m.id)} className="btn btn-sm text-coral-600 hover:bg-coral-50"><Trash2 className="w-3.5 h-3.5" /> 删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-fade-in-up stagger-2">
        <ST icon={Home} title="托管人管理" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {trustees.map((t,i)=>(
            <div key={t.id} className={cn('card animate-fade-in-up',`stagger-${(i%6)+1}`)}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-cream-200 flex items-center justify-center text-2xl shrink-0 border-2 border-white shadow-inner">{t.isFamily?'👨':'🤝'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-lg font-bold text-navy-800">{t.name}</h3>
                      <span className="badge bg-navy-50 text-navy-600">{t.relation}</span>
                      {t.movedFlag && <span className="badge bg-coral-50 text-coral-700">⚠️ 已搬家</span>}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-navy-500">
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-navy-400 shrink-0" /><span className="font-mono">{t.phone}</span></div>
                      <div className="flex items-start gap-2"><User className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" /><span className="line-clamp-1">{t.address}</span></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={t.movedFlag} onChange={()=>toggleMoved(t)} className="w-4 h-4 rounded border-cream-300 text-coral-500 focus:ring-coral-300" />
                    <span className="text-sm text-navy-600">标记搬家</span>
                  </label>
                  <button onClick={()=>openEditTR(t)} className="btn-ghost btn-sm"><Edit2 className="w-3.5 h-3.5" /> 编辑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-fade-in-up stagger-3">
        <ST icon={Settings2} title="系统设置" />
        <div className="card divide-y divide-cream-200 overflow-hidden">
          <div className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div><h3 className="font-semibold text-navy-800 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-amber-500" /> 未核对提醒阈值</h3><p className="text-xs text-navy-400 mt-1">超过此时长未核对的钥匙将自动生成提醒</p></div>
              <div className="flex items-center gap-2 shrink-0">
                <input type="number" min={7} max={365} value={threshold} onChange={(e)=>changeThr(Number(e.target.value))} className="input w-24 text-center font-mono font-bold text-amber-600 h-11" />
                <span className="text-navy-500">天</span>
              </div>
            </div>
            <input type="range" min={7} max={365} step={1} value={threshold} onChange={(e)=>changeThr(Number(e.target.value))} className="w-full h-2 rounded-full bg-cream-200 appearance-none cursor-pointer accent-amber-500" />
            <div className="flex justify-between text-xs text-navy-400 mt-2 font-mono"><span>7天</span><span>90天</span><span>180天</span><span>365天</span></div>
          </div>
          <div className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div><h3 className="font-semibold text-navy-800 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-mint-500" /> 立即扫描生成提醒</h3><p className="text-xs text-navy-400 mt-1">扫描所有钥匙档案，根据阈值和状态生成提醒</p></div>
              <button onClick={doScan} className="btn-primary btn-sm"><RefreshCw className="w-4 h-4" /> 立即扫描</button>
            </div>
          </div>
          <div className="p-5 md:p-6">
            <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2"><Download className="w-4 h-4 text-navy-500" /> 数据管理</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={doExport} className="btn-secondary btn-sm"><Download className="w-4 h-4" /> 导出 JSON</button>
              <button onClick={()=>fileRef.current?.click()} className="btn-secondary btn-sm"><Upload className="w-4 h-4" /> 导入 JSON</button>
              <input ref={fileRef} type="file" accept=".json" onChange={doImport} className="hidden" />
            </div>
          </div>
          <div className="p-5 md:p-6 bg-cream-50/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center shrink-0"><Info className="w-5 h-5 text-navy-500" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-navy-800">关于系统</h3>
                <p className="text-sm text-navy-500 mt-1"><span className="font-mono text-xs bg-cream-200 px-2 py-0.5 rounded mr-2">v1.0.0</span>备用钥匙托管系统 · 温暖工业风设计</p>
                <p className="text-xs text-navy-400 mt-2 leading-relaxed">本系统帮助您安全管理家庭备用钥匙，支持按家庭成员分组、托管人维护、借用归还记录、自动扫描提醒等功能。所有数据均存储在本地浏览器中，请定期导出备份以防丢失。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal open={mmOpen} title={mmMode==='add'?'新增家庭成员':'编辑家庭成员'} onClose={()=>setMmOpen(false)} onSave={saveFM} saveText={mmMode==='add'?'添加':'保存'}>
        <div>
          <label className="label">头像</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e=>(
              <button key={e} onClick={()=>setMForm({...mForm, avatarEmoji:e})} className={cn('w-12 h-12 rounded-xl text-2xl flex items-center justify-center border-2 transition-all', mForm.avatarEmoji===e ? 'border-amber-400 bg-amber-50 shadow-md scale-105' : 'border-cream-200 hover:border-amber-300 bg-white')}>{e}</button>
            ))}
          </div>
        </div>
        <div><label className="label">姓名</label><input value={mForm.name} onChange={(e)=>setMForm({...mForm, name:e.target.value})} className="input" placeholder="如：张三" /></div>
        <div><label className="label">关系</label><input value={mForm.relation} onChange={(e)=>setMForm({...mForm, relation:e.target.value})} className="input" placeholder="如：父亲 / 母亲 / 哥哥" /></div>
        <div><label className="label">联系电话</label><input value={mForm.phone} onChange={(e)=>setMForm({...mForm, phone:e.target.value})} className="input font-mono" placeholder="13800138000" /></div>
        <div>
          <label className="label">颜色标签</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c=>(
              <button key={c} onClick={()=>setMForm({...mForm, colorTag:c})} className={cn('w-10 h-10 rounded-xl border-2 transition-all', mForm.colorTag===c ? 'border-white ring-2 ring-offset-2 ring-navy-400 scale-110' : 'border-white/50')} style={{ backgroundColor:c }}>{mForm.colorTag===c && <Check className="w-5 h-5 text-white mx-auto" />}</button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal open={tmOpen} title="编辑托管人" onClose={()=>setTmOpen(false)} onSave={saveTR} saveText="保存">
        <div><label className="label">姓名</label><input value={tForm.name} onChange={(e)=>setTForm({...tForm, name:e.target.value})} className="input" /></div>
        <div><label className="label">关系</label><input value={tForm.relation} onChange={(e)=>setTForm({...tForm, relation:e.target.value})} className="input" /></div>
        <div><label className="label">联系电话</label><input value={tForm.phone} onChange={(e)=>setTForm({...tForm, phone:e.target.value})} className="input font-mono" /></div>
        <div><label className="label">存放地址</label><input value={tForm.address} onChange={(e)=>setTForm({...tForm, address:e.target.value})} className="input" /></div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
