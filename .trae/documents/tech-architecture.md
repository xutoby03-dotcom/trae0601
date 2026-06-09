## 1. 架构设计

```mermaid
flowchart TB
    subgraph "前端层"
        A["React + TypeScript"]
        B["Tailwind CSS"]
        C["Zustand 状态管理"]
        D["localStorage 持久化"]
    end
    subgraph "页面层"
        E["首页 - 分组列表"]
        F["新增/编辑借款页"]
        G["借款详情页"]
        H["统计页"]
    end
    A --> E
    A --> F
    A --> G
    A --> H
    C --> D
    A --> C
    A --> B
```

纯前端应用，数据存储在 localStorage，无需后端服务。

## 2. 技术说明
- 前端：React@18 + TypeScript + Tailwind CSS@3 + Vite
- 初始化工具：vite-init
- 后端：无（纯前端应用，数据存 localStorage）
- 数据库：无（localStorage + Zustand persist 中间件）

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 首页，展示分组借款列表 |
| /loan/new | 新增借款表单 |
| /loan/:id | 借款详情页（含还款记录、提醒操作） |
| /loan/:id/edit | 编辑借款信息 |
| /stats | 统计页，展示借出/收回/逾期数据 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    Loan {
        string id PK
        string borrowerName
        number totalAmount
        string lendDate
        string dueDate
        string purpose
        boolean hasScreenshot
        string note
        string sentiment "挚友|普通|疏远"
        boolean isPaused
        string status "active|overdue|settled"
        number remainingAmount
        string createdAt
        string updatedAt
    }
    Repayment {
        string id PK
        string loanId FK
        number amount
        string date
        string proof
        string note
        string createdAt
    }
    Loan ||--o{ Repayment : "has many"
```

### 4.2 数据类型定义

```typescript
interface Loan {
  id: string
  borrowerName: string
  totalAmount: number
  lendDate: string
  dueDate: string
  purpose: string
  hasScreenshot: boolean
  note: string
  sentiment: 'close' | 'normal' | 'distant'
  isPaused: boolean
  status: 'active' | 'overdue' | 'settled'
  remainingAmount: number
  createdAt: string
  updatedAt: string
}

interface Repayment {
  id: string
  loanId: string
  amount: number
  date: string
  proof: string
  note: string
  createdAt: string
}

interface LoanStore {
  loans: Loan[]
  repayments: Repayment[]
  addLoan: (loan: Omit<Loan, 'id' | 'status' | 'remainingAmount' | 'createdAt' | 'updatedAt'>) => void
  updateLoan: (id: string, data: Partial<Loan>) => void
  deleteLoan: (id: string) => void
  addRepayment: (repayment: Omit<Repayment, 'id' | 'createdAt'>) => void
  deleteRepayment: (id: string) => void
  getRepaymentsByLoanId: (loanId: string) => Repayment[]
  getLoansByGroup: () => { expiringSoon: Loan[], overdue: Loan[], installment: Loan[], settled: Loan[] }
  getStats: () => { totalLent: number, totalOverdue: number, totalRecovered: number, maxOverdueDays: number }
}
```
