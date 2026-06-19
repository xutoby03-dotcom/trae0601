import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PawPrint,
  User,
  Phone,
  Stethoscope,
  Syringe,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  SURGERY_TYPE_LABELS,
  ANESTHESIA_TYPE_LABELS,
  VisitPlanStatus,
} from '@/types';
import { formatDate } from '@/utils/date';
import StarRating from '@/components/StarRating';
import StatusTag from '@/components/StatusTag';

const VISIT_PLAN_STATUS_LABELS: Record<VisitPlanStatus, string> = {
  pending: '待回访',
  completed: '已完成',
  missed: '已错过',
};

const VISIT_PLAN_STATUS_COLORS: Record<VisitPlanStatus, string> = {
  pending: 'text-warning-600 bg-warning-50',
  completed: 'text-green-600 bg-green-50',
  missed: 'text-danger-600 bg-danger-50',
};

const VISIT_PLAN_STATUS_ICONS: Record<VisitPlanStatus, typeof Clock> = {
  pending: Clock,
  completed: CheckCircle2,
  missed: AlertCircle,
};

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const cases = useStore((s) => s.cases);
  const allVisitPlans = useStore((s) => s.visitPlans);
  const allVisitRecords = useStore((s) => s.visitRecords);

  const petCase = useMemo(
    () => cases.find((c) => c.id === caseId),
    [cases, caseId]
  );

  const visitPlans = useMemo(
    () =>
      allVisitPlans
        .filter((p) => p.caseId === caseId)
        .sort((a, b) => a.dayNumber - b.dayNumber),
    [allVisitPlans, caseId]
  );

  const visitRecords = useMemo(
    () =>
      allVisitRecords
        .filter((r) => r.caseId === caseId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [allVisitRecords, caseId]
  );

  const recordMap = useMemo(() => {
    const map = new Map<string, (typeof visitRecords)[number]>();
    visitRecords.forEach((r) => map.set(r.planId, r));
    return map;
  }, [visitRecords]);

  if (!petCase) {
    return (
      <div>
        <button
          onClick={() => navigate('/cases')}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回病例列表
        </button>
        <div className="card p-12 text-center text-gray-500">病例不存在</div>
      </div>
    );
  }

  const pendingPlan = visitPlans.find((p) => p.status === 'pending');

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/cases')}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回病例列表
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">病例详情</h1>
            <p className="text-sm text-gray-500 mt-1">
              {petCase.petName} 的术后回访记录
            </p>
          </div>
          {pendingPlan && (
            <Link
              to={`/cases/${caseId}/visits/new?planId=${pendingPlan.id}`}
              className="btn-primary inline-flex items-center gap-2"
            >
              去回访（第{pendingPlan.dayNumber}天）
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
              <PawPrint className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">宠物名</div>
              <div className="font-medium text-gray-800">{petCase.petName}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">主人</div>
              <div className="font-medium text-gray-800">{petCase.ownerName}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">联系电话</div>
              <div className="font-medium text-gray-800">{petCase.ownerPhone}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">手术类型</div>
              <div className="font-medium text-gray-800">
                {SURGERY_TYPE_LABELS[petCase.surgeryType]}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">主治医生</div>
              <div className="font-medium text-gray-800">{petCase.doctor}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-pink-50 rounded-lg flex items-center justify-center shrink-0">
              <Syringe className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">麻醉方式</div>
              <div className="font-medium text-gray-800">
                {ANESTHESIA_TYPE_LABELS[petCase.anesthesiaType]}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">出院日期</div>
              <div className="font-medium text-gray-800">
                {formatDate(petCase.dischargeDate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">回访时间轴</h2>
        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-200" />
          <div className="space-y-6">
            {visitPlans.map((plan) => {
              const record = recordMap.get(plan.id);
              const StatusIcon = VISIT_PLAN_STATUS_ICONS[plan.status];

              return (
                <div key={plan.id} className="relative flex gap-4">
                  <div className="relative z-10">
                    {plan.status === 'pending' ? (
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-warning-400 flex items-center justify-center">
                        <Circle className="w-4 h-4 text-warning-500" />
                      </div>
                    ) : plan.status === 'completed' ? (
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-danger-500 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-gray-800">
                        第{plan.dayNumber}天回访
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${VISIT_PLAN_STATUS_COLORS[plan.status]}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {VISIT_PLAN_STATUS_LABELS[plan.status]}
                      </span>
                      <span className="text-sm text-gray-500">
                        计划日期：{formatDate(plan.planDate)}
                      </span>
                      {plan.status === 'pending' && (
                        <Link
                          to={`/cases/${caseId}/visits/new?planId=${plan.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          去回访
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                    {record && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">食欲</div>
                            <StarRating value={record.appetite} readOnly size="sm" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">精神</div>
                            <StarRating value={record.spirit} readOnly size="sm" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">用药情况</div>
                            <div className="text-sm text-gray-800">
                              {record.medication || '无'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">排便情况</div>
                            <div className="text-sm text-gray-800">
                              {record.defecation || '正常'}
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-xs text-gray-500 mb-1">异常描述</div>
                            <div className="text-sm text-gray-800">
                              {record.abnormalDesc || '无异常'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">医生标注</div>
                            {record.doctorMark ? (
                              <StatusTag mark={record.doctorMark} />
                            ) : (
                              <span className="text-sm text-gray-500">暂无</span>
                            )}
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-xs text-gray-500 mb-1">医生备注</div>
                            <div className="text-sm text-gray-800">
                              {record.doctorNote || '暂无备注'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
