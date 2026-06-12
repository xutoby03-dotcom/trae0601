import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, AlertTriangle, Clock } from 'lucide-react';
import { useAppStore } from '@/store';
import { BORROW_STATUS_COLORS, BORROW_STATUS_LABELS } from '@/types';

export default function ReturnList() {
  const { borrows, devices } = useAppStore();

  const deviceMap = useMemo(() => {
    const map = new Map<string, (typeof devices)[number]>();
    devices.forEach((d) => map.set(d.id, d));
    return map;
  }, [devices]);

  const activeBorrows = useMemo(
    () => borrows.filter((b) => b.status === 'borrowing' || b.status === 'overdue'),
    [borrows]
  );

  const stats = useMemo(
    () => ({
      total: activeBorrows.length,
      overdue: activeBorrows.filter((b) => b.status === 'overdue').length,
    }),
    [activeBorrows]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">归还验收</h1>
          <p className="text-sm text-slate-500 mt-1">
            待归还 <span className="text-blue-600 font-medium">{stats.total}</span> 笔，其中逾期{' '}
            <span className="text-rose-600 font-medium">{stats.overdue}</span> 笔
          </p>
        </div>
      </div>

      {activeBorrows.length === 0 ? (
        <div className="card p-16 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">暂无待归还的设备</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeBorrows.map((borrow) => {
            const device = deviceMap.get(borrow.deviceId);
            const isOverdue = borrow.status === 'overdue';
            return (
              <div
                key={borrow.id}
                className={`card p-5 transition-all hover:shadow-md ${
                  isOverdue ? 'ring-1 ring-rose-200' : ''
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  {device && (
                    <img
                      src={device.photo}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {device?.code || '未知设备'}
                      </span>
                      <span className={`badge ${BORROW_STATUS_COLORS[borrow.status]}`}>
                        {isOverdue && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {BORROW_STATUS_LABELS[borrow.status]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{device?.category}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      保管人：{device?.custodian}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4 p-3 rounded-lg bg-slate-50">
                  <div className="flex justify-between">
                    <span className="text-slate-500">借用人</span>
                    <span className="font-medium text-slate-800">{borrow.borrower}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">借出日期</span>
                    <span className="text-slate-700">{borrow.borrowDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">预计归还</span>
                    <span className={isOverdue ? 'text-rose-600 font-medium' : 'text-slate-700'}>
                      {borrow.expectedReturnDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">用途：</span>
                    <span className="text-slate-700">{borrow.purpose}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">配件 {borrow.accessories.length} 件：</span>
                    <span className="text-slate-700">
                      {borrow.accessories.map((a) => a.name).join('、')}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/returns/${borrow.id}`}
                  className="btn-primary w-full"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  开始验收
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
