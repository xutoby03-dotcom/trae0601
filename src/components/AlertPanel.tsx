import { useState } from 'react';
import {
  Clock,
  BatteryCharging,
  Droplets,
  Wrench,
  X,
  ChevronRight,
  AlertTriangle,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import type { AlertEvent, ProcessStatus } from '../utils/types';
import { useDutyStore } from '../store/useDutyStore';
import { formatTime } from '../utils/helpers';
import MaintenanceModal from './MaintenanceModal';

interface AlertCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  alertClass: string;
  dotClass: string;
  shadowClass: string;
  alerts: AlertEvent[];
  onResolve: (id: string) => void;
  onMarkProcessing: (id: string) => void;
  extraButton?: React.ReactNode;
}

function AlertCard({
  icon,
  title,
  description,
  count,
  alertClass,
  dotClass,
  shadowClass,
  alerts,
  onResolve,
  onMarkProcessing,
  extraButton,
}: AlertCardProps) {
  const [expanded, setExpanded] = useState(count > 0);

  return (
    <div
      className={`glass-card p-4 transition-all ${count > 0 ? shadowClass : ''} ${
        count > 0 ? `border ${alertClass.replace('bg-', 'border-').replace('/15', '/40')}` : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2.5 rounded-xl ${count > 0 ? 'animate-pulse-slow' : ''} ${
            count > 0 ? alertClass : 'bg-ocean-800/40 text-ocean-400'
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-ocean-100">{title}</h3>
              {count > 0 && (
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${dotClass}`}
                >
                  {count}
                </span>
              )}
            </div>
            {count > 0 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-ocean-300 hover:text-ocean-100 transition-colors"
              >
                <ChevronRight
                  size={18}
                  className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
                />
              </button>
            )}
          </div>
          <p className="text-xs text-ocean-300 mt-1">{description}</p>
          {count === 0 && (
            <span className="inline-flex items-center gap-1 mt-2 text-xs text-alert-safe">
              <CheckCircle2 size={12} />
              运行正常
            </span>
          )}
        </div>
      </div>

      {count > 0 && expanded && (
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-ocean-950/60 rounded-lg p-3 border border-ocean-700/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ocean-100">
                      {alert.title}
                    </span>
                    <span
                      className={`chip text-[10px] ${
                        alert.status === 'pending'
                          ? 'chip-warning'
                          : alert.status === 'processing'
                          ? 'chip-caution'
                          : 'chip-safe'
                      }`}
                    >
                      {alert.status === 'pending'
                        ? '待处理'
                        : alert.status === 'processing'
                        ? '处理中'
                        : '已解决'}
                    </span>
                  </div>
                  <p className="text-xs text-ocean-300 mt-1 line-clamp-2">
                    {alert.description}
                  </p>
                  <p className="text-[11px] text-ocean-400 mt-1">
                    {formatTime(alert.timestamp)}
                    {alert.handler && ` · 处理人: ${alert.handler}`}
                  </p>
                </div>
              </div>
              {alert.status !== 'resolved' && (
                <div className="flex gap-2 mt-2">
                  {alert.status === 'pending' && (
                    <button
                      onClick={() => onMarkProcessing(alert.id)}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-ocean-700/50 text-ocean-200 hover:bg-ocean-700/70 transition-colors"
                    >
                      标记处理中
                    </button>
                  )}
                  <button
                    onClick={() => onResolve(alert.id)}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-alert-safe/20 text-alert-safe hover:bg-alert-safe/30 transition-colors"
                  >
                    标记已解决
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {extraButton && count === 0 && (
        <div className="mt-3 pt-3 border-t border-ocean-700/30">{extraButton}</div>
      )}
      {extraButton && count > 0 && (
        <div className="mt-3 pt-3 border-t border-ocean-700/30">{extraButton}</div>
      )}
    </div>
  );
}

export default function AlertPanel() {
  const { alerts, updateAlertStatus, addManualAlert } = useDutyStore();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const getActiveAlerts = (type: string) =>
    alerts
      .filter((a) => a.type === type && a.status !== 'resolved')
      .sort((a, b) => b.timestamp - a.timestamp);

  const intervalAlerts = getActiveAlerts('interval_abnormal');
  const powerAlerts = getActiveAlerts('power_switch');
  const condensationAlerts = getActiveAlerts('condensation');
  const maintenanceAlerts = getActiveAlerts('maintenance');

  const totalActive =
    intervalAlerts.length +
    powerAlerts.length +
    condensationAlerts.length +
    maintenanceAlerts.length;

  const handleResolve = (id: string) => {
    updateAlertStatus(id, 'resolved', '值守员已处理');
  };

  const handleMarkProcessing = (id: string) => {
    updateAlertStatus(id, 'processing');
  };

  const handlePowerSwitch = () => {
    addManualAlert({
      type: 'power_switch',
      level: 'warning',
      title: '手动切换备用电源',
      description: '值守员手动切换至备用电源，请检查主电源状态',
      handler: '当前值守员',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={22} className="text-ocean-200" />
            {totalActive > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-alert-warning rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-blink">
                {totalActive}
              </span>
            )}
          </div>
          <h2 className="font-display text-2xl text-ocean-100">异常监控面板</h2>
        </div>
        {totalActive > 0 && (
          <span className="chip chip-warning animate-pulse">
            <AlertTriangle size={12} />
            {totalActive} 项待关注
          </span>
        )}
      </div>

      <AlertCard
        icon={<Clock size={20} />}
        title="设备周期异常"
        description="灯光周期与雾号间隔偏离标准范围"
        count={intervalAlerts.length}
        alerts={intervalAlerts}
        alertClass="bg-alert-warning/15 text-alert-warning"
        dotClass="bg-alert-warning text-white"
        shadowClass="shadow-glow-warning"
        onResolve={handleResolve}
        onMarkProcessing={handleMarkProcessing}
      />

      <AlertCard
        icon={<BatteryCharging size={20} />}
        title="备用电源状态"
        description="主电源故障时自动切换备用发电机组"
        count={powerAlerts.length}
        alerts={powerAlerts}
        alertClass="bg-alert-caution/15 text-alert-caution"
        dotClass="bg-alert-caution text-ocean-900"
        shadowClass="shadow-glow-caution"
        onResolve={handleResolve}
        onMarkProcessing={handleMarkProcessing}
        extraButton={
          <button
            onClick={handlePowerSwitch}
            className="w-full text-sm py-2 rounded-lg bg-ocean-700/40 text-ocean-200 hover:bg-ocean-700/60 border border-ocean-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <BatteryCharging size={14} />
            手动切换至备用电源
          </button>
        }
      />

      <AlertCard
        icon={<Droplets size={20} />}
        title="设备结露预警"
        description="高湿度或持续低能见度可能导致光学设备结露"
        count={condensationAlerts.length}
        alerts={condensationAlerts}
        alertClass="bg-ocean-300/15 text-ocean-300"
        dotClass="bg-ocean-300 text-ocean-900"
        shadowClass="shadow-glow"
        onResolve={handleResolve}
        onMarkProcessing={handleMarkProcessing}
      />

      <AlertCard
        icon={<Wrench size={20} />}
        title="维护工单"
        description="设备检修与维护任务追踪"
        count={maintenanceAlerts.length}
        alerts={maintenanceAlerts}
        alertClass="bg-alert-caution/15 text-alert-caution"
        dotClass="bg-alert-caution text-ocean-900"
        shadowClass="shadow-glow-caution"
        onResolve={handleResolve}
        onMarkProcessing={handleMarkProcessing}
        extraButton={
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="w-full text-sm py-2 rounded-lg bg-alert-safe/20 text-alert-safe hover:bg-alert-safe/30 transition-colors flex items-center justify-center gap-2"
          >
            <Wrench size={14} />
            提交维护工单
          </button>
        }
      />

      <MaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
      />
    </div>
  );
}
