## 1. 架构设计

```mermaid
graph TD
    subgraph "前端层"
        A["React 18 组件"] --> B["Zustand 状态管理"]
        C["React Router 路由"] --> A
        D["Tailwind CSS 样式"] --> A
        E["Lucide React 图标"] --> A
    end
    
    subgraph "数据层"
        F["本地 Mock 数据"] --> B
        G["LocalStorage 持久化"] --> B
    end
    
    subgraph "工具层"
        H["日期处理工具"] --> A
        I["表单验证工具"] --> A
    end
```

## 2. 技术描述

- **前端框架**: React@18 + TypeScript
- **构建工具**: Vite@5
- **样式方案**: TailwindCSS@3
- **状态管理**: Zustand@4
- **路由管理**: React Router DOM@6
- **图标库**: Lucide React
- **数据存储**: LocalStorage + Mock 数据
- **包管理器**: npm

## 3. 路由定义

| 路由路径 | 页面名称 | 功能说明 |
|----------|----------|----------|
| /dashboard | 看板首页 | 数据概览、统计卡片、区域占用率、各类列表 |
| /posters | 海报档案 | 海报列表、新增、编辑、删除 |
| /posters/new | 新增海报 | 海报表单页面 |
| /applications | 张贴申请 | 申请列表、新建申请 |
| /applications/new | 新建申请 | 选择公告栏、数量、联系人等 |
| /audit | 审核管理 | 待审核申请列表、审批操作 |
| /posting-list | 张贴清单 | 生成的张贴清单详情 |
| /execution | 张贴执行 | 现场确认、拍照上传 |
| /exceptions | 异常管理 | 异常记录列表、新增异常 |
| /reminders | 到期提醒 | 即将到期和已过期海报列表 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    POSTER ||--o{ APPLICATION : "拥有"
    POSTER {
        string id "海报ID"
        string activityName "活动名称"
        string club "所属社团"
        string size "尺寸"
        string area "张贴区域"
        string approvalNumber "审批编号"
        date startDate "开始日期"
        date endDate "结束日期"
        string imageUrl "海报图片"
        string status "状态"
        datetime createdAt "创建时间"
    }
    
    APPLICATION ||--o{ POSTING_ITEM : "包含"
    APPLICATION {
        string id "申请ID"
        string posterId "海报ID"
        string applicant "申请人"
        string contact "联系人电话"
        string status "申请状态"
        string rejectReason "驳回原因"
        datetime createdAt "申请时间"
        datetime auditedAt "审核时间"
    }
    
    BULLETIN_BOARD ||--o{ POSTING_ITEM : "包含"
    BULLETIN_BOARD {
        string id "公告栏ID"
        string name "公告栏名称"
        string location "位置"
        int totalSlots "总槽位数"
        int occupiedSlots "已占用数"
        string area "所属区域"
    }
    
    POSTING_ITEM {
        string id "张贴项ID"
        string applicationId "申请ID"
        string bulletinBoardId "公告栏ID"
        int quantity "张贴数量"
        boolean needTop "是否置顶"
        string status "张贴状态"
        string photoUrl "现场照片"
        datetime postedAt "张贴时间"
        datetime removedAt "撤下时间"
    }
    
    EXCEPTION {
        string id "异常ID"
        string type "异常类型"
        string description "异常描述"
        string location "位置"
        string photoUrl "异常照片"
        string reporter "上报人"
        string status "处理状态"
        string relatedPosterId "关联海报ID"
        datetime createdAt "创建时间"
        datetime resolvedAt "解决时间"
    }
```

### 4.2 类型定义

```typescript
// 海报状态
type PosterStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'posting' | 'posted' | 'expired' | 'removed';

// 申请状态
type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// 张贴状态
type PostingStatus = 'pending' | 'posted' | 'expired' | 'removed';

// 异常类型
type ExceptionType = 'damaged' | 'covered' | 'unauthorized' | 'wrong_position' | 'expired_not_removed';

// 异常状态
type ExceptionStatus = 'pending' | 'processing' | 'resolved';

interface Poster {
  id: string;
  activityName: string;
  club: string;
  size: string;
  area: string;
  approvalNumber: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  status: PosterStatus;
  createdAt: string;
}

interface Application {
  id: string;
  posterId: string;
  applicant: string;
  contact: string;
  status: ApplicationStatus;
  rejectReason?: string;
  createdAt: string;
  auditedAt?: string;
}

interface BulletinBoard {
  id: string;
  name: string;
  location: string;
  totalSlots: number;
  occupiedSlots: number;
  area: string;
}

interface PostingItem {
  id: string;
  applicationId: string;
  bulletinBoardId: string;
  quantity: number;
  needTop: boolean;
  status: PostingStatus;
  photoUrl?: string;
  postedAt?: string;
  removedAt?: string;
}

interface Exception {
  id: string;
  type: ExceptionType;
  description: string;
  location: string;
  photoUrl?: string;
  reporter: string;
  status: ExceptionStatus;
  relatedPosterId?: string;
  createdAt: string;
  resolvedAt?: string;
}
```

## 5. 项目结构

```
src/
├── components/          # 通用组件
│   ├── Layout/         # 布局组件
│   ├── Card/           # 卡片组件
│   ├── Form/           # 表单组件
│   ├── Table/          # 表格组件
│   └── Modal/          # 弹窗组件
├── pages/              # 页面组件
│   ├── Dashboard/      # 看板首页
│   ├── Posters/        # 海报档案
│   ├── Applications/   # 张贴申请
│   ├── Audit/          # 审核管理
│   ├── PostingList/    # 张贴清单
│   ├── Execution/      # 张贴执行
│   ├── Exceptions/     # 异常管理
│   └── Reminders/      # 到期提醒
├── store/              # Zustand 状态管理
│   ├── usePosterStore.ts
│   ├── useApplicationStore.ts
│   ├── useBulletinBoardStore.ts
│   ├── usePostingStore.ts
│   └── useExceptionStore.ts
├── types/              # TypeScript 类型定义
│   └── index.ts
├── utils/              # 工具函数
│   ├── date.ts
│   ├── validation.ts
│   └── mock.ts
├── mock/               # Mock 数据
│   ├── posters.ts
│   ├── applications.ts
│   ├── bulletinBoards.ts
│   ├── postingItems.ts
│   └── exceptions.ts
├── App.tsx
├── main.tsx
└── index.css
```
