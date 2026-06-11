## 1. 架构设计

```mermaid
graph TD
    A["前端应用 (React + TypeScript)"] --> B["状态管理层 (Zustand)"]
    B --> C["本地数据持久化 (localStorage)"]
    A --> D["路由层 (React Router)"]
    D --> E["首页总览"]
    D --> F["借用登记页"]
    D --> G["归还管理页"]
    D --> H["统计分析页"]
    A --> I["UI 组件层"]
    I --> J["Tailwind CSS 样式系统"]
    I --> K["lucide-react 图标库"]
```

## 2. 技术描述

- **前端框架**: React@18 + TypeScript + Vite
- **初始化工具**: vite-init (react-ts 模板)
- **路由**: react-router-dom@6
- **状态管理**: zustand
- **样式方案**: tailwindcss@3
- **图标库**: lucide-react
- **数据持久化**: localStorage (前端模拟数据，无需后端)
- **后端**: 无（纯前端应用）
- **数据库**: 无（使用 localStorage 模拟）

## 3. 路由定义

| 路由 | 用途 |
|-------|---------|
| / | 首页总览 - 卡片状态统计与快速操作 |
| /borrow | 借用登记 - 新借卡片登记表单 |
| /return | 归还管理 - 卡号查询、归还确认、挂失流程 |
| /statistics | 统计分析 - 借用趋势、超时统计、部门排行 |

## 4. 数据模型

### 4.1 数据模型定义 (ER 图)

```mermaid
erDiagram
    CARD {
        string id PK "卡片唯一ID"
        string cardNumber "卡号"
        string cardType "卡类型: visitor/employee"
        string accessArea "权限区域"
        number deposit "押金金额"
        string status "状态: available/in_use/overdue/lost"
    }
    
    BORROW_RECORD {
        string id PK "记录唯一ID"
        string cardId FK "关联卡片ID"
        string cardNumber "卡号（冗余）"
        string cardType "卡类型（冗余）"
        string borrowerName "借用人姓名"
        string department "所属部门"
        string contact "联系方式"
        string accessArea "权限区域"
        number deposit "押金金额"
        string borrowTime "借出时间"
        string expectedReturnTime "预计归还时间"
        string actualReturnTime "实际归还时间"
        string status "状态: active/returned/lost"
        string lostReason "挂失原因"
        string depositRefundType "押金退还方式: full/none/partial"
        number partialRefundAmount "部分退还金额"
    }
```

### 4.2 类型定义 (TypeScript)

```typescript
type CardType = 'visitor' | 'employee';
type CardStatus = 'available' | 'in_use' | 'overdue' | 'lost';
type RecordStatus = 'active' | 'returned' | 'lost';
type DepositRefundType = 'full' | 'none' | 'partial';

interface Card {
  id: string;
  cardNumber: string;
  cardType: CardType;
  accessArea: string;
  deposit: number;
  status: CardStatus;
}

interface BorrowRecord {
  id: string;
  cardId: string;
  cardNumber: string;
  cardType: CardType;
  borrowerName: string;
  department: string;
  contact: string;
  accessArea: string;
  deposit: number;
  borrowTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  status: RecordStatus;
  lostReason?: string;
  depositRefundType?: DepositRefundType;
  partialRefundAmount?: number;
}

interface DepartmentStats {
  department: string;
  count: number;
}

interface DailyStats {
  date: string;
  visitorCount: number;
  employeeCount: number;
}
```

### 4.3 初始 Mock 数据

系统初始化时预置以下测试数据：
- 10 张可借卡片（5 张访客卡、5 张员工临时卡）
- 3 条使用中的借用记录
- 5 条历史归还记录
- 1 条挂失记录
- 涵盖近 14 天的借用数据用于统计展示
