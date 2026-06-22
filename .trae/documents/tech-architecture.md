## 1. 架构设计

```mermaid
flowchart TB
    subgraph "前端层"
        A["React 单页应用"] --> B["研磨记录表单组件"]
        A --> C["粒度对照面板组件"]
        A --> D["试闻评分组件"]
        A --> E["研磨规范库组件"]
        A --> F["状态管理 Context"]
    end
    subgraph "数据层"
        G["localStorage 持久化"]
        H["内存状态管理"]
    end
    F --> G
    F --> H
```

## 2. 技术说明
- 前端：React@18 + Tailwind CSS@3 + Vite
- 初始化工具：Vite
- 后端：无（纯前端应用）
- 数据库：localStorage（浏览器本地持久化）

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 主页面，包含研磨记录、粒度对照、评分、规范库 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    "GrindingRecord" {
        string id PK
        string spiceName
        string roastLevel
        string equipment
        number meshSize
        number shutdownTemp
        number aromaIntensity
        number layering
        number persistence
        number recipeRatio
        string notes
        string createdAt
    }
    "GrindingSpec" {
        string id PK
        string recordId FK
        string spiceName
        string roastLevel
        string equipment
        number meshSize
        number shutdownTemp
        string specNotes
        string createdAt
    }
    "GrindingRecord" ||--o| "GrindingSpec" : "沉淀为"
```

### 4.2 数据定义
- GrindingRecord：研磨记录，包含所有录入参数和评分数据
- GrindingSpec：研磨规范，由记录沉淀而来，可额外添加规范说明备注
- 数据存储在 localStorage，键名分别为 `grinding_records` 和 `grinding_specs`
