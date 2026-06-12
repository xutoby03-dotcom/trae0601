## 1. 架构设计

```mermaid
graph TD
    A["React 前端应用"] --> B["状态管理层 (Zustand)"]
    B --> C["数据持久化 (localStorage)"]
    A --> D["UI组件层"]
    D --> D1["菜单管理组件"]
    D --> D2["订餐管理组件"]
    D --> D3["厨房看板组件"]
    D --> D4["统计分析组件"]
    D --> E["UI组件库 (Tailwind + Lucide React)"]
    D --> F["图表库 (Recharts)"]
```

## 2. 技术说明

- **前端框架**：React@18 + TypeScript@5
- **构建工具**：Vite@5
- **样式方案**：Tailwind CSS@3（原子化CSS）
- **状态管理**：Zustand（轻量级状态管理，支持持久化）
- **路由方案**：React Router DOM@6
- **图表组件**：Recharts（React生态图表库）
- **图标库**：Lucide React
- **后端方案**：无后端，使用 localStorage + Mock 数据实现本地持久化
- **数据存储**：localStorage（浏览器本地存储）

## 3. 路由定义

| 路由 | 页面 | 用途 |
|------|------|------|
| / | 仪表盘/统计总览 | 今日数据概览、快捷入口 |
| /menu | 菜单管理 | 每日菜单维护、菜品CRUD |
| /orders | 订餐管理 | 订单列表、新建/取消订单 |
| /kitchen | 厨房看板 | 三栏出餐看板、状态流转 |
| /stats | 数据统计 | 详细统计分析、图表展示 |

## 4. 数据模型

### 4.1 实体关系图

```mermaid
erDiagram
    DISH ||--o{ ORDER_ITEM : contains
    ORDER ||--o{ ORDER_ITEM : has
    DISH {
        string id PK
        string name
        string type "荤/素/半荤素"
        number price
        string allergens "过敏原标签，逗号分隔"
        number maxQuantity "可订份数上限"
        string image "菜品图片URL"
        string date "所属日期 YYYY-MM-DD"
        string mealType "早餐/午餐/晚餐"
    }
    ORDER {
        string id PK
        string elderlyName "老人姓名"
        string building "楼栋号"
        string mealType "早餐/午餐/晚餐"
        string dietaryNote "忌口说明"
        string deliveryType "堂食/打包/上门配送"
        string phone "联系电话"
        string status "待备餐/制作中/已完成/已取消"
        string createdAt "下单时间"
        string cancelledAt "取消时间"
        string cancelDeadline "取消截止时间"
    }
    ORDER_ITEM {
        string id PK
        string orderId FK
        string dishId FK
        number quantity
    }
```

### 4.2 TypeScript 类型定义

```typescript
// 菜品类型
interface Dish {
  id: string;
  name: string;
  type: 'meat' | 'vegetarian' | 'mixed'; // 荤/素/半荤素
  price: number;
  allergens: string[]; // 过敏原标签列表
  maxQuantity: number; // 可订份数上限
  image: string; // 菜品图片URL
  date: string; // 所属日期 YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner';
}

// 订单类型
type OrderStatus = 'pending' | 'cooking' | 'completed' | 'cancelled';
type DeliveryType = 'dine_in' | 'takeaway' | 'delivery';
type MealType = 'breakfast' | 'lunch' | 'dinner';

interface Order {
  id: string;
  elderlyName: string;
  building: string;
  mealType: MealType;
  dietaryNote: string;
  deliveryType: DeliveryType;
  phone: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  cancelledAt?: string;
  cancelDeadline: string;
}

interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
}
```

### 4.3 初始Mock数据

- 预置3天的菜单数据（每天早中晚各3-5个菜品）
- 预置当日15-20个示例订单，覆盖三种配送方式
- 预置最近7天的历史订单用于统计展示
