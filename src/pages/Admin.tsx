import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  AlertTriangle,
  Wrench,
  Clock,
  User,
  MapPin,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Table,
} from 'lucide-react';
import useTableStore from '@/store/useTableStore';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { cn, formatDate, getDaysLeft } from '@/utils/helpers';
import { getWeeklyAvailability } from '@/data/mockData';
import type { FoldingTable, BorrowRecord, IssueType } from '@/types';

function WeeklyChart() {
  const weeklyData = getWeeklyAvailability();
  const maxCount = Math.max(...weeklyData.map((d) => d.count));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">本周可用数量</h3>
        <span className="text-xs text-gray-400">共7天</span>
      </div>
      <div className="flex items-end justify-between gap-2 h-32">
        {weeklyData.map((day, index) => {
          const heightPercent = (day.count / maxCount) * 100;
          const isToday = index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6);
          return (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-24 flex items-end">
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-500',
                    isToday
                      ? 'bg-gradient-to-t from-teal-500 to-teal-400'
                      : 'bg-gradient-to-t from-teal-200 to-teal-100'
                  )}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isToday ? 'text-teal-700' : 'text-gray-500'
                )}
              >
                {day.day}
              </span>
              <span
                className={cn(
                  'text-xs font-bold',
                  isToday ? 'text-teal-600' : 'text-gray-400'
                )}
              >
                {day.count}张
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface OverdueItemProps {
  record: BorrowRecord;
  table: FoldingTable | undefined;
  onAction: () => void;
}

function OverdueItem({ record, table, onAction }: OverdueItemProps) {
  const daysOverdue = Math.abs(getDaysLeft(record.expectedReturn));

  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-2xl border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onAction}
    >
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900">{record.residentName}</h4>
          <span className="text-xs text-gray-500">{record.residentRoom}</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Table className="w-3 h-3" />
            {table?.id || '未知桌子'}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            逾期 {daysOverdue} 天
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 truncate">
          预计归还：{formatDate(record.expectedReturn)}
        </p>
      </div>

      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
    </div>
  );
}

interface MaintenanceItemProps {
  table: FoldingTable;
  onAction: () => void;
}

function MaintenanceItem({ table, onAction }: MaintenanceItemProps) {
  const hasDamaged = table.issueTags.includes('desktop_damaged');
  const hasMissing = table.issueTags.includes('missing_parts');
  const hasPositionMismatch = table.issueTags.includes('position_mismatch');

  const missingPads = table.totalFootPads - table.footPadCount;
  const missingTablecloth = !table.hasTablecloth;

  let primaryColor = 'gray';
  if (hasDamaged) primaryColor = 'orange';
  else if (hasMissing) primaryColor = 'amber';
  else if (hasPositionMismatch) primaryColor = 'violet';

  const detailItems = [];
  if (hasDamaged) {
    detailItems.push({ label: '划痕', value: `${table.scratchCount}处`, color: 'text-orange-600' });
  }
  if (missingPads > 0) {
    detailItems.push({ label: '脚垫', value: `${table.footPadCount}/${table.totalFootPads}`, color: 'text-amber-600' });
  }
  if (missingTablecloth) {
    detailItems.push({ label: '桌布', value: '缺失', color: 'text-red-600' });
  }
  if (hasPositionMismatch) {
    detailItems.push({ label: '柜位', value: '待核实', color: 'text-violet-600' });
  }

  const borderColorMap: Record<string, string> = {
    orange: '#f97316',
    amber: '#f59e0b',
    violet: '#8b5cf6',
    gray: '#9ca3af',
  };

  return (
    <div
      className="p-4 bg-white rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      style={{ borderLeftColor: borderColorMap[primaryColor] }}
      onClick={onAction}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            primaryColor === 'orange' && 'bg-orange-50',
            primaryColor === 'amber' && 'bg-amber-50',
            primaryColor === 'violet' && 'bg-violet-50',
            primaryColor === 'gray' && 'bg-gray-50'
          )}
        >
          <Wrench
            className={cn(
              'w-6 h-6',
              primaryColor === 'orange' && 'text-orange-500',
              primaryColor === 'amber' && 'text-amber-500',
              primaryColor === 'violet' && 'text-violet-500',
              primaryColor === 'gray' && 'text-gray-500'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{table.id}</h4>
            <span className="text-xs text-gray-400">{table.size}</span>
          </div>
          <div className={cn('text-xs mt-0.5 flex items-center gap-1',
            hasPositionMismatch ? 'text-violet-600 font-medium' : 'text-gray-500'
          )}>
            {hasPositionMismatch ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>柜位待核</span>
                <span className="text-gray-400 font-normal">· 原柜 {table.storageCabinet}</span>
              </>
            ) : (
              table.storageCabinet
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
      </div>

      {/* 具体问题明细 */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-x-4 gap-y-2">
        {detailItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">{item.label}：</span>
            <span className={cn('text-xs font-semibold', item.color)}>{item.value}</span>
          </div>
        ))}
        {detailItems.length === 0 && table.issueTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {table.issueTags.map((tag: IssueType) => (
              <StatusBadge key={tag} type="issue" value={tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const { tables, getAvailableCount, getOverdueRecords, getMaintenanceTables } = useTableStore();

  const availableCount = getAvailableCount();
  const overdueRecords = getOverdueRecords();
  const maintenanceTables = getMaintenanceTables();
  const totalCount = tables.length;
  const borrowedCount = tables.filter((t) => t.status === 'borrowed').length;

  const handleOverdueClick = (tableId: string) => {
    navigate(`/return/${tableId}`);
  };

  const handleMaintenanceClick = (tableId: string) => {
    navigate(`/return/${tableId}`);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">物业工作台</h1>
          <p className="text-gray-500 text-sm mt-1">活动室折叠桌管理总览</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="今日可用"
            value={availableCount}
            subtitle={`共 ${totalCount} 张`}
            icon={<Table className="w-5 h-5" />}
            color="teal"
            trend="neutral"
          />
          <StatCard
            title="借出中"
            value={borrowedCount}
            subtitle="正在使用"
            icon={<Calendar className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="逾期未还"
            value={overdueRecords.length}
            subtitle="需催还"
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
          />
          <StatCard
            title="待维修"
            value={maintenanceTables.length}
            subtitle="需处理"
            icon={<Wrench className="w-5 h-5" />}
            color="amber"
          />
        </div>

        {/* 本周趋势 */}
        <div className="mb-6">
          <WeeklyChart />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 逾期名单 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="font-bold text-gray-900">逾期名单</h2>
              </div>
              <span className="text-sm text-red-600 font-medium">{overdueRecords.length} 人</span>
            </div>

            <div className="space-y-3">
              {overdueRecords.length > 0 ? (
                overdueRecords.map((record) => {
                  const table = tables.find((t) => t.id === record.tableId);
                  return (
                    <OverdueItem
                      key={record.id}
                      record={record}
                      table={table}
                      onAction={() => handleOverdueClick(record.tableId)}
                    />
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-gray-500 text-sm">暂无逾期</p>
                  <p className="text-gray-400 text-xs mt-1">所有借桌均按时归还</p>
                </div>
              )}
            </div>
          </div>

          {/* 待维修清单 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <h2 className="font-bold text-gray-900">待维修清单</h2>
              </div>
              <span className="text-sm text-amber-600 font-medium">
                {maintenanceTables.length} 张
              </span>
            </div>

            <div className="space-y-3">
              {maintenanceTables.length > 0 ? (
                maintenanceTables.map((table) => (
                  <MaintenanceItem
                    key={table.id}
                    table={table}
                    onAction={() => handleMaintenanceClick(table.id)}
                  />
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-gray-500 text-sm">所有桌子状态良好</p>
                  <p className="text-gray-400 text-xs mt-1">暂无待维修项</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 全部桌子快速预览 */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">全部桌子状态</h2>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
            >
              查看详情
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={cn(
                    'aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all cursor-pointer hover:scale-105',
                    table.status === 'available' && 'bg-emerald-50 text-emerald-700 border border-emerald-100',
                    table.status === 'borrowed' && 'bg-blue-50 text-blue-700 border border-blue-100',
                    table.status === 'maintenance' && 'bg-gray-50 text-gray-500 border border-gray-200',
                    table.issueTags.includes('overdue') && 'bg-red-50 text-red-700 border border-red-200'
                  )}
                  onClick={() => navigate('/')}
                >
                  <span className="text-lg font-bold">{table.id.replace('T-', '')}</span>
                  <span className="text-[10px] mt-0.5 opacity-75">
                    {table.status === 'available' && '可用'}
                    {table.status === 'borrowed' && '借出'}
                    {table.status === 'maintenance' && '维修'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-400" />
                <span className="text-xs text-gray-500">可借用</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-400" />
                <span className="text-xs text-gray-500">借出中</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-400" />
                <span className="text-xs text-gray-500">已逾期</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gray-400" />
                <span className="text-xs text-gray-500">维修中</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
