import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Filter } from 'lucide-react';
import useTableStore from '@/store/useTableStore';
import TableCard from '@/components/TableCard';
import BorrowModal from '@/components/BorrowModal';
import { cn } from '@/utils/helpers';

export default function Home() {
  const navigate = useNavigate();
  const { tables, filterStatus, setFilterStatus, getAvailableCount, openBorrowModal } =
    useTableStore();

  const availableCount = getAvailableCount();
  const totalCount = tables.length;

  const filteredTables =
    filterStatus === 'available'
      ? tables.filter((t) => t.status === 'available')
      : tables;

  const handleBorrow = (tableId: string) => {
    openBorrowModal(tableId);
  };

  const handleReturn = (tableId: string) => {
    navigate(`/return/${tableId}`);
  };

  const today = new Date();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 顶部看板 */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 p-8 text-white">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-10 -bottom-20 w-48 h-48 rounded-full bg-white/5 blur-xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <Calendar className="w-4 h-4" />
              <span>
                {today.getMonth() + 1}月{today.getDate()}日 · {weekDays[today.getDay()]}
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/80 text-lg">今天还能借</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-6xl font-bold tracking-tight">{availableCount}</span>
                  <span className="text-white/70 text-lg">/ {totalCount} 张</span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-white/70 text-sm">活动室开放时间</p>
                <p className="text-white font-medium">08:00 - 20:00</p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <Clock className="w-3 h-3 text-white/70" />
                  <span className="text-white/70 text-xs">借出请提前预约</span>
                </div>
              </div>
            </div>

            {/* 筛选切换 */}
            <div className="mt-6 flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl p-1 w-fit">
              <button
                onClick={() => setFilterStatus('available')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  filterStatus === 'available'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-white/80 hover:text-white'
                )}
              >
                <Filter className="w-4 h-4" />
                仅看可用
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  filterStatus === 'all'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-white/80 hover:text-white'
                )}
              >
                全部桌子
              </button>
            </div>
          </div>
        </div>

        {/* 桌子列表 */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {filterStatus === 'available' ? '可借用折叠桌' : '全部折叠桌'}
          </h2>
          <p className="text-sm text-gray-500">共 {filteredTables.length} 张桌子</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onBorrow={() => handleBorrow(table.id)}
              onReturn={() => handleReturn(table.id)}
            />
          ))}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">暂无可用折叠桌</p>
            <p className="text-sm text-gray-400 mt-1">请尝试查看全部桌子</p>
          </div>
        )}
      </div>

      <BorrowModal />
    </div>
  );
}
