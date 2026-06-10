import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle, Plus, ChevronDown, ChevronUp, FileWarning, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import { DocumentCard } from '@/components/DocumentCard';
import { getDocumentStatus } from '@/utils/dateUtils';
import type { DocumentStatus, Document } from '@/types';

interface GroupInfo {
  status: DocumentStatus | 'expiring_soon';
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

const GROUPS: GroupInfo[] = [
  {
    status: 'expired',
    title: '已过期',
    icon: <AlertTriangle className="w-6 h-6" />,
    bgColor: 'bg-gradient-to-br from-red-500 to-red-600',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    description: '请尽快办理，避免影响使用',
  },
  {
    status: 'expiring_soon',
    title: '三个月内到期',
    icon: <Clock className="w-6 h-6" />,
    bgColor: 'bg-gradient-to-br from-orange-500 to-accent-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    description: '建议开始准备换证材料',
  },
  {
    status: 'long_term',
    title: '长期有效',
    icon: <CheckCircle className="w-6 h-6" />,
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    description: '无需担心有效期',
  },
  {
    status: 'valid',
    title: '有效期内',
    icon: <CheckCircle className="w-6 h-6" />,
    bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    description: '状态正常',
  },
];

export default function Home() {
  const { documents } = useDocumentStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['expired', 'expiring_soon', 'valid', 'long_term'])
  );

  const toggleGroup = (status: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(status)) {
      newExpanded.delete(status);
    } else {
      newExpanded.add(status);
    }
    setExpandedGroups(newExpanded);
  };

  const groupDocuments = (): Record<string, Document[]> => {
    const groups: Record<string, Document[]> = {
      expired: [],
      expiring_soon: [],
      valid: [],
      long_term: [],
    };

    documents.forEach((doc) => {
      const status = getDocumentStatus(doc);
      groups[status].push(doc);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        const dateA = a.expireDate === 'long_term' ? '9999-12-31' : a.expireDate;
        const dateB = b.expireDate === 'long_term' ? '9999-12-31' : b.expireDate;
        return dateA.localeCompare(dateB);
      });
    });

    return groups;
  };

  const grouped = groupDocuments();
  const totalCount = documents.length;
  const expiringCount = grouped.expiring_soon.length + grouped.expired.length;
  const uniqueHolders = new Set(documents.map(d => d.holder)).size;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">证件总览</h1>
        <p className="text-slate-500">管理您和家人的证件有效期，从容应对到期换证</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 text-white card-shadow animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">证件总数</p>
              <p className="text-3xl font-bold mt-1">{totalCount}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <FileWarning className="w-6 h-6" />
            </div>
          </div>
        </div>

        <Link
          to="/statistics#risk-details"
          className="bg-gradient-to-br from-accent-500 to-orange-500 rounded-2xl p-5 text-white card-shadow animate-fade-in-up hover:scale-[1.02] transition-transform relative overflow-hidden group"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">需关注</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold mt-1">{expiringCount}</p>
                <span className="text-xs text-white/80 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  查看明细
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white card-shadow animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">家庭成员</p>
              <p className="text-3xl font-bold mt-1">{uniqueHolders}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center card-shadow animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary-50 rounded-full flex items-center justify-center">
            <FileWarning className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">还没有添加证件</h3>
          <p className="text-slate-500 mb-6">添加您的第一个证件，开始管理有效期</p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            添加证件
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {GROUPS.map((group, groupIndex) => {
            const docs = grouped[group.status] || [];
            const isExpanded = expandedGroups.has(group.status);
            const hasDocs = docs.length > 0;

            return (
              <div
                key={group.status}
                className={`bg-white rounded-2xl overflow-hidden card-shadow border ${group.borderColor} animate-fade-in-up`}
                style={{ animationDelay: `${(groupIndex + 3) * 100}ms` }}
              >
                <button
                  onClick={() => toggleGroup(group.status)}
                  className={`w-full p-5 flex items-center justify-between ${group.bgColor} text-white hover:opacity-95 transition-opacity`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {group.icon}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{group.title}</h3>
                        <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-sm font-medium">
                          {docs.length} 个
                        </span>
                      </div>
                      <p className="text-sm text-white/80">{group.description}</p>
                    </div>
                  </div>
                  {hasDocs && (
                    isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )
                  )}
                </button>

                {hasDocs && isExpanded && (
                  <div className="p-4 grid gap-4 sm:grid-cols-2">
                    {docs.map((doc, idx) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        delay={idx * 50}
                      />
                    ))}
                  </div>
                )}

                {!hasDocs && isExpanded && (
                  <div className="p-8 text-center text-slate-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>暂无{group.title}的证件</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-24 md:bottom-8 right-8">
        <Link
          to="/add"
          className="w-14 h-14 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 hover:scale-110 transition-all duration-300"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
