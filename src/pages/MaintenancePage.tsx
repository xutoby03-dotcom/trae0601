import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Wrench,
  Scissors,
  Footprints,
  Clapperboard,
  MapPin,
  Check,
  AlertTriangle,
  Plus,
  Minus,
} from 'lucide-react';
import useTableStore from '@/store/useTableStore';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/utils/helpers';
import type { IssueType } from '@/types';

interface RepairItemProps {
  icon: React.ReactNode;
  title: string;
  currentValue?: string;
  targetValue?: string;
  checked: boolean;
  onToggle: () => void;
  hasIssue: boolean;
  color: 'orange' | 'amber' | 'red' | 'violet';
  children?: React.ReactNode;
}

function RepairItem({
  icon,
  title,
  currentValue,
  targetValue,
  checked,
  onToggle,
  hasIssue,
  color,
  children,
}: RepairItemProps) {
  const colorClasses = {
    orange: 'border-orange-200 bg-orange-50',
    amber: 'border-amber-200 bg-amber-50',
    red: 'border-red-200 bg-red-50',
    violet: 'border-violet-200 bg-violet-50',
  };

  const textColorClasses = {
    orange: 'text-orange-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
    violet: 'text-violet-700',
  };

  const iconBgClasses = {
    orange: 'bg-orange-100 text-orange-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    violet: 'bg-violet-100 text-violet-600',
  };

  if (!hasIssue) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border-2 transition-all duration-200 overflow-hidden',
        checked ? 'border-gray-100 bg-white' : colorClasses[color]
      )}
    >
      <div className="p-4 flex items-center gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            checked ? 'bg-emerald-100 text-emerald-600' : iconBgClasses[color]
          )}
        >
          {checked ? <Check className="w-6 h-6" /> : icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'font-semibold',
                checked ? 'text-gray-500 line-through' : textColorClasses[color]
              )}
            >
              {title}
            </h3>
            {checked && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                已修复
              </span>
            )}
          </div>
          {currentValue && (
            <p className="text-sm text-gray-500 mt-0.5">
              当前：{currentValue}
              {targetValue && <span className="text-gray-400"> · 目标：{targetValue}</span>}
            </p>
          )}
        </div>

        <button
          onClick={onToggle}
          className={cn(
            'w-12 h-7 rounded-full relative transition-colors duration-200 flex-shrink-0',
            checked ? 'bg-emerald-500' : 'bg-gray-300'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200',
              checked ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>

      {children && (
        <div className="px-4 pb-4 pt-0 ml-16">{children}</div>
      )}
    </div>
  );
}

export default function MaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tables, repairTable } = useTableStore();

  const table = tables.find((t) => t.id === id);

  const [repairs, setRepairs] = useState({
    desktopFixed: false,
    footPadsAdded: 0,
    tableclothFound: false,
    positionVerified: false,
    note: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const hasDesktopIssue = table?.issueTags.includes('desktop_damaged') || false;
  const hasMissingParts = table?.issueTags.includes('missing_parts') || false;
  const hasPositionIssue = table?.issueTags.includes('position_mismatch') || false;

  const missingPads = table ? table.totalFootPads - table.footPadCount : 0;
  const missingTablecloth = table ? !table.hasTablecloth : false;

  const missingPadsIssue = hasMissingParts && missingPads > 0;
  const tableclothIssue = hasMissingParts && missingTablecloth;

  const allFixed = useMemo(() => {
    let allOk = true;
    if (hasDesktopIssue && !repairs.desktopFixed) allOk = false;
    if (missingPadsIssue && repairs.footPadsAdded < missingPads) allOk = false;
    if (tableclothIssue && !repairs.tableclothFound) allOk = false;
    if (hasPositionIssue && !repairs.positionVerified) allOk = false;
    return allOk;
  }, [hasDesktopIssue, missingPadsIssue, tableclothIssue, hasPositionIssue, repairs, missingPads]);

  const issuesCount = [hasDesktopIssue, missingPadsIssue, tableclothIssue, hasPositionIssue].filter(Boolean).length;
  const fixedCount = [
    hasDesktopIssue && repairs.desktopFixed,
    missingPadsIssue && repairs.footPadsAdded >= missingPads,
    tableclothIssue && repairs.tableclothFound,
    hasPositionIssue && repairs.positionVerified,
  ].filter(Boolean).length;

  if (!table) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-gray-500">未找到该桌子</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!allFixed) return;
    repairTable(table.id, repairs);
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/admin');
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-xl animate-scaleIn">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">维修完成</h2>
          <p className="text-gray-500 text-sm">{table.id} 已恢复可借用状态</p>
          <p className="text-gray-400 text-xs mt-4">即将返回物业工作台...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">返回</span>
        </button>

        {/* 桌子信息卡片 */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <div className="h-32 bg-gradient-to-br from-violet-500 to-violet-600 p-5 relative">
            <div className="absolute right-4 top-4 flex gap-1.5">
              {table.issueTags.map((tag: IssueType) => (
                <StatusBadge key={tag} type="issue" value={tag} pulse />
              ))}
            </div>
            <p className="text-white/80 text-sm font-medium">维修处理</p>
            <h1 className="text-white text-2xl font-bold mt-1">{table.id}</h1>
            <p className="text-white/70 text-sm mt-0.5">{table.size} · {table.storageCabinet}</p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{table.scratchCount}</p>
                <p className="text-xs text-gray-500 mt-1">桌面划痕</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {table.footPadCount}/{table.totalFootPads}
                </p>
                <p className="text-xs text-gray-500 mt-1">脚垫数量</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {table.hasTablecloth ? '✓' : '✗'}
                </p>
                <p className="text-xs text-gray-500 mt-1">桌布状态</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-600">
                  {hasPositionIssue ? '✗' : '✓'}
                </p>
                <p className="text-xs text-gray-500 mt-1">柜位状态</p>
              </div>
            </div>
          </div>
        </div>

        {/* 维修清单 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">逐项修复</h2>
          <p className="text-sm text-gray-500 mb-4">
            请逐项检查并标记已修复的项目，全部完成后可恢复可借用状态
          </p>

          <div className="space-y-3">
            <RepairItem
              icon={<Scissors className="w-6 h-6" />}
              title="桌面划痕已修复"
              currentValue={`${table.scratchCount}处`}
              targetValue="0处"
              checked={repairs.desktopFixed}
              onToggle={() => setRepairs((prev) => ({ ...prev, desktopFixed: !prev.desktopFixed }))}
              hasIssue={hasDesktopIssue}
              color="orange"
            />

            <RepairItem
              icon={<Footprints className="w-6 h-6" />}
              title="补齐脚垫"
              currentValue={`${table.footPadCount}/${table.totalFootPads}个`}
              targetValue={`${table.totalFootPads}/${table.totalFootPads}个`}
              checked={repairs.footPadsAdded >= missingPads}
              onToggle={() => {}}
              hasIssue={missingPadsIssue}
              color="amber"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">补充数量：</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setRepairs((prev) => ({
                        ...prev,
                        footPadsAdded: Math.max(0, prev.footPadsAdded - 1),
                      }))
                    }
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900">{repairs.footPadsAdded}</span>
                  <button
                    onClick={() =>
                      setRepairs((prev) => ({
                        ...prev,
                        footPadsAdded: Math.min(missingPads, prev.footPadsAdded + 1),
                      }))
                    }
                    className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 hover:bg-amber-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">还需补 {missingPads} 个</span>
              </div>
            </RepairItem>

            <RepairItem
              icon={<Clapperboard className="w-6 h-6" />}
              title="桌布已找回"
              checked={repairs.tableclothFound}
              onToggle={() =>
                setRepairs((prev) => ({ ...prev, tableclothFound: !prev.tableclothFound }))
              }
              hasIssue={tableclothIssue}
              color="red"
            />

            <RepairItem
              icon={<MapPin className="w-6 h-6" />}
              title="柜位已核实"
              currentValue={hasPositionIssue ? `未归位（原柜 ${table.storageCabinet}）` : undefined}
              targetValue={table.storageCabinet}
              checked={repairs.positionVerified}
              onToggle={() =>
                setRepairs((prev) => ({ ...prev, positionVerified: !prev.positionVerified }))
              }
              hasIssue={hasPositionIssue}
              color="violet"
            />
          </div>
        </div>

        {/* 备注 */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">维修备注（可选）</label>
          <textarea
            value={repairs.note}
            onChange={(e) => setRepairs((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="记录维修详情..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 resize-none"
            rows={3}
          />
        </div>

        {/* 底部操作栏 */}
        <div className="sticky bottom-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {allFixed ? '全部修复完成' : `已修复 ${fixedCount}/${issuesCount} 项`}
                </p>
                <p className="text-xs text-gray-500">
                  {allFixed ? '确认后将恢复可借用状态' : '请完成所有修复项'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {allFixed ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                )}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allFixed}
              className={cn(
                'w-full py-3.5 px-4 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98]',
                allFixed
                  ? 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700'
                  : 'bg-gray-300 cursor-not-allowed'
              )}
            >
              {allFixed ? '完成维修 · 恢复可借' : '请完成所有修复项'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
