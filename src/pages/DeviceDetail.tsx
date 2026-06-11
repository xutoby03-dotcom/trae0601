import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Cpu,
  Calendar,
  MapPin,
  FileText,
  AlertTriangle,
  Package,
  Plus,
  Edit3,
  History,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import StatusBadge from '../components/common/StatusBadge';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../utils';

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeviceById, loans } = useAppStore();

  const device = getDeviceById(id || '');
  const deviceLoans = loans.filter((l) => l.deviceId === id);

  if (!device) {
    return (
      <PageContainer title="样机详情" subtitle="样机不存在">
        <div className="text-center py-16 text-gray-500">样机不存在</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="样机详情" subtitle={device.deviceNo}>
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/devices')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回样机列表
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* 左侧：基本信息 */}
        <div className="col-span-2 space-y-6">
          {/* 样机卡片 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Cpu className="w-10 h-10 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 font-serif">{device.name}</h2>
                  <p className="text-gray-500">{device.model}</p>
                  <div className="mt-2">
                    <StatusBadge status={device.status} type="device" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary flex items-center gap-2 text-sm">
                  <Edit3 className="w-4 h-4" />
                  编辑
                </button>
                {device.status === 'available' && (
                  <button
                    onClick={() => navigate('/loans/new')}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    借出
                  </button>
                )}
              </div>
            </div>

            {/* 信息网格 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">样机编号</p>
                <p className="font-medium text-gray-800">{device.deviceNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">序列号</p>
                <p className="font-medium text-gray-800 font-mono">{device.serialNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  存放位置
                </p>
                <p className="font-medium text-gray-800">{device.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  购入日期
                </p>
                <p className="font-medium text-gray-800">{formatDate(device.purchaseDate)}</p>
              </div>
            </div>

            {device.description && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">设备描述</p>
                <p className="text-gray-700">{device.description}</p>
              </div>
            )}
          </div>

          {/* 配件清单 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                配件清单
              </h3>
              <span className="text-sm text-gray-500">共 {device.accessories.length} 件</span>
            </div>

            <div className="space-y-3">
              {device.accessories.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{acc.name}</p>
                      {acc.description && (
                        <p className="text-xs text-gray-500">{acc.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary-600">× {acc.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 借出历史 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-primary-600" />
              借出历史
            </h3>

            <div className="space-y-3">
              {deviceLoans.length === 0 ? (
                <p className="text-gray-400 text-center py-8">暂无借出记录</p>
              ) : (
                deviceLoans.map((loan) => {
                  const customer = useAppStore.getState().customers.find(
                    (c) => c.id === loan.customerId
                  );
                  const employee = useAppStore.getState().employees.find(
                    (e) => e.id === loan.employeeId
                  );
                  return (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/loans/${loan.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-400">借出日期</p>
                          <p className="font-medium text-gray-700">{formatDate(loan.loanDate)}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div>
                          <p className="font-medium text-gray-800">{customer?.name}</p>
                          <p className="text-xs text-gray-500">{customer?.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">负责人</p>
                          <p className="text-sm text-gray-600">{employee?.name}</p>
                        </div>
                        <StatusBadge status={loan.status} type="loan" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 右侧：异常记录 + 统计 */}
        <div className="space-y-6">
          {/* 异常记录 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              异常记录
            </h3>

            {deviceLoans.flatMap((l) => l.exceptions).length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-6 h-6 text-success-500" />
                </div>
                <p className="text-gray-400 text-sm">暂无异常记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deviceLoans
                  .flatMap((l) => l.exceptions)
                  .slice(0, 5)
                  .map((exc) => (
                    <div key={exc.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {exc.type === 'damage'
                            ? '外观损坏'
                            : exc.type === 'accessory_missing'
                            ? '配件缺失'
                            : exc.type === 'malfunction'
                            ? '功能故障'
                            : '其他'}
                        </span>
                        <StatusBadge status={exc.severity} type="severity" />
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{exc.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(exc.createDate)}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 使用统计 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">使用统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">累计借出</span>
                <span className="text-xl font-bold text-primary-900 font-serif">
                  {deviceLoans.length}
                  <span className="text-sm font-normal text-gray-400 ml-1">次</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">异常次数</span>
                <span className="text-xl font-bold text-warning-600 font-serif">
                  {deviceLoans.flatMap((l) => l.exceptions).length}
                  <span className="text-sm font-normal text-gray-400 ml-1">次</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">在借状态</span>
                <span className="text-lg font-bold">
                  {device.status === 'available' ? (
                    <span className="text-success-600">空闲中</span>
                  ) : (
                    <span className="text-primary-600">使用中</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
