## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层"
        A["React 18 单页应用"]
        B["路由管理 (React Router)"]
        C["状态管理 (React Context + Hooks)"]
        D["UI组件库 (TailwindCSS + Lucide图标)"]
        E["图表库 (Recharts)"]
    end
    
    subgraph "数据层"
        F["LocalStorage 持久化"]
        G["Mock 数据服务"]
        H["TypeScript 类型系统"]
    end
    
    subgraph "服务层"
        I["借还管理服务"]
        J["遥控器档案服务"]
        K["统计分析服务"]
        L["提醒通知服务"]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    C --> F
    C --> G
    I --> F
    J --> F
    K --> F
    L --> F
    G --> H
```

## 2. 技术描述

- **前端框架**：React 18.2.0
- **构建工具**：Vite 5.0
- **开发语言**：TypeScript 5.0
- **样式方案**：TailwindCSS 3.4
- **路由管理**：React Router DOM 6.20
- **图表组件**：Recharts 2.10
- **图标库**：Lucide React 0.294
- **状态管理**：React Context + useReducer
- **数据持久化**：LocalStorage
- **日期处理**：date-fns 3.0

## 3. 目录结构

```
src/
├── components/          # 公共组件
│   ├── layout/         # 布局组件
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── ui/           # UI基础组件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Slider.tsx
│   │   ├── Badge.tsx
│   │   └── Table.tsx
│   └── charts/       # 图表组件
│       ├── BarChart.tsx
│       ├── PieChart.tsx
│       └── LineChart.tsx
├── pages/             # 页面组件
│   ├── Dashboard.tsx
│   ├── Remotes.tsx
│   ├── BorrowReturn.tsx
│   ├── Statistics.tsx
│   └── Purchase.tsx
├── context/           # 状态管理
│   ├── AppContext.tsx
│   └── types.ts
├── data/             # Mock数据和类型
│   ├── mockData.ts
│   └── types.ts
├── services/         # 业务服务
│   ├── remoteService.ts
│   ├── borrowService.ts
│   └── statsService.ts
│   └── notificationService.ts
├── utils/            # 工具函数
│   ├── dateUtils.ts
│   └── storage.ts
│   └── helpers.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 4. 路由定义

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | Dashboard | 首页仪表盘，概览统计和提醒 |
| `/remotes` | Remotes | 遥控器档案管理 |
| `/borrow` | BorrowReturn | 借还管理 |
| `/statistics` | Statistics | 统计报表 |
| `/purchase` | Purchase | 补购管理 |

## 5. 数据模型

### 5.1 ER图

```mermaid
erDiagram
    REMOTE {
        string id "主键"
        string code "遥控器编号"
        string conferenceRoom "适配会议室"
        string batteryModel "电池型号"
        string storageLocation "默认存放点"
        string photoUrl "外观照片"
        string status "状态: 可用/借用中/维修中/丢失"
        number batteryLevel "电池电量"
        date lastBatteryChange "上次换电池日期"
        date createdAt "创建时间"
    }
    
    BORROW_RECORD {
        string id "主键"
        string remoteId "外键-遥控器ID"
        string borrower "使用人"
        string department "部门"
        string conferenceRoom "使用会议室"
        date borrowTime "借出时间"
        date expectedReturn "预计归还"
        string purpose "用途"
        date actualReturn "实际归还"
        number returnBatteryLevel "归还时电量"
        boolean hasDamage "是否破损"
        boolean inOriginalBox "是否放回原盒"
        string status "状态: 借用中/已归还/逾期/丢失"
        string notes "备注"
    }
    
    PURCHASE_ORDER {
        string id "主键"
        string remoteId "外键-遥控器ID"
        string reason "补购原因"
        string applicant "申请人"
        date applyDate "申请日期"
        string approver "审批人"
        date approveDate "审批日期"
        string status "状态: 待审批/审批通过/已采购/已入库"
        string purchaseChannel "采购渠道"
        number cost "采购费用"
        date purchaseDate "采购日期"
        date stockDate "入库日期"
    }
    
    REMOTE ||--o{ BORROW_RECORD : "has"
    REMOTE ||--o{ PURCHASE_ORDER : "generates"
```

### 5.2 TypeScript 类型定义

```typescript
// 遥控器状态枚举
type RemoteStatus = 'available' | 'borrowed' | 'maintenance' | 'lost';

// 借用记录状态枚举
type BorrowStatus = 'borrowing' | 'returned' | 'overdue' | 'lost';

// 采购单状态枚举
type PurchaseStatus = 'pending' | 'approved' | 'purchased' | 'stocked';

// 遥控器接口
interface Remote {
  id: string;
  code: string;
  conferenceRoom: string;
  batteryModel: string;
  storageLocation: string;
  photoUrl: string;
  status: RemoteStatus;
  batteryLevel: number;
  lastBatteryChange: string;
  createdAt: string;
}

// 借用记录接口
interface BorrowRecord {
  id: string;
  remoteId: string;
  borrower: string;
  department: string;
  conferenceRoom: string;
  borrowTime: string;
  expectedReturn: string;
  purpose: string;
  actualReturn?: string;
  returnBatteryLevel?: number;
  hasDamage?: boolean;
  inOriginalBox?: boolean;
  status: BorrowStatus;
  notes?: string;
}

// 采购单接口
interface PurchaseOrder {
  id: string;
  remoteId?: string;
  reason: string;
  applicant: string;
  applyDate: string;
  approver?: string;
  approveDate?: string;
  status: PurchaseStatus;
  purchaseChannel?: string;
  cost?: number;
  purchaseDate?: string;
  stockDate?: string;
  newRemoteId?: string;
}

// 提醒类型
interface Notification {
  id: string;
  type: 'overdue' | 'lowBattery' | 'maintenance';
  title: string;
  message: string;
  remoteId: string;
  recordId?: string;
  timestamp: string;
  read: boolean;
}
```

### 5.3 Mock 初始数据

- 遥控器数据：15个遥控器，覆盖不同楼层会议室
- 借用记录：30条历史记录，包含5条逾期、3条低电量
- 采购单：2条历史采购记录
- 部门列表：技术部、产品部、运营部、市场部、人事部、财务部
- 会议室列表：1楼-培训室、2楼-大会议室、2楼-小会议室、3楼-董事会议室、3楼-洽谈室、5楼-多功能厅
- 电池型号：AA、AAA、CR2032
