import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Wrench, ClipboardList, Calendar, User, DollarSign, Hash, Tag } from 'lucide-react';
import { useAppStore } from '@/store';
import { DEVICE_STATUS_COLORS, DEVICE_STATUS_LABELS, BORROW_STATUS_COLORS, BORROW_STATUS_LABELS, REPAIR_STATUS_COLORS, REPAIR_STATUS_LABELS } from '@/types';

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDevice, getDeviceBorrows, getDeviceRepairs } = useAppStore();

  const device = getDevice(id!);
  const borrows = device ? getDeviceBorrows(device.id) : [];
  const repairs = device ? getDeviceRepairs(device.id) : [];

  if (!device) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-500 mb-4">设备不存在</p>
        <Link to="/devices" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/devices"
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">{device.code}</h1>
          <p className="text-sm text-slate-500">{device.category}</p>
        </div>
        <button onClick={() => navigate(`/devices/${device.id}/edit`)} className="btn-secondary">
          <Edit2 className="w-4 h-4" />
          编辑
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <img
            src={device.photo}
            alt={device.code}
            className="w-full aspect-square rounded-xl object-cover bg-slate-100 mb-5"
          />
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-800">{device.description || device.category}</span>
            <span className={`badge ${DEVICE_STATUS_COLORS[device.status]}`}>
              {DEVICE_STATUS_LABELS[device.status]}
            </span>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">设备信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
              <Hash className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">设备编号</p>
                <p className="text-sm font-medium text-slate-800">{device.code}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
              <Tag className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">品类</p>
                <p className="text-sm font-medium text-slate-800">{device.category}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
              <User className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">保管人</p>
                <p className="text-sm font-medium text-slate-800">{device.custodian}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
              <DollarSign className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">价值</p>
                <p className="text-sm font-medium text-slate-800">¥{device.value.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 md:col-span-2">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">购买日期</p>
                <p className="text-sm font-medium text-slate-800">{device.purchaseDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-slate-800">借用记录</h3>
            <span className="text-xs text-slate-400">({borrows.length})</span>
          </div>
          {borrows.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">暂无借用记录</p>
          ) : (
            <div className="space-y-3">
              {borrows.map((b) => (
                <div key={b.id} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{b.borrower}</span>
                    <span className={`badge ${BORROW_STATUS_COLORS[b.status]}`}>
                      {BORROW_STATUS_LABELS[b.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{b.purpose}</p>
                  <p className="text-xs text-slate-400">
                    {b.borrowDate} → {b.actualReturnDate || b.expectedReturnDate}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800">维修记录</h3>
            <span className="text-xs text-slate-400">({repairs.length})</span>
          </div>
          {repairs.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">暂无维修记录</p>
          ) : (
            <div className="space-y-3">
              {repairs.map((r) => (
                <div key={r.id} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{r.handler}</span>
                    <span className={`badge ${REPAIR_STATUS_COLORS[r.status]}`}>
                      {REPAIR_STATUS_LABELS[r.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{r.faultDescription}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">{r.startDate}</p>
                    {r.cost > 0 && (
                      <p className="text-xs text-rose-500 font-medium">¥{r.cost}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
