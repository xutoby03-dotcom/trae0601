import { AlertTriangle, Droplets, Leaf, Clock } from 'lucide-react';

interface RecoveryAlertProps {
  daysLeft: number;
  recoveryEndDate: string;
}

export default function RecoveryAlert({ daysLeft, recoveryEndDate }: RecoveryAlertProps) {
  return (
    <div className="relative overflow-hidden card bg-gradient-to-br from-leaf-50 to-cream-100 border-leaf-200">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-leaf-200/30 rounded-full blur-2xl" />

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-leaf-400/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-leaf-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-semibold text-leaf-800 mb-1">
              缓苗期进行中
            </h3>
            <p className="text-sm text-leaf-700 mb-3">
              还剩 <span className="font-semibold text-leaf-600">{daysLeft}</span> 天结束（至 {recoveryEndDate}）
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-xl">
                <Droplets className="w-4 h-4 text-forest-500" />
                <span className="text-xs text-forest-700">减少浇水频率</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-xl">
                <Leaf className="w-4 h-4 text-leaf-600" />
                <span className="text-xs text-forest-700">观察黄叶情况</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-xl">
                <Clock className="w-4 h-4 text-clay-600" />
                <span className="text-xs text-forest-700">关注掉叶现象</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
