## 1. 架构设计

```mermaid
graph TD
    A["React 前端"] --> B["Zustand 状态管理"]
    B --> C["LocalStorage 数据持久化"]
    A --> D["TailwindCSS 样式"]
    A --> E["Lucide React 图标"]
```

## 2. 技术描述

- 前端：React@18 + TypeScript + Vite
- 状态管理：Zustand
- 样式：TailwindCSS@3
- 图标：lucide-react
- 数据存储：LocalStorage + Mock数据
- 路由：react-router-dom

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 看板页 |
| /headsets | 耳麦档案列表 |
| /headsets/new | 新增耳麦档案 |
| /headsets/:id/edit | 编辑耳麦档案 |
| /borrow | 借用登记 |
| /return/:id | 归还测试 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    HEADSET {
        string id
        string brand
        string connectionType
        string serialNumber
        string cabinet
        string[] compatibleSoftware
        number batteryLevel
        string photo
        string status
        boolean receiverLost
        boolean microphoneIssue
    }
    BORROW_RECORD {
        string id
        string headsetId
        string meetingRoom
        datetime meetingTime
        string borrower
        datetime expectedReturn
        boolean needSpareReceiver
        datetime actualReturn
        string status
    }
    RETURN_TEST {
        string id
        string borrowRecordId
        boolean soundTest
        boolean noiseCancellation
        boolean bluetoothTest
        boolean wireControl
        boolean appearance
        string notes
    }
    MEETING_DEMAND {
        string id
        datetime meetingTime
        string meetingRoom
        number headsetCount
        string notes
    }
    PURCHASE_NEED {
        string id
        string brand
        string model
        int quantity
        string reason
        string status
    }
```

### 4.2 类型定义

```typescript
type ConnectionType = 'bluetooth' | 'usb' | 'wireless_24g' | 'wired';
type HeadsetStatus = 'available' | 'borrowed' | 'faulty' | 'maintenance';
type BorrowStatus = 'borrowed' | 'returned' | 'overdue';
type PurchaseStatus = 'pending' | 'ordered' | 'received';

interface Headset {
  id: string;
  brand: string;
  connectionType: ConnectionType;
  serialNumber: string;
  cabinet: string;
  compatibleSoftware: string[];
  batteryLevel: number;
  photo: string;
  status: HeadsetStatus;
  receiverLost: boolean;
  microphoneIssue: boolean;
  createdAt: string;
}

interface BorrowRecord {
  id: string;
  headsetId: string;
  meetingRoom: string;
  meetingTime: string;
  borrower: string;
  expectedReturn: string;
  needSpareReceiver: boolean;
  actualReturn?: string;
  status: BorrowStatus;
  createdAt: string;
}

interface ReturnTest {
  id: string;
  borrowRecordId: string;
  soundTest: boolean;
  noiseCancellation: boolean;
  bluetoothTest: boolean;
  wireControl: boolean;
  appearance: boolean;
  notes?: string;
  createdAt: string;
}

interface MeetingDemand {
  id: string;
  meetingTime: string;
  meetingRoom: string;
  headsetCount: number;
  notes?: string;
  createdAt: string;
}

interface PurchaseNeed {
  id: string;
  brand: string;
  model: string;
  quantity: number;
  reason: string;
  status: PurchaseStatus;
  createdAt: string;
}
```
