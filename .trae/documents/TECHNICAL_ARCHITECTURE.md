## 1. 架构设计

```mermaid
graph TB
    subgraph "前端应用层"
        A["React SPA (Vite)"]
        A1["页面组件<br/>Dashboard/Subscriptions/Stats"]
        A2["通用组件<br/>Calendar/Cards/Modals/Charts"]
        A3["Zustand 全局状态<br/>订阅数据/UI状态/筛选器"]
    end
    
    subgraph "数据持久化层"
        B["localStorage 封装"]
        B1["订阅 CRUD 操作"]
        B2["图片 Base64 存储"]
    end
    
    subgraph "工具函数层"
        C["日期计算<br/>下次扣费/周期推算/倒计时"]
        D["金额统计<br/>年化/分类汇总/对比"]
        E["提醒逻辑<br/>试用期/犹豫区/异常检测"]
    end
    
    A --> A1 --> A2 --> A3
    A3 --> B
    A3 --> C
    A3 --> D
    A3 --> E
```

## 2. 技术描述

- **前端框架**：React@18 + TypeScript@5 + Vite@5
- **样式方案**：Tailwind CSS@3（自定义主题令牌）+ CSS 变量
- **状态管理**：Zustand@4（轻量全局 Store，含 localStorage 持久化中间件）
- **路由方案**：React Router DOM@6（Hash 路由，部署友好）
- **图标库**：Lucide React（线性图标，按需加载）
- **图表可视化**：Recharts（React 原生图表库，轻量）
- **日期处理**：date-fns（模块化、Tree-shakable，比 Moment 轻）
- **后端服务**：无后端，纯前端 + localStorage
- **初始化工具**：vite-init（react-ts 模板）

## 3. 路由定义

| 路由 | 页面 | 用途 |
|------|------|------|
| `/` | Dashboard | 首页仪表盘：月历 + 汇总 + 即将扣费 + 犹豫区 |
| `/subscriptions` | Subscriptions | 订阅列表：全部/分类筛选、复核、编辑入口 |
| `/stats` | Statistics | 统计分析：分类饼图、年化、智能建议 |
| `/subscriptions/new` | SubscriptionForm | 新增订阅（弹窗/独立页） |
| `/subscriptions/:id/edit` | SubscriptionForm | 编辑订阅 |

## 4. 数据模型

### 4.1 ER 图

```mermaid
erDiagram
    SUBSCRIPTION {
        string id PK "唯一ID"
        string name "服务名称"
        string purpose "用途描述"
        enum category "分类: entertainment/education/office/family"
        enum channel "扣费渠道: alipay/appstore/wechat/credit_card/other"
        string channelCustom "自定义渠道名"
        enum billingCycle "周期: monthly/quarterly/yearly/custom"
        number cycleDays "自定义周期天数"
        number amount "当前金额(元)"
        string nextBillingDate "下次扣费日 YYYY-MM-DD"
        string lastBillingDate "上次扣费日"
        string logoEmoji "服务图标Emoji"
        string screenshot "截图Base64(可选)"
        string[] familyMembers "家庭共享人列表"
        boolean isTrial "是否试用期"
        string trialEndDate "试用期结束日"
        number trialReminderDays "提前几天提醒取消"
        boolean isPriceIncreased "是否涨价过"
        number originalAmount "原金额"
        string priceIncreaseDate "涨价日期"
        number cardFailCount "换卡失败次数"
        string duplicateOfId "重复订阅关联ID"
        string lastConfirmedAt "上次复核时间 ISO"
        string createdAt "创建时间"
        string updatedAt "更新时间"
        string notes "备注"
    }
```

### 4.2 TypeScript 类型定义

```typescript
export type Category = 'entertainment' | 'education' | 'office' | 'family' | 'other';
export type Channel = 'alipay' | 'appstore' | 'wechat' | 'credit_card' | 'paypal' | 'other';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'weekly' | 'custom';

export interface PriceHistory {
  date: string;
  from: number;
  to: number;
}

export interface Subscription {
  id: string;
  name: string;
  purpose: string;
  category: Category;
  channel: Channel;
  channelCustom?: string;
  billingCycle: BillingCycle;
  cycleDays?: number;
  amount: number;
  currency: string;
  nextBillingDate: string;
  lastBillingDate?: string;
  logoEmoji: string;
  screenshot?: string;
  familyMembers: string[];
  isTrial: boolean;
  trialEndDate?: string;
  trialReminderDays?: number;
  isPriceIncreased: boolean;
  priceHistory: PriceHistory[];
  cardFailCount: number;
  duplicateOfId?: string;
  lastConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface SubscriptionFilters {
  category: Category | 'all';
  search: string;
  onlyUnconfirmed: boolean;
  onlyTrial: boolean;
}
```

## 5. Zustand Store 设计

```typescript
// useSubscriptionStore
interface State {
  subscriptions: Subscription[];
  filters: SubscriptionFilters;
  selectedMonth: string; // YYYY-MM
  modalState: { add: boolean; editId: string | null };
}

interface Actions {
  addSubscription: (data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSubscription: (id: string, data: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  confirmUsage: (id: string) => void; // 点击"还在用吗"
  setFilters: (filters: Partial<SubscriptionFilters>) => void;
  setSelectedMonth: (month: string) => void;
  getSubscriptionsByDate: (date: string) => Subscription[]; // 月历用
  getMonthlyTotal: (month: string) => number;
  getNextBillingDate: (sub: Subscription, fromDate?: Date) => string;
  getUnconfirmedSubscriptions: (months?: number) => Subscription[];
  getCategoryStats: () => CategoryStats[];
  getAnnualProjection: () => number;
}
```

## 6. 关键业务逻辑

### 6.1 下次扣费日期推算
- monthly: 当月同日 → 下月同日（月末特殊处理）
- quarterly: +3个月
- yearly: +1年
- weekly: +7天
- custom: +cycleDays天

### 6.2 犹豫区判定
```typescript
const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
const isInDoubtZone = (sub: Subscription) => {
  if (!sub.lastConfirmedAt) return Date.now() - new Date(sub.createdAt).getTime() > THREE_MONTHS_MS;
  return Date.now() - new Date(sub.lastConfirmedAt).getTime() > THREE_MONTHS_MS;
};
```

### 6.3 年化计算
```typescript
const getAnnualAmount = (sub: Subscription) => {
  switch (sub.billingCycle) {
    case 'weekly': return sub.amount * 52;
    case 'monthly': return sub.amount * 12;
    case 'quarterly': return sub.amount * 4;
    case 'yearly': return sub.amount;
    case 'custom': return sub.amount * (365 / (sub.cycleDays || 30));
  }
};
```
