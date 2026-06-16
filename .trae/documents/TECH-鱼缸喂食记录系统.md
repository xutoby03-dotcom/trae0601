## 1. 架构设计

纯前端单页应用，使用浏览器 localStorage 持久化存储，无需后端服务。架构分为三层：UI 展示层、状态管理层、数据持久化层。

```mermaid
graph TD
    subgraph "UI 展示层 (React + Tailwind)"
        A["页面组件 Pages"]
        B["通用组件 Components"]
        C["图表/可视化"]
    end
    subgraph "状态管理层 (Zustand)"
        D["鱼缸档案 Store"]
        E["喂食记录 Store"]
        F["换水/水质 Store"]
        G["库存与提醒 Store"]
    end
    subgraph "数据持久化层"
        H["localStorage 封装"]
        I["初始数据/种子数据"]
    end
    A --> D
    A --> E
    A --> F
    A --> G
    B --> D
    B --> E
    C --> E
    C --> F
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I
```

## 2. 技术描述

- **前端框架**：React 18 + TypeScript + Vite
- **样式方案**：TailwindCSS 3 + CSS 变量主题系统
- **状态管理**：Zustand（轻量级，支持 devtools + persist 中间件）
- **路由**：react-router-dom v6
- **图标库**：lucide-react
- **图表**：recharts（React 图表库，支持面积图/柱状图/饼图）
- **日期处理**：date-fns（轻量级日期工具库）
- **后端/数据库**：无，纯前端 localStorage 持久化
- **初始化方式**：pnpm create vite-init@latest . --template react-ts --force

## 3. 路由定义

| Route | 页面组件 | 用途 |
|-------|----------|------|
| `/` | Dashboard | 控制面板首页（今日概览+快捷操作+预警） |
| `/aquariums` | AquariumList | 鱼缸档案列表 |
| `/aquariums/:id` | AquariumDetail | 鱼缸档案详情/编辑 |
| `/aquariums/new` | AquariumForm | 新增鱼缸档案 |
| `/feeding` | FeedingRecord | 喂食记录（日历+计划+录入） |
| `/water` | WaterRecord | 换水与水质检测记录 |
| `/statistics` | Statistics | 数据统计与库存预警 |

## 4. 数据模型（TypeScript 类型 + localStorage 结构）

### 4.1 ER 关系图

```mermaid
erDiagram
    AQUARIUM ||--o{ FISH_SPECIES : contains
    AQUARIUM ||--o{ FEEDING_PLAN : has
    AQUARIUM ||--o{ FEEDING_RECORD : logs
    AQUARIUM ||--o{ WATER_CHANGE : logs
    AQUARIUM ||--o{ WATER_TEST : logs
    FOOD_STOCK ||--o{ AQUARIUM : used_by

    AQUARIUM {
        string id PK
        string name
        number size_liters
        number water_temp
        string filter_type
        string photo_url
        string food_type
        string created_at
        string updated_at
    }

    FISH_SPECIES {
        string id PK
        string aquarium_id FK
        string species_name
        int count
        number daily_grams_per_fish
        string notes
    }

    FEEDING_PLAN {
        string id PK
        string aquarium_id FK
        string date
        number morning_grams
        number evening_grams
        boolean morning_done
        boolean evening_done
    }

    FEEDING_RECORD {
        string id PK
        string aquarium_id FK
        string datetime
        string period "morning/evening"
        string feeder
        number actual_grams
        string leftover_level "none/little/medium/lots"
        string fish_status "normal/active/sluggish/sick"
        string notes
    }

    WATER_CHANGE {
        string id PK
        string aquarium_id FK
        string date
        number changed_liters
        number changed_percent
        string notes
    }

    WATER_TEST {
        string id PK
        string aquarium_id FK
        string date
        number ph
        number ammonia
        number nitrite
        number nitrate
        string notes
    }

    FOOD_STOCK {
        string id PK
        string food_name
        string food_type
        number current_grams
        string last_purchase_date
        string notes
    }
```

### 4.2 localStorage Key 设计

| Key | 存储内容 |
|-----|----------|
| `aquarium_data` | 鱼缸档案数组 |
| `feeding_plan_data` | 喂食计划数组 |
| `feeding_record_data` | 喂食记录数组 |
| `water_change_data` | 换水记录数组 |
| `water_test_data` | 水质检测数组 |
| `food_stock_data` | 鱼粮库存数组 |

### 4.3 核心工具函数

- `generateDailyPlan(aquarium)`：根据鱼种总建议量 + 早晚比例（默认 6:4）生成当日计划
- `checkDuplicateFeeding(aquariumId, period, date)`：检测重复喂食
- `checkMissedFeeding(plan)`：检测漏喂（超时阈值可配置）
- `checkContinuousLeftover(aquariumId, days=3)`：检测连续 N 天剩食
- `calcWeeklyFoodUsage(aquariumId, startOfWeek)`：计算周用粮量
- `calcStockDaysRemaining(stockId, avgDailyUsage)`：计算库存剩余天数
- `findMostMissedTimeframes(records)`：统计最易漏喂时段

## 5. 组件目录结构

```
src/
├── components/
│   ├── aquarium/
│   │   ├── AquariumCard.tsx
│   │   ├── AquariumForm.tsx
│   │   └── FishSpeciesList.tsx
│   ├── feeding/
│   │   ├── FeedingModal.tsx
│   │   ├── FeedingCalendar.tsx
│   │   ├── FeedingPlanCard.tsx
│   │   └── LeftoverBadge.tsx
│   ├── water/
│   │   ├── WaterChangeForm.tsx
│   │   └── WaterTestForm.tsx
│   ├── statistics/
│   │   ├── FoodUsageChart.tsx
│   │   ├── AppetiteAnalysis.tsx
│   │   └── StockWarning.tsx
│   ├── common/
│   │   ├── AlertBanner.tsx
│   │   ├── QuickActionButton.tsx
│   │   └── AppLayout.tsx
│   └── App.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── AquariumList.tsx
│   ├── AquariumDetail.tsx
│   ├── FeedingRecord.tsx
│   ├── WaterRecord.tsx
│   └── Statistics.tsx
├── store/
│   ├── useAquariumStore.ts
│   ├── useFeedingStore.ts
│   ├── useWaterStore.ts
│   └── useStockStore.ts
├── utils/
│   ├── planGenerator.ts
│   ├── alertChecker.ts
│   ├── statistics.ts
│   ├── formatters.ts
│   └── storage.ts
├── types/
│   └── index.ts
├── data/
│   └── seedData.ts
└── index.css
```
