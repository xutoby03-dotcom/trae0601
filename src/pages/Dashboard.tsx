import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  UtensilsCrossed,
  FileWarning,
  Users,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useVendorStore } from '@/stores/useVendorStore';
import { isExpiringThisWeek, getDaysUntilExpiry, getLicenseStatus, formatDate } from '@/utils/date';
import StatusBadge from '@/components/StatusBadge';

const Dashboard = () => {
  const navigate = useNavigate();
  const { vendors, initData, isLoaded } = useVendorStore();

  useEffect(() => {
    initData();
  }, [initData]);

  if (!isLoaded) {
    return <div className="text-center py-20">加载中...</div>;
  }

  const expiringThisWeek = vendors.filter(v => isExpiringThisWeek(v.validUntil));
  const foodVendors = vendors.filter(v => v.stallType === 'food');
  const materialRequired = vendors.filter(v => v.auditStatus === 'material_required');
  const expiringVendors = vendors.filter(v => getLicenseStatus(v.validUntil) === 'expiring');
  const expiredVendors = vendors.filter(v => getLicenseStatus(v.validUntil) === 'expired');

  const sortedExpiring = [...expiringVendors, ...expiredVendors].sort(
    (a, b) => getDaysUntilExpiry(a.validUntil) - getDaysUntilExpiry(b.validUntil)
  );

  const statsCards = [
    {
      title: '本周到期证照',
      value: expiringThisWeek.length,
      icon: CalendarClock,
      gradient: 'from-orange-500 to-amber-500',
      linkText: '查看全部',
      linkTo: '/vendors?status=expiring',
      unit: '张',
    },
    {
      title: '食品类摊主',
      value: foodVendors.length,
      icon: UtensilsCrossed,
      gradient: 'from-rose-500 to-pink-500',
      linkText: '食品类管理',
      linkTo: '/vendors?type=food',
      unit: '位',
    },
    {
      title: '待补材料',
      value: materialRequired.length,
      icon: FileWarning,
      gradient: 'from-amber-500 to-yellow-500',
      linkText: '去处理',
      linkTo: '/vendors?audit=material_required',
      unit: '人',
    },
    {
      title: '摊主总数',
      value: vendors.length,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-500',
      linkText: '摊主列表',
      linkTo: '/vendors',
      unit: '位',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">欢迎回来 👋</h1>
        <p className="text-slate-500 mt-1">这是周末广场摊位管理的最新概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(card.linkTo)}
          >
            <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{card.title}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-slate-800">{card.value}</span>
                    <span className="text-slate-400 text-sm">{card.unit}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-blue-600 font-medium hover:text-blue-700">{card.linkText}</span>
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">证照临期提醒</h2>
              <p className="text-sm text-slate-500 mt-0.5">以下摊主证照即将到期或已过期，请及时处理</p>
            </div>
            <button
              onClick={() => navigate('/vendors?status=expiring')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              查看全部
            </button>
          </div>

          {sortedExpiring.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>所有证照都在有效期内</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedExpiring.slice(0, 5).map(vendor => {
                const daysLeft = getDaysUntilExpiry(vendor.validUntil);
                const status = getLicenseStatus(vendor.validUntil);
                return (
                  <div
                    key={vendor.id}
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        status === 'expired' ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        {status === 'expired' ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{vendor.name}</p>
                        <p className="text-sm text-slate-500">{vendor.licenseNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge type="license" status={status} size="sm" />
                      <p className="text-sm text-slate-500 mt-1.5">
                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                        {status === 'expired'
                          ? `已过期 ${Math.abs(daysLeft)} 天`
                          : `还剩 ${daysLeft} 天`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">快捷操作</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/vendors/new')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">新增摊主档案</p>
                <p className="text-sm text-blue-600">录入新摊主信息</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/vendors?status=expiring')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">证照到期处理</p>
                <p className="text-sm text-amber-600">{expiringVendors.length} 张证照临期</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/vendors?audit=material_required')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center">
                <FileWarning className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">待补材料跟进</p>
                <p className="text-sm text-rose-600">{materialRequired.length} 人待补充</p>
              </div>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 mb-4">本周到期证照详情</h3>
            {expiringThisWeek.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">本周无到期证照</p>
            ) : (
              <div className="space-y-2">
                {expiringThisWeek.map(vendor => (
                  <div
                    key={vendor.id}
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="text-sm font-medium text-slate-700">{vendor.name}</span>
                    <span className="text-xs text-slate-400">{formatDate(vendor.validUntil)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
