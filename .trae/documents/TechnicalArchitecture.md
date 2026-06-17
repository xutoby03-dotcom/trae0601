## 1. 架构设计

```mermaid
graph TD
    A["浏览器"] --> B["React 前端"]
    B --> C["Zustand 状态管理"]
    B --> D["React Router 路由"]
    B --> E["TailwindCSS 样式"]
    B --> F["Lucide React 图标"]
    C --> G["Mock 数据层"]
    G --> H["LocalStorage 持久化"]
```

## 2. 技术说明
- 前端：React@18 + TypeScript + Vite
- 状态管理：Zustand
- 路由：react-router-dom@6
- 样式：TailwindCSS@3
- 图标：lucide-react
- 后端：无，纯前端Mock数据 + LocalStorage持久化
- 数据持久化：LocalStorage存储任务确认状态和交接记录

## 3. 路由定义
| 路由 | 页面 | 用途 |
|------|------|------|
| / | TimelinePage | 时间线总览页(首页) |
| /members | MembersPage | 成员管理页 |
| /items | ItemsPage | 物品交接页 |
| /monitor | MonitorPage | 协调监控页 |
| /workload | WorkloadPage | 人员负载页 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    MEMBER ||--o{ TASK : "负责"
    MEMBER ||--o{ TASK : "备用"
    MEMBER ||--o{ HANDOVER : "交出"
    MEMBER ||--o{ HANDOVER : "接收"
    TIMELINE_NODE ||--o{ TASK : "包含"
    ITEM ||--o{ HANDOVER : "交接"

    MEMBER {
        string id "成员ID"
        string name "姓名"
        string role "角色: 伴郎/伴娘/总协调/摄影师等"
        string phone "电话"
        string arrivalTime "到场时间"
        boolean canDrive "是否会开车"
        boolean canKeepValuables "能否保管贵重物"
        string avatar "头像"
    }

    TIMELINE_NODE {
        string id "节点ID"
        string name "节点名称: 接亲/外景/仪式/午宴/晚宴"
        string time "开始时间"
        string location "地点"
        string description "描述"
        int sortOrder "排序"
    }

    TASK {
        string id "任务ID"
        string timelineNodeId "所属节点ID"
        string name "任务名称"
        string description "任务描述"
        string location "地点"
        string remindTime "提醒时间"
        string[] itemsToBring "需带物品"
        string responsibleId "负责人ID"
        string backupId "备用人ID"
        string status "状态: pending/confirmed/completed/late"
        string confirmedAt "确认时间"
    }

    ITEM {
        string id "物品ID"
        string name "物品名称"
        string icon "图标"
        string description "描述"
        string currentHolderId "当前持有人ID"
        string status "状态: idle/intransit/handedover"
    }

    HANDOVER {
        string id "交接ID"
        string itemId "物品ID"
        string fromMemberId "交出人ID"
        string toMemberId "接收人ID"
        string handoverTime "交接时间"
        string location "交接地点"
        string note "备注"
        boolean fromConfirmed "交出人确认"
        boolean toConfirmed "接收人确认"
    }
```

### 4.2 TypeScript类型定义
```typescript
interface Member {
  id: string;
  name: string;
  role: '伴郎' | '伴娘' | '总协调' | '摄影师' | '化妆师' | '司机' | '其他';
  phone: string;
  arrivalTime: string;
  canDrive: boolean;
  canKeepValuables: boolean;
  avatar: string;
}

interface TimelineNode {
  id: string;
  name: '接亲' | '外景' | '仪式' | '午宴' | '晚宴';
  time: string;
  location: string;
  description: string;
  sortOrder: number;
}

type TaskStatus = 'pending' | 'confirmed' | 'completed' | 'late';

interface Task {
  id: string;
  timelineNodeId: string;
  name: string;
  description: string;
  location: string;
  remindTime: string;
  itemsToBring: string[];
  responsibleId: string;
  backupId: string;
  status: TaskStatus;
  confirmedAt?: string;
}

type ItemStatus = 'idle' | 'intransit' | 'handedover';

interface Item {
  id: string;
  name: string;
  icon: string;
  description: string;
  currentHolderId: string;
  status: ItemStatus;
}

interface Handover {
  id: string;
  itemId: string;
  fromMemberId: string;
  toMemberId: string;
  handoverTime: string;
  location: string;
  note: string;
  fromConfirmed: boolean;
  toConfirmed: boolean;
}
```
