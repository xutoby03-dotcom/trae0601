## 1. 架构设计

```mermaid
graph TB
    "前端 React App" --> "Zustand Store"
    "Zustand Store" --> "localStorage 持久化"
    "前端 React App" --> "React Router"
    "React Router" --> "首页"
    "React Router" --> "成员管理"
    "React Router" --> "饮水记录"
    "React Router" --> "统计页"
```

纯前端应用，使用 localStorage 持久化数据，无需后端服务。

## 2. 技术说明

- **前端**：React@18 + TypeScript + Tailwind CSS@3 + Vite
- **初始化工具**：vite-init（react-ts 模板）
- **状态管理**：Zustand（含 persist 中间件持久化到 localStorage）
- **路由**：react-router-dom@6
- **图标**：lucide-react
- **后端**：无（纯前端，数据存储在 localStorage）
- **数据库**：无（使用 localStorage 模拟持久化）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 首页 - 杯子阵列视图，全家饮水概览 |
| `/members` | 成员管理 - 添加/编辑/删除家庭成员 |
| `/members/new` | 添加新成员表单 |
| `/members/:id/edit` | 编辑成员信息 |
| `/record` | 饮水记录 - 选择饮品、输入容量、补记 |
| `/record/:memberId` | 为指定成员记录饮水 |
| `/stats` | 统计页 - 周达标率、时段分析、平均饮水量 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    "Family" ||--o{ "Member" : contains
    "Member" ||--o{ "DrinkRecord" : has
    "Member" {
        "string id PK"
        "string name"
        "number age"
        "number dailyGoal"
        "number cupCapacity"
        "boolean limitWater"
        "string[] reminderPeriods"
        "string avatar"
        "string color"
    }
    "DrinkRecord" {
        "string id PK"
        "string memberId FK"
        "number amount"
        "string drinkType"
        "string[] scenarios"
        "number timestamp"
    }
```

### 4.2 数据类型定义

```typescript
type DrinkType = 'water' | 'coffee' | 'tea' | 'soda' | 'juice' | 'milk'

type Scenario = 'exercise' | 'bedtime' | 'cold' | 'normal'

interface Member {
  id: string
  name: string
  age: number
  dailyGoal: number
  cupCapacity: number
  limitWater: boolean
  reminderPeriods: string[]
  avatar: string
  color: string
}

interface DrinkRecord {
  id: string
  memberId: string
  amount: number
  drinkType: DrinkType
  scenarios: Scenario[]
  timestamp: number
}

interface FamilyState {
  members: Member[]
  records: DrinkRecord[]
  addMember: (member: Omit<Member, 'id'>) => void
  updateMember: (id: string, data: Partial<Member>) => void
  removeMember: (id: string) => void
  addRecord: (record: Omit<DrinkRecord, 'id'>) => void
  removeRecord: (id: string) => void
  getMemberRecords: (memberId: string, date?: Date) => DrinkRecord[]
  getMemberDailyTotal: (memberId: string, date?: Date) => number
}
```

### 4.3 饮品折算规则

| 饮品类型 | 折算白水比例 | 图标 | 颜色 |
|----------|-------------|------|------|
| 白水 (water) | 100% | Droplets | #4FC3F7 |
| 咖啡 (coffee) | 60% | Coffee | #795548 |
| 茶 (tea) | 80% | Leaf | #66BB6A |
| 碳酸饮料 (soda) | 40% | GlassWater | #FF7043 |
| 果汁 (juice) | 50% | Citrus | #FFA726 |
| 牛奶 (milk) | 70% | Milk | #ECEFF1 |

### 4.4 特殊提醒规则

| 场景 | 触发条件 | 提醒内容 |
|------|----------|----------|
| 运动后 | 选择"运动"标签 | 建议额外补充 200-300ml |
| 睡前 | 当前时间在提醒时段结束后 1 小时内 | 提醒"睡前少喝水" |
| 感冒期间 | 选择"感冒"标签 | 提醒增加饮水频率，多记录 |
| 少喝水成员 | limitWater=true 且接近目标 | 提醒"今日饮水已接近上限" |
| 长时间未喝 | 距上次记录超过 2 小时 | 提醒"该喝水了" |
