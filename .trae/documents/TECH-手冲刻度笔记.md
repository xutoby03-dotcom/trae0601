## 1. 架构设计

```mermaid
graph TD
    subgraph "前端层"
        A["React 18 + TypeScript"]
        B["React Router DOM 路由"]
        C["Zustand 状态管理"]
        D["TailwindCSS 3 样式"]
        E["Lucide React 图标"]
    end
    subgraph "数据层"
        F["LocalStorage 持久化"]
        G["Mock 初始数据"]
    end
    A --> B
    A --> C
    A --> D
    A --> E
    C --> F
    C --> G
```

## 2. 技术描述
- 前端：React@18 + TypeScript + Vite
- 初始化工具：vite-init（react-ts 模板）
- 路由：react-router-dom@6
- 状态管理：zustand
- 样式：tailwindcss@3
- 图标：lucide-react
- 后端：无（纯前端本地存储）
- 数据库：LocalStorage + 内置 Mock 数据

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 仪表盘（今日推荐、翻车原因、校准预警） |
| /records | 参数记录表（筛选、列表、操作） |
| /records/new | 新增参数记录 |
| /records/:id/edit | 编辑参数记录 |
| /records/:id/revise | 从原参数改版（带差评原因） |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    COFFEE_RECORD {
        string id PK "记录ID"
        string beanName "豆名"
        string roastLevel "烘焙度: light/medium/dark"
        string batchDate "批次日期 YYYY-MM-DD"
        string grinder "磨豆机型号"
        string dripper "滤杯型号"
        number grindSetting "研磨刻度"
        number waterTemp "水温 ℃"
        string ratio "粉水比 e.g. 1:15"
        number pourStages "注水段数"
        number brewTime "出杯时间 秒"
        string flavorNotes "风味备注"
        boolean isTodayRecommended "是否今日推荐"
        string parentId FK "改版来源记录ID"
        string negativeReason "差评原因: sour/bitter/weak/other"
        string adjustmentNote "调整说明"
        string createdAt "创建时间"
        string updatedAt "更新时间"
    }
```

### 4.2 TypeScript 类型定义

```typescript
type RoastLevel = 'light' | 'medium' | 'dark';
type NegativeReason = 'sour' | 'bitter' | 'weak' | 'other' | null;

interface CoffeeRecord {
  id: string;
  beanName: string;
  roastLevel: RoastLevel;
  batchDate: string;
  grinder: string;
  dripper: string;
  grindSetting: number;
  waterTemp: number;
  ratio: string;
  pourStages: number;
  brewTime: number;
  flavorNotes: string;
  isTodayRecommended: boolean;
  parentId: string | null;
  negativeReason: NegativeReason;
  adjustmentNote: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  beanName: string;
  roastLevel: RoastLevel | 'all';
  grinder: string;
  dripper: string;
}
```

## 5. 核心状态管理（Zustand Store）

```typescript
interface CoffeeStore {
  records: CoffeeRecord[];
  filters: FilterState;
  // Actions
  addRecord: (data: Omit<CoffeeRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecord: (id: string, data: Partial<CoffeeRecord>) => void;
  deleteRecord: (id: string) => void;
  reviseRecord: (parentId: string, data: Partial<CoffeeRecord> & { negativeReason: NegativeReason; adjustmentNote: string }) => void;
  setTodayRecommended: (id: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  getFilteredRecords: () => CoffeeRecord[];
  getTodayRecommended: () => CoffeeRecord | null;
  getLastFailure: () => CoffeeRecord | null;
  getConsecutiveNegativeCount: (beanName: string, batchDate: string) => number;
  needsCalibration: () => { beanName: string; batchDate: string; count: number } | null;
}
```

## 6. 项目目录结构

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── TodayRecommendedCard.tsx
│   │   ├── LastFailureCard.tsx
│   │   └── CalibrationAlert.tsx
│   ├── Records/
│   │   ├── FilterBar.tsx
│   │   ├── RecordsTable.tsx
│   │   └── RecordRow.tsx
│   ├── Form/
│   │   ├── RecordForm.tsx
│   │   └── ReviseForm.tsx
│   └── Layout/
│       ├── Navbar.tsx
│       └── Container.tsx
├── hooks/
│   └── useCoffeeStore.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Records.tsx
│   ├── NewRecord.tsx
│   ├── EditRecord.tsx
│   └── ReviseRecord.tsx
├── store/
│   └── coffeeStore.ts
├── types/
│   └── index.ts
├── utils/
│   ├── mockData.ts
│   └── storage.ts
├── App.tsx
├── main.tsx
└── index.css
```
