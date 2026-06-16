// 桌椅区域
export type FurnitureArea = 'outdoor-east' | 'outdoor-west' | 'outdoor-south' | 'outdoor-north';

// 桌椅类型
export type FurnitureType = 'chair' | 'table' | 'umbrella';

// 桌椅材质
export type FurnitureMaterial = 'wood' | 'metal' | 'plastic' | 'rattan';

// 桌椅状态
export type FurnitureStatus = 'normal' | 'repairing' | 'lost';

// 桌椅档案
export interface Furniture {
  id: string;                    // 主键ID
  code: string;                  // 编号
  name?: string;                 // 名称（可选）
  area: FurnitureArea;           // 区域：东区/西区/南区/北区
  type: FurnitureType;           // 类型：椅子/桌子/遮阳伞
  material: FurnitureMaterial;   // 材质：木质/金属/塑料/藤编
  hasUmbrella: boolean;          // 是否带伞
  storagePoint: string;          // 默认收纳点
  photo?: string;                // 照片URL（可选）
  status: FurnitureStatus;       // 状态：正常/维修中/已丢失
  purchaseDate?: string;         // 采购日期（可选）
  notes?: string;                // 备注（可选）
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}

// 每日记录状态
export type DailyRecordStatus = 'in-progress' | 'completed' | 'abnormal';

// 收摊检查项
export interface CloseChecklist {
  wiped: boolean;    // 是否擦拭干净
  folded: boolean;   // 是否折叠整齐
  locked: boolean;   // 是否上锁
  covered: boolean;  // 是否遮盖
  returned: boolean; // 是否归位
}

// 每日记录
export interface DailyRecord {
  id: string;                    // 主键ID
  recordDate: string;            // 记录日期
  openUserId: string;            // 开摊人ID
  openTime: string;              // 开摊时间
  closeUserId?: string;          // 收摊人ID（可选）
  closeTime?: string;            // 收摊时间（可选）
  furnitureCount: number;        // 外摆数量
  furnitureIds: string[];        // 外摆桌椅ID列表
  closeChecklist: CloseChecklist;// 收摊检查项
  status: DailyRecordStatus;     // 状态：进行中/已完成/异常
  weatherInfo?: WeatherInfo;     // 天气信息（可选）
  notes?: string;                // 备注（可选）
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}

// 事件类型
export type IncidentType = 'damage' | 'loss';

// 事件严重程度
export type IncidentSeverity = 'minor' | 'moderate' | 'severe';

// 事件状态
export type IncidentStatus = 'pending' | 'processing' | 'resolved';

// 事件记录
export interface Incident {
  id: string;                    // 主键ID
  furnitureId: string;           // 桌椅ID
  dailyRecordId?: string;        // 关联记录ID（可选）
  type: IncidentType;            // 类型：损坏/丢失
  severity: IncidentSeverity;    // 严重程度：轻微/中等/严重
  description: string;           // 描述
  photos: string[];              // 照片列表
  reporterId: string;            // 上报人ID
  reportTime: string;            // 上报时间
  status: IncidentStatus;        // 状态：待处理/处理中/已解决
  handlerId?: string;            // 处理人ID（可选）
  repairCost?: number;           // 维修费用（可选）
  resolution?: string;           // 处理结果（可选）
  resolutionTime?: string;       // 处理时间（可选）
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}

// 预警类型
export type AlertType = 'rain' | 'wind' | 'typhoon';

// 预警级别
export type AlertLevel = 'blue' | 'yellow' | 'orange' | 'red';

// 天气信息
export interface WeatherInfo {
  id: string;                    // 主键ID
  recordDate: string;            // 日期
  condition: string;             // 天气状况
  temperature: number;           // 温度
  humidity: number;              // 湿度
  windSpeed: number;             // 风速
  rainProbability: number;       // 降雨概率
  hasAlert: boolean;             // 是否有预警
  alertType?: AlertType;         // 预警类型（可选）：暴雨/大风/台风
  alertLevel?: AlertLevel;       // 预警级别（可选）：蓝色/黄色/橙色/红色
  createdAt: string;             // 创建时间
}

// 用户角色
export type UserRole = 'manager' | 'staff';

// 用户
export interface User {
  id: string;                    // 主键ID
  username: string;              // 用户名
  role: UserRole;                // 角色：店长/店员
  avatar?: string;               // 头像（可选）
  isActive: boolean;             // 是否启用
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}

// 提醒类型
export type ReminderType = 'weather' | 'timer' | 'patrol' | 'custom';

// 提醒
export interface Reminder {
  id: string;                    // 主键ID
  type: ReminderType;            // 类型：天气/定时/巡查/自定义
  title: string;                 // 标题
  content: string;               // 内容
  triggerTime: string;           // 触发时间
  isRead: boolean;               // 是否已读
  relatedId?: string;            // 关联ID（可选）
  createdAt: string;             // 创建时间
}

// 提醒设置
export interface ReminderSettings {
  rainAlertThreshold: number;          // 降雨预警阈值（百分比）
  windAlertThreshold: number;          // 大风预警阈值（km/h）
  patrolReminderTimes: string[];       // 巡查提醒时间列表
  autoCloseReminderTime: string;       // 自动收摊提醒时间
  weatherCheckInterval: number;        // 天气检查间隔（分钟）
  enableDesktopNotification: boolean;  // 是否启用桌面通知
  enableSound: boolean;                // 是否启用声音
}

// 使用率数据
export interface DailyUsageRate {
  date: string;  // 日期
  rate: number;  // 使用率
}

// 高频丢失数据
export interface FrequentlyMissing {
  furnitureId: string;  // 桌椅ID
  code: string;         // 桌椅编号
  count: number;        // 丢失次数
}

// 天气影响数据
export interface WeatherImpact {
  condition: string;     // 天气状况
  incidentCount: number; // 事件数量
}

// 统计数据
export interface StatisticsData {
  dailyUsageRate: DailyUsageRate[];       // 每日使用率
  frequentlyMissing: FrequentlyMissing[]; // 高频丢失
  weatherImpact: WeatherImpact[];         // 天气影响
  repairList: Incident[];                 // 维修列表
}
