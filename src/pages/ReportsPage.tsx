import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Users, Package, Clock, DollarSign } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { UnpickedList } from '../components/reports/UnpickedList';
import { CostSharing } from '../components/reports/CostSharing';
import { RemainingMaterials } from '../components/reports/RemainingMaterials';
import { QueueAnalysis } from '../components/reports/QueueAnalysis';
import { useMemberStore } from '../store/memberStore';
import { useMaterialStore } from '../store/materialStore';
import { usePickupPointStore } from '../store/pickupPointStore';

export default function ReportsPage() {
  const { members } = useMemberStore();
  const { materials } = useMaterialStore();
  const { getAllPickupPointStats, getLongestQueuePoint } = usePickupPointStore();

  const pickupPointStats = useMemo(() => getAllPickupPointStats(), [getAllPickupPointStats]);
  const longestQueuePoint = useMemo(() => getLongestQueuePoint(), [getLongestQueuePoint]);

  const unpickedMembers = members.filter((m) => m.status === 'pending');
  const pickedCount = members.filter((m) => m.status === 'picked' || m.status === 'proxied').length;
  
  const totalCost = useMemo(() => {
    return materials.reduce((sum, m) => sum + m.cost * (m.totalQuantity - m.remainingQuantity), 0);
  }, [materials]);

  const avgCostPerPerson = pickedCount > 0 ? totalCost / pickedCount : 0;

  const attendanceRate = members.length > 0 ? ((pickedCount / members.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white font-display">统计报告</h1>
          <p className="text-gray-400 mt-1">演唱会应援物领取数据统计</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="总成员数"
          value={members.length}
          icon={<Users className="w-6 h-6" />}
          color="purple"
          delay={0.1}
        />
        <StatCard
          title="已领取率"
          value={`${attendanceRate}%`}
          icon={<BarChart3 className="w-6 h-6" />}
          color="green"
          delay={0.2}
        />
        <StatCard
          title="物料总成本"
          value={`¥${totalCost.toFixed(0)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="gold"
          delay={0.3}
        />
        <StatCard
          title="物料种类"
          value={materials.length}
          icon={<Package className="w-6 h-6" />}
          color="pink"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <UnpickedList members={unpickedMembers} />
        <CostSharing
          totalCost={totalCost}
          totalMembers={members.length}
          pickedCount={pickedCount}
          avgCostPerPerson={avgCostPerPerson}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RemainingMaterials materials={materials} />
        <QueueAnalysis
          pickupPointStats={pickupPointStats}
          longestQueuePoint={longestQueuePoint}
        />
      </div>
    </div>
  );
}
