import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Table,
  Unlink,
  Lock,
  Clapperboard,
  MapPin,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
} from 'lucide-react';
import useTableStore from '@/store/useTableStore';
import StatusBadge from '@/components/StatusBadge';
import { cn, formatDate } from '@/utils/helpers';
import type { ReturnCheckData } from '@/types';

interface CheckItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isOk: boolean;
  note: string;
  onToggle: () => void;
  onNoteChange: (note: string) => void;
  color: 'emerald' | 'red' | 'amber' | 'orange';
}

function CheckItem({
  icon,
  title,
  description,
  isOk,
  note,
  onToggle,
  onNoteChange,
  color,
}: CheckItemProps) {
  const [expanded, setExpanded] = useState(false);

  const colorClasses = {
    emerald: 'border-emerald-200 bg-emerald-50',
    red: 'border-red-200 bg-red-50',
    amber: 'border-amber-200 bg-amber-50',
    orange: 'border-orange-200 bg-orange-50',
  };

  const textColorClasses = {
    emerald: 'text-emerald-700',
    red: 'text-red-700',
    amber: 'text-amber-700',
    orange: 'text-orange-700',
  };

  const iconBgClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border-2 transition-all duration-200 overflow-hidden',
        isOk ? 'border-gray-100 bg-white' : colorClasses[color]
      )}
    >
      <div
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            isOk ? 'bg-gray-100 text-gray-500' : iconBgClasses[color]
          )}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'font-semibold',
                isOk ? 'text-gray-900' : textColorClasses[color]
              )}
            >
              {title}
            </h3>
            {isOk && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                完好
              </span>
            )}
            {!isOk && (
              <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                color === 'red' && 'text-red-600 bg-red-100',
                color === 'amber' && 'text-amber-600 bg-amber-100',
                color === 'orange' && 'text-orange-600 bg-orange-100',
              )}>
                <AlertTriangle className="w-3 h-3" />
                有问题
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={cn(
              'w-12 h-7 rounded-full relative transition-colors duration-200 flex-shrink-0',
              isOk ? 'bg-emerald-500' : 'bg-gray-300'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200',
                isOk ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </button>
          {!isOk && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {!isOk && expanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="ml-16">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">问题描述</label>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="请描述具体问题..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 resize-none"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReturnCheck() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tables, getActiveBorrowForTable, returnTable } = useTableStore();

  const table = tables.find((t) => t.id === id);
  const activeBorrow = id ? getActiveBorrowForTable(id) : undefined;

  const [checkData, setCheckData] = useState<ReturnCheckData>({
    desktopOk: true,
    desktopNote: '',
    legsOk: true,
    legsNote: '',
    lockOk: true,
    lockNote: '',
    tableclothReturned: true,
    positionCorrect: true,
  });

  const [showSuccess, setShowSuccess] = useState(false);

  if (!table) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-gray-500">未找到该桌子</p>
      </div>
    );
  }

  const allOk =
    checkData.desktopOk &&
    checkData.legsOk &&
    checkData.lockOk &&
    checkData.tableclothReturned &&
    checkData.positionCorrect;

  const handleSubmit = () => {
    if (!activeBorrow) return;
    returnTable(activeBorrow.id, checkData);
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const issuesCount = [
    !checkData.desktopOk,
    !checkData.legsOk,
    !checkData.lockOk,
    !checkData.tableclothReturned,
    !checkData.positionCorrect,
  ].filter(Boolean).length;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-xl animate-scaleIn">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">归还完成</h2>
          <p className="text-gray-500 text-sm">
            {allOk
              ? '桌子状态完好，已登记入库'
              : `已记录 ${issuesCount} 项问题，将安排维修`}
          </p>
          <p className="text-gray-400 text-xs mt-4">即将返回首页...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 顶部导航 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">返回</span>
        </button>

        {/* 桌子信息卡片 */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 p-5 relative">
            <div className="absolute right-4 top-4">
              <StatusBadge type="status" value={table.status} pulse />
            </div>
            <p className="text-white/80 text-sm font-medium">归还验收</p>
            <h1 className="text-white text-2xl font-bold mt-1">{table.id}</h1>
            <p className="text-white/70 text-sm mt-0.5">{table.size} · {table.storageCabinet}</p>
          </div>

          {activeBorrow && (
            <div className="p-5 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">借出信息</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{activeBorrow.residentName}</span>
                  <span className="text-gray-400 text-xs">({activeBorrow.residentRoom})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{formatDate(activeBorrow.borrowTime)}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{activeBorrow.purpose} · {activeBorrow.moveTo}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 验收清单 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">逐项核对</h2>
          <p className="text-sm text-gray-500 mb-4">
            请仔细检查以下项目，有问题的请记录
          </p>

          <div className="space-y-3">
            <CheckItem
              icon={<Table className="w-6 h-6" />}
              title="桌面状态"
              description="检查桌面是否有新的划痕、破损或污渍"
              isOk={checkData.desktopOk}
              note={checkData.desktopNote}
              onToggle={() => setCheckData((prev) => ({ ...prev, desktopOk: !prev.desktopOk }))}
              onNoteChange={(note) => setCheckData((prev) => ({ ...prev, desktopNote: note }))}
              color="orange"
            />

            <CheckItem
              icon={<Unlink className="w-6 h-6" />}
              title="桌脚与脚垫"
              description="检查桌脚是否稳固，脚垫是否齐全"
              isOk={checkData.legsOk}
              note={checkData.legsNote}
              onToggle={() => setCheckData((prev) => ({ ...prev, legsOk: !prev.legsOk }))}
              onNoteChange={(note) => setCheckData((prev) => ({ ...prev, legsNote: note }))}
              color="amber"
            />

            <CheckItem
              icon={<Lock className="w-6 h-6" />}
              title="锁扣状态"
              description="检查折叠锁扣是否完好、开合顺畅"
              isOk={checkData.lockOk}
              note={checkData.lockNote}
              onToggle={() => setCheckData((prev) => ({ ...prev, lockOk: !prev.lockOk }))}
              onNoteChange={(note) => setCheckData((prev) => ({ ...prev, lockNote: note }))}
              color="amber"
            />

            <CheckItem
              icon={<Clapperboard className="w-6 h-6" />}
              title="桌布归还"
              description="确认借出时带的桌布是否一并归还"
              isOk={checkData.tableclothReturned}
              note=""
              onToggle={() =>
                setCheckData((prev) => ({ ...prev, tableclothReturned: !prev.tableclothReturned }))
              }
              onNoteChange={() => {}}
              color="red"
            />

            <CheckItem
              icon={<MapPin className="w-6 h-6" />}
              title="放回位置"
              description="确认桌子是否放回指定存放柜位置"
              isOk={checkData.positionCorrect}
              note=""
              onToggle={() =>
                setCheckData((prev) => ({ ...prev, positionCorrect: !prev.positionCorrect }))
              }
              onNoteChange={() => {}}
              color="amber"
            />
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="sticky bottom-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {allOk ? '全部检查完好' : `发现 ${issuesCount} 项问题`}
                </p>
                <p className="text-xs text-gray-500">
                  {allOk ? '确认无误后完成归还' : '请详细记录问题，便于维修'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {allOk ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                )}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!activeBorrow}
              className={cn(
                'w-full py-3.5 px-4 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98]',
                allOk
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
                !activeBorrow && 'opacity-50 cursor-not-allowed'
              )}
            >
              {allOk ? '确认完成归还' : '记录问题并归还'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
