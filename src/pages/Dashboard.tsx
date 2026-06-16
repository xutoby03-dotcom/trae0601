import { useState, useEffect } from 'react';
import { Users, CreditCard, AlertTriangle, Clock } from 'lucide-react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { UnreturnedBadges } from '../components/dashboard/UnreturnedBadges';
import { VisitorTable } from '../components/dashboard/VisitorTable';
import { AreaDistribution } from '../components/dashboard/AreaDistribution';
import { VisitorForm } from '../components/visitors/VisitorForm';
import { ReturnConfirm } from '../components/visitors/ReturnConfirm';
import { LossForm } from '../components/visitors/LossForm';
import type { Visitor } from '../types';
import { useBadgeStore } from '../store/useBadgeStore';

interface DashboardProps {
  onNewVisitor: () => void;
  showVisitorForm: boolean;
  onCloseVisitorForm: () => void;
}

export const Dashboard = ({ onNewVisitor, showVisitorForm, onCloseVisitorForm }: DashboardProps) => {
  const getDashboardStats = useBadgeStore((s) => s.getDashboardStats);
  const updateOvertimeStatus = useBadgeStore((s) => s.updateOvertimeStatus);

  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [showLossForm, setShowLossForm] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [, setTick] = useState(0);

  const stats = getDashboardStats();

  useEffect(() => {
    const interval = setInterval(() => {
      updateOvertimeStatus();
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [updateOvertimeStatus]);

  const handleReturn = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setShowReturnConfirm(true);
  };

  const handleReportLost = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setShowLossForm(true);
  };

  const handleCloseReturn = () => {
    setShowReturnConfirm(false);
    setSelectedVisitor(null);
  };

  const handleCloseLoss = () => {
    setShowLossForm(false);
    setSelectedVisitor(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="今日访客"
          value={stats.todayTotal}
          icon={Users}
          gradientFrom="from-primary"
          gradientTo="to-primary-light"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          subtitle="总登记访客数"
        />
        <StatsCard
          title="未归还工牌"
          value={stats.notReturned}
          icon={CreditCard}
          gradientFrom="from-warning"
          gradientTo="to-warning-light"
          iconBg="bg-warning/10"
          iconColor="text-warning"
          subtitle="当前在场访客"
        />
        <StatsCard
          title="超时未归还"
          value={stats.overtimeCount}
          icon={AlertTriangle}
          gradientFrom="from-danger"
          gradientTo="to-danger-light"
          iconBg="bg-danger/10"
          iconColor="text-danger"
          subtitle="超过预计离开时间"
        />
        <StatsCard
          title="平均停留时长"
          value={stats.avgStayDuration}
          icon={Clock}
          gradientFrom="from-success"
          gradientTo="to-success-light"
          iconBg="bg-success/10"
          iconColor="text-success"
          subtitle="已离场访客均值"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <UnreturnedBadges onReturn={handleReturn} onReportLost={handleReportLost} />
          <VisitorTable onReturn={handleReturn} onReportLost={handleReportLost} />
        </div>
        <div className="space-y-6">
          <AreaDistribution stats={stats} />
          <div className="card p-5">
            <h3 className="text-base font-semibold text-neutral-800 mb-4">操作指南</h3>
            <div className="space-y-3 text-sm text-neutral-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                <p>访客到达时点击「访客登记」填写信息并发放工牌</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </span>
                <p>访客离场时在未归还列表点击「归还工牌」确认回收</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                <p>超时未归还的工牌将自动标红，提醒前台和接待人</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-danger/10 text-danger flex items-center justify-center text-xs font-bold shrink-0">
                  !
                </span>
                <p>工牌遗失需登记赔付并立即停用，后续可补办新工牌</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VisitorForm open={showVisitorForm} onClose={onCloseVisitorForm} />
      <ReturnConfirm
        open={showReturnConfirm}
        onClose={handleCloseReturn}
        visitor={selectedVisitor}
      />
      <LossForm
        open={showLossForm}
        onClose={handleCloseLoss}
        visitor={selectedVisitor}
      />
    </div>
  );
};
