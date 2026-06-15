import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Check, RotateCcw, Phone, MapPin, Calendar, Package,
  Image as ImageIcon, ChevronLeft, ChevronRight, X, Copy, AlertCircle,
  Clock, User, FileText, Tag, KeyRound, CheckCircle2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  formatDateCN, cn, getStatusBadgeClass, getStatusText,
  todayStr, addDays, daysFromToday
} from '../utils/helpers';

const KeyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const keyArchives = useStore((s) => s.keyArchives);
  const trustees = useStore((s) => s.trustees);
  const borrowRecords = useStore((s) => s.borrowRecords);
  const familyMembers = useStore((s) => s.familyMembers);
  const getActiveBorrowRecord = useStore((s) => s.getActiveBorrowRecord);
  const addBorrowRecord = useStore((s) => s.addBorrowRecord);
  const returnBorrowRecord = useStore((s) => s.returnBorrowRecord);
  const markKeyAsVerified = useStore((s) => s.markKeyAsVerified);
  const markCoreReplaced = useStore((s) => s.markCoreReplaced);

  const archive = keyArchives.find((k) => k.id === id);
  const trustee = trustees.find((t) => t.id === archive?.trusteeId);
  const activeBorrow = useMemo(() => borrowRecords.find((r) => r.keyArchiveId === id && !r.isReturned), [borrowRecords, id]);
  const computedStatus = activeBorrow
    ? 'borrowed'
    : archive?.status === 'borrowed'
      ? 'available'
      : (archive?.status ?? 'available');
  const archiveBorrowRecords = useMemo(
    () => borrowRecords.filter((r) => r.keyArchiveId === id).sort((a, b) => b.borrowDate.localeCompare(a.borrowDate)),
    [borrowRecords, id]
  );

  const [photoIdx, setPhotoIdx] = useState(0);
  const [showBorrow, setShowBorrow] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [borrowForm, setBorrowForm] = useState({
    borrowerId: '', borrowerName: '', reason: '',
    expectedReturnDate: addDays(todayStr(), 3), needDuplicate: false, duplicateNote: ''
  });
  const [returnForm, setReturnForm] = useState({
    returnedQuantity: archive?.totalQuantity ?? 1, tagIntact: true,
    keyRingIntact: true, storageReset: true, returnNote: ''
  });

  if (!archive) {
    return (
      <div className="card p-12 text-center animate-fade-in-up">
        <AlertCircle className="w-16 h-16 mx-auto text-coral-400 mb-4" />
        <h3 className="title-serif text-xl mb-2">钥匙档案不存在</h3>
        <Link to="/keys" className="btn-secondary mt-4"><ArrowLeft className="w-4 h-4" />返回列表</Link>
      </div>
    );
  }

  const statusBorderClass = computedStatus === 'available' ? 'border-mint-300' : computedStatus === 'borrowed' ? 'border-coral-300' : 'border-cream-400';

  const prevPhoto = () => setPhotoIdx((i) => (i - 1 + archive.photos.length) % archive.photos.length);
  const nextPhoto = () => setPhotoIdx((i) => (i + 1) % archive.photos.length);

  const handleBorrow = () => {
    const borrowerName = borrowForm.borrowerName || familyMembers.find((f) => f.id === borrowForm.borrowerId)?.name;
    if (!borrowerName || !borrowForm.reason) return;
    addBorrowRecord({
      keyArchiveId: archive.id,
      borrowerId: borrowForm.borrowerId || undefined,
      borrowerName,
      reason: borrowForm.reason,
      borrowDate: todayStr(),
      expectedReturnDate: borrowForm.expectedReturnDate,
      needDuplicate: borrowForm.needDuplicate,
      duplicateNote: borrowForm.needDuplicate ? borrowForm.duplicateNote : undefined,
    });
    setShowBorrow(false);
    setBorrowForm({ borrowerId: '', borrowerName: '', reason: '', expectedReturnDate: addDays(todayStr(), 3), needDuplicate: false, duplicateNote: '' });
  };

  const handleReturn = () => {
    if (!activeBorrow) return;
    returnBorrowRecord(activeBorrow.id, returnForm);
    setShowReturn(false);
    setReturnForm({ returnedQuantity: archive.totalQuantity, tagIntact: true, keyRingIntact: true, storageReset: true, returnNote: '' });
  };

  const Modal = ({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
    show && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-cream-200">
            <h3 className="title-serif text-lg">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-cream-100 transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-5 space-y-4">{children}</div>
        </div>
      </div>
    )
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/keys')} className="btn-secondary btn-sm shrink-0"><ArrowLeft className="w-4 h-4" />返回</button>
        <h2 className="font-serif text-xl md:text-2xl font-bold text-navy-800 truncate">钥匙详情</h2>
      </div>

      <div className={cn('card relative overflow-hidden border-l-4', statusBorderClass)}>
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy-800">{archive.lockName}</h1>
                <span className={cn('badge', getStatusBadgeClass(computedStatus))}>{getStatusText(computedStatus)}</span>
              </div>
              <p className="text-navy-500 flex items-center gap-1"><MapPin className="w-4 h-4 text-navy-400" />{archive.lockLocation}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center shrink-0">
              <KeyRound className="w-7 h-7 text-amber-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-cream-50 space-y-1">
              <p className="text-xs text-navy-400 flex items-center gap-1"><Package className="w-3 h-3" />钥匙数量</p>
              <p className="font-bold text-navy-800">{archive.totalQuantity} 把</p>
            </div>
            <div className="p-3 rounded-xl bg-cream-50 space-y-1">
              <p className="text-xs text-navy-400 flex items-center gap-1"><User className="w-3 h-3" />托管人</p>
              <p className="font-semibold text-navy-800 truncate">{trustee?.name || '-'}</p>
              <p className="text-xs text-navy-400">{trustee?.relation || ''}</p>
            </div>
            <div className="col-span-2 md:col-span-1 p-3 rounded-xl bg-cream-50 space-y-1">
              <p className="text-xs text-navy-400 flex items-center gap-1"><Phone className="w-3 h-3" />联系电话</p>
              {trustee?.phone ? (
                <a href={`tel:${trustee.phone}`} className="font-semibold text-mint-600 hover:text-mint-700 flex items-center gap-1">
                  {trustee.phone}<Phone className="w-3 h-3" />
                </a>
              ) : <p className="text-navy-500">-</p>}
            </div>
            <div className="col-span-2 md:col-span-3 p-3 rounded-xl bg-cream-50 space-y-1">
              <p className="text-xs text-navy-400 flex items-center gap-1"><MapPin className="w-3 h-3" />存放位置</p>
              <p className="font-semibold text-navy-800">{archive.storageLocation}</p>
            </div>
            <div className="p-3 rounded-xl bg-cream-50 space-y-1">
              <p className="text-xs text-navy-400 flex items-center gap-1"><Calendar className="w-3 h-3" />交付日期</p>
              <p className="text-sm font-medium text-navy-700">{formatDateCN(archive.deliveryDate)}</p>
            </div>
            <div className="p-3 rounded-xl bg-cream-50 space-y-1">
              <p className="text-xs text-navy-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />上次核对</p>
              <p className="text-sm font-medium text-navy-700">{formatDateCN(archive.lastVerifiedDate)}</p>
              <p className={cn('text-xs', daysFromToday(archive.lastVerifiedDate) > 90 ? 'text-coral-600' : daysFromToday(archive.lastVerifiedDate) > 60 ? 'text-amber-600' : 'text-navy-400')}>
                {daysFromToday(archive.lastVerifiedDate)} 天前
              </p>
            </div>
            {trustee?.address && (
              <div className="p-3 rounded-xl bg-cream-50 space-y-1">
                <p className="text-xs text-navy-400">托管人住址</p>
                <p className="text-sm text-navy-700">{trustee.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="title-serif text-base mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-amber-500" />照片档案</h3>
        {archive.photos.length === 0 ? (
          <div className="rounded-xl bg-cream-50 border-2 border-dashed border-cream-300 p-10 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-navy-300 mb-2" />
            <p className="text-navy-400 text-sm">暂无照片记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-navy-50">
              <img src={archive.photos[photoIdx]} alt="" className="w-full h-full object-cover" />
              {archive.photos.length > 1 && (
                <>
                  <button onClick={prevPhoto} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextPhoto} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-navy-900/70 text-white text-xs">
                    {photoIdx + 1} / {archive.photos.length}
                  </div>
                </>
              )}
            </div>
            {archive.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {archive.photos.map((p, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)} className={cn('shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all', i === photoIdx ? 'border-amber-400 ring-2 ring-amber-200' : 'border-transparent opacity-60 hover:opacity-100')}>
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="title-serif text-base mb-3 flex items-center gap-2"><KeyRound className="w-4 h-4 text-amber-500" />操作区</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {computedStatus === 'available' && (
            <button onClick={() => setShowBorrow(true)} className="btn-accent col-span-2 md:col-span-4"><Copy className="w-4 h-4" />发起借用</button>
          )}
          {computedStatus === 'borrowed' && activeBorrow && (
            <button onClick={() => { setReturnForm({ ...returnForm, returnedQuantity: archive.totalQuantity }); setShowReturn(true); }} className="btn-primary col-span-2 md:col-span-4">
              <RotateCcw className="w-4 h-4" />确认归还
            </button>
          )}
          <Link to={`/keys/${archive.id}/edit`} className="btn-secondary"><Edit2 className="w-4 h-4" />编辑档案</Link>
          <button onClick={() => markKeyAsVerified(archive.id)} className="btn-secondary"><Check className="w-4 h-4" />标记已核对</button>
          <button onClick={() => markCoreReplaced(archive.id)} className="btn-secondary"><KeyRound className="w-4 h-4" />标记换锁</button>
          <Link to="/keys" className="btn-secondary"><ArrowLeft className="w-4 h-4" />返回列表</Link>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="title-serif text-base mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" />借用记录 <span className="text-sm font-normal text-navy-400">（共 {archiveBorrowRecords.length} 条）</span></h3>
        {archiveBorrowRecords.length === 0 ? (
          <div className="py-10 text-center text-navy-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-navy-300" />
            <p className="text-sm">暂无借用记录</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-cream-300" />
            <div className="space-y-5">
              {archiveBorrowRecords.map((r) => (
                <div key={r.id} className="relative pl-10">
                  <div className={cn('absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs', r.isReturned ? 'bg-mint-100 border-2 border-mint-300' : 'bg-coral-100 border-2 border-coral-300')}>
                    {r.isReturned ? <Check className="w-3 h-3 text-mint-600" /> : <Clock className="w-3 h-3 text-coral-600" />}
                  </div>
                  <div className={cn('p-4 rounded-xl', r.isReturned ? 'bg-cream-50' : 'bg-coral-50 border border-coral-100')}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-navy-800">{r.borrowerName}</span>
                          {r.needDuplicate && <span className="badge bg-amber-100 text-amber-700 !text-xs"><Copy className="w-3 h-3" />需要复制</span>}
                          <span className={cn('badge', r.isReturned ? 'badge-available' : 'badge-borrowed')}>{r.isReturned ? '已归还' : '借用中'}</span>
                        </div>
                        <p className="text-sm text-navy-600 mt-1">{r.reason}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
                      <span>借出：{formatDateCN(r.borrowDate)}</span>
                      <span>预计归还：{formatDateCN(r.expectedReturnDate)}</span>
                      {r.isReturned && r.returnDate && <span className="text-mint-600 font-medium">实际归还：{formatDateCN(r.returnDate)}</span>}
                    </div>
                    {r.needDuplicate && r.duplicateNote && <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded-lg">复制备注：{r.duplicateNote}</p>}
                    {r.isReturned && (
                      <div className="mt-3 pt-3 border-t border-cream-200">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {r.returnedQuantity !== undefined && (
                            <span className={cn('text-xs px-2 py-1 rounded-full flex items-center gap-1', r.returnedQuantity === archive.totalQuantity ? 'bg-mint-100 text-mint-700' : 'bg-coral-100 text-coral-700')}>
                              {r.returnedQuantity === archive.totalQuantity && <CheckCircle2 className="w-3 h-3" />}数量：{r.returnedQuantity}/{archive.totalQuantity}
                            </span>
                          )}
                          {r.tagIntact !== undefined && (
                            <span className={cn('text-xs px-2 py-1 rounded-full flex items-center gap-1', r.tagIntact ? 'bg-mint-100 text-mint-700' : 'bg-coral-100 text-coral-700')}>
                              {r.tagIntact && <CheckCircle2 className="w-3 h-3" />}<Tag className="w-3 h-3" />标签{r.tagIntact ? '完好' : '损坏'}
                            </span>
                          )}
                          {r.keyRingIntact !== undefined && (
                            <span className={cn('text-xs px-2 py-1 rounded-full flex items-center gap-1', r.keyRingIntact ? 'bg-mint-100 text-mint-700' : 'bg-coral-100 text-coral-700')}>
                              {r.keyRingIntact && <CheckCircle2 className="w-3 h-3" />}钥匙圈{r.keyRingIntact ? '完好' : '损坏'}
                            </span>
                          )}
                          {r.storageReset !== undefined && (
                            <span className={cn('text-xs px-2 py-1 rounded-full flex items-center gap-1', r.storageReset ? 'bg-mint-100 text-mint-700' : 'bg-coral-100 text-coral-700')}>
                              {r.storageReset && <CheckCircle2 className="w-3 h-3" />}存放{r.storageReset ? '已复位' : '未复位'}
                            </span>
                          )}
                        </div>
                        {r.returnNote && <p className="text-xs text-navy-500 bg-white p-2 rounded-lg">备注：{r.returnNote}</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal show={showBorrow} onClose={() => setShowBorrow(false)} title="发起借用登记">
        <div>
          <label className="label">借用人</label>
          <div className="space-y-2">
            <select value={borrowForm.borrowerId} onChange={(e) => setBorrowForm({ ...borrowForm, borrowerId: e.target.value, borrowerName: '' })} className="input">
              <option value="">选择家庭成员...</option>
              {familyMembers.map((f) => <option key={f.id} value={f.id}>{f.avatarEmoji} {f.name}（{f.relation}）</option>)}
            </select>
            <input type="text" value={borrowForm.borrowerName} onChange={(e) => setBorrowForm({ ...borrowForm, borrowerName: e.target.value, borrowerId: '' })} placeholder="或手动输入姓名..." className="input" />
          </div>
        </div>
        <div><label className="label">借用原因</label><textarea value={borrowForm.reason} onChange={(e) => setBorrowForm({ ...borrowForm, reason: e.target.value })} rows={2} className="input resize-none" placeholder="例如：忘带钥匙、家人来访..." /></div>
        <div><label className="label">预计归还日期</label><input type="date" value={borrowForm.expectedReturnDate} onChange={(e) => setBorrowForm({ ...borrowForm, expectedReturnDate: e.target.value })} className="input" /></div>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2"><Copy className="w-4 h-4 text-amber-600" /><span className="font-medium text-navy-700">需要复制钥匙</span></div>
            <input type="checkbox" checked={borrowForm.needDuplicate} onChange={(e) => setBorrowForm({ ...borrowForm, needDuplicate: e.target.checked })} className="w-5 h-5 accent-amber-500" />
          </label>
          {borrowForm.needDuplicate && <input type="text" value={borrowForm.duplicateNote} onChange={(e) => setBorrowForm({ ...borrowForm, duplicateNote: e.target.value })} placeholder="复制备注..." className="input mt-3" />}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => setShowBorrow(false)} className="btn-secondary flex-1">取消</button>
          <button onClick={handleBorrow} disabled={!borrowForm.reason || (!borrowForm.borrowerId && !borrowForm.borrowerName)} className="btn-accent flex-1">确认借用</button>
        </div>
      </Modal>

      <Modal show={showReturn} onClose={() => setShowReturn(false)} title="归还确认核对">
        {activeBorrow && (
          <div className="p-3 rounded-xl bg-coral-50 border border-coral-200 mb-2">
            <p className="text-sm text-coral-800"><span className="font-bold">{activeBorrow.borrowerName}</span> · {activeBorrow.reason}</p>
            <p className="text-xs text-coral-600 mt-1">借出：{formatDateCN(activeBorrow.borrowDate)}</p>
          </div>
        )}
        <div><label className="label">数量核对 <span className="text-navy-400 font-normal">（应有 {archive.totalQuantity} 把）</span></label><input type="number" min={0} value={returnForm.returnedQuantity} onChange={(e) => setReturnForm({ ...returnForm, returnedQuantity: Number(e.target.value) })} className="input" /></div>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 cursor-pointer hover:bg-cream-100 transition-colors"><input type="checkbox" checked={returnForm.tagIntact} onChange={(e) => setReturnForm({ ...returnForm, tagIntact: e.target.checked })} className="w-5 h-5 accent-mint-500" /><Tag className="w-4 h-4 text-navy-500" /><span className="font-medium text-navy-700">标签完好无损</span></label>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 cursor-pointer hover:bg-cream-100 transition-colors"><input type="checkbox" checked={returnForm.keyRingIntact} onChange={(e) => setReturnForm({ ...returnForm, keyRingIntact: e.target.checked })} className="w-5 h-5 accent-mint-500" /><KeyRound className="w-4 h-4 text-navy-500" /><span className="font-medium text-navy-700">钥匙圈完好</span></label>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 cursor-pointer hover:bg-cream-100 transition-colors"><input type="checkbox" checked={returnForm.storageReset} onChange={(e) => setReturnForm({ ...returnForm, storageReset: e.target.checked })} className="w-5 h-5 accent-mint-500" /><MapPin className="w-4 h-4 text-navy-500" /><span className="font-medium text-navy-700">存放位置已复位</span></label>
        </div>
        <div><label className="label">备注</label><textarea value={returnForm.returnNote} onChange={(e) => setReturnForm({ ...returnForm, returnNote: e.target.value })} rows={3} className="input resize-none" placeholder="异常情况说明..." /></div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => setShowReturn(false)} className="btn-secondary flex-1">取消</button>
          <button onClick={handleReturn} className="btn-primary flex-1"><Check className="w-4 h-4" />确认归还</button>
        </div>
      </Modal>
    </div>
  );
};

export default KeyDetailPage;
