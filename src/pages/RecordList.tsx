import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Calendar, Pill, ChevronRight, User, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function RecordList() {
  const { visits, records, patients } = useStore();
  const [selectedPatient, setSelectedPatient] = useState<string>('all');

  const completedVisits = visits.filter((v) => v.status === 'completed');

  const filteredVisits = completedVisits.filter((v) => {
    if (selectedPatient === 'all') return true;
    return v.patientId === selectedPatient;
  });

  const getPatientName = (patientId: string) => {
    return patients.find((p) => p.id === patientId)?.name || '未知';
  };

  const getRecord = (visitId: string) => {
    return records.find((r) => r.visitId === visitId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const sortedVisits = [...filteredVisits].sort(
    (a, b) => new Date(b.visitTime).getTime() - new Date(a.visitTime).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">复诊记录</h2>
          <p className="text-gray-500 mt-1">查看历史复诊记录和医嘱</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            className="input max-w-[150px]"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
          >
            <option value="all">全部就诊人</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sortedVisits.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="w-16 h-16 text-warm-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无复诊记录</h3>
          <p className="text-gray-500 mb-4">完成复诊后会在这里显示记录</p>
          <Link to="/visits" className="btn-primary">
            查看复诊安排
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedVisits.map((visit) => {
            const record = getRecord(visit.id);
            const patient = patients.find((p) => p.id === visit.patientId);

            return (
              <Link
                key={visit.id}
                to={`/visits/${visit.id}`}
                className="card p-5 block hover:border-primary-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-center gap-4">
                    {patient && (
                      <img
                        src={patient.avatar}
                        alt={patient.name}
                        className="w-12 h-12 rounded-xl bg-warm-100"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{visit.department}</h3>
                        <span className="tag bg-green-100 text-green-700 text-xs">
                          已完成
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <User className="w-3.5 h-3.5" />
                        {getPatientName(visit.patientId)}
                        <span className="text-warm-200">|</span>
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(visit.visitTime)}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 sm:pl-6">
                    {record ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Pill className="w-4 h-4 text-secondary-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600 line-clamp-2">{record.advice}</p>
                        </div>
                        {record.nextVisit && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Calendar className="w-4 h-4" />
                            <span>下次复诊：{record.nextVisit}</span>
                          </div>
                        )}
                        {record.dosageChange && (
                          <div className="flex items-center gap-2 text-sm text-amber-600">
                            <Pill className="w-4 h-4" />
                            <span className="line-clamp-1">药量变化：{record.dosageChange}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">暂无详细记录</p>
                    )}
                  </div>

                  <div className="hidden sm:block">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
