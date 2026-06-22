export const NORMAL_LIGHT_PERIOD = { min: 2, max: 10 };

export const NORMAL_FOG_INTERVAL = { min: 30, max: 120 };

export const VISIBILITY_THRESHOLD = 1000;

export const CONDENSATION_HUMIDITY_THRESHOLD = 85;

export const CONDENSATION_VISIBILITY_THRESHOLD = 500;

export const CONDENSATION_DURATION_THRESHOLD = 30 * 60 * 1000;

export const WIND_DIRECTIONS = [
  { value: 'N', label: '北', deg: 0 },
  { value: 'NE', label: '东北', deg: 45 },
  { value: 'E', label: '东', deg: 90 },
  { value: 'SE', label: '东南', deg: 135 },
  { value: 'S', label: '南', deg: 180 },
  { value: 'SW', label: '西南', deg: 225 },
  { value: 'W', label: '西', deg: 270 },
  { value: 'NW', label: '西北', deg: 315 },
] as const;

export const SEA_STATE_LABELS = [
  { value: 0, label: '无浪', desc: '海面如镜' },
  { value: 1, label: '微浪', desc: '波纹' },
  { value: 2, label: '小浪', desc: '小波' },
  { value: 3, label: '轻浪', desc: '小波加大' },
  { value: 4, label: '中浪', desc: '中波' },
  { value: 5, label: '大浪', desc: '大波开始形成' },
  { value: 6, label: '巨浪', desc: '较大波' },
  { value: 7, label: '狂浪', desc: '巨波' },
  { value: 8, label: '狂涛', desc: '异常波' },
  { value: 9, label: '怒涛', desc: '海况非凡' },
] as const;

export const VESSEL_FEEDBACK_OPTIONS = [
  { value: 'positive', label: '信号清晰', desc: '船只反馈信号正常', color: 'safe' },
  { value: 'negative', label: '信号异常', desc: '船只反馈信号有问题', color: 'warning' },
  { value: 'none', label: '无反馈', desc: '未收到船只反馈', color: 'info' },
] as const;

export const ALERT_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  interval_abnormal: { label: '间隔异常', icon: 'clock', color: 'warning' },
  power_switch: { label: '电源切换', icon: 'battery', color: 'caution' },
  condensation: { label: '设备结露', icon: 'droplets', color: 'info' },
  maintenance: { label: '维护工单', icon: 'wrench', color: 'caution' },
};

export const ALERT_LEVEL_META: Record<string, { label: string; chipClass: string }> = {
  info: { label: '提示', chipClass: 'chip-info' },
  warning: { label: '警告', chipClass: 'chip-caution' },
  critical: { label: '严重', chipClass: 'chip-warning' },
};

export const PROCESS_STATUS_META: Record<string, { label: string; chipClass: string }> = {
  pending: { label: '待处理', chipClass: 'chip-warning' },
  processing: { label: '处理中', chipClass: 'chip-caution' },
  resolved: { label: '已解决', chipClass: 'chip-safe' },
};
