## 1. 架构设计

```mermaid
graph TD
    A["React 前端应用"] --> B["状态管理 (useState/useReducer)"]
    A --> C["本地存储 (localStorage)"]
    A --> D["UI 组件库"]
    D --> D1["看板列组件"]
    D --> D2["退货卡片组件"]
    D --> D3["添加/编辑弹窗"]
    D --> D4["详情弹窗"]
    D --> D5["图片上传组件"]
    C --> E["数据持久化"]
    B --> F["日期计算工具"]
    B --> G["状态归类逻辑"]
```

## 2. 技术描述

- **前端框架**：React@18 + TypeScript
- **构建工具**：Vite
- **样式方案**：TailwindCSS 3
- **状态管理**：React useState + useReducer (本地状态)
- **数据存储**：localStorage (本地持久化，无需后端)
- **拖拽功能**：@dnd-kit/core + @dnd-kit/sortable
- **日期处理**：date-fns
- **图标**：lucide-react

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 主页面（三栏看板） |

本应用为单页应用，所有功能在主页面完成，通过弹窗展示详情和表单。

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    RETURN_ORDER {
        string id PK "退货单ID"
        string platform "平台：淘宝/京东/拼多多等"
        string productName "商品名称"
        string buyer "下单人"
        string returnReason "退货原因"
        date applicationDeadline "申请截止日"
        date shipDeadline "寄出截止日"
        string pickupCode "取件码"
        string trackingNumber "快递单号"
        string status "状态：pending/shipment_pending/refund_pending/completed"
        string refundPromiseDays "退款承诺天数"
        date refundApplyDate "退款申请日期"
        string packageId "包裹ID（用于分组）"
        string photos "商品照片URL数组"
        date createdAt "创建时间"
        date updatedAt "更新时间"
    }
```

### 4.2 TypeScript 类型定义

```typescript
interface ReturnOrder {
  id: string;
  platform: string;
  productName: string;
  buyer: string;
  returnReason: string;
  applicationDeadline: string;
  shipDeadline: string;
  pickupCode: string;
  trackingNumber: string;
  status: 'pending' | 'shipment_pending' | 'refund_pending' | 'completed';
  refundPromiseDays: number;
  refundApplyDate?: string;
  packageId?: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

type ColumnStatus = 'today_must_handle' | 'need_tracking' | 'refund_followup';
```

### 4.3 状态归类规则

- **今天必须处理 (today_must_handle)**: 
  - 申请截止日为今天或已过期且未申请
  - 寄出截止日为今天或已过期且未寄出
  
- **还差快递单 (need_tracking)**:
  - 已申请退货但未填写快递单号
  - 状态为 shipment_pending 且 trackingNumber 为空

- **退款跟进 (refund_followup)**:
  - 已寄出但退款未到账
  - 状态为 refund_pending
  - 超过退款承诺天数未完成的显示红色提醒
