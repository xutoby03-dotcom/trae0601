import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Droplet,
  Volume2,
  AlertTriangle,
  Plug,
  Wind,
  FileText,
  ClipboardList,
  Building2,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useInspectionStore } from '@/store/useInspectionStore';
import { useRoomStore } from '@/store/useRoomStore';
import {
  getInspectionStatusLabel,
} from '@/utils/status';
import { cn } from '@/lib/utils';

const InspectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspection } = useInspectionStore();
  const { getRoom } = useRoomStore();

  const inspection = getInspection(id || '');
  const room = inspection ? getRoom(inspection.roomId) : null;

  if (!inspection) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <p className="text-dark-400 mb-4">巡检记录不存在</p>
        <button
          onClick={() => navigate('/inspections')}
          className="text-warning-400 hover:text-warning-300"
        >
          返回巡检列表
        </button>
      </div>
    );
  }

  const checkItems = [
    {
      key: 'hasLeak',
      label: '漏水检查',
      icon: Droplet,
      value: inspection.hasLeak,
      description: '是否有漏水现象',
    },
    {
      key: 'hasNoise',
      label: '异响检查',
      icon: Volume2,
      value: inspection.hasNoise,
      description: '运行时是否有异常响声',
    },
    {
      key: 'socketNormal',
      label: '插座检查',
      icon: Plug,
      value: inspection.socketNormal,
      description: '电源插座是否正常',
      invert: true,
    },
    {
      key: 'exhaustNormal',
      label: '排气检查',
      icon: Wind,
      value: inspection.exhaustNormal,
      description: '排气系统是否正常',
      invert: true,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/inspections')}
          className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:bg-dark-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">巡检详情</h1>
          <p className="text-dark-400">{inspection.inspectionDate}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <Link
                to={`/rooms/${inspection.roomId}`}
                className="text-lg font-semibold text-white hover:text-warning-400 transition-colors"
              >
                {room?.roomNumber} 房
              </Link>
              <p className="text-sm text-dark-400">{room?.heaterModel}</p>
            </div>
          </div>
          <StatusBadge
            label={getInspectionStatusLabel(inspection.status)}
            variant={
              inspection.status === 'normal'
                ? 'success'
                : inspection.status === 'warning'
                ? 'warning'
                : 'danger'
            }
          />
        </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-800/50 rounded-xl p-4">
              <p className="text-sm text-dark-400 mb-1">巡检人</p>
              <p className="text-white font-medium">{inspection.inspector}</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4">
              <p className="text-sm text-dark-400 mb-1">巡检日期</p>
              <p className="text-white font-medium">{inspection.inspectionDate}</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4">
              <p className="text-sm text-dark-400 mb-1">巡检状态</p>
              <p className="text-white font-medium">
                {getInspectionStatusLabel(inspection.status)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">数值检测</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-800/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-warning-500/10 rounded-lg flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-warning-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">水温</p>
                  <p className="text-2xl font-bold text-white font-mono">
                    {inspection.waterTemperature}°C
                  </p>
                </div>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    inspection.waterTemperature < 40 || inspection.waterTemperature > 55
                      ? 'bg-danger-500'
                      : 'bg-success-500'
                  )}
                  style={{ width: `${Math.min(inspection.waterTemperature, 100)}%` }}
                />
              </div>
              <p className="text-xs text-dark-500 mt-2">正常范围: 40-55°C</p>
            </div>

            <div className="bg-dark-800/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">出水量</p>
                <p className="text-2xl font-bold text-white font-mono">
                  {inspection.waterFlowRate}L/min
                </p>
              </div>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  inspection.waterFlowRate < 6 ? 'bg-warning-500' : 'bg-success-500'
                )}
                style={{ width: `${Math.min((inspection.waterFlowRate / 20) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-dark-500 mt-2">正常: ≥ 6L/min</p>
          </div>
        </div>
      </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">检查项目</h2>
          <div className="grid grid-cols-2 gap-4">
            {checkItems.map((item) => {
              const Icon = item.icon;
              const isAbnormal = item.invert ? !item.value : item.value;
              return (
                <div
                  key={item.key}
                  className={cn(
                    'p-4 rounded-xl border',
                    isAbnormal
                      ? 'bg-danger-500/10 border-danger-500/30'
                      : 'bg-dark-800/30 border-dark-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        isAbnormal ? 'bg-danger-500/20' : 'bg-dark-700/50'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          isAbnormal ? 'text-danger-400' : 'text-dark-400'
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">{item.label}</p>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isAbnormal ? 'text-danger-400' : 'text-success-400'
                          )}
                        >
                          {isAbnormal ? '异常' : '正常'}
                        </span>
                      </div>
                      <p className="text-xs text-dark-500">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {inspection.alarmCode && (
            <div className="mt-4 p-4 bg-danger-500/10 border border-danger-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-danger-400" />
                <div>
                  <p className="font-medium text-danger-400">报警码</p>
                  <p className="text-white font-mono text-xl">{inspection.alarmCode}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {inspection.notes && (
          <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-dark-400" />
              备注说明
            </h2>
            <p className="text-dark-300">{inspection.notes}</p>
          </div>
        )}

        {inspection.status !== 'normal' && (
          <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">关联维修</h2>
            <p className="text-dark-400 mb-4">
              本次巡检发现异常，已自动生成维修工单
            </p>
            <Link
              to="/repairs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-warning-500/20 text-warning-400 rounded-xl hover:bg-warning-500/30 transition-colors"
            >
              查看维修进度 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionDetail;
