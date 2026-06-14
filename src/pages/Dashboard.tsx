import {
  Plane,
  Hotel,
  CalendarDays,
  AlertTriangle,
  Users,
  FileCheck,
  Clock,
  X,
} from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ProgressRing from '@/components/ProgressRing';
import PersonCard from '@/components/PersonCard';
import { useTripStore, getTeamCompletionRate, getMissingItemsCount, getPersonsNeedingReminder } from '@/store/useTripStore';
import { getDocumentStatus, getDaysUntil, formatDate } from '@/utils/dateUtils';
import { Document, Person } from '@/types';

export default function Dashboard() {
  const { trip, persons, documents } = useTripStore();
  const [activeFilter, setActiveFilter] = useState<
    null | 'expired' | 'warning' | 'pending'
  >(null);

  const toggleFilter = (filter: 'expired' | 'warning' | 'pending') => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
  };

  const personHasExpired = (person: Person, docs: Document[]): boolean => {
    return docs
      .filter((d) => d.personId === person.id)
      .some((d) => getDocumentStatus(d.expiryDate) === 'expired');
  };

  const personHasWarning = (person: Person, docs: Document[]): boolean => {
    return docs
      .filter((d) => d.personId === person.id)
      .some((d) => getDocumentStatus(d.expiryDate) === 'warning');
  };

  const personHasPending = (person: Person, docs: Document[]): boolean => {
    return docs
      .filter((d) => d.personId === person.id)
      .some((d) => !d.photoBackup || !d.inLuggage);
  };

  const personMatchesFilter = (person: Person): boolean => {
    if (!activeFilter) return true;
    switch (activeFilter) {
      case 'expired':
        return personHasExpired(person, documents);
      case 'warning':
        return personHasWarning(person, documents);
      case 'pending':
        return personHasPending(person, documents);
    }
  };

  const filteredPersons = persons.filter(personMatchesFilter);

  const filteredPersonIds = new Set(filteredPersons.map((p) => p.id));
  const filteredDocuments = documents.filter((d) =>
    filteredPersonIds.has(d.personId)
  );

  const completionRate = getTeamCompletionRate(filteredDocuments);
  const missingItems = getMissingItemsCount(filteredDocuments);
  const expiredCount = filteredDocuments.filter(
    (d) => getDocumentStatus(d.expiryDate) === 'expired'
  ).length;
  const warningCount = filteredDocuments.filter(
    (d) => getDocumentStatus(d.expiryDate) === 'warning'
  ).length;
  const personsNeedingReminder = getPersonsNeedingReminder(
    filteredPersons,
    documents,
    getDocumentStatus
  );

  const totalDocs = documents.filter((d) => d.photoBackup && d.inLuggage).length;
  const filteredConfirmed = filteredDocuments.filter(
    (d) => d.photoBackup && d.inLuggage
  ).length;

  const filterLabel = {
    expired: '已过期',
    warning: '即将过期',
    pending: '待确认',
  } as const;

  const filterColorClass = {
    expired: 'bg-red-500 text-white shadow-lg shadow-red-500/25',
    warning: 'bg-orange-500 text-white shadow-lg shadow-orange-500/25',
    pending: 'bg-amber-500 text-white shadow-lg shadow-amber-500/25',
  } as const;

  const daysToDeparture = getDaysUntil(trip.departureTime);

  const getUrgentDocuments = (): Document[] => {
    return documents
      .filter((d) => getDocumentStatus(d.expiryDate) !== 'normal')
      .sort((a, b) => {
        const daysA = getDaysUntil(a.expiryDate);
        const daysB = getDaysUntil(b.expiryDate);
        return daysA - daysB;
      });
  };

  const urgentDocs = getUrgentDocuments();

  const getPersonName = (personId: string) => {
    return persons.find((p) => p.id === personId)?.name || '未知';
  };

  const getDepartureStatus = () => {
    if (daysToDeparture < 0) return { text: '已出发', color: 'text-gray-500' };
    if (daysToDeparture === 0) return { text: '今天出发', color: 'text-orange-500' };
    if (daysToDeparture <= 3) return { text: '即将出发', color: 'text-red-500' };
    if (daysToDeparture <= 7) return { text: '一周内', color: 'text-orange-500' };
    return { text: '准备中', color: 'text-emerald-500' };
  };

  const departureStatus = getDepartureStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 行程信息卡片 */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">目的地</p>
                <h2 className="text-4xl font-bold">{trip.destination}</h2>
                <p className="text-slate-300 mt-2">{trip.notes || '愉快的旅程'}</p>
              </div>

              <div className="text-right">
                <p className="text-slate-400 text-sm mb-1">出发倒计时</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-orange-400">
                    {daysToDeparture >= 0 ? daysToDeparture : 0}
                  </span>
                  <span className="text-slate-400">天</span>
                </div>
                <p className={`text-sm mt-1 font-medium ${departureStatus.color}`}>
                  {departureStatus.text}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <CalendarDays size={20} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">出发时间</p>
                  <p className="font-medium">{formatDate(trip.departureTime)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Plane size={20} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">交通方式</p>
                  <p className="font-medium">{trip.transport || '未设置'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Hotel size={20} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">住宿</p>
                  <p className="font-medium">{trip.accommodation || '未设置'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 统计面板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 完成率 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-4">全队完成率</h3>
            <div className="flex items-center justify-center py-4">
              <ProgressRing
                progress={completionRate}
                size={140}
                strokeWidth={10}
                color={expiredCount > 0 ? '#ef4444' : completionRate === 1 ? '#10b981' : '#f97316'}
                label={activeFilter ? filterLabel[activeFilter] : '证件确认'}
                sublabel={`${filteredConfirmed}/${filteredDocuments.length}${activeFilter ? ` · 全队 ${totalDocs}` : ''}`}
              />
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="space-y-4">
            <StatCard
              title="参与人数"
              value={persons.length}
              icon={<Users size={20} />}
              color="blue"
              subtext="位同行伙伴"
            />
            <StatCard
              title="证件总数"
              value={documents.length}
              icon={<FileCheck size={20} />}
              color="gray"
              subtext="份证件登记"
            />
          </div>

          {/* 问题提醒 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-4">需要关注</h3>
            <div className="space-y-3">
              {expiredCount > 0 && (
                <div
                  onClick={() => toggleFilter('expired')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    activeFilter === 'expired'
                      ? 'bg-red-100 ring-2 ring-red-300 scale-[1.01]'
                      : 'bg-red-50 hover:bg-red-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeFilter === 'expired' ? 'bg-red-200' : 'bg-red-100'
                  }`}>
                    <AlertTriangle
                      size={16}
                      className={
                        activeFilter === 'expired' ? 'text-red-700' : 'text-red-500'
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-bold ${
                        activeFilter === 'expired' ? 'text-red-700' : 'text-red-600'
                      }`}
                    >
                      {expiredCount} 个已过期
                    </p>
                    <p
                      className={`text-xs ${
                        activeFilter === 'expired' ? 'text-red-500' : 'text-red-400'
                      }`}
                    >
                      请尽快补办
                    </p>
                  </div>
                  {activeFilter === 'expired' && (
                    <X size={16} className="text-red-600" />
                  )}
                </div>
              )}

              {warningCount > 0 && (
                <div
                  onClick={() => toggleFilter('warning')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    activeFilter === 'warning'
                      ? 'bg-orange-100 ring-2 ring-orange-300 scale-[1.01]'
                      : 'bg-orange-50 hover:bg-orange-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeFilter === 'warning' ? 'bg-orange-200' : 'bg-orange-100'
                  }`}>
                    <Clock
                      size={16}
                      className={
                        activeFilter === 'warning'
                          ? 'text-orange-700'
                          : 'text-orange-500'
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-bold ${
                        activeFilter === 'warning'
                          ? 'text-orange-700'
                          : 'text-orange-600'
                      }`}
                    >
                      {warningCount} 个即将过期
                    </p>
                    <p
                      className={`text-xs ${
                        activeFilter === 'warning'
                          ? 'text-orange-500'
                          : 'text-orange-400'
                      }`}
                    >
                      30天内到期
                    </p>
                  </div>
                  {activeFilter === 'warning' && (
                    <X size={16} className="text-orange-600" />
                  )}
                </div>
              )}

              {missingItems > 0 && (
                <div
                  onClick={() => toggleFilter('pending')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    activeFilter === 'pending'
                      ? 'bg-amber-100 ring-2 ring-amber-300 scale-[1.01]'
                      : 'bg-amber-50 hover:bg-amber-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeFilter === 'pending' ? 'bg-amber-200' : 'bg-amber-100'
                  }`}>
                    <FileCheck
                      size={16}
                      className={
                        activeFilter === 'pending'
                          ? 'text-amber-700'
                          : 'text-amber-500'
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-bold ${
                        activeFilter === 'pending'
                          ? 'text-amber-700'
                          : 'text-amber-600'
                      }`}
                    >
                      {missingItems} 项待确认
                    </p>
                    <p
                      className={`text-xs ${
                        activeFilter === 'pending'
                          ? 'text-amber-500'
                          : 'text-amber-400'
                      }`}
                    >
                      照片备份或行李放置
                    </p>
                  </div>
                  {activeFilter === 'pending' && (
                    <X size={16} className="text-amber-600" />
                  )}
                </div>
              )}

              {expiredCount === 0 && warningCount === 0 && missingItems === 0 && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FileCheck size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-600">一切就绪！</p>
                    <p className="text-xs text-emerald-400">所有证件状态良好</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 需要提醒的人 */}
        {personsNeedingReminder.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-4">需要提醒的人</h3>
            <div className="flex flex-wrap gap-4">
              {personsNeedingReminder.map((person) => {
                const personDocs = documents.filter((d) => d.personId === person.id);
                const issues = personDocs.filter(
                  (d) =>
                    !d.photoBackup ||
                    !d.inLuggage ||
                    getDocumentStatus(d.expiryDate) !== 'normal'
                ).length;

                return (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">
                      {person.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{person.name}</p>
                      <p className="text-xs text-orange-500">{issues} 项需要处理</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 紧急证件清单 */}
        {urgentDocs.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-4">证件有效期预警</h3>
            <div className="space-y-3">
              {urgentDocs.slice(0, 5).map((doc) => {
                const status = getDocumentStatus(doc.expiryDate);
                const days = getDaysUntil(doc.expiryDate);
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      status === 'expired' ? 'bg-red-50' : 'bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {persons.find((p) => p.id === doc.personId)?.avatar}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">
                          {getPersonName(doc.personId)} · {doc.type}
                        </p>
                        <p className={`text-sm ${
                          status === 'expired' ? 'text-red-500' : 'text-orange-500'
                        }`}>
                          {status === 'expired'
                            ? `已过期 ${Math.abs(days)} 天`
                            : `还剩 ${days} 天过期`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        status === 'expired'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {formatDate(doc.expiryDate)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 证件清单 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-800">证件清单</h3>
              {activeFilter && (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    activeFilter === 'expired'
                      ? 'bg-red-100 text-red-600'
                      : activeFilter === 'warning'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  仅看{filterLabel[activeFilter]}
                </span>
              )}
              <span className="text-sm text-gray-500">
                {filteredPersons.length}/{persons.length} 人 ·{' '}
                {filteredDocuments.length}/{documents.length} 份证件
              </span>
            </div>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${filterColorClass[activeFilter]}`}
              >
                <X size={16} />
                显示全部
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filteredPersons.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileCheck size={28} className="text-emerald-500" />
                </div>
                <p className="text-gray-700 font-medium">
                  筛选范围内没有匹配的人员
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  点击「显示全部」查看完整清单
                </p>
              </div>
            ) : (
              filteredPersons.map((person) => {
                const personDocs = documents.filter(
                  (d) => d.personId === person.id
                );
                return (
                  <PersonCard
                    key={person.id}
                    person={person}
                    documents={personDocs}
                    defaultExpanded={!!activeFilter}
                  />
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
