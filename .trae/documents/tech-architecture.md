## 1. 架构设计

纯前端单页应用，数据存储在 Zustand + localStorage，无需后端服务。

```mermaid
flowchart TD
    "React 前端" --> "Zustand 状态管理"
    "Zustand 状态管理" --> "localStorage 持久化"
    "React 前端" --> "React Router 路由"
    "React 前端" --> "Tailwind CSS 样式"
```

## 2. 技术说明

- 前端：React@18 + TypeScript + Tailwind CSS@3 + Vite
- 初始化工具：vite-init (react-ts 模板)
- 状态管理：Zustand (含 persist 中间件持久化到 localStorage)
- 路由：react-router-dom v6
- 图标：lucide-react
- 后端：无（纯前端，mock 数据）
- 数据库：无（localStorage 模拟持久化）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 首页看板（按状态分组的房源卡片） |
| `/properties` | 房源管理列表 |
| `/properties/new` | 新增房源 |
| `/properties/:id` | 房源详情/编辑 |
| `/inspection/:id` | 检查单详情（保洁执行） |
| `/review/:id` | 复核页（房东复核） |
| `/statistics` | 统计面板 |

## 4. API 定义

无后端 API，所有数据通过 Zustand store 管理。

## 5. 服务器架构图

不适用（纯前端项目）

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    "Property" ||--o{ "Inspection" : "has"
    "Property" ||--o{ "SupplyStandard" : "has"
    "Staff" ||--o{ "Inspection" : "assigned_to"
    "Inspection" ||--o{ "CheckItem" : "contains"
    "Inspection" ||--o{ "Photo" : "has"
    "Inspection" ||--o{ "SupplyRecord" : "has"
    "Inspection" ||--o{ "ReworkItem" : "has"

    "Property" {
        "string id PK"
        "string name"
        "string address"
        "number rooms"
        "number beds"
        "string cleanerId"
        "string checkInTime"
        "string status"
    }

    "Staff" {
        "string id PK"
        "string name"
        "string phone"
        "string role"
    }

    "Inspection" {
        "string id PK"
        "string propertyId FK"
        "string cleanerId FK"
        "string status"
        "string createdAt"
        "string startedAt"
        "string completedAt"
        "string reviewedAt"
    }

    "CheckItem" {
        "string id PK"
        "string inspectionId FK"
        "string category"
        "string name"
        "boolean passed"
        "string note"
    }

    "Photo" {
        "string id PK"
        "string inspectionId FK"
        "string type"
        "string url"
        "string uploadedAt"
    }

    "SupplyRecord" {
        "string id PK"
        "string inspectionId FK"
        "string itemName"
        "number quantity"
    }

    "ReworkItem" {
        "string id PK"
        "string inspectionId FK"
        "string checkItemId FK"
        "string reason"
        "string deductionReason"
        "number deductionAmount"
    }
```

### 6.2 数据定义语言

使用 TypeScript 接口定义数据模型，Zustand persist 中间件自动序列化到 localStorage。

检查单状态流转：`pending` → `cleaning` → `completed` → `reviewing` → `approved` / `rework` → `cleaning`（循环）

检查项八大分类：床品 (bedding)、浴室 (bathroom)、厨房 (kitchen)、地面 (floor)、垃圾 (garbage)、冰箱 (fridge)、门锁 (doorLock)、遥控器 (remote)
