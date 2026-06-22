## 1. 架构设计

```mermaid
graph TD
    A["React 前端应用"] --> B["Zustand 状态管理"]
    B --> C["标本 Store (含 mock 数据)"]
    A --> D["页面组件"]
    D --> D1["标本录入表单"]
    D --> D2["标本卡片列表"]
    D --> D3["统计面板"]
    D --> D4["导出面板"]
    A --> E["工具函数"]
    E --> E1["干燥进度计算"]
    E --> E2["CSV 导出"]
    E --> E3["日期处理"]
    A --> F["本地持久化 (localStorage)"]
```

## 2. 技术描述

- **前端**：React@18 + TypeScript + tailwindcss@3 + Vite
- **初始化工具**：vite-init（react-ts 模板）
- **状态管理**：zustand
- **路由**：react-router-dom（单页应用，可选 HashRouter）
- **图标**：lucide-react
- **后端**：无，使用 localStorage 本地持久化 + 内置 mock 数据
- **数据存储**：浏览器 localStorage

## 3. 路由定义

| 路由 | 用途 |
|-----|-----|
| / | 标本压制管理主页（单页应用所有功能集成于此） |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    SPECIMEN {
        string id PK "标本唯一ID"
        string plantName "植物名称"
        string collectionLocation "采集地点"
        string plantPart "植物部位"
        date pressingDate "压制日期"
        string absorbentPaperBatch "吸水纸批次"
        number plateWeight "压板重量(kg)"
        number paperChangeIntervalDays "换纸周期(天)"
        number currentDryness "当前干燥度(0-100)"
        boolean hasMold "是否发霉"
        boolean hasEdgeRoll "是否卷边"
        boolean hasColorFade "是否颜色褪变"
        boolean hasMissingLabel "是否标签缺项"
        boolean isCompleted "是否已完成干燥"
        date lastPaperChangeDate "上次换纸日期"
        number paperChangeCount "换纸次数"
        string notes "备注"
        date createdAt "创建时间"
        date updatedAt "更新时间"
    }
```

### 4.2 TypeScript 类型定义

```typescript
export interface Specimen {
  id: string;
  plantName: string;
  collectionLocation: string;
  plantPart: string;
  pressingDate: string;
  absorbentPaperBatch: string;
  plateWeight: number;
  paperChangeIntervalDays: number;
  currentDryness: number;
  hasMold: boolean;
  hasEdgeRoll: boolean;
  hasColorFade: boolean;
  hasMissingLabel: boolean;
  isCompleted: boolean;
  lastPaperChangeDate: string;
  paperChangeCount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type SpecimenFormData = Omit<
  Specimen,
  'id' | 'currentDryness' | 'hasMold' | 'hasEdgeRoll' | 'hasColorFade' |
  'hasMissingLabel' | 'isCompleted' | 'lastPaperChangeDate' | 'paperChangeCount' |
  'createdAt' | 'updatedAt'
>;
```

## 5. 组件结构

```
src/
├── components/
│   ├── SpecimenForm/          # 标本录入表单
│   ├── SpecimenCard/          # 标本展示卡片
│   ├── SpecimenList/          # 标本列表容器
│   ├── StatsPanel/            # 顶部统计面板
│   ├── DrynessProgress/       # 干燥进度条组件
│   ├── StatusBadge/           # 状态标签（异常/完成等）
│   ├── ActionPanel/           # 操作面板（换纸、标记状态）
│   └── ExportPanel/           # 导出面板
├── store/
│   └── useSpecimenStore.ts    # zustand 状态管理
├── utils/
│   ├── dryness.ts             # 干燥进度计算工具
│   ├── export.ts              # CSV 导出工具
│   └── date.ts                # 日期处理工具
├── types/
│   └── specimen.ts            # 类型定义
├── data/
│   └── mockData.ts            # Mock 初始数据
├── pages/
│   └── App.tsx                # 主页面
└── main.tsx                   # 入口文件
```
