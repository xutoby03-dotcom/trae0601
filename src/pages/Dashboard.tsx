import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChefHat, Package, TrendingUp } from 'lucide-react';
import { usePotStore } from '../store/usePotStore';
import PotCard from '../components/PotCard';
import { Card } from '../components/ui';

export default function Dashboard() {
  const navigate = useNavigate();
  const { pots, getAlertPots } = usePotStore();
  const alertPots = getAlertPots();

  const todayTotalBatches = pots.reduce(
    (sum, pot) => sum + pot.productionBatches.length,
    0
  );
  const totalSpicePacks = pots.reduce((sum, pot) => sum + pot.spicePackCount, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      {alertPots.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-lg">告警提示</h2>
              <p className="text-red-100 text-sm">共 {alertPots.length} 口卤锅需要关注</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertPots.map((pot) => (
              <button
                key={pot.id}
                onClick={() => navigate(`/pot/${pot.id}`)}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                {pot.name}
                <span className="text-red-100 text-xs">
                  {pot.soupLevel < 30 && '液位低 '}
                  {pot.continuousUseHours >= 72 && '超时'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-braised-red-100 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-braised-red-600" />
            </div>
            <div>
              <p className="text-stone-500 text-sm">在用卤锅</p>
              <p className="text-2xl font-bold text-stone-800">{pots.length} 口</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-gold-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-gold-600" />
            </div>
            <div>
              <p className="text-stone-500 text-sm">今日出品</p>
              <p className="text-2xl font-bold text-stone-800">{todayTotalBatches} 批</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-stone-500 text-sm">本月香料消耗</p>
              <p className="text-2xl font-bold text-stone-800">{totalSpicePacks} 包</p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-800">卤锅状态</h2>
          <button
            onClick={() => navigate('/cooking-record')}
            className="px-4 py-2 bg-braised-red-600 hover:bg-braised-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            记录续煮
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pots.map((pot) => (
            <PotCard key={pot.id} pot={pot} />
          ))}
        </div>
      </div>
    </div>
  );
}
