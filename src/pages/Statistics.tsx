import React, { useEffect, useState } from 'react';
import {
  BarChart3, Package as PackageIcon, AlertTriangle, Clock, Grid3x3, Users,
  ChevronDown, ChevronUp, ArrowRight, Snowflake, DollarSign, Phone, Box, MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import {
  COMPANY_COLORS, formatDateTime, getTimeDiffHours,
} from '../lib/utils';
import type {
  Package, StatsSummary, CompanyStats, AbnormalRecord,
} from 'shared/types.js';

export default function Statistics() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [waitingPackages, setWaitingPackages] = useState<(Package & { isOverdue: boolean })[]>([]);
  const [abnormalRecords, setAbnormalRecords] = useState<AbnormalRecord[]>([]);
  const [tab, setTab] = useState<'waiting' | 'overdue' | 'abnormal'>('waiting');
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [sum, comp, wait, abn] = await Promise.all([
        api.getStatsSummary(),
        api.getCompanyStats(),
        api.getPackages({ status: 'waiting' }),
        api.getAbnormalRecords(),
      ]);
      setSummary(sum);
      setCompanyStats(comp);
      setWaitingPackages(wait);
      setAbnormalRecords(abn);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const overdueSorted = [...waitingPackages]
    .filter(p => p.isOverdue)
    .sort((a, b) => getTimeDiffHours(b.createdAt) - getTimeDiffHours(a.createdAt));

  const companyData = companyStats.map(c => ({
    name: c.company,
    value: c.count,
    fill: COMPANY_COLORS[c.company] || '#64748b',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-500" />
          数据统计
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">全面了解快递暂存柜的使用情况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="待取包裹" value={summary?.totalWaiting ?? 0} icon={PackageIcon} color="primary" />
        <StatCard title="超期包裹" value={summary?.totalOverdue ?? 0} icon={Clock} color="rose" />
        <StatCard
          title="柜格占用率"
          value={`${summary?.lockerOccupancy ?? 0}%`}
          icon={Grid3x3}
          color="amber"
        />
        <StatCard title="今日已取" value={summary?.pickedToday ?? 0} icon={Users} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">快递公司分布</h3>
          {loading || companyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={companyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {companyData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">快递公司包裹数量</h3>
          {loading || companyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={companyData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="包裹数" radius={[6, 6, 0, 0]}>
                  {companyData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-3 flex gap-1">
          {[
            { key: 'waiting', label: '未取包裹', count: waitingPackages.length, icon: PackageIcon },
            { key: 'overdue', label: '超期排行', count: overdueSorted.length, icon: Clock },
            { key: 'abnormal', label: '异常记录', count: abnormalRecords.length, icon: AlertTriangle },
          ].map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-card'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-slate-200'
                }`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {tab === 'overdue' && <th className="px-3 py-3 w-10"></th>}
                <th className="px-6 py-3 text-left font-medium">收件人</th>
                <th className="px-6 py-3 text-left font-medium">快递公司</th>
                <th className="px-6 py-3 text-left font-medium">单号</th>
                <th className="px-6 py-3 text-left font-medium">柜格</th>
                <th className="px-6 py-3 text-left font-medium">存放时间</th>
                {tab !== 'abnormal' && <th className="px-6 py-3 text-left font-medium">状态</th>}
                {tab === 'abnormal' && <th className="px-6 py-3 text-left font-medium">异常原因</th>}
                {tab === 'overdue' && <th className="px-6 py-3 text-left font-medium">超期时长</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={tab === 'overdue' ? 8 : 7} className="px-6 py-12 text-center text-slate-400">加载中...</td></tr>
              ) : (
                (tab === 'waiting' ? waitingPackages :
                 tab === 'overdue' ? overdueSorted :
                 abnormalRecords).map((item: any, i: number) => {
                  const rowKey = `${tab}-${i}`;
                  const isExpanded = expandedRow === rowKey;
                  return (
                    <React.Fragment key={rowKey}>
                      <tr
                        className={`hover:bg-slate-50 ${tab === 'overdue' ? 'cursor-pointer' : ''} ${
                          isExpanded ? 'bg-primary-500/5' : ''
                        }`}
                        onClick={() => {
                          if (tab === 'overdue') {
                            setExpandedRow(isExpanded ? null : rowKey);
                          }
                        }}
                      >
                        {tab === 'overdue' && (
                          <td className="px-3 py-3.5">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </td>
                        )}
                        <td className="px-6 py-3.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/?recipient=${encodeURIComponent(item.recipientName)}`);
                            }}
                            className="text-left hover:text-primary-600 group"
                          >
                            <div className="font-medium text-slate-800 group-hover:text-primary-600 flex items-center gap-1">
                              {item.recipientName}
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {item.phoneLast4 && (
                              <div className="text-xs text-slate-400 font-mono">****{item.phoneLast4}</div>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-3.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/?company=${encodeURIComponent(item.company)}`);
                            }}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <span
                              className="tag text-white text-xs inline-flex items-center gap-1"
                              style={{ backgroundColor: COMPANY_COLORS[item.company] || '#64748b' }}
                            >
                              {item.company}
                              <ArrowRight className="w-3 h-3 opacity-60" />
                            </span>
                          </button>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-xs text-slate-600">
                          {item.trackingNumber}
                        </td>
                        <td className="px-6 py-3.5">
                          {item.lockerCode && (
                            <span className="font-semibold text-primary-500">{item.lockerCode}</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">
                          {formatDateTime(item.createdAt)}
                        </td>
                        {tab !== 'abnormal' && (
                          <td className="px-6 py-3.5">
                            {tab === 'overdue' ? (
                              <span className="tag bg-rose-100 text-rose-700">
                                已超期 {Math.floor(getTimeDiffHours(item.createdAt) - 48)} 小时
                              </span>
                            ) : (
                              item.isOverdue ? (
                                <span className="tag bg-rose-100 text-rose-700">已超期</span>
                              ) : (
                                <span className="tag bg-emerald-100 text-emerald-700">待取件</span>
                              )
                            )}
                          </td>
                        )}
                        {tab === 'abnormal' && (
                          <td className="px-6 py-3.5 text-slate-600 max-w-xs">
                            {item.abnormalReason}
                          </td>
                        )}
                        {tab === 'overdue' && (
                          <td className="px-6 py-3.5 text-accent-rose font-semibold">
                            {Math.floor(getTimeDiffHours(item.createdAt) - 48)} 小时
                          </td>
                        )}
                      </tr>
                      {tab === 'overdue' && isExpanded && (
                        <tr key={`${rowKey}-detail`} className="bg-primary-500/5">
                          <td></td>
                          <td colSpan={7} className="px-6 pb-5">
                            <div className="ml-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className="tag font-semibold text-white"
                                    style={{ backgroundColor: COMPANY_COLORS[item.company] || '#64748b' }}
                                  >
                                    {item.company}
                                  </span>
                                  {item.isFragile && (
                                    <span className="tag bg-amber-100 text-amber-700">
                                      <AlertTriangle className="w-3 h-3" /> 易碎
                                    </span>
                                  )}
                                  {item.isColdChain && (
                                    <span className="tag bg-sky-100 text-sky-700">
                                      <Snowflake className="w-3 h-3" /> 冷链
                                    </span>
                                  )}
                                  {item.isCod && (
                                    <span className="tag bg-rose-100 text-rose-700">
                                      <DollarSign className="w-3 h-3" /> 到付
                                    </span>
                                  )}
                                  <span className="tag bg-rose-100 text-rose-700 animate-pulse">
                                    <Clock className="w-3 h-3" />
                                    超期 {Math.floor(getTimeDiffHours(item.createdAt) - 48)} 小时
                                  </span>
                                </div>
                                <button
                                  onClick={() => navigate('/pickup', { state: { preselectId: item.id } })}
                                  className="btn-danger !py-1.5 text-xs"
                                >
                                  催促取件 <ArrowRight className="w-3 h-3 inline ml-1" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <div className="text-xs text-slate-400 mb-1">收件人</div>
                                  <div className="font-medium text-slate-800 flex items-center gap-1">
                                    <span>{item.recipientName}</span>
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span className="font-mono text-xs text-slate-500">****{item.phoneLast4}</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-400 mb-1">单号</div>
                                  <div className="font-mono text-xs text-slate-700 flex items-center gap-1">
                                    <Box className="w-3 h-3 text-slate-400" />
                                    {item.trackingNumber}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-400 mb-1">柜格</div>
                                  <div className="font-semibold text-primary-600 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {item.lockerCode} ({item.size})
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-400 mb-1">存放时间</div>
                                  <div className="text-slate-700">{formatDateTime(item.createdAt)}</div>
                                </div>
                              </div>
                              {item.photoUrl && (
                                <div className="mt-3">
                                  <div className="text-xs text-slate-400 mb-1">包裹照片</div>
                                  <img src={item.photoUrl} alt="包裹" className="w-32 h-32 object-cover rounded-lg border border-slate-200" />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
              {!loading && (
                (tab === 'waiting' && waitingPackages.length === 0) ||
                (tab === 'overdue' && overdueSorted.length === 0) ||
                (tab === 'abnormal' && abnormalRecords.length === 0)
              ) && (
                <tr>
                  <td colSpan={tab === 'overdue' ? 8 : 7} className="px-6 py-12 text-center text-slate-400">
                    暂无记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
