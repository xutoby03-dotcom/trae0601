## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层"
        A["React 18 + Vite"]
        B["React Router 路由"]
        C["TailwindCSS 样式"]
        D["Recharts 图表"]
        E["Lucide React 图标"]
    end
    subgraph "状态与数据层"
        F["React Context 全局状态"]
        G["Mock 数据服务"]
        H["LocalStorage 持久化"]
    end
    subgraph "组件层"
        I["通用组件（卡片、按钮、表单）"]
        J["业务组件（看板、列表、详情）"]
        K["布局组件（侧边栏、顶栏）"]
    end
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    F --> G
    F --> H
    A --> I
    A --> J
    A --> K
```

## 2. 技术描述

- **前端框架**：React@18 + TypeScript@5 + Vite@6
- **初始化工具**：Vite create vite@latest
- **后端服务**：无（纯前端，使用 Mock 数据 + LocalStorage）
- **路由管理**：React Router@6
- **样式方案**：TailwindCSS@3
- **图表库**：Recharts@2
- **图标库**：Lucide React@0.400
- **状态管理**：React Context + useReducer
- **日期处理**：date-fns@3

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| /dashboard | 看板首页，展示统计卡片与提醒列表 |
| /archives | 档案箱列表，支持多条件搜索筛选 |
| /archives/:id | 档案箱详情页，含基本信息、照片、借阅历史 |
| /archives/new | 新增档案箱表单 |
| /borrow/apply | 借阅申请列表与新建 |
| /borrow/approve | 借阅审批列表（管理员/主管视图） |
| /borrow/return | 归还检查登记页 |

## 4. 数据模型

### 4.1 ER 图

```mermaid
erDiagram
    ARCHIVE_BOX ||--o{ BORROW_RECORD : has
    ARCHIVE_BOX ||--o{ ARCHIVE_PHOTO : has
    BORROW_RECORD ||--o{ RETURN_CHECK : has
    USER ||--o{ BORROW_RECORD : "applies"
    USER ||--o{ BORROW_RECORD : "approves"

    ARCHIVE_BOX {
        string id PK
        string box_number "档案箱编号"
        string contract_number "合同号"
        string client_name "客户名"
        string cabinet_location "柜位"
        int year "年份"
        string department "部门"
        string security_level "密级：普通/内部/机密/绝密"
        string custodian "保管人"
        string seal_number "封条号"
        int page_count "文件页数"
        string status "状态：在库/借出/异常"
        string audit_date "审计日期（可选）"
        datetime created_at
        datetime updated_at
    }

    BORROW_RECORD {
        string id PK
        string archive_box_id FK
        string borrower_id FK
        string borrower_name "借出人"
        string purpose "用途"
        date expected_return_date "预计归还日期"
        boolean allow_take_out "是否允许带出办公室"
        string status "状态：待审批/已通过/已驳回/借出中/已归还/已逾期"
        string approver_id FK
        string approver_name
        string approval_remark "审批意见"
        datetime approved_at
        datetime borrowed_at
        datetime returned_at
        datetime created_at
    }

    RETURN_CHECK {
        string id PK
        string borrow_record_id FK
        boolean seal_intact "封条完好"
        string seal_remark "封条备注"
        boolean pages_complete "页数完整"
        int actual_page_count "实际页数"
        string missing_pages "缺页说明"
        boolean cabinet_correct "正确放回柜位"
        string checker_id FK
        string checker_name
        string remarks "备注"
        datetime checked_at
    }

    ARCHIVE_PHOTO {
        string id PK
        string archive_box_id FK
        string photo_type "类型：外观/封条/文件"
        string photo_url "照片地址"
        datetime created_at
    }

    USER {
        string id PK
        string username
        string real_name
        string department
        string role "角色：employee/admin/manager/auditor"
    }
```

### 4.2 数据类型定义（TypeScript）

```typescript
type SecurityLevel = '普通' | '内部' | '机密' | '绝密';
type BoxStatus = '在库' | '借出' | '异常';
type BorrowStatus = '待审批' | '已通过' | '已驳回' | '借出中' | '已归还' | '已逾期';
type UserRole = 'employee' | 'admin' | 'manager' | 'auditor';

interface ArchiveBox {
  id: string;
  boxNumber: string;
  contractNumber?: string;
  clientName?: string;
  cabinetLocation: string;
  year: number;
  department: string;
  securityLevel: SecurityLevel;
  custodian: string;
  sealNumber: string;
  pageCount: number;
  status: BoxStatus;
  auditDate?: string;
  currentBorrowId?: string;
  photos: ArchivePhoto[];
  createdAt: string;
  updatedAt: string;
}

interface BorrowRecord {
  id: string;
  archiveBoxId: string;
  boxNumber: string;
  borrowerId: string;
  borrowerName: string;
  borrowerDepartment: string;
  purpose: string;
  expectedReturnDate: string;
  allowTakeOut: boolean;
  status: BorrowStatus;
  needsManagerApproval: boolean;
  managerApproved?: boolean;
  approverId?: string;
  approverName?: string;
  approvalRemark?: string;
  approvedAt?: string;
  borrowedAt?: string;
  returnedAt?: string;
  returnCheck?: ReturnCheck;
  createdAt: string;
}

interface ReturnCheck {
  id: string;
  borrowRecordId: string;
  sealIntact: boolean;
  sealRemark?: string;
  pagesComplete: boolean;
  actualPageCount: number;
  missingPages?: string;
  cabinetCorrect: boolean;
  checkerId: string;
  checkerName: string;
  remarks?: string;
  checkedAt: string;
}

interface ArchivePhoto {
  id: string;
  archiveBoxId: string;
  photoType: '外观' | '封条' | '文件';
  photoUrl: string;
  createdAt: string;
}
```

## 5. 目录结构

```
src/
├── components/
│   ├── layout/          # Sidebar, Topbar, Layout
│   ├── ui/              # Button, Card, Modal, Badge, Form inputs
│   ├── dashboard/       # StatCard, OverdueList, SealAlertList, AuditReminder, DeptChart
│   ├── archives/        # ArchiveCard, SearchBar, ArchiveForm, PhotoGallery, BorrowTimeline
│   └── borrow/          # BorrowForm, ApproveCard, ReturnCheckForm
├── pages/
│   ├── Dashboard.tsx
│   ├── ArchiveList.tsx
│   ├── ArchiveDetail.tsx
│   ├── ArchiveNew.tsx
│   ├── BorrowApply.tsx
│   ├── BorrowApprove.tsx
│   └── BorrowReturn.tsx
├── context/
│   └── AppContext.tsx   # 全局状态（档案箱、借阅记录、当前用户）
├── data/
│   └── mockData.ts      # Mock 初始数据
├── types/
│   └── index.ts         # TypeScript 类型定义
├── utils/
│   ├── date.ts          # 日期工具函数
│   └── status.ts        # 状态判断与样式映射
├── App.tsx
├── main.tsx
└── index.css
```

