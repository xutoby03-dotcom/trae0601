import { useStore } from '../store/useStore';
import { BathroomCard } from '../components/BathroomCard';
import { RiskBadge } from '../components/RiskBadge';
import { AlertTriangle, Shield, CheckCircle, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  const { bathrooms, getHighRiskBathrooms } = useStore();

  const safeCount = bathrooms.filter((b) => b.riskLevel === 'safe').length;
  const warningCount = bathrooms.filter((b) => b.riskLevel === 'warning').length;
  const dangerCount = bathrooms.filter((b) => b.riskLevel === 'danger').length;
  const highRiskBathrooms = getHighRiskBathrooms();

  const stats = [
    {
      label: '浴室总数',
      value: bathrooms.length,
      icon: <Shield size={24} />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: '安全',
      value: safeCount,
      icon: <CheckCircle size={24} />,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: '需注意',
      value: warningCount,
      icon: <AlertTriangle size={24} />,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: '高风险',
      value: dangerCount,
      icon: <TrendingUp size={24} />,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">浴室风险概览</h2>
        <p className="text-gray-600">
          定期检查防滑垫状态，守护家人安全。建议每周进行一次全面检查。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-2xl p-5 transition-all duration-300 hover:shadow-lg`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl ${stat.color} text-white flex items-center justify-center`}>
                {stat.icon}
              </div>
              <span className="text-gray-600 font-medium">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {highRiskBathrooms.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900">高风险提醒</h3>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <p className="text-red-700 mb-3">
              以下浴室存在安全隐患，请尽快处理：
            </p>
            <div className="flex flex-wrap gap-2">
              {highRiskBathrooms.map((b) => (
                <div key={b.id} className="flex items-center gap-2">
                  <RiskBadge level={b.riskLevel} size="sm" />
                  <span className="text-gray-800 font-medium">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">所有浴室</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bathrooms.map((bathroom, index) => (
          <div
            key={bathroom.id}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <BathroomCard bathroom={bathroom} />
          </div>
        ))}
      </div>
    </div>
  );
};
