## 1. 架构设计

纯前端单页应用，数据使用 localStorage 持久化存储，无需后端服务。

```mermaid
graph TD
    subgraph "前端应用"
        A["React Router 路由层"] --> B["页面组件层"]
        B --> C["Zustand 状态管理层"]
        C --> D["localStorage 持久化层"]
        B --> E["通用组件库"]
        E --> F["UI基础组件（卡片/按钮/表单）"]
        E --> G["业务组件（装备卡片/检查卡/晾晒卡）"]
    end
```

## 2. 技术说明
- **前端框架**：React@18 + TypeScript@5
- **构建工具**：Vite@5
- **样式方案**：TailwindCSS@3
- **状态管理**：Zustand@4
- **路由**：React Router DOM@6
- **图标库**：Lucide React
- **数据存储**：localStorage（封装工具类，支持初始化mock数据）
- **项目初始化模板**：react-ts

## 3. 路由定义
| 路由 | 页面 | 用途 |
|------|------|------|
| / | Dashboard 首页 | 四大状态看板 + 快速操作 + 最近活动 |
| /equipment | EquipmentList 装备档案 | 装备列表、分类筛选、增删改查 |
| /equipment/new | EquipmentForm 新增装备 | 新增装备表单 |
| /equipment/:id/edit | EquipmentForm 编辑装备 | 编辑装备表单 |
| /trips | TripList 露营活动 | 活动列表、创建新活动 |
| /trips/:id/pack | PackingList 装箱清单 | 某活动的装箱确认流程 |
| /trips/:id/check | ReturnCheck 归还检查 | 某活动的归营逐件检查 |
| /drying | DryingQueue 晾晒管理 | 晾晒队列、翻面收回操作 |
| /maintenance | Maintenance 维修补购 | 维修进度、补购清单 |

## 4. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    EQUIPMENT ||--o{ PACKING_ITEM : contains
    TRIP ||--o{ PACKING_ITEM : has
    TRIP ||--o{ RETURN_CHECK : produces
    EQUIPMENT ||--o{ RETURN_CHECK : belongs_to
    EQUIPMENT ||--o{ DRYING_RECORD : enters
    EQUIPMENT ||--o{ MAINTENANCE_RECORD : requires
    EQUIPMENT {
        string id PK
        string code "装备编号"
        string name "名称"
        string category "类别：tent/tarp/sleepingbag/stove/furniture/lighting"
        string brand "品牌"
        string purchaseDate "购买日期"
        string storageBox "存放箱编号"
        string photo "照片URL"
        string notes "备注"
        string status "状态：available/drying/repairing/missing/unavailable"
        number batteryLevel "电量百分比（灯具等带电池装备）"
    }
    TRIP {
        string id PK
        string name "活动名称"
        string startDate "出发日期"
        string endDate "结束日期"
        string location "目的地"
        string status "状态：planning/ongoing/completed"
    }
    PACKING_ITEM {
        string id PK
        string tripId FK
        string equipmentId FK
        boolean packed "是否已装箱"
        string packedAt "装箱时间"
    }
    RETURN_CHECK {
        string id PK
        string tripId FK
        string equipmentId FK
        boolean hasDirt "是否有泥土"
        boolean isWet "是否潮湿"
        boolean isMissingParts "是否缺件"
        boolean isDamaged "是否破损"
        number batteryLevel "归还时电量"
        string notes "检查备注"
        string checkedAt "检查时间"
    }
    DRYING_RECORD {
        string id PK
        string equipmentId FK
        string tripId FK "关联活动"
        string location "晾晒位置"
        string startTime "开始时间"
        string flipTime "翻面时间"
        string endTime "收回时间"
        string status "状态：drying/completed"
    }
    MAINTENANCE_RECORD {
        string id PK
        string equipmentId FK
        string type "类型：repair/purchase"
        string description "描述"
        number priority "优先级 1-3"
        string status "状态：pending/in_progress/completed"
        string createdAt "创建时间"
        string completedAt "完成时间"
        string estimatedCost "预估费用"
    }
```

### 6.2 装备类别定义
```typescript
const CATEGORIES = [
  { id: 'tent', name: '帐篷', emoji: '⛺', icon: 'tent' },
  { id: 'tarp', name: '天幕', emoji: '🏕️', icon: 'umbrella' },
  { id: 'sleepingbag', name: '睡袋', emoji: '🛌', icon: 'bed-double' },
  { id: 'stove', name: '炉具', emoji: '🔥', icon: 'flame' },
  { id: 'furniture', name: '桌椅', emoji: '🪑', icon: 'armchair' },
  { id: 'lighting', name: '灯具', emoji: '💡', icon: 'lightbulb' },
]
```

### 6.3 初始 Mock 数据
- 6大类各2-3件装备，共15件示例装备
- 2次示例露营活动（1次已完成、1次计划中）
- 3条晾晒记录（2条进行中、1条已完成）
- 2条维修记录、1条补购记录
