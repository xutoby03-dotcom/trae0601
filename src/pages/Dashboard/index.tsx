import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  AlertTriangle,
  MessageCircle,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import { useStore, getTodayVisitsFromState, getAbnormalCasesFromState, getUnrepliedOwnersFromState, getRecheckSchedulesFromState } from '@/store/useStore';
import { SURGERY_TYPE_LABELS } from '@/types';
import StatusTag from '@/components/StatusTag';

export default function Dashboard() {
  const navigate = useNavigate();

  const cases = useStore((s) => s.cases);
  const visitPlans = useStore((s) => s.visitPlans);
  const visitRecords = useStore((s) => s.visitRecords);

  const todayVisits = useMemo(
    () => getTodayVisitsFromState(cases, visitPlans),
    [cases, visitPlans]
  );
  const abnormalCases = useMemo(
    () => getAbnormalCasesFromState(cases, visitRecords),
    [cases, visitRecords]
  );
  const unrepliedOwners = useMemo(
    () => getUnrepliedOwnersFromState(cases, visitRecords),
    [cases, visitRecords]
  );
  const recheckSchedules = useMemo(
    () => getRecheckSchedulesFromState(cases, visitRecords),
    [cases, visitRecords]
  );

  const statCards = [
    {
      label: '今日回访数',
      value: todayVisits.length,
      icon: CalendarCheck,
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    {
      label: '异常病例数',
      value: abnormalCases.length,
      icon: AlertTriangle,
      bgColor: 'bg-warning-50',
      iconColor: 'text-warning-500',
    },
    {
      label: '未回复主人',
      value: unrepliedOwners.length,
      icon: MessageCircle,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: '复诊安排数',
      value: recheckSchedules.length,
      icon: Stethoscope,
      bgColor: 'bg-danger-50',
      iconColor: 'text-danger-500',
    },
  ];

  const handleGoVisit = (caseId: string, planId: string) => {
    navigate(`/cases/${caseId}/visits/new?planId=${planId}`);
  };

  const handleViewCase = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

  const handleRemindOwner = () => {
    alert('已发送提醒通知给主人');
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="card card-hover p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div
                className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}
              >
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-800">今日回访</h3>
              <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                {todayVisits.length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {todayVisits.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">暂无今日回访</div>
            ) : (
              todayVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{visit.petCase.petName}</span>
                      <span className="text-gray-400 text-sm">·</span>
                      <span className="text-gray-600 text-sm">{visit.petCase.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{SURGERY_TYPE_LABELS[visit.petCase.surgeryType]}</span>
                      <span>第{visit.dayNumber}天回访</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGoVisit(visit.caseId, visit.id)}
                    className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1 whitespace-nowrap ml-3"
                  >
                    去回访
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              <h3 className="font-semibold text-gray-800">异常病例</h3>
              <span className="bg-warning-100 text-warning-700 text-xs px-2 py-0.5 rounded-full">
                {abnormalCases.length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {abnormalCases.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">暂无异常病例</div>
            ) : (
              abnormalCases.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-800">{item.petName}</span>
                      <span className="text-gray-400 text-sm">·</span>
                      <span className="text-gray-600 text-sm">{item.ownerName}</span>
                      <StatusTag mark={item.latestRecord.doctorMark!} />
                    </div>
                    {item.latestRecord.abnormalDesc && (
                      <p className="text-sm text-gray-500 truncate">
                        {truncateText(item.latestRecord.abnormalDesc, 30)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewCase(item.id)}
                    className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1 whitespace-nowrap ml-3"
                  >
                    查看详情
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">未回复主人</h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {unrepliedOwners.length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {unrepliedOwners.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">暂无未回复主人</div>
            ) : (
              unrepliedOwners.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{item.petName}</span>
                      <span className="text-gray-400 text-sm">·</span>
                      <span className="text-gray-600 text-sm">{item.ownerName}</span>
                    </div>
                    <p className="text-sm text-gray-500">{item.ownerPhone}</p>
                  </div>
                  <button
                    onClick={handleRemindOwner}
                    className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1 whitespace-nowrap ml-3"
                  >
                    提醒主人
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-danger-500" />
              <h3 className="font-semibold text-gray-800">复诊安排</h3>
              <span className="bg-danger-100 text-danger-700 text-xs px-2 py-0.5 rounded-full">
                {recheckSchedules.length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {recheckSchedules.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">暂无复诊安排</div>
            ) : (
              recheckSchedules.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{item.petName}</span>
                      <span className="text-gray-400 text-sm">·</span>
                      <span className="text-gray-600 text-sm">{item.ownerName}</span>
                    </div>
                    {item.latestRecord.doctorNote && (
                      <p className="text-sm text-gray-500 truncate">
                        {truncateText(item.latestRecord.doctorNote, 30)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewCase(item.id)}
                    className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1 whitespace-nowrap ml-3"
                  >
                    查看详情
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
