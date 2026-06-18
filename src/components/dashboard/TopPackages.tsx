import { TrendingUp, Crown } from "lucide-react";
import { ServicePackage } from "@/types";

interface TopPackagesProps {
  packages: ServicePackage[];
}

export default function TopPackages({ packages }: TopPackagesProps) {
  const top5 = [...packages]
    .sort((a, b) => b.repurchaseCount - a.repurchaseCount)
    .slice(0, 5);
  const maxCount = Math.max(...top5.map((p) => p.repurchaseCount));

  const medalColors = [
    "from-yellow-400 to-yellow-500",
    "from-gray-300 to-gray-400",
    "from-orange-300 to-orange-400",
    "from-primary-300 to-primary-400",
    "from-primary-200 to-primary-300",
  ];

  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between p-5 pb-3 border-b border-cream-200">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-brown-900 text-lg">
            热门服务套餐
          </h3>
          <TrendingUp className="w-5 h-5 text-primary-500" />
        </div>
        <span className="chip bg-primary-50 text-primary-600 border-primary-100">
          复购排行
        </span>
      </div>

      <div className="p-4 space-y-3">
        {top5.map((pkg, idx) => {
          const percent = (pkg.repurchaseCount / maxCount) * 100;
          return (
            <div
              key={pkg.id}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${350 + idx * 50}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-7 h-7 rounded-xl bg-gradient-to-br ${medalColors[idx]} flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0`}
                >
                  {idx === 0 ? (
                    <Crown className="w-4 h-4" />
                  ) : (
                      idx + 1
                    )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-brown-900 text-sm">
                      {pkg.name}
                    </span>
                    <span className="text-primary-600 font-semibold text-sm">
                      {pkg.repurchaseCount} 次
                    </span>
                  </div>
                  <span className="text-xs text-brown-700/50">
                    ¥{pkg.price} · {Math.floor(pkg.durationMinutes / 60)}h{pkg.durationMinutes % 60}m
                  </span>
                </div>
              </div>
              <div className="ml-10 h-2 bg-cream-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${medalColors[idx]} transition-all duration-700`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
