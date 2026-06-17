import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ArrowLeft, Edit, FileUp, MapPin, User, Calendar, Shield, Tag, FileText, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge, SecurityBadge } from '../components/ui/Badges';
import { PhotoGallery } from '../components/archives/PhotoGallery';
import { BorrowTimeline } from '../components/archives/BorrowTimeline';
import { useAppStore } from '../store/useAppStore';
import { formatDateTime, addDaysFromNow } from '../utils';
import { Modal } from '../components/ui/Modal';

export function ArchiveDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const archiveBoxes = useAppStore((s) => s.archiveBoxes);
  const borrowRecords = useAppStore((s) => s.borrowRecords);
  const createBorrowRequest = useAppStore((s) => s.createBorrowRequest);
  const currentUser = useAppStore((s) => s.currentUser);

  const box = useMemo(() => archiveBoxes.find((b) => b.id === id), [archiveBoxes, id]);
  const records = useMemo(
    () => borrowRecords.filter((r) => r.archiveBoxId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [borrowRecords, id]
  );

  const latestReturnRecord = useMemo(() => {
    return records.find((r) => r.returnCheck && r.status === '已归还');
  }, [records]);

  const [showBorrow, setShowBorrow] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [expectedReturn, setExpectedReturn] = useState(addDaysFromNow(7));
  const [allowTakeOut, setAllowTakeOut] = useState(false);

  if (!box) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => navigate('/archives')} className="btn-secondary mb-5">
          <ArrowLeft size={16} /> 返回列表
        </button>
        <div className="card p-16 text-center">
          <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-navy-700 font-medium">档案箱不存在</p>
        </div>
      </div>
    );
  }

  const handleBorrow = () => {
    if (!purpose.trim()) return;
    createBorrowRequest({
      archiveBoxId: box.id,
      borrowerId: currentUser.id,
      borrowerName: currentUser.realName,
      borrowerDepartment: currentUser.department,
      purpose: purpose.trim(),
      expectedReturnDate: expectedReturn,
      allowTakeOut,
    });
    setShowBorrow(false);
    setPurpose('');
    setExpectedReturn(addDaysFromNow(7));
    setAllowTakeOut(false);
  };

  const infoItems = [
    { icon: MapPin, label: '柜位位置', value: box.cabinetLocation },
    { icon: Calendar, label: '归档年份', value: `${box.year} 年` },
    { icon: User, label: '所属部门', value: box.department },
    { icon: Shield, label: '密级等级', value: box.securityLevel, badge: true },
    { icon: User, label: '保管人', value: box.custodian },
    { icon: Tag, label: '封条号', value: box.sealNumber },
    { icon: FileText, label: '文件页数', value: `${box.pageCount} 页` },
    { icon: Calendar, label: '创建时间', value: formatDateTime(box.createdAt) },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={box.boxNumber}
        subtitle={box.clientName || '档案箱详情'}
        actions={
          <>
            <button onClick={() => navigate('/archives')} className="btn-secondary">
              <ArrowLeft size={16} />
              返回
            </button>
            <button className="btn-secondary">
              <Edit size={16} />
              编辑
            </button>
            {box.status === '在库' && (
              <button onClick={() => setShowBorrow(true)} className="btn-primary">
                <FileUp size={16} />
                申请借阅
              </button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-serif text-xl font-semibold text-navy-900">{box.boxNumber}</h2>
                  <StatusBadge status={box.status} />
                  <SecurityBadge level={box.securityLevel} />
                </div>
                {box.contractNumber && (
                  <p className="text-sm text-gray-500">合同号：{box.contractNumber}</p>
                )}
                {box.auditDate && (
                  <p className="text-sm text-gold-700 mt-1">
                    <AlertCircle size={12} className="inline mr-1" />
                    审计日期：{box.auditDate}
                  </p>
                )}
              </div>
            </div>

            <h3 className="font-serif text-base font-semibold text-navy-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {infoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-navy-50 flex items-center justify-center text-navy-600 flex-shrink-0 mt-0.5">
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                      {item.badge ? (
                        <SecurityBadge level={item.value as any} />
                      ) : (
                        <p className="text-sm font-medium text-navy-800">{item.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-serif text-base font-semibold text-navy-900 mb-4">照片资料</h3>
            <PhotoGallery photos={box.photos} />
          </div>

          <div className="card p-6">
            <h3 className="font-serif text-base font-semibold text-navy-900 mb-5">借阅历史</h3>
            <BorrowTimeline records={records} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-serif text-base font-semibold text-navy-900 mb-3">快速操作</h3>
            <div className="space-y-2">
              <button onClick={() => setShowBorrow(true)} disabled={box.status !== '在库'} className="w-full btn-primary disabled:opacity-50">
                <FileUp size={16} />
                {box.status === '在库' ? '申请借阅' : '当前不可借阅'}
              </button>
              <button className="w-full btn-secondary">
                <MapPin size={16} />
                导航到柜位
              </button>
              <button className="w-full btn-secondary">
                <Edit size={16} />
                更新封条号
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-serif text-base font-semibold text-navy-900 mb-3">当前状态</h3>
            <div className="flex items-center justify-center py-4">
              <StatusBadge status={box.status} />
            </div>
            {box.status === '借出' && records[0] && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-sm space-y-1">
                <p className="text-gray-600">借出人：<span className="text-navy-800 font-medium">{records[0].borrowerName}</span></p>
                <p className="text-gray-600">借出时间：<span className="text-navy-800">{records[0].borrowedAt ? formatDateTime(records[0].borrowedAt) : '-'}</span></p>
                <p className="text-gray-600">预计归还：<span className="text-navy-800">{records[0].expectedReturnDate}</span></p>
              </div>
            )}
            {box.status === '异常' && latestReturnRecord?.returnCheck && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={14} className="text-red-500" />
                  <p className="text-sm font-medium text-red-700">异常详情</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className={`p-2 rounded-md text-center ${latestReturnRecord.returnCheck.sealIntact ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <p className="font-medium">封条</p>
                    <p>{latestReturnRecord.returnCheck.sealIntact ? '完好' : '异常'}</p>
                  </div>
                  <div className={`p-2 rounded-md text-center ${latestReturnRecord.returnCheck.pagesComplete ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <p className="font-medium">页数</p>
                    <p>{latestReturnRecord.returnCheck.pagesComplete ? '完整' : '缺失'}</p>
                  </div>
                  <div className={`p-2 rounded-md text-center ${latestReturnRecord.returnCheck.cabinetCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <p className="font-medium">柜位</p>
                    <p>{latestReturnRecord.returnCheck.cabinetCorrect ? '正确' : '错误'}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>检查人：{latestReturnRecord.returnCheck.checkerName}</p>
                  <p>实际清点：{latestReturnRecord.returnCheck.actualPageCount} 页</p>
                  {latestReturnRecord.returnCheck.sealRemark && (
                    <p className="text-red-600">封条说明：{latestReturnRecord.returnCheck.sealRemark}</p>
                  )}
                  {latestReturnRecord.returnCheck.missingPages && (
                    <p className="text-red-600">缺页说明：{latestReturnRecord.returnCheck.missingPages}</p>
                  )}
                  {latestReturnRecord.returnCheck.remarks && (
                    <p className="text-gold-700">备注：{latestReturnRecord.returnCheck.remarks}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showBorrow}
        onClose={() => setShowBorrow(false)}
        title={`借阅申请 - ${box.boxNumber}`}
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowBorrow(false)} className="btn-secondary">取消</button>
            <button onClick={handleBorrow} disabled={!purpose.trim()} className="btn-primary">
              提交申请
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {box.securityLevel === '机密' || box.securityLevel === '绝密' ? (
            <div className="p-3 bg-gold-50 border border-gold-200 rounded-md text-sm text-gold-700">
              <AlertCircle size={14} className="inline mr-1.5" />
              该档案箱为{box.securityLevel}级别，需部门主管审批后方可借阅
            </div>
          ) : null}
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
          </label>
        </div>
      </Modal>
    </div>
  );
}
