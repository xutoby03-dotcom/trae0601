## 1. 架构设计

```mermaid
flowchart LR
    subgraph "前端层"
        A["React 18 + TypeScript"] --> B["React Router 路由"]
        A --> C["Zustand 状态管理"]
        A --> D["TailwindCSS 样式"]
        A --> E["Lucide React 图标"]
    end
    subgraph "数据层"
        F["localStorage 持久化"] --> G["Mock 初始数据"]
    end
    A --> F
```

## 2. 技术说明

- **前端框架**：React@18 + TypeScript + Vite
- **初始化工具**：vite-init (react-ts 模板)
- **后端**：无后端，前端纯 Mock 数据 + localStorage 持久化
- **状态管理**：Zustand
- **路由**：react-router-dom
- **样式**：TailwindCSS@3
- **图标**：lucide-react

## 3. 路由定义

| 路由 | 用途 |
|-------|---------|
| /dashboard | 统计看板首页 |
| /devices | 设备档案列表 |
| /devices/new | 新增设备 |
| /devices/:id | 设备详情 |
| /borrows | 借用记录列表 |
| /borrows/new | 发起借用申请 |
| /returns/:borrowId | 归还验收 |
| /repairs | 维修单列表 |
| /repairs/new | 新建维修单 |
| /repairs/:id | 维修单详情 |

## 4. 数据模型

### 4.1 数据模型 ER 图

```mermaid
erDiagram
    DEVICE ||--o{ BORROW : "被借用"
    DEVICE ||--o{ REPAIR : "被维修"
    BORROW ||--o{ REPAIR : "产生维修"
    BORROW }o--|| ACCESSORY : "包含配件"
    
    DEVICE {
        string id PK "设备ID"
        string code "设备编号"
        string category "品类"
        string status "状态：可用/借用中/维修中/报废"
        string purchaseDate "购买日期"
        string custodian "保管人"
        number value "价值（元）"
        string photo "照片URL"
        string description "备注"
        date createdAt "创建时间"
    }
    
    BORROW {
        string id PK "借用ID"
        string deviceId FK "设备ID"
        string purpose "用途"
        string borrower "借用人"
        date borrowDate "借用日期"
        date expectedReturnDate "预计归还日期"
        date actualReturnDate "实际归还日期"
        string status "状态：借用中/已归还/逾期"
        json accessories "配件清单（借出时）"
        json returnChecklist "归还验收项"
        string returnNote "归还备注"
    }
    
    REPAIR {
        string id PK "维修ID"
        string deviceId FK "设备ID"
        string borrowId FK "关联借用ID（可选）"
        string faultDescription "故障现象"
        string handler "处理人"
        number cost "维修费用"
        string status "状态：维修中/已完成/已取消"
        string beforePhoto "维修前照片"
        string afterPhoto "维修后照片"
        date startDate "开始日期"
        date completeDate "完成日期"
        string remark "备注"
    }
    
    ACCESSORY {
        string id PK "配件ID"
        string deviceId FK "设备ID"
        string name "配件名称"
        boolean isDefault "是否标准配件"
    }
```

### 4.2 类型定义（TypeScript）

```typescript
type DeviceStatus = 'available' | 'borrowed' | 'repairing' | 'scrapped';
type BorrowStatus = 'borrowing' | 'returned' | 'overdue';
type RepairStatus = 'repairing' | 'completed' | 'cancelled';

interface Device {
  id: string;
  code: string;
  category: string;
  status: DeviceStatus;
  purchaseDate: string;
  custodian: string;
  value: number;
  photo: string;
  description?: string;
  createdAt: string;
}

interface AccessoryItem {
  id: string;
  name: string;
  checked: boolean;
}

interface Borrow {
  id: string;
  deviceId: string;
  purpose: string;
  borrower: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: BorrowStatus;
  accessories: AccessoryItem[];
  returnChecklist?: {
    accessories: AccessoryItem[];
    appearance: 'good' | 'minor_damage' | 'damaged';
    note?: string;
  };
}

interface Repair {
  id: string;
  deviceId: string;
  borrowId?: string;
  faultDescription: string;
  handler: string;
  cost: number;
  status: RepairStatus;
  beforePhoto?: string;
  afterPhoto?: string;
  startDate: string;
  completeDate?: string;
  remark?: string;
}
```
