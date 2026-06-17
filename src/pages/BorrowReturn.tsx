import { useState, useMemo } from 'react';
import { RotateCcw, Check, AlertTriangle, FileText, MapPin, Search } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { useAppStore } from '../store/useAppStore';
import { formatDate, formatDateTime } from '../utils';
import type { BorrowRecord, ArchiveBox } from '../types';

export function BorrowReturn() {
  const borrowRecords = useAppStore((s) => s.borrowRecords);
  const archiveBoxes = useAppStore((s) => s.archiveBoxes);
  const returnBorrow = useAppStore((s) => s.returnBorrow);
  const currentUser = useAppStore((s) => s.currentUser);
  const borrowedList = useMemo(
    () => borrowRecords.filter((r) => r.status === '借出中' || r.status === '已逾期'),
    [borrowRecords]
  );
  const [showCheck, setShowCheck] = useState(false);
  const [selected, setSelected] = useState<BorrowRecord | null>(null);
  const [box, setBox] = useState<ArchiveBox | null>(null);

  const [actualSealNumber, setActualSealNumber] = useState('');
  const [sealRemark, setSealRemark] = useState('');
  const [actualPageCount, setActualPageCount] = useState(0);
  const [missingPages, setMissingPages] = useState('');
  const [cabinetCorrect, setCabinetCorrect] = useState(true);
  const [remarks, setRemarks] = useState('');

  const openCheck = (record: BorrowRecord) => {
    const foundBox = archiveBoxes.find((b) => b.id === record.archiveBoxId);
    setSelected(record);
    setBox(foundBox || null);
    setActualSealNumber(foundBox?.sealNumber || '');
    setSealRemark('');
    setActualPageCount(foundBox?.pageCount || 0);
    setMissingPages('');
    setCabinetCorrect(true);
    setRemarks('');
    setShowCheck(true);
  };

  const registeredSeal = box?.sealNumber || '';
  const registeredPages = box?.pageCount || 0;
  const sealIntact = actualSealNumber.trim().toUpperCase() === registeredSeal.trim().toUpperCase() && actualSealNumber.trim() !== '';
  const pageDiff = Number(actualPageCount) - registeredPages;
  const pagesComplete = Number(actualPageCount) === registeredPages;
  const hasAnomaly = !sealIntact || !pagesComplete || !cabinetCorrect;

  const anomalyMessages = [];
  if (!sealIntact) anomalyMessages.push('封条号不符');
  if (!pagesComplete) anomalyMessages.push(`页数不符（差 ${pageDiff > 0 ? '+' : ''}${pageDiff} 页）`);
  if (!cabinetCorrect) anomalyMessages.push('柜位错误');

  const handleSubmit = () => {
    if (!selected) return;
    returnBorrow(selected.id, {
      registeredSealNumber: registeredSeal,
      actualSealNumber: actualSealNumber.trim(),
      sealIntact,
      sealRemark: sealRemark || undefined,
      registeredPageCount: registeredPages,
      actualPageCount: Number(actualPageCount),
      pageDiff,
      pagesComplete,
      missingPages: missingPages || undefined,
      cabinetCorrect,
      checkerId: currentUser.id,
      checkerName: currentUser.realName,
      remarks: remarks || undefined,
    });
    setShowCheck(false);
    setSelected(null);
    setBox(null);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="归还检查"
        subtitle="检查归还的档案箱封条、页数并确认放回柜位"
      />

      {borrowedList.length === 0 ? (
        <div className="card p-16 text-center">
          <RotateCcw size={40} className="mx-auto text-green-400 mb-3" />
          <p className="text-navy-700 font-medium mb-1">暂无待归还档案箱</p>
          <p className="text-sm text-gray-500">所有借出档案箱均已归还</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {borrowedList.map((record, idx) => {
            const b = archiveBoxes.find((a) => a.id === record.archiveBoxId);
            return (
              <div key={record.id} className="card p-5 animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-serif text-base font-semibold text-navy-900 mb-1">{record.boxNumber}</h4>
                    <p className="text-xs text-gray-500">借出时间：{record.borrowedAt ? formatDateTime(record.borrowedAt) : '-'}</p>
                  </div>
                  <span className={`badge ${record.status === '已逾期' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    {record.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-xs text-gray-500">借出人</p>
                    <p className="text-navy-800 font-medium">{record.borrowerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">部门</p>
                    <p className="text-navy-800">{record.borrowerDepartment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">预计归还</p>
                    <p className={`${record.status === '已逾期' ? 'text-red-600 font-medium' : 'text-navy-800'}`}>
                      {formatDate(record.expectedReturnDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">柜位</p>
                    <p className="text-navy-800">{b?.cabinetLocation || '—'}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md mb-4">
                  <p className="text-xs text-gray-500 mb-1">借阅用途</p>
                  <p className="text-sm text-navy-800">{record.purpose}</p>
                </div>

                <button onClick={() => openCheck(record)} className="w-full btn-primary">
                  <RotateCcw size={16} />
                  开始归还检查
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showCheck}
        onClose={() => setShowCheck(false)}
        title={`归还检查 - ${selected?.boxNumber || ''}`}
        footer={
          <div className="space-y-3">
            {hasAnomaly && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">检测到异常</p>
                <p className="text-xs mt-0.5 text-red-600">
                  {anomalyMessages.join('、')}
                </p>
              </div>
            </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCheck(false)} className="btn-secondary">取消</button>
              <button onClick={handleSubmit} className={`${hasAnomaly ? 'btn-gold' : 'btn-primary'}`}>
                {hasAnomaly ? (
                  <><AlertTriangle size={14} /> 登记异常并完成归还</>
                ) : (
                  <><Check size={14} /> 确认归还</>
                )}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {hasAnomaly && (
            <div className="p-3 bg-gold-50 border border-gold-200 rounded-md text-sm text-gold-700 flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">检测到异常项</p>
                <p className="text-xs mt-0.5 text-gold-600">归还完成后档案箱状态将标记为「异常」，请按流程处理</p>
              </div>
            </div>
          )}

          <div className="p-4 bg-navy-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Search size={14} className="text-navy-600" />
              <p className="text-sm font-medium text-navy-800">档案箱信息核对</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-navy-400">封条号</p>
                <p className="text-navy-800 font-mono font-medium">{box?.sealNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">文件页数</p>
                <p className="text-navy-800 font-medium">{box?.pageCount || 0} 页</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-navy-400">应放回柜位</p>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-navy-600" />
                  <p className="text-navy-800 font-medium">{box?.cabinetLocation || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-base !mb-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-gold-100 text-gold-700 text-xs inline-flex items-center justify-center">1</span>
                  封条检查
                </span>
              </label>
              {actualSealNumber.trim() !== '' && (
                <span className={`text-xs font-medium ${sealIntact ? 'text-green-600' : 'text-red-600'}`}>
                  {sealIntact ? '✓ 封条一致' : '✗ 封条不符'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">登记封条号</label>
                <input type="text" value={registeredSeal} readOnly className="input-base text-sm bg-gray-50 font-mono" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">实际封条号 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={actualSealNumber}
                  onChange={(e) => setActualSealNumber(e.target.value)}
                  placeholder="请输入实际封条号"
                  className={`input-base text-sm font-mono ${!sealIntact && actualSealNumber.trim() !== '' ? 'border-red-400 bg-red-50 focus:ring-red-500' : ''}`}
                />
              </div>
            </div>
            {!sealIntact && actualSealNumber.trim() !== '' && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2 mb-2">
              <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
              <span>封条号与登记不一致，请核实是否为原封</span>
            </div>
            )}
            {!sealIntact && actualSealNumber.trim() !== '' && (
              <input
                type="text"
                value={sealRemark}
                onChange={(e) => setSealRemark(e.target.value)}
                placeholder="请描述封条异常情况..."
                className="input-base text-sm"
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-base !mb-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-gold-100 text-gold-700 text-xs inline-flex items-center justify-center">2</span>
                  文件页数检查
                </span>
              </label>
              <span className={`text-xs font-medium ${pagesComplete ? 'text-green-600' : 'text-red-600'}`}>
                {pagesComplete ? '✓ 页数一致' : `✗ 页数不符（${pageDiff > 0 ? '多' : '少'} ${Math.abs(pageDiff)} 页）`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">登记页数</label>
                <input type="text" value={registeredPages} readOnly className="input-base text-sm bg-gray-50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">实际清点页数 <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={actualPageCount}
                  onChange={(e) => setActualPageCount(Number(e.target.value))}
                  className={`input-base text-sm ${!pagesComplete ? 'border-red-400 bg-red-50 focus:ring-red-500' : ''}`}
                />
              </div>
            </div>
            {!pagesComplete && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2 mb-2">
              <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
              <span>实际页数与登记不符，请确认是否有缺页或多出</span>
            </div>
            )}
            {!pagesComplete && (
              <input
                type="text"
                value={missingPages}
                onChange={(e) => setMissingPages(e.target.value)}
                placeholder="请说明缺失页码，如：第45-48页"
                className="input-base text-sm"
              />
            )}
          </div>

          <div>
            <label className="label-base">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-gold-100 text-gold-700 text-xs inline-flex items-center justify-center">3</span>
                柜位确认
              </span>
            </label>
            <div className="flex gap-3 mb-2">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border-2 cursor-pointer transition-all ${cabinetCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                <input type="radio" checked={cabinetCorrect} onChange={() => setCabinetCorrect(true)} className="sr-only" />
                <MapPin size={16} />
                <span className="text-sm font-medium">正确放回 {box?.cabinetLocation || '柜位'}</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border-2 cursor-pointer transition-all ${!cabinetCorrect ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>
                <input type="radio" checked={!cabinetCorrect} onChange={() => setCabinetCorrect(false)} className="sr-only" />
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">柜位错误</span>
              </label>
            </div>
          </div>

          <div>
            <label className="label-base">检查备注（可选）</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="其他需要说明的情况..."
              className="input-base text-sm resize-none"
            />
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            检查人：{currentUser.realName} · {currentUser.department}
          </div>
        </div>
      </Modal>
    </div>
  );
}
