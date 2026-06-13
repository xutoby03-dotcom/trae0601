## 1. 架构设计

```mermaid
graph TD
    A["浏览器前端 (React + TypeScript)"] --> B["Vite 开发服务器"]
    A --> C["Express API 服务"]
    C --> D["Zustand 本地状态管理"]
    C --> E["SQLite 文件数据库 (better-sqlite3)"]
    E --> F["床位表 beds"]
    E --> G["预约表 reservations"]
    E --> H["签到表 check_ins"]
    E --> I["换床记录表 bed_swaps"]
```

## 2. 技术说明

- 前端：React@18 + TypeScript + Vite
- 样式：TailwindCSS@3
- 状态管理：Zustand
- 后端：Express@4 + TypeScript
- 数据库：SQLite (better-sqlite3)，本地文件存储，适合小型管理系统
- 图表：recharts
- 图标：lucide-react
- 路由：react-router-dom

## 3. 路由定义

| 路由 | 用途 |
|-------|---------|
| / | 首页仪表盘，统计概览 |
| /beds | 床位管理列表 |
| /beds/new | 新增床位 |
| /beds/:id/edit | 编辑床位 |
| /reservations | 预约管理列表 |
| /reservations/new | 新增预约 |
| /check-in | 当日签到管理 |
| /statistics | 统计分析页面 |

## 4. API 定义

### 4.1 床位接口
```typescript
// GET /api/beds - 获取床位列表（支持筛选）
interface Bed {
  id: number;
  room: string;
  bedNumber: string;
  bunkType: 'upper' | 'lower';
  isWindowSide: boolean;
  disinfectionStatus: 'completed' | 'pending' | 'expired';
  disinfectionDate: string | null;
  photoUrl: string | null;
  createdAt: string;
}

// POST /api/beds - 新增床位
// PUT /api/beds/:id - 更新床位
// DELETE /api/beds/:id - 删除床位
// PATCH /api/beds/:id/disinfection - 更新消毒状态
```

### 4.2 预约接口
```typescript
// GET /api/reservations - 获取预约列表（支持按日期/班级筛选）
interface Reservation {
  id: number;
  bedId: number;
  className: string;
  studentName: string;
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'full';
  allergyNote: string;
  parentConfirmed: boolean;
  status: 'pending' | 'checked_in' | 'absent' | 'swapped';
  createdAt: string;
}

// POST /api/reservations - 新增预约（含冲突校验）
// POST /api/reservations/check-conflict - 检查床位是否可预约
// DELETE /api/reservations/:id - 取消预约
```

### 4.3 签到接口
```typescript
// GET /api/check-ins?date=YYYY-MM-DD - 获取当日签到列表
interface CheckInRecord {
  id: number;
  reservationId: number;
  checkInTime: string | null;
  status: 'pending' | 'checked_in' | 'absent';
}

// POST /api/check-ins/:reservationId/check-in - 签到
// POST /api/check-ins/:reservationId/absent - 标记未到
// POST /api/check-ins/:reservationId/swap - 临时换床
```

### 4.4 统计接口
```typescript
// GET /api/statistics/overview - 首页概览数据
// GET /api/statistics/class-usage?startDate=&endDate= - 班级使用量
// GET /api/statistics/vacancy?date= - 空床率
// GET /api/statistics/disinfection-missed - 消毒漏检床位
```

## 5. 服务端架构

```mermaid
graph LR
    A["路由层 routes/"] --> B["控制器层 controllers/"]
    B --> C["服务层 services/"]
    C --> D["数据访问层 db/"]
    D --> E["SQLite 数据库"]
```

## 6. 数据模型

### 6.1 ER 图

```mermaid
erDiagram
    BEDS ||--o{ RESERVATIONS : has
    RESERVATIONS ||--o| CHECK_INS : has
    RESERVATIONS ||--o{ BED_SWAPS : triggers
    BEDS ||--o{ BED_SWAPS : "from/to"

    BEDS {
        INTEGER id PK
        VARCHAR room
        VARCHAR bed_number
        VARCHAR bunk_type
        BOOLEAN is_window_side
        VARCHAR disinfection_status
        DATE disinfection_date
        TEXT photo_url
        DATETIME created_at
    }

    RESERVATIONS {
        INTEGER id PK
        INTEGER bed_id FK
        VARCHAR class_name
        VARCHAR student_name
        DATE date
        VARCHAR time_slot
        TEXT allergy_note
        BOOLEAN parent_confirmed
        VARCHAR status
        DATETIME created_at
    }

    CHECK_INS {
        INTEGER id PK
        INTEGER reservation_id FK
        DATETIME check_in_time
        VARCHAR status
    }

    BED_SWAPS {
        INTEGER id PK
        INTEGER reservation_id FK
        INTEGER from_bed_id FK
        INTEGER to_bed_id FK
        TEXT reason
        DATETIME created_at
    }
```

### 6.2 DDL

```sql
-- 床位表
CREATE TABLE IF NOT EXISTS beds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room TEXT NOT NULL,
  bed_number TEXT NOT NULL,
  bunk_type TEXT NOT NULL CHECK (bunk_type IN ('upper', 'lower')),
  is_window_side INTEGER NOT NULL DEFAULT 0,
  disinfection_status TEXT NOT NULL DEFAULT 'pending' CHECK (disinfection_status IN ('completed', 'pending', 'expired')),
  disinfection_date TEXT,
  photo_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(room, bed_number)
);

-- 预约表
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bed_id INTEGER NOT NULL,
  class_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL DEFAULT 'full' CHECK (time_slot IN ('morning', 'afternoon', 'full')),
  allergy_note TEXT,
  parent_confirmed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'absent', 'swapped')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bed_id) REFERENCES beds(id),
  UNIQUE(bed_id, date, time_slot)
);

-- 签到表
CREATE TABLE IF NOT EXISTS check_ins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL UNIQUE,
  check_in_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'absent')),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

-- 换床记录表
CREATE TABLE IF NOT EXISTS bed_swaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL,
  from_bed_id INTEGER NOT NULL,
  to_bed_id INTEGER NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id),
  FOREIGN KEY (from_bed_id) REFERENCES beds(id),
  FOREIGN KEY (to_bed_id) REFERENCES beds(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_class ON reservations(class_name);
CREATE INDEX IF NOT EXISTS idx_beds_disinfection ON beds(disinfection_status);
```
