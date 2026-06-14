## 1. 架构设计

```mermaid
graph TD
    subgraph "前端层 (React + Vite)"
        A["路由层 (React Router)"]
        B["页面组件层"]
        C["业务组件层"]
        D["通用组件层 (UI Kit)"]
        E["状态管理层 (Zustand)"]
    end
    
    subgraph "数据层"
        F["本地存储 (localStorage)"]
        G["Mock 数据"]
        H["数据服务层 (API Service)"]
    end
    
    subgraph "工具层"
        I["工具函数 (utils)"]
        J["常量配置 (constants)"]
        K["类型定义 (types)"]
    end
    
    A --> B
    B --> C
    C --> D
    B --> E
    C --> E
    E --> H
    H --> F
    H --> G
    B --> I
    C --> I
    D --> I
    B --> J
    C --> J
    B --> K
    C --> K
    D --> K
```

## 2. 技术栈说明

- **前端框架**：React@18 + TypeScript
- **构建工具**：Vite@5
- **样式方案**：TailwindCSS@3
- **路由管理**：react-router-dom@6
- **状态管理**：Zustand@4（轻量，适合中小项目）
- **图表库**：Recharts@2（React 生态常用图表库）
- **图标库**：Lucide React（轻量线性图标）
- **日期处理**：date-fns（轻量函数式日期库）
- **数据持久化**：localStorage + 自定义封装
- **表单处理**：React 原生 state + 自定义校验

## 3. 目录结构

```
src/
├── assets/              # 静态资源（图片、字体等）
├── components/          # 通用组件
│   ├── layout/          # 布局组件（Sidebar、Header等）
│   ├── ui/              # 基础UI组件（Button、Modal、Card等）
│   └── charts/          # 图表组件
├── pages/               # 页面级组件
│   ├── Dashboard/       # 总览看板
│   ├── Inspections/     # 巡查记录
│   ├── Notifications/   # 通知管理
│   ├── Recheck/         # 复查列表
│   └── Statistics/      # 统计分析
├── store/               # Zustand状态管理
│   ├── inspectionStore.ts
│   └── notificationStore.ts
├── services/            # 数据服务层
│   ├── inspectionService.ts
│   └── storageService.ts
├── types/               # TypeScript 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   ├── date.ts
│   └── helpers.ts
├── constants/           # 常量配置
│   └── index.ts
├── data/                # Mock数据
│   └── mockData.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 4. 路由定义

| 路由路径 | 页面名称 | 说明 |
|----------|----------|------|
| `/` | 总览看板 | 首页，数据概览和高风险提醒 |
| `/inspections` | 巡查记录 | 巡查记录列表和管理 |
| `/inspections/new` | 新增巡查 | 新增巡查记录表单 |
| `/inspections/:id` | 巡查详情 | 单条巡查记录详情 |
| `/notifications` | 通知管理 | 通知记录和状态跟踪 |
| `/recheck` | 复查列表 | 超期未清理的复查清单 |
| `/statistics` | 统计分析 | 各类统计图表和分析 |

## 5. 数据模型

### 5.1 数据模型定义

```mermaid
erDiagram
    INSPECTION {
        string id PK "记录ID"
        string building "楼栋号"
        string floor "楼层"
        string location "具体位置"
        string itemType "物品类型"
        number area "占用面积(㎡)"
        string photo "照片URL"
        string suspectedResident "疑似住户"
        boolean isFireExit "是否消防通道"
        string status "状态：待处理/通知中/已清理/已超期"
        Date createdAt "创建时间"
        Date updatedAt "更新时间"
    }
    
    NOTIFICATION {
        string id PK "通知ID"
        string inspectionId FK "关联巡查ID"
        string method "通知方式：上门/电话/告示/微信"
        Date deadline "清理期限"
        string contactPerson "联系人"
        string contactPhone "联系电话"
        string feedback "住户反馈"
        Date feedbackAt "反馈时间"
        string status "通知状态：已发送/已反馈/已超期"
        Date createdAt "创建时间"
    }
    
    RECHECK_RECORD {
        string id PK "复查ID"
        string inspectionId FK "关联巡查ID"
        Date recheckDate "复查日期"
        string result "复查结果"
        boolean needsSecondNotice "是否需要二次通知"
        string remark "备注"
    }
    
    INSPECTION ||--o{ NOTIFICATION : "有多次"
    INSPECTION ||--o{ RECHECK_RECORD : "有多次"
```

### 5.2 核心数据类型

```typescript
// 巡查记录
interface Inspection {
  id: string;
  building: string;
  floor: string;
  location: string;
  itemType: ItemType;
  area: number;
  photo: string;
  suspectedResident: string;
  isFireExit: boolean;
  status: InspectionStatus;
  createdAt: string;
  updatedAt: string;
  cleanedAt?: string;
  cleanedPhoto?: string;
}

// 通知记录
interface Notification {
  id: string;
  inspectionId: string;
  method: NotificationMethod;
  deadline: string;
  contactPerson: string;
  contactPhone: string;
  feedback?: string;
  feedbackAt?: string;
  status: NotificationStatus;
  createdAt: string;
  noticeCount: number;
}

// 物品类型
type ItemType = '纸箱' | '旧家具' | '花盆' | '儿童车' | '自行车' | '杂物' | '其他';

// 巡查状态
type InspectionStatus = 'pending' | 'notified' | 'cleaned' | 'overdue' | 'recheck';

// 通知方式
type NotificationMethod = '上门' | '电话' | '告示' | '微信' | '其他';

// 通知状态
type NotificationStatus = 'sent' | 'feedback_received' | 'overdue' | 'completed';
```

### 5.3 统计数据模型

```typescript
// 楼栋统计
interface BuildingStats {
  building: string;
  totalCount: number;
  pendingCount: number;
  cleanedCount: number;
  overdueCount: number;
}

// 重复住户统计
interface ResidentStats {
  resident: string;
  count: number;
  building: string;
}

// 清理时效统计
interface CleanupStats {
  avgDays: number;
  within3Days: number;
  within7Days: number;
  over7Days: number;
}

// 高风险点位
interface RiskPoint {
  location: string;
  building: string;
  floor: string;
  count: number;
  riskLevel: 'high' | 'medium' | 'low';
  isFireExit: boolean;
}
```
