## 1. 架构设计
纯前端单页应用，使用 localStorage 进行数据持久化，内置 mock 数据供演示。

```mermaid
graph TD
    A["React前端应用"] --> B["Zustand状态管理"]
    B --> C["localStorage持久化"]
    B --> D["组件层"]
    D --> D1["设备台账组件"]
    D --> D2["校准记录组件"]
    D --> D3["试听记录组件"]
    D --> D4["数据分析图表组件"]
```

## 2. 技术描述
- **前端框架**: React 18 + TypeScript + Vite
- **样式方案**: Tailwind CSS 3
- **状态管理**: Zustand
- **图表库**: Recharts (原生React图表库，轻量级)
- **路由**: React Router DOM
- **图标库**: Lucide React
- **数据存储**: localStorage (纯前端)
- **初始化方式**: vite-init react-ts 模板

## 3. 路由定义
| 路由 | 页面用途 |
|-------|----------|
| / | 首页仪表盘：告警概览 + 快捷入口 |
| /equipment | 设备台账管理 |
| /calibration | 校准记录管理 |
| /listening | 试听记录管理 |
| /analysis | 数据分析与对比图 |

## 4. 数据模型

### 4.1 ER图
```mermaid
erDiagram
    EQUIPMENT ||--o{ CALIBRATION : "拥有"
    CALIBRATION ||--o{ LISTENING_TEST : "关联"
    
    EQUIPMENT {
        string id PK "设备ID"
        string turntableModel "唱机型号"
        string tonearmModel "唱臂型号"
        string cartridgeModel "唱头型号"
        number targetForceMin "目标针压下限(mN)"
        number targetForceMax "目标针压上限(mN)"
        date installDate "安装日期"
        string notes "备注"
        date createdAt "创建时间"
    }
    
    CALIBRATION {
        string id PK "校准ID"
        string equipmentId FK "设备ID"
        date calibrationDate "校准日期"
        number targetForce "目标针压(mN)"
        number measuredForce "实测针压(mN)"
        number antiSkate "防滑刻度"
        string operator "校准人"
        string notes "备注"
        date createdAt "创建时间"
    }
    
    LISTENING_TEST {
        string id PK "试听ID"
        string calibrationId FK "校准ID"
        string equipmentId FK "设备ID"
        date testDate "试听日期"
        number jumpLevel "跳针等级0-5"
        number sibilanceLevel "齿音等级0-5"
        number leftChannelDb "左声道电平(dB)"
        number rightChannelDb "右声道电平(dB)"
        string recordName "试听唱片"
        string notes "备注"
        date createdAt "创建时间"
    }
```

### 4.2 TypeScript 类型定义
```typescript
interface Equipment {
  id: string;
  turntableModel: string;
  tonearmModel: string;
  cartridgeModel: string;
  targetForceMin: number;
  targetForceMax: number;
  installDate: string;
  notes?: string;
  createdAt: string;
}

interface Calibration {
  id: string;
  equipmentId: string;
  calibrationDate: string;
  targetForce: number;
  measuredForce: number;
  antiSkate: number;
  operator: string;
  notes?: string;
  createdAt: string;
}

interface ListeningTest {
  id: string;
  calibrationId: string;
  equipmentId: string;
  testDate: string;
  jumpLevel: number; // 0-5
  sibilanceLevel: number; // 0-5
  leftChannelDb: number;
  rightChannelDb: number;
  recordName?: string;
  notes?: string;
  createdAt: string;
}

// 告警规则
type AlertType = 'realignment' | 'replace_stylus' | 'channel_balance';
interface Alert {
  id: string;
  equipmentId: string;
  type: AlertType;
  severity: 'warning' | 'danger';
  message: string;
  relatedRecordId?: string;
}
```

## 5. 告警规则定义
1. **重新调平 (realignment)**:
   - 针压偏差 > ±0.3mN（实测值超出目标值范围）
   - 左右声道差 > 2dB
   
2. **更换针尖 (replace_stylus)**:
   - 跳针等级 ≥ 3
   - 齿音等级 ≥ 4
   - 连续3次试听出现跳针≥2或齿音≥3

## 6. 初始Mock数据
内置3台设备、8条校准记录、15条试听记录作为演示数据