import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Clock, CheckCircle, TrendingUp, Users,
  FileWarning, Calendar, ChevronRight, User, BarChart3,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import { DocumentIcon } from '@/components/DocumentIcon';
import {
  DOCUMENT_TYPE_LABELS, PROCESS_STATUS_LABELS
} from '@/types';
import type { Document } from '@/types';
import {
  getDocumentStatus, getDaysUntilExpiry,
  isProcessInProgress
} from '@/utils/dateUtils';

interface TimeGroup {
  label: string;
  minDays: number;
  maxDays: number;
  color: string;
  bgColor: string;
}

const TIME_GROUPS: TimeGroup[] = [
  { label: '已过期', minDays: -Infinity, maxDays: 0, color: 'text-red-600', bgColor: 'bg-red-500' },
  { label: '7天内', minDays: 0, maxDays: 7, color: 'text-red-500', bgColor: 'bg-red-400' },
  { label: '30天内', minDays: 7, maxDays: 30, color: 'text-orange-500', bgColor: 'bg-orange-500' },
  { label: '90天内', minDays: 30, maxDays: 90, color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  { label: '半年内', minDays: 90, maxDays: 180, color: 'text-blue-500', bgColor: 'bg-blue-500' },
  { label: '更久', minDays: 180, maxDays: Infinity, color: 'text-green-500', bgColor: 'bg-green-500' },
];

export default function Statistics() {
  const { documents, materials } = useDocumentStore();

  const stats = useMemo(() => {
    let expired = 0;
    let expiringSoon = 0;
    let valid = 0;
    let longTerm = 0;
    let inProgress = 0;

    const holderDocs: Record<string, Document[]> = {};
    const typeCounts: Record<string, number> = {};

    documents.forEach(doc => {
      const status = getDocumentStatus(doc);
      if (status === 'expired') expired++;
      else if (status === 'expiring_soon') expiringSoon++;
      else if (status === 'long_term') longTerm++;
      else valid++;

      if (isProcessInProgress(doc.processStatus)) inProgress++;

      if (!holderDocs[doc.holder]) holderDocs[doc.holder] = [];
      holderDocs[doc.holder].push(doc);

      typeCounts[doc.type] = (typeCounts[doc.type] || 0) + 1;
    });

    const timeDistribution = TIME_GROUPS.map(group => {
      const count = documents.filter(doc => {
        const days = getDaysUntilExpiry(doc.expireDate);
        return days >= group.minDays && days < group.maxDays;
      }).length;
      return { ...group, count };
    });

    const maxCount = Math.max(...timeDistribution.map(g => g.count), 1);

    const atRiskHolders = Object.entries(holderDocs)
      .map(([holder, docs]) => {
        const riskDocs = docs.filter(d => {
          const s = getDocumentStatus(d);
          return s === 'expired' || s === 'expiring_soon';
        });
        return { holder, riskDocs, totalDocs: docs.length };
      })
      .filter(h => h.riskDocs.length > 0)
      .sort((a, b) => b.riskDocs.length - a.riskDocs.length);

    const inProgressDocs = documents.filter(d => isProcessInProgress(d.processStatus));

    const incompleteMaterials = documents.map(doc => {
      const docMaterials = materials.filter(m => m.documentId === doc.id);
      const missing = docMaterials.filter(m => !m.isReady);
      return { doc, missingCount: missing.length, total: docMaterials.length };
    }).filter(item => item.missingCount > 0 && item.total > 0)
      .sort((a, b) => b.missingCount - a.missingCount);

    return {
      total: documents.length,
      expired,
      expiringSoon,
      valid,
      longTerm,
      inProgress,
      holderDocs,
      typeCounts,
      timeDistribution,
      maxCount,
      atRiskHolders,
      inProgressDocs,
      incompleteMaterials,
    };
  }, [documents, materials]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">统计分析</h1>
        <p className="text-slate-500">全面了解您和家人的证件状态，提前规划办理时间</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<FileWarning className="w-6 h-6" />}
          label="证件总数"
          value={stats.total}
          gradient="from-primary-500 to-primary-600"
          delay={0}
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          label="已过期"
          value={stats.expired}
          gradient="from-red-500 to-red-600"
          delay={100}
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="即将到期"
          value={stats.expiringSoon}
          gradient="from-orange-500 to-accent-500"
          delay={200}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="办理中"
          value={stats.inProgress}
          gradient="from-blue-500 to-blue-600"
          delay={300}
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="有效期内"
          value={stats.valid + stats.longTerm}
          gradient="from-emerald-500 to-teal-600"
          delay={400}
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="家庭成员"
          value={Object.keys(stats.holderDocs).length}
          gradient="from-purple-500 to-purple-600"
          delay={500}
        />
      </div>

      {stats.total === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center card-shadow animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">暂无数据</h3>
          <p className="text-slate-500 mb-6">添加证件后这里将显示详细统计</p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
          >
            添加证件
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              过期时间分布
            </h2>
            <div className="space-y-4">
              {stats.timeDistribution.map((group, idx) => (
                <div key={group.label} className="flex items-center gap-4">
                  <span className={`text-sm font-medium w-16 ${group.color}`}>
                    {group.label}
                  </span>
                  <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${group.bgColor} transition-all duration-700 rounded-lg flex items-center justify-end pr-3`}
                      style={{
                        width: `${(group.count / stats.maxCount) * 100}%`,
                        minWidth: group.count > 0 ? '40px' : '0',
                      }}
                    >
                      {group.count > 0 && (
                        <span className="text-white text-sm font-medium">
                          {group.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 w-12 text-right">
                    {group.count} 个
                  </span>
                </div>
              ))}
            </div>
          </div>

          {stats.atRiskHolders.length > 0 && (
            <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up" style={{ animationDelay: '700ms' }}>
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                需关注的家庭成员
              </h2>
              <div className="space-y-3">
                {stats.atRiskHolders.map((item, idx) => (
                  <div
                    key={item.holder}
                    className="flex items-center justify-between p-4 bg-red-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <User className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{item.holder}</p>
                        <p className="text-sm text-slate-500">
                          共 {item.totalDocs} 个证件，{item.riskDocs.length} 个需关注
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {item.riskDocs.slice(0, 3).map(doc => (
                        <div key={doc.id} className="p-1.5 bg-white rounded-lg">
                          <DocumentIcon type={doc.type} className="w-4 h-4" />
                        </div>
                      ))}
                      {item.riskDocs.length > 3 && (
                        <div className="p-1.5 bg-white rounded-lg text-xs font-medium text-slate-500">
                          +{item.riskDocs.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.inProgressDocs.length > 0 && (
            <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                正在办理的事项
              </h2>
              <div className="space-y-3">
                {stats.inProgressDocs.map(doc => (
                  <Link
                    key={doc.id}
                    to={`/document/${doc.id}`}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <DocumentIcon type={doc.type} className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-slate-800">
                          {DOCUMENT_TYPE_LABELS[doc.type]} · {doc.holder}
                        </p>
                        <p className="text-sm text-blue-600">
                          {PROCESS_STATUS_LABELS[doc.processStatus]}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {stats.incompleteMaterials.length > 0 && (
            <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up" style={{ animationDelay: '900ms' }}>
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-500" />
                材料待补充
              </h2>
              <div className="space-y-3">
                {stats.incompleteMaterials.map(item => (
                  <Link
                    key={item.doc.id}
                    to={`/document/${item.doc.id}`}
                    className="flex items-center justify-between p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <DocumentIcon type={item.doc.type} className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-slate-800">
                          {DOCUMENT_TYPE_LABELS[item.doc.type]} · {item.doc.holder}
                        </p>
                        <p className="text-sm text-amber-600">
                          缺少 {item.missingCount} 项材料
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">
                        {item.total - item.missingCount}/{item.total}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {Object.keys(stats.typeCounts).length > 0 && (
            <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-purple-500" />
                证件类型分布
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(stats.typeCounts).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                  >
                    <DocumentIcon type={type as any} className="w-5 h-5" />
                    <div>
                      <p className="font-medium text-slate-800">
                        {DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS]}
                      </p>
                      <p className="text-sm text-slate-500">{count} 个</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
  delay = 0
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
  delay?: number;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white card-shadow animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/80 text-sm">{label}</p>
        <div className="p-2 bg-white/20 rounded-lg">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
