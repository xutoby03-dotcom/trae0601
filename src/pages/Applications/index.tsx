import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSignature,
  Plus,
  Check,
  X,
  Eye,
  ClipboardCheck,
  ArrowRight,
  Stamp,
} from 'lucide-react';
import { useStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, formatDateShort, getOverdueHours } from '@/utils/helpers';
import type { Application, ApplicationStatus } from '@/types';

type TabKey = 'all' | ApplicationStatus;

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审批' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已驳回' },
  { key: 'checked_out', label: '已外带' },
  { key: 'returned', label: '已归还' },
  { key: 'overdue', label: '逾期' },
];

export default function ApplicationList() {
  const navigate = useNavigate();
  const {
    applications,
    seals,
    records,
    getSealById,
    getRecordByApplicationId,
    updateApplicationStatus,
    checkOverdue,
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);

  useEffect(() => {
    checkOverdue();
  }, [checkOverdue]);

  useEffect(() => {
    const sorted = [...applications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (activeTab === 'all') {
      setFilteredApps(sorted);
    } else {
      setFilteredApps(sorted.filter((a) => a.status === activeTab));
    }
  }, [applications, activeTab]);

  const handleApprove = (id: string) => {
    updateApplicationStatus(id, 'approved');
  };

  const handleReject = (id: string) => {
    const reason = window.prompt('请输入驳回原因：');
    if (reason !== null && reason.trim()) {
      updateApplicationStatus(id, 'rejected', reason.trim());
    }
  };

  const getRecordStatus = (appId: string) => {
    const record = getRecordByApplicationId(appId);
    return record?.status;
  };

  const isOverdueOrAnomaly = (app: Application) => {
    if (app.status === 'overdue') return true;
    const record = getRecordByApplicationId(app.id);
    return record?.hasAnomaly || false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary-800 flex items-center gap-3">
            <FileSignature className="w-7 h-7 text-gold-500" />
            外带申请管理
          </h1>
          <p className="text-sm text-primary-500 mt-1">管理印章外带申请、审批与登记</p>
        </div>
        <button
          onClick={() => navigate('/applications/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          发起申请
        </button>
      </div>

      <div className="card-seal overflow-hidden">
        <div className="border-b border-primary-100">
          <div className="flex">
            {tabs.map((tab) => {
              const count =
                tab.key === 'all'
                  ? applications.length
                  : applications.filter((a) => a.status === tab.key).length;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-5 py-3.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-700'
                      : 'text-primary-500 hover:text-primary-700'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-primary-50 text-primary-500'
                    }`}
                  >
                    {count}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50/60">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                  申请时间
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                  印章
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                  申请人
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                  部门
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                  用途
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                  预计归还
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileSignature className="w-12 h-12 text-primary-200" />
                      <p className="text-primary-400">暂无申请记录</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const seal = getSealById(app.sealId);
                  const record = getRecordByApplicationId(app.id);
                  const isDanger = isOverdueOrAnomaly(app);
                  const recordStatus = getRecordStatus(app.id);

                  return (
                    <tr
                      key={app.id}
                      className={`transition-colors duration-200 ${
                        isDanger
                          ? 'bg-red-50/50 hover:bg-red-50 animate-pulse-red'
                          : 'hover:bg-primary-50/30'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm text-primary-700">{formatDateShort(app.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center">
                            <Stamp className="w-4 h-4 text-gold-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary-800">{seal?.type || '-'}</p>
                            <p className="text-xs text-primary-400">{seal?.sealNumber || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-primary-800">{app.applicant}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-primary-600">{app.department}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-primary-700 max-w-xs truncate" title={app.purpose}>
                          {app.purpose}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-primary-700">{formatDate(app.expectedReturn)}</p>
                        {app.status === 'overdue' && (
                          <p className="text-xs text-seal-red mt-0.5 font-medium">
                            逾期 {getOverdueHours(app.expectedReturn)} 小时
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge type="application" status={app.status} />
                        {record && recordStatus && recordStatus !== app.status && (
                          <div className="mt-1">
                            <StatusBadge type="record" status={recordStatus} />
                          </div>
                        )}
                        {record?.hasAnomaly && (
                          <p className="text-xs text-seal-red mt-1">存在异常</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => navigate(`/applications/${app.id}`)}
                            className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            详情
                          </button>

                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(app.id)}
                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                通过
                              </button>
                              <button
                                onClick={() => handleReject(app.id)}
                                className="px-3 py-1.5 text-xs bg-seal-red text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                驳回
                              </button>
                            </>
                          )}

                          {app.status === 'approved' && !record && (
                            <button
                              onClick={() => navigate(`/records/checkout/${app.id}`)}
                              className="px-3 py-1.5 text-xs bg-primary-700 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1 border border-gold-500"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              外带登记
                            </button>
                          )}

                          {(app.status === 'checked_out' || recordStatus === 'checked_out') && record && (
                            <button
                              onClick={() => navigate(`/records/return/${record.id}`)}
                              className="px-3 py-1.5 text-xs bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors flex items-center gap-1"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              归还登记
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
