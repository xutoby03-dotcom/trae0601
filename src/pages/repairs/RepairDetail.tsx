import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, User, FileText, Calendar, Wrench, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/store';
import { REPAIR_STATUS_COLORS, REPAIR_STATUS_LABELS, DEVICE_STATUS_COLORS, DEVICE_STATUS_LABELS, BORROW_STATUS_COLORS, BORROW_STATUS_LABELS } from '@/types';
import CompleteRepairModal from '@/components/CompleteRepairModal';

export default function RepairDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRepair, getDevice, getBorrow, completeRepair } = useAppStore();

  const repair = getRepair(id!);
  const device = repair ? getDevice(repair.deviceId) : undefined;
  const borrow = repair?.borrowId ? getBorrow(repair.borrowId) : undefined;

  const [modalOpen, setModalOpen] = useState(false);

  if (!repair) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-500 mb-4">维修单不存在</p>
        <Link to="/repairs" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
      </div>
    );
  }

  const isRepairing = repair.status === 'repairing';

  const handleConfirmComplete = (data: { afterPhoto: string; cost: number }) => {
    completeRepair(repair.id, data);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/repairs"
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">维修单详情</h1>
          <p className="text-sm text-slate-500 mt-0.5">维修单号：{repair.id}</p>
        </div>
        <span className={`badge ${REPAIR_STATUS_COLORS[repair.status]} text-sm px-3 py-1`}>
          {REPAIR_STATUS_LABELS[repair.status]}
        </span>
      </div>

      {device && (
        <div className="card p-5">
          <div className="flex items-start gap-4">
            <img
              src={device.photo}
              alt=""
              className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-800 text-lg">{device.code}</span>
                <span className={`badge ${DEVICE_STATUS_COLORS[device.status]}`}>
                  {DEVICE_STATUS_LABELS[device.status]}
                </span>
              </div>
              <p className="text-sm text-slate-500">{device.category}</p>
              {device.description && (
                <p className="text-sm text-slate-600 mt-1">{device.description}</p>
              )}
              <div className="flex gap-6 mt-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400">保管人</span>
                  <p className="font-medium text-slate-700">{device.custodian}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">价值</span>
                  <p className="font-medium text-slate-700">¥{device.value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-slate-800">维修信息</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">故障现象</p>
              <p className="text-sm text-slate-800">{repair.faultDescription}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
            <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">处理人</p>
              <p className="text-sm text-slate-800">{repair.handler}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">开始日期</p>
              <p className="text-sm text-slate-800">{repair.startDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
            <DollarSign className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">维修费用</p>
              <p className="text-sm font-medium text-rose-600">¥{repair.cost.toLocaleString()}</p>
            </div>
          </div>
          {repair.completeDate && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
              <CheckCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400">完成日期</p>
                <p className="text-sm text-slate-800">{repair.completeDate}</p>
              </div>
            </div>
          )}
          {repair.remark && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 md:col-span-2">
              <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400">备注</p>
                <p className="text-sm text-slate-800">{repair.remark}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {(repair.beforePhoto || repair.afterPhoto) && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-800">照片记录</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repair.beforePhoto && (
              <div>
                <p className="text-xs text-slate-500 mb-2">维修前</p>
                <img
                  src={repair.beforePhoto}
                  alt="维修前"
                  className="w-full aspect-video object-cover rounded-xl bg-slate-100 border border-slate-200"
                />
              </div>
            )}
            {repair.afterPhoto && (
              <div>
                <p className="text-xs text-slate-500 mb-2">维修后</p>
                <img
                  src={repair.afterPhoto}
                  alt="维修后"
                  className="w-full aspect-video object-cover rounded-xl bg-slate-100 border border-slate-200"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {borrow && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-3">关联借用记录</h2>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <div>
              <p className="text-sm text-slate-700">
                借用人：<span className="font-medium">{borrow.borrower}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{borrow.purpose}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {borrow.borrowDate} → {borrow.actualReturnDate || borrow.expectedReturnDate}
              </p>
            </div>
            <span className={`badge ${BORROW_STATUS_COLORS[borrow.status]}`}>
              {BORROW_STATUS_LABELS[borrow.status]}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Link to="/repairs" className="btn-secondary">
          返回列表
        </Link>
        {isRepairing && (
          <button onClick={() => setModalOpen(true)} className="btn-success">
            <CheckCircle className="w-4 h-4" />
            标记完成
          </button>
        )}
      </div>

      <CompleteRepairModal
        repair={repair}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmComplete}
      />
    </div>
  );
}
