## 1. 架构设计

```mermaid
graph TD
    subgraph "前端层"
        A["React 18 + TypeScript"]
        B["页面层<br/>首页/发布/详情/统计"]
        C["组件层<br/>卡片/筛选/模态框/表单"]
        D["状态管理<br/>Zustand"]
        E["样式层<br/>Tailwind CSS 3"]
    end
    subgraph "数据层"
        F["LocalStorage 持久化"]
        G["Mock 数据"]
    end
    A --> B --> C
    B --> D
    C --> E
    D --> F
    D --> G
```

## 2. 技术描述

- **前端框架**：React@18 + TypeScript
- **构建工具**：Vite 5
- **样式方案**：Tailwind CSS 3
- **路由**：react-router-dom 6
- **状态管理**：Zustand 4
- **图标库**：lucide-react
- **数据持久化**：LocalStorage
- **数据来源**：内置 Mock 数据，无后端

## 3. 路由定义

| 路由路径 | 页面用途 |
|-----------|---------|
| / | 首页 - 活动广场，展示活动列表和筛选 |
| /publish | 发布活动页 - 填写并发布新活动 |
| /activity/:id | 活动详情页 - 查看详情、报名、候补 |
| /stats | 管理统计页 - 数据统计和我的活动 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    ACTIVITY ||--o{ REGISTRATION : has
    ACTIVITY {
        string id PK
        string title
        string ageRange
        string location
        string locationType
        datetime startTime
        datetime endTime
        string description
        int maxParticipants
        boolean needParent
        string notes
        string coverEmoji
        datetime createdAt
    }
    REGISTRATION {
        string id PK
        string activityId FK
        string childNickname
        string allergyInfo
        int attendeeCount
        string parentPhone
        string status
        int waitlistNumber
        datetime registeredAt
    }
```

### 4.2 TypeScript 类型定义

```typescript
// 活动地点类型
type LocationType = 'indoor' | 'outdoor';

// 报名状态
type RegistrationStatus = 'confirmed' | 'waitlist' | 'cancelled';

// 活动
interface Activity {
  id: string;
  title: string;
  ageRange: string; // e.g. "3-5岁"
  location: string;
  locationType: LocationType;
  startTime: string; // ISO datetime
  endTime: string;
  description: string;
  maxParticipants: number;
  needParent: boolean;
  notes: string;
  coverEmoji: string;
  createdAt: string;
}

// 报名记录
interface Registration {
  id: string;
  activityId: string;
  childNickname: string;
  allergyInfo: string;
  attendeeCount: number;
  parentPhone: string; // 仅存储，列表不展示
  status: RegistrationStatus;
  waitlistNumber: number | null;
  registeredAt: string;
}

// 筛选条件
type FilterType = 'all' | 'today' | 'weekend' | 'indoor' | 'outdoor';
```

## 5. 项目目录结构

```
src/
├── components/         # 通用组件
│   ├── ActivityCard.tsx      # 活动卡片
│   ├── FilterTabs.tsx      # 筛选标签
│   ├── Modal.tsx          # 模态框
│   ├── Badge.tsx          # 标签徽章
│   ├── Empty.tsx          # 空状态
│   └── Layout.tsx         # 布局组件
├── pages/            # 页面
│   ├── Home.tsx           # 首页-活动广场
│   ├── Publish.tsx        # 发布活动
│   ├── ActivityDetail.tsx # 活动详情
│   └── Statistics.tsx     # 管理统计
├── store/            # Zustand 状态管理
│   └── index.ts
├── types/            # 类型定义
│   └── index.ts
├── utils/            # 工具函数
│   └── helpers.ts
├── App.tsx
├── main.tsx
└── index.css
```
