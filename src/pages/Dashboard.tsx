import {
  Plane,
  Hotel,
  CalendarDays,
  AlertTriangle,
  Users,
  FileCheck,
  Clock,
} from 'lucide-react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ProgressRing from '@/components/ProgressRing';
import PersonCard from '@/components/PersonCard';
import { useTripStore, getTeamCompletionRate, getMissingItemsCount, getPersonsNeedingReminder } from '@/store/useTripStore';
import { getDocumentStatus, getDaysUntil, formatDate } from '@/utils/dateUtils';
import { Document } from '@/types';

export default function Dashboard() {
  const { trip, persons, documents } = useTripStore();

  const completionRate = getTeamCompletionRate(documents);
  const missingItems = getMissingItemsCount(documents);
  const expiredCount = documents.filter(
    (d) => getDocumentStatus(d.expiryDate) === 'expired'
  ).length;
  const warningCount = documents.filter(
    (d) => getDocumentStatus(d.expiryDate) === 'warning'
  ).length;
  const personsNeedingReminder = getPersonsNeedingReminder(
    persons,
    documents,
    getDocumentStatus
  );

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
                label="证件确认"
                sublabel={`${documents.filter(d => d.photoBackup && d.inLuggage).length}/${documents.length}`}
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
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                  <div>
                    <p className="font-bold text-red-600">{expiredCount} 个已过期</p>
                    <p className="text-xs text-red-400">请尽快补办</p>
                  </div>
                </div>
              )}

              {warningCount > 0 && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Clock size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="font-bold text-orange-600">{warningCount} 个即将过期</p>
                    <p className="text-xs text-orange-400">30天内到期</p>
                  </div>
                </div>
              )}

              {missingItems > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FileCheck size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-600">{missingItems} 项待确认</p>
                    <p className="text-xs text-amber-400">照片备份或行李放置</p>
                  </div>
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
            <h3 className="text-lg font-bold text-gray-800">证件清单</h3>
            <span className="text-sm text-gray-500">
              共 {documents.length} 份证件
            </span>
          </div>

          <div className="space-y-4">
            {persons.map((person) => {
              const personDocs = documents.filter(
                (d) => d.personId === person.id
              );
              return (
                <PersonCard
                  key={person.id}
                  person={person}
                  documents={personDocs}
                  defaultExpanded={false}
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
