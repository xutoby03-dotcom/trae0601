import { useMemo } from 'react';
import { Package, Clock, AlertTriangle, FileSearch, Archive } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { OverdueList, SealAlertList, AuditReminder } from '../components/dashboard/AlertLists';
import { DeptBorrowChart } from '../components/dashboard/DeptBorrowChart';
import { useAppStore } from '../store/useAppStore';
import { isOverdue } from '../utils';

export function Dashboard() {
  const archiveBoxes = useAppStore((s) => s.archiveBoxes);
  const borrowRecords = useAppStore((s) => s.borrowRecords);

  const stats = useMemo(() => {
    const overdueBoxes = borrowRecords
      .filter((r) => (r.status === '借出中' && isOverdue(r.expectedReturnDate)) || r.status === '已逾期')
      .map((r) => archiveBoxes.find((b) => b.id === r.archiveBoxId))
      .filter(Boolean).length;
    const sealAlerts = archiveBoxes.filter((b) => b.status === '异常').length;
    const upcomingAudits = archiveBoxes.filter((b) => {
      if (!b.auditDate) return false;
      const audit = new Date(b.auditDate).getTime();
      const now = Date.now();
      const diff = (audit - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    }).length;
    return { overdueBoxes, sealAlerts, upcomingAudits };
  }, [archiveBoxes, borrowRecords]);

  const totalBoxes = archiveBoxes.length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="管理看板"
        subtitle="实时监控档案箱状态，掌握借阅与归还情况"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="档案箱总数"
          value={totalBoxes}
          icon={Package}
          color="navy"
          trend={{ value: 5, label: '较上月' }}
          delay={0}
        />
        <StatCard
          title="逾期未还"
          value={stats.overdueBoxes}
          icon={Clock}
          color="red"
          trend={{ value: 2, label: '较上周' }}
          delay={80}
        />
        <StatCard
          title="封条异常"
          value={stats.sealAlerts}
          icon={AlertTriangle}
          color="gold"
          trend={{ value: 0, label: '较上周' }}
          delay={160}
        />
        <StatCard
          title="近期审计"
          value={stats.upcomingAudits}
          icon={FileSearch}
          color="green"
          trend={{ value: -1, label: '较上月' }}
          delay={240}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2">
          <DeptBorrowChart />
        </div>
        <div>
          <AuditReminder />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OverdueList />
        <SealAlertList />
      </div>
    </div>
  );
}
