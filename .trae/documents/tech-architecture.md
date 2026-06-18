## 1. 架构设计

```mermaid
graph TD
    A["前端应用 (React + TypeScript)"] --> B["状态管理层 (Zustand)"]
    B --> C["数据模型层"]
    C --> D["Mock 数据 (localStorage 持久化"]
    A --> E["UI 组件层"]
    E --> E1["仪表板页面"]
    E --> E2["实验服档案页面"]
    E --> E3["领用登记页面"]
    E --> E4["归还检查页面"]
    E --> E5["清洗管理页面"]
    A --> F["路由层 (React Router)"]
    A --> G["图表层 (Recharts)"]
    A --> H["样式层 (TailwindCSS 3)"]
```

## 2. 技术描述

- **前端**：React@18 + TypeScript + Vite@5
- **初始化工具**：vite-init
- **状态管理**：Zustand@4
- **路由**：React Router@6
- **样式**：TailwindCSS@3
- **图表**：Recharts@2
- **图标**：Lucide React
- **后端**：无后端，使用 Mock 数据 + localStorage 持久化
- **数据存储**：浏览器 localStorage

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| /dashboard | 仪表板 - 统计概览、库存、破损原因、逾期列表 |
| /coats | 实验服档案管理 |
| /coats/:id | 实验服档案详情 |
| /lendings | 领用登记 - 领用列表、新建领用 |
| /return/:lendingId | 归还检查表单 |
| /cleaning | 清洗批次管理 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    LAB_COAT ||--o{ LENDING : has
    LAB_COAT ||--o{ CLEANING_BATCH_ITEM : has
    LENDING ||--o{ DAMAGE_RECORD : produces
    CLEANING_BATCH ||--o{ CLEANING_BATCH_ITEM : contains

    LAB_COAT {
        string id PK
        string code "编号"
        string size "尺码 S/M/L/XL/XXL"
        string lab "所属实验室"
        string status "可领用/使用中/待清洗/清洗中/维修中/报废"
        string photo "照片URL"
        string notes "备注"
        date createdAt "入库日期"
    }

    LENDING {
        string id PK
        string coatId FK
        string studentName "学生姓名"
        string studentId "学号"
        string course "课程"
        string teacher "教师"
        date experimentDate "实验日期"
        date expectedReturn "预计归还"
        date actualReturn "实际归还"
        string status "使用中/已归还/已逾期"
    }

    DAMAGE_RECORD {
        string id PK
        string lendingId FK
        boolean hasStain "污渍"
        boolean hasHole "破洞"
        boolean missingButton "扣子缺失"
        boolean pocketResidue "口袋残留"
        boolean contactHazard "接触危险试剂"
        string stainLevel "轻微/中度/严重"
        string holeLevel "轻微/中度/严重"
        string buttonLevel "轻微/中度/严重"
        string notes "备注"
        string photos "照片"
        boolean needCleaning "需要清洗"
        boolean needRepair "需要维修"
        date createdAt "记录时间"
    }

    CLEANING_BATCH {
        string id PK
        string batchNo "批次号"
        date createdAt "创建时间"
        date completedAt "完成时间"
        string status "清洗中/已完成"
        string notes "备注"
    }

    CLEANING_BATCH_ITEM {
        string id PK
        string batchId FK
        string coatId FK
    }
```

### 4.2 TypeScript 类型定义

```typescript
type CoatSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';
type CoatStatus = 'available' | 'in_use' | 'pending_cleaning' | 'cleaning' | 'repairing' | 'scrapped';
type DamageLevel = 'none' | 'minor' | 'moderate' | 'severe';
type LendingStatus = 'active' | 'returned' | 'overdue';
type BatchStatus = 'cleaning' | 'completed';

interface LabCoat {
  id: string;
  code: string;
  size: CoatSize;
  lab: string;
  status: CoatStatus;
  photo?: string;
  notes?: string;
  createdAt: string;
  lastCleaningBatchId?: string;
}

interface Lending {
  id: string;
  coatId: string;
  studentName: string;
  studentId: string;
  course: string;
  teacher: string;
  experimentDate: string;
  expectedReturn: string;
  actualReturn?: string;
  status: LendingStatus;
  createdAt: string;
}

interface DamageRecord {
  id: string;
  lendingId: string;
  hasStain: boolean;
  hasHole: boolean;
  missingButton: boolean;
  pocketResidue: boolean;
  contactHazard: boolean;
  stainLevel: DamageLevel;
  holeLevel: DamageLevel;
  buttonLevel: DamageLevel;
  notes?: string;
  photos: string[];
  needCleaning: boolean;
  needRepair: boolean;
  createdAt: string;
}

interface CleaningBatch {
  id: string;
  batchNo: string;
  createdAt: string;
  completedAt?: string;
  status: BatchStatus;
  notes?: string;
  coatIds: string[];
}
```

## 5. 目录结构

```
src/
├── types/              # 类型定义
│   └── index.ts
├── store/              # Zustand 状态管理
│   └── useStore.ts
├── data/               # Mock 数据
│   └── mockData.ts
├── components/         # 公共组件
│   ├── Layout/
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   ├── CoatCard.tsx
│   └── Modal.tsx
│   └── StatusBadge.tsx
├── pages/              # 页面组件
│   ├── Dashboard.tsx
│   ├── CoatList.tsx
│   ├── CoatDetail.tsx
│   ├── LendingList.tsx
│   ├── ReturnCheck.tsx
│   └── CleaningManagement.tsx
├── utils/              # 工具函数
│   └── helpers.ts
├── App.tsx
├── main.tsx
└── index.css
```
