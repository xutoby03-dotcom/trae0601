import { useState, useMemo } from 'react';
import { FileUp, Plus, Clock, AlertCircle, Search } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badges';
import { SecurityBadge } from '../components/ui/Badges';
import { Modal } from '../components/ui/Modal';
import { useAppStore } from '../store/useAppStore';
import { formatDate, formatDateTime, addDaysFromNow, needsManagerApproval } from '../utils';
import type { ArchiveBox } from '../types';

export function BorrowApply() {
  const currentUser = useAppStore((s) => s.currentUser);
  const archiveBoxes = useAppStore((s) => s.archiveBoxes);
  const borrowRecords = useAppStore((s) => s.borrowRecords);
  const createBorrowRequest = useAppStore((s) => s.createBorrowRequest);
  const myRecords = useMemo(
    () => borrowRecords.filter((r) => r.borrowerId === currentUser.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [borrowRecords, currentUser.id]
  );
  const [showNew, setShowNew] = useState(false);
  const [selectedBox, setSelectedBox] = useState<ArchiveBox | null>(null);
  const [boxSearch, setBoxSearch] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expectedReturn, setExpectedReturn] = useState(addDaysFromNow(7));
  const [allowTakeOut, setAllowTakeOut] = useState(false);

  const availableBoxes = archiveBoxes.filter(
    (b) => b.status === '在库' && (boxSearch === '' || b.boxNumber.includes(boxSearch) || (b.clientName || '').includes(boxSearch))
  );

  const handleSubmit = () => {
    if (!selectedBox || !purpose.trim()) return;
    createBorrowRequest({
      archiveBoxId: selectedBox.id,
      borrowerId: currentUser.id,
      borrowerName: currentUser.realName,
      borrowerDepartment: currentUser.department,
      purpose: purpose.trim(),
      expectedReturnDate: expectedReturn,
      allowTakeOut,
    });
    setShowNew(false);
    setSelectedBox(null);
    setPurpose('');
    setExpectedReturn(addDaysFromNow(7));
    setAllowTakeOut(false);
    setBoxSearch('');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="借阅申请"
        subtitle="提交档案箱借阅申请，跟踪审批状态"
        actions={
          <button onClick={() => setShowNew(true)} className="btn-primary">
            <Plus size={16} />
            新建申请
          </button>
        }
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-5 py-3 font-medium">档案箱</th>
              <th className="px-5 py-3 font-medium">用途</th>
              <th className="px-5 py-3 font-medium">预计归还</th>
              <th className="px-5 py-3 font-medium">带出办公室</th>
              <th className="px-5 py-3 font-medium">申请时间</th>
              <th className="px-5 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {myRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                  <FileUp size={32} className="mx-auto mb-2 text-gray-300" />
                  暂无借阅记录
                </td>
              </tr>
            ) : (
              myRecords.map((r, idx) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-navy-800">{r.boxNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{r.purpose}</td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(r.expectedReturnDate)}</td>
                  <td className="px-5 py-4 text-gray-600">{r.allowTakeOut ? '允许' : '否'}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{formatDateTime(r.createdAt)}</td>
                  <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="新建借阅申请"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowNew(false)} className="btn-secondary">取消</button>
            <button onClick={handleSubmit} disabled={!selectedBox || !purpose.trim()} className="btn-primary">
              提交申请
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="label-base">选择档案箱 <span className="text-red-500">*</span></label>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索档案箱编号或客户名"
                value={boxSearch}
                onChange={(e) => setBoxSearch(e.target.value)}
                className="input-base pl-8"
              />
            </div>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-50">
              {availableBoxes.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">暂无可借阅的档案箱</div>
              ) : (
                availableBoxes.map((box) => (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBox(box)}
                    className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${
                      selectedBox?.id === box.id ? 'bg-navy-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-navy-800">{box.boxNumber}</p>
                      <p className="text-xs text-gray-500">{box.clientName || '—'} · {box.cabinetLocation}</p>
                    </div>
                    <SecurityBadge level={box.securityLevel} />
                  </div>
                ))
              )}
            </div>
            {selectedBox && needsManagerApproval(selectedBox.securityLevel) && (
              <div className="mt-3 p-3 bg-gold-50 border border-gold-200 rounded-md text-sm text-gold-700">
                <AlertCircle size={14} className="inline mr-1.5" />
                该档案箱为{selectedBox.securityLevel}级别，需部门主管审批后方可借阅
              </div>
            )}
          </div>

          <div>
            <label className="label-base">借阅用途 <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="请详细说明借阅用途..."
              className="input-base resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-base">借出人</label>
              <input type="text" value={currentUser.realName} readOnly className="input-base bg-gray-50" />
            </div>
            <div>
              <label className="label-base">所属部门</label>
              <input type="text" value={currentUser.department} readOnly className="input-base bg-gray-50" />
            </div>
          </div>

          <div>
            <label className="label-base">预计归还日期 <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
              className="input-base"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowTakeOut}
              onChange={(e) => setAllowTakeOut(e.target.checked)}
              className="w-4 h-4 text-navy-800 rounded border-gray-300 focus:ring-navy-500"
            />
            <span className="text-sm text-navy-800">允许带出办公室</span>
            <Clock size={12} className="text-gray-400 ml-1" />
          </label>
        </div>
      </Modal>
    </div>
  );
}
