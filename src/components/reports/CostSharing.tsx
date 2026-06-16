import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Calculator } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';

interface CostSharingProps {
  totalCost: number;
  totalMembers: number;
  pickedCount: number;
  avgCostPerPerson: number;
}

export function CostSharing({ totalCost, totalMembers, pickedCount, avgCostPerPerson }: CostSharingProps) {
  const stats = [
    { label: '物料总成本', value: `¥${totalCost.toFixed(2)}`, icon: DollarSign, color: 'text-primary-400', bgColor: 'bg-primary-500/20' },
    { label: '参与人数', value: totalMembers, icon: Users, color: 'text-accent-400', bgColor: 'bg-accent-500/20' },
    { label: '已领取人数', value: pickedCount, icon: TrendingUp, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
    { label: '人均分摊', value: `¥${avgCostPerPerson.toFixed(2)}`, icon: Calculator, color: 'text-gold-400', bgColor: 'bg-gold-500/20' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/20">
              <Calculator className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">费用分摊</h3>
              <p className="text-sm text-gray-500">按已领取人数计算人均成本</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-sm text-gray-400">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-white font-display">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">预计总收款</p>
                <p className="text-xl font-bold text-gradient-gold font-display">
                  ¥{(pickedCount * avgCostPerPerson).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">回收率</p>
                <p className="text-xl font-bold text-emerald-400">
                  {totalMembers > 0 ? ((pickedCount / totalMembers) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
            <div className="mt-3 progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${totalMembers > 0 ? (pickedCount / totalMembers) * 100 : 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
