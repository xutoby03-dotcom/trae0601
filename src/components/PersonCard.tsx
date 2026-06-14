import { useState } from 'react';
import { ChevronDown, ChevronUp, User, AlertCircle } from 'lucide-react';
import { Person, Document } from '@/types';
import DocumentRow from './DocumentRow';
import { useNavigate } from 'react-router-dom';
import {
  getDocumentStatus,
  getDaysUntil,
} from '@/utils/dateUtils';
import { getPersonCompletionRate } from '@/store/useTripStore';

interface PersonCardProps {
  person: Person;
  documents: Document[];
  defaultExpanded?: boolean;
}

export default function PersonCard({
  person,
  documents,
  defaultExpanded = false,
}: PersonCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const navigate = useNavigate();

  const completionRate = getPersonCompletionRate(person.id, documents);
  const hasIssues = documents.some(
    (d) => getDocumentStatus(d.expiryDate) !== 'normal'
  );
  const pendingCount = documents.filter(
    (d) => !d.photoBackup || !d.inLuggage
  ).length;

  const expiredCount = documents.filter(
    (d) => getDocumentStatus(d.expiryDate) === 'expired'
  ).length;
  const warningCount = documents.filter(
    (d) => getDocumentStatus(d.expiryDate) === 'warning'
  ).length;
  const noBackupCount = documents.filter((d) => !d.photoBackup).length;
  const notInLuggageCount = documents.filter((d) => !d.inLuggage).length;

  const urgentDocs = documents.filter(
    (d) => getDocumentStatus(d.expiryDate) !== 'normal'
  );

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        hasIssues ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white'
      }`}
    >
      <div
        className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                hasIssues ? 'bg-red-100' : 'bg-slate-100'
              }`}
            >
              {person.avatar || <User size={24} className="text-gray-400" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-gray-800 text-lg">{person.name}</h3>
                {expiredCount > 0 && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                    <AlertCircle size={12} />
                    {expiredCount} 过期
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                    {warningCount} 快过期
                  </span>
                )}
                {noBackupCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">
                    {noBackupCount} 没备份
                  </span>
                )}
                {notInLuggageCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
                    {notInLuggageCount} 没放行李
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {documents.length} 个证件 · 完成度 {Math.round(completionRate * 100)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  hasIssues ? 'bg-red-500' : completionRate === 1 ? 'bg-emerald-500' : 'bg-orange-500'
                }`}
                style={{ width: `${completionRate * 100}%` }}
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/person/${person.id}`);
              }}
              className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              管理
            </button>
            {expanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
        </div>

        {urgentDocs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {urgentDocs.map((doc) => (
              <span
                key={doc.id}
                className={`text-xs px-2 py-1 rounded-md ${
                  getDocumentStatus(doc.expiryDate) === 'expired'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-orange-100 text-orange-600'
                }`}
              >
                {doc.type}：
                {getDocumentStatus(doc.expiryDate) === 'expired'
                  ? `已过期 ${Math.abs(getDaysUntil(doc.expiryDate))} 天`
                  : `还剩 ${getDaysUntil(doc.expiryDate)} 天`}
              </span>
            ))}
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
          {documents.length === 0 ? (
            <p className="text-gray-400 text-center py-6">暂无证件信息</p>
          ) : (
            documents.map((doc) => <DocumentRow key={doc.id} document={doc} />)
          )}
        </div>
      )}
    </div>
  );
}
