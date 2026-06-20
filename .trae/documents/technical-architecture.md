## 1. 架构设计

```mermaid
graph TD
    subgraph "前端层 (React + Vite)"
        A["数据看板 Dashboard"]
        B["团品档案 Products"]
        C["居民订单 Orders"]
        D["到货验收 Inspection"]
        E["取货确认 Pickup"]
    end
    
    subgraph "状态管理层 (Zustand)"
        F["全局 Store"]
    end
    
    subgraph "数据层 (LocalStorage Mock)"
        G["团品数据"]
        H["订单数据"]
        I["验收记录"]
        J["取货记录"]
    end
    
    A --> F
    B --> F
    C --> F
    D --> F
    E --> F
    F --> G
    F --> H
    F --> I
    F --> J
```

## 2. 技术描述
- 前端：React@18 + TypeScript + Vite
- 样式：TailwindCSS@3
- 状态管理：Zustand
- 路由：React Router DOM
- 图标：lucide-react
- 数据存储：LocalStorage（模拟数据，无需后端）
- 初始化工具：vite-init，使用 react-ts 模板

## 3. 路由定义
| 路由 | 用途 |
|-------|---------|
| /dashboard | 数据看板 - 统计概览、异常列表、时段压力图 |
| /products | 团品档案 - 团品列表、新增/编辑团品 |
| /orders | 居民订单 - 订单列表、新增/编辑订单 |
| /inspection | 到货验收 - 验收列表、验收表单 |
| /pickup | 取货确认 - 扫码查询、取货确认 |

## 4. 数据模型

### 4.1 数据模型定义（ER图）

```mermaid
erDiagram
    PRODUCT ||--o{ ORDER : "包含"
    PRODUCT ||--o| INSPECTION : "对应"
    ORDER ||--o| PICKUP_RECORD : "产生"
    
    PRODUCT {
        string id PK "团品ID"
        string name "品名"
        string spec "规格"
        string temp_zone "温区: frozen/refrigerated/normal"
        datetime arrival_time "到货时间"
        string supplier "供应商"
        string box_number "保温箱编号"
        string photo "照片URL"
        datetime created_at "创建时间"
    }
    
    ORDER {
        string id PK "订单ID"
        string product_id FK "团品ID"
        string customer_name "居民姓名"
        string phone_last4 "手机号后四位"
        int quantity "数量"
        string pickup_slot "取货时段"
        boolean has_ice_bag "是否自带冰袋"
        string status "状态: pending/picked/timeout"
        datetime created_at "创建时间"
    }
    
    INSPECTION {
        string id PK "验收ID"
        string product_id FK "团品ID"
        float temperature "箱内温度"
        boolean has_damage "是否破损"
        string damage_note "破损备注"
        boolean has_melt "是否融化"
        string melt_note "融化备注"
        int shortage_quantity "缺货数量"
        string shortage_note "缺货备注"
        string[] photos "照片列表"
        datetime inspected_at "验收时间"
    }
    
    PICKUP_RECORD {
        string id PK "取货记录ID"
        string order_id FK "订单ID"
        datetime picked_at "取货时间"
        boolean has_exception "是否有异常"
        string exception_note "异常备注"
        string[] photos "异常照片"
    }
```

### 4.2 TypeScript 类型定义

```typescript
export type TempZone = 'frozen' | 'refrigerated' | 'normal';
export type OrderStatus = 'pending' | 'picked' | 'timeout';
export type PickupSlot = 'morning' | 'noon' | 'afternoon' | 'evening';

export interface Product {
  id: string;
  name: string;
  spec: string;
  tempZone: TempZone;
  arrivalTime: string;
  supplier: string;
  boxNumber: string;
  photo?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  customerName: string;
  phoneLast4: string;
  quantity: number;
  pickupSlot: PickupSlot;
  hasIceBag: boolean;
  status: OrderStatus;
  createdAt: string;
}

export interface Inspection {
  id: string;
  productId: string;
  temperature: number;
  hasDamage: boolean;
  damageNote?: string;
  hasMelt: boolean;
  meltNote?: string;
  shortageQuantity: number;
  shortageNote?: string;
  photos: string[];
  inspectedAt: string;
}

export interface PickupRecord {
  id: string;
  orderId: string;
  pickedAt: string;
  hasException: boolean;
  exceptionNote?: string;
  photos: string[];
}
```

## 5. 项目文件结构

```
src/
├── components/          # 通用组件
│   ├── Layout/          # 布局组件（侧边栏、导航）
│   ├── Card/            # 统计卡片
│   ├── Modal/           # 弹窗组件
│   ├── StatusBadge/     # 状态标签
│   └── TempIndicator/   # 温度指示器
├── pages/               # 页面组件
│   ├── Dashboard.tsx    # 数据看板
│   ├── Products.tsx     # 团品档案
│   ├── Orders.tsx       # 居民订单
│   ├── Inspection.tsx   # 到货验收
│   └── Pickup.tsx       # 取货确认
├── store/               # Zustand 状态管理
│   └── index.ts
├── types/               # TypeScript 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   ├── mockData.ts      # 模拟数据
│   └── helpers.ts       # 辅助函数
├── App.tsx              # 应用入口
├── main.tsx             # 渲染入口
└── index.css            # 全局样式
```
