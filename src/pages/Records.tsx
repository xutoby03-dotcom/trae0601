import { Link } from 'react-router-dom';
import { Plus, ClipboardList, User, Calendar, Pill, FileText, Trash2, AlertCircle, Clock } from 'lucide-react';
import { useMedicineStore } from '@/store/medicineStore';
import { formatDate } from '@/utils/medicine';

export default function Records() {
  const { records, deleteRecord } = useMedicineStore();

  const groupedRecords = records.reduce((acc, record) => {
    const date = formatDate(record.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, typeof records>);

  const dates = Object.keys(groupedRecords).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">用药记录</h1>
          <p className="text-gray-500 text-sm mt-1">共 {records.length} 条记录</p>
        </div>
        <Link
          to="/records/add"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          添加记录
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无用药记录</h3>
          <p className="text-gray-500 mb-6">
            记录家人的用药情况，便于追踪病情和复诊
          </p>
          <Link
            to="/records/add"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 transition-all"
          >
            <Plus className="w-5 h-5" />
            记录第一次用药
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{date}</h2>
              </div>
              
              <div className="relative pl-5 ml-5 border-l-2 border-gray-200 space-y-4">
                {groupedRecords[date].map((record, index) => (
                  <div key={record.id} className="relative">
                    <div className="absolute -left-[26px] top-6 w-3 h-3 bg-white border-4 border-primary-400 rounded-full" />
                    
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{record.userName}</h3>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(record.createdAt).toLocaleTimeString('zh-CN', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-[52px]">
                            <div className="flex items-start gap-2">
                              <Pill className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500">药品</p>
                                <p className="text-sm font-medium text-gray-800">{record.medicineName}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500">用量</p>
                                <p className="text-sm font-medium text-gray-800">{record.dosage}</p>
                              </div>
                            </div>
                            {record.symptoms && (
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-500">症状</p>
                                  <p className="text-sm font-medium text-gray-800">{record.symptoms}</p>
                                </div>
                              </div>
                            )}
                            {record.needFollowUp && (
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-danger-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-500">复诊提醒</p>
                                  <p className="text-sm font-medium text-danger-600">
                                    需要复诊
                                    {record.followUpDate && ` · ${formatDate(record.followUpDate)}`}
                                  </p>
                                </div>
                              </div>
                            )}
                            {record.notes && (
                              <div className="flex items-start gap-2 sm:col-span-2">
                                <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-500">备注</p>
                                  <p className="text-sm text-gray-600">{record.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm('确定要删除这条记录吗？')) {
                              deleteRecord(record.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
