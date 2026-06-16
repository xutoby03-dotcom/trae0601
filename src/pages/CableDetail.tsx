import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Zap, Ruler, MapPin, Clock, History, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAppStore } from '@/store/useAppStore';
import { INTERFACE_TYPE_LABELS, DAMAGE_TYPE_LABELS } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';

export default function CableDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCableById, borrowRecords, currentUser, deleteCable } = useAppStore();
  
  const cable = id ? getCableById(id) : undefined;
  const cableBorrowHistory = borrowRecords
    .filter(r => r.cableId === id)
    .sort((a, b) => new Date(b.borrowTime).getTime() - new Date(a.borrowTime).getTime());

  if (!cable) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">线材不存在</h2>
        <button
          onClick={() => navigate('/cables')}
          className="text-blue-600 hover:text-blue-700"
        >
          返回线材列表
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`确定要删除线材 ${cable.code} 吗？`)) {
      const success = deleteCable(cable.id);
      if (success) {
        navigate('/cables');
      } else {
        alert('该线材正在借用中，无法删除');
      }
    }
  };

  const interfaceColors: Record<string, string> = {
    'USB-C': 'bg-blue-100 text-blue-700 border-blue-200',
    'Lightning': 'bg-purple-100 text-purple-700 border-purple-200',
    'Micro-USB': 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/cables')}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{cable.code}</h1>
            <p className="text-sm text-gray-500 mt-1">线材详情</p>
          </div>
          {currentUser?.isAdmin && (
            <div className="flex gap-3">
              <Link
                to={`/cables/${cable.id}/edit`}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                编辑
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-24">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={cable.photoUrl}
                  alt={cable.code}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <StatusBadge status={cable.status} />
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${interfaceColors[cable.interfaceType]}`}>
                    {INTERFACE_TYPE_LABELS[cable.interfaceType]}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-500">快充功率</span>
                    <span className="font-mono font-semibold text-gray-900 ml-auto">{cable.power}W</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Ruler className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-500">长度</span>
                    <span className="font-mono font-semibold text-gray-900 ml-auto">{cable.length}m</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="text-gray-500">默认位置</span>
                    <span className="font-semibold text-gray-900 ml-auto">{cable.defaultLocation}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <History className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-500">累计借用</span>
                    <span className="font-mono font-semibold text-gray-900 ml-auto">{cable.borrowCount} 次</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">创建时间</span>
                    <span className="text-gray-700 ml-auto">{formatDateTime(cable.createdAt)}</span>
                  </div>
                </div>

                {cable.status === 'available' && (
                  <Link
                    to={`/borrow/${cable.id}`}
                    className="w-full mt-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    立即借用
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                借还历史
              </h2>
              
              {cableBorrowHistory.length > 0 ? (
                <div className="space-y-4">
                  {cableBorrowHistory.map(record => (
                    <div key={record.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{record.employeeName}</p>
                          <p className="text-xs text-gray-500">{record.department} · {record.employeeNo}</p>
                        </div>
                        <StatusBadge status={record.status} type="borrow" size="sm" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">借用时间</p>
                          <p className="font-mono text-gray-900">{formatDateTime(record.borrowTime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">预计归还</p>
                          <p className="font-mono text-gray-900">{formatDateTime(record.expectedReturn)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">设备</p>
                          <p className="text-gray-900">{record.device}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">用途</p>
                          <p className="text-gray-900">{record.purpose}</p>
                        </div>
                      </div>

                      {record.returnTime && (
                        <>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">实际归还</p>
                            <p className="font-mono text-gray-900">{formatDateTime(record.returnTime)}</p>
                          </div>
                          {record.damageType && (
                            <div className="mt-3 p-3 bg-orange-50 rounded-lg flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-orange-800">
                                  {DAMAGE_TYPE_LABELS[record.damageType]}
                                </p>
                                {record.damageReport && (
                                  <p className="text-xs text-orange-600 mt-1">{record.damageReport}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  暂无借还记录
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
