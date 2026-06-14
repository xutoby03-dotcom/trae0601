import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Pill, Hospital, Stethoscope, Plus, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patients, visits, records } = useStore();

  const patient = patients.find((p) => p.id === id);
  const patientVisits = visits.filter((v) => v.patientId === id);
  const upcomingVisits = patientVisits.filter((v) => v.status !== 'completed' && v.status !== 'cancelled');
  const completedVisits = patientVisits.filter((v) => v.status === 'completed');

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">未找到该就诊人</p>
        <Link to="/patients" className="btn-primary mt-4 inline-block">
          返回列表
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <img
            src={patient.avatar}
            alt={patient.name}
            className="w-24 h-24 rounded-2xl bg-warm-100"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2>
              <span className="tag bg-primary-100 text-primary-700">
                {patient.disease}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
                <Hospital className="w-5 h-5 text-secondary-500" />
                <div>
                  <p className="text-xs text-gray-500">常去医院</p>
                  <p className="text-sm font-medium text-gray-800">{patient.hospital}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
                <Stethoscope className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-xs text-gray-500">主治医生</p>
                  <p className="text-sm font-medium text-gray-800">{patient.doctor}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-start gap-3">
                <Pill className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">用药备注</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {patient.medicationNotes || '暂无用药备注'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              待复诊 ({upcomingVisits.length})
            </h3>
            <Link to="/visits" className="text-sm text-primary-600 hover:text-primary-700">
              添加复诊
            </Link>
          </div>

          {upcomingVisits.length === 0 ? (
            <div className="card p-8 text-center">
              <Calendar className="w-12 h-12 text-warm-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无待复诊安排</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingVisits.map((visit) => (
                <Link
                  key={visit.id}
                  to={`/visits/${visit.id}`}
                  className="card p-4 block hover:border-primary-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{visit.department}</p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(visit.visitTime)}
                      </p>
                    </div>
                    <StatusBadge status={visit.status} size="sm" />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-warm-100 text-warm-600 rounded-full text-xs">
                      陪同：{visit.companion}
                    </span>
                    <span className="px-2 py-0.5 bg-secondary-100 text-secondary-600 rounded-full text-xs">
                      {visit.transport}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Pill className="w-5 h-5 text-secondary-500" />
              历史记录 ({completedVisits.length})
            </h3>
          </div>

          {completedVisits.length === 0 ? (
            <div className="card p-8 text-center">
              <Pill className="w-12 h-12 text-warm-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无历史记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedVisits.map((visit) => {
                const record = records.find((r) => r.visitId === visit.id);
                return (
                  <div key={visit.id} className="card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{visit.department}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(visit.visitTime)}
                        </p>
                      </div>
                      <StatusBadge status={visit.status} size="sm" />
                    </div>
                    {record && (
                      <div className="mt-3 pt-3 border-t border-warm-100">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          医嘱：{record.advice}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
