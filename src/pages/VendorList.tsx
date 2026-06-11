import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Phone, Calendar, FileText, Filter, AlertCircle } from 'lucide-react';
import { useVendorStore } from '@/stores/useVendorStore';
import { getLicenseStatus, getDaysUntilExpiry, formatDate, isExpiringThisWeek } from '@/utils/date';
import { stallTypeLabels } from '@/types';
import type { LicenseStatus, AuditStatus, StallType } from '@/types';
import StatusBadge from '@/components/StatusBadge';

type FilterStatus = 'all' | LicenseStatus;
type FilterAudit = 'all' | AuditStatus;
type FilterType = 'all' | StallType;

const VendorList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { vendors, initData, isLoaded } = useVendorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [auditFilter, setAuditFilter] = useState<FilterAudit>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [expiringWeekFilter, setExpiringWeekFilter] = useState(false);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    const status = searchParams.get('status') as LicenseStatus | null;
    const audit = searchParams.get('audit') as AuditStatus | null;
    const type = searchParams.get('type') as StallType | null;
    const expiringWeek = searchParams.get('expiringWeek');

    if (status) setStatusFilter(status);
    if (audit) setAuditFilter(audit);
    if (type) setTypeFilter(type);
    if (expiringWeek === 'true') setExpiringWeekFilter(true);
  }, [searchParams]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const licenseStatus = getLicenseStatus(vendor.validUntil);

      if (expiringWeekFilter && !isExpiringThisWeek(vendor.validUntil)) return false;
      if (statusFilter !== 'all' && licenseStatus !== statusFilter) return false;
      if (auditFilter !== 'all' && vendor.auditStatus !== auditFilter) return false;
      if (typeFilter !== 'all' && vendor.stallType !== typeFilter) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          vendor.name.toLowerCase().includes(query) ||
          vendor.licenseNumber.toLowerCase().includes(query) ||
          stallTypeLabels[vendor.stallType].includes(query) ||
          vendor.businessCategory.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [vendors, expiringWeekFilter, statusFilter, auditFilter, typeFilter, searchQuery]);

  const handleStatusTabClick = (status: FilterStatus) => {
    setStatusFilter(status);
    setExpiringWeekFilter(false);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    searchParams.delete('expiringWeek');
    setSearchParams(searchParams);
  };

  const statusTabs = [
    { key: 'all' as const, label: '全部', count: vendors.length },
    { key: 'normal' as const, label: '正常', count: vendors.filter(v => getLicenseStatus(v.validUntil) === 'normal').length },
    { key: 'expiring' as const, label: '临期', count: vendors.filter(v => getLicenseStatus(v.validUntil) === 'expiring').length },
    { key: 'expired' as const, label: '已过期', count: vendors.filter(v => getLicenseStatus(v.validUntil) === 'expired').length },
  ];

  if (!isLoaded) {
    return <div className="text-center py-20">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">
              {expiringWeekFilter ? '本周到期证照' : '摊主管理'}
            </h1>
            {expiringWeekFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                <AlertCircle className="w-4 h-4" />
                仅显示本周到期
                <button
                  onClick={() => {
                    setExpiringWeekFilter(false);
                    searchParams.delete('expiringWeek');
                    setSearchParams(searchParams);
                  }}
                  className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-1">
            {expiringWeekFilter ? '本周内证照到期的摊主列表' : '管理所有摊主档案和证照信息'}
          </p>
        </div>
        <button
          onClick={() => navigate('/vendors/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          新增摊主
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100">
          <div className="flex">
            {statusTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleStatusTabClick(tab.key)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  statusFilter === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  statusFilter === tab.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索姓名、证照编号、摊位类型..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={auditFilter}
                  onChange={e => setAuditFilter(e.target.value as FilterAudit)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">全部审核状态</option>
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已驳回</option>
                  <option value="material_required">待补材料</option>
                </select>
              </div>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as FilterType)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="all">全部摊位类型</option>
                <option value="food">食品类</option>
                <option value="handcraft">手作类</option>
                <option value="clothing">服饰类</option>
                <option value="accessory">饰品类</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3" />
              <p>暂无符合条件的摊主</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredVendors.map(vendor => {
                const licenseStatus = getLicenseStatus(vendor.validUntil);
                const daysLeft = getDaysUntilExpiry(vendor.validUntil);
                const isExpiring = licenseStatus === 'expiring';
                const isExpired = licenseStatus === 'expired';

                return (
                  <div
                    key={vendor.id}
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                    className={`relative p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                      isExpired
                        ? 'bg-red-50/50 border-red-200'
                        : isExpiring
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isExpiring && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-full m-3 animate-ping" />
                    )}
                    {isExpired && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-3" />
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                          vendor.stallType === 'food'
                            ? 'bg-rose-100 text-rose-600'
                            : vendor.stallType === 'handcraft'
                            ? 'bg-purple-100 text-purple-600'
                            : vendor.stallType === 'clothing'
                            ? 'bg-blue-100 text-blue-600'
                            : vendor.stallType === 'accessory'
                            ? 'bg-pink-100 text-pink-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {vendor.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{vendor.name}</h3>
                          <p className="text-sm text-slate-500">{stallTypeLabels[vendor.stallType]}</p>
                        </div>
                      </div>
                      <StatusBadge type="license" status={licenseStatus} size="sm" />
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">证照号：</span>
                        <span className="font-mono">{vendor.licenseNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">有效期至：</span>
                        <span className={isExpired ? 'text-red-600 font-medium' : isExpiring ? 'text-amber-600 font-medium' : ''}>
                          {formatDate(vendor.validUntil)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">电话：</span>
                        <span>{vendor.phone}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <StatusBadge type="audit" status={vendor.auditStatus} size="sm" />
                      <span className={`text-xs ${
                        isExpired
                          ? 'text-red-600'
                          : isExpiring
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}>
                        {isExpired
                          ? `已过期 ${Math.abs(daysLeft)} 天`
                          : isExpiring
                          ? `还剩 ${daysLeft} 天`
                          : `剩余 ${daysLeft} 天`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorList;
