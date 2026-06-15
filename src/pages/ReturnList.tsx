import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, MapPin, Calendar, AlertCircle, Table } from 'lucide-react';
import useTableStore from '@/store/useTableStore';
import StatusBadge from '@/components/StatusBadge';
import { cn, formatDate, isOverdue, getDaysLeft } from '@/utils/helpers';

export default function ReturnList() {
  const navigate = useNavigate();
  const { tables, borrowRecords } = useTableStore();

  const activeBorrows = borrowRecords.filter(
    (r) => r.status === 'active' || r.status === 'overdue'
  );

  const getTable = (tableId: string) => tables.find((t) => t.id === tableId);

  const handleCheck = (tableId: string) => {
    navigate(`/return/${tableId}`);
  };

  const overdueCount = activeBorrows.filter((r) => isOverdue(r.expectedReturn)).length;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 顶部 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">返回</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">归还验收</h1>
          <p className="text-gray-500 text-sm mt-1">选择要归还的桌子，逐项核对后完成验收</p>
        </div>

        {/* 统计条 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">待归还</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{activeBorrows.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
            <p className="text-sm text-red-500">已逾期</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</p>
          </div>
        </div>

        {/* 待归还列表 */}
        <div className="space-y-3">
          {activeBorrows.length > 0 ? (
            activeBorrows.map((record) => {
              const table = getTable(record.tableId);
              const overdue = isOverdue(record.expectedReturn);
              const daysLeft = getDaysLeft(record.expectedReturn);

              return (
                <div
                  key={record.id}
                  className={cn(
                    'bg-white rounded-2xl overflow-hidden shadow-sm border transition-all hover:shadow-md cursor-pointer',
                    overdue ? 'border-red-200' : 'border-gray-100'
                  )}
                  onClick={() => handleCheck(record.tableId)}
                >
                  <div className="flex">
                    {/* 桌子图片 */}
                    <div className="w-28 h-28 bg-gray-100 flex-shrink-0">
                      {table?.photo ? (
                        <img
                          src={table.photo}
                          alt={table.id}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Table className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* 信息区 */}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{table?.id || '未知桌子'}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{table?.size}</p>
                        </div>
                        <StatusBadge
                          type="status"
                          value={overdue ? 'overdue' as any : table?.status || 'borrowed'}
                          pulse={overdue}
                        />
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{record.residentName}</span>
                          <span className="text-gray-400">·</span>
                          <span>{record.residentRoom}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{record.purpose} · {record.moveTo}</span>
                        </div>
                        <div
                          className={cn(
                            'flex items-center gap-1.5 text-xs font-medium',
                            overdue ? 'text-red-600' : 'text-gray-500'
                          )}
                        >
                          {overdue ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>逾期 {Math.abs(daysLeft)} 天</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>还剩 {daysLeft} 天 · {formatDate(record.expectedReturn)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 箭头 */}
                    <div className="flex items-center pr-4">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Clock className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-gray-700 font-medium">暂无待归还的桌子</p>
              <p className="text-gray-400 text-sm mt-1">所有桌子都已归还入库</p>
            </div>
          )}
        </div>

        {/* 提示 */}
        {activeBorrows.length > 0 && (
          <p className="mt-6 text-center text-xs text-gray-400">
            点击卡片进入逐项验收流程
          </p>
        )}
      </div>
    </div>
  );
}
