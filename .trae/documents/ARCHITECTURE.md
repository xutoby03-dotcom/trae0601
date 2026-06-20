## 1. 架构设计

```mermaid
graph TD
    A["React 前端 (Vite)"] --> B["Zustand 状态管理"]
    B --> C["观测计划 Store"]
    B --> D["观测清单 Store"]
    B --> E["观测记录 Store"]
    A --> F["页面层"]
    F --> F1["PlanPage 观测计划"]
    F --> F2["ChecklistPage 观测清单"]
    F --> F3["RecordPage 观测记录"]
    F --> F4["HistoryPage 历史复盘"]
    A --> G["组件层"]
    G --> G1["月相/天气组件"]
    G --> G2["星座/目标组件"]
    G --> G3["装备/表单组件"]
    A --> H["数据层"]
    H --> H1["星座与目标Mock数据"]
    H --> H2["月相计算工具函数"]
    H --> H3["天气生成工具函数"]
    H --> H4["LocalStorage 持久化"]
```

## 2. 技术说明
- **前端**：React@18 + TypeScript + tailwindcss@3 + Vite
- **初始化工具**：vite-init
- **后端**：无后端，纯前端应用，数据持久化使用 LocalStorage
- **路由**：react-router-dom 管理 4 个主页面
- **状态管理**：zustand 管理观测计划、清单、记录状态
- **图表**：recharts 绘制天气云量折线图
- **图标**：lucide-react
- **拖拽排序**：@dnd-kit/core + @dnd-kit/sortable

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 观测计划页（首页），日期选择+月相+天气+星座+深空目标 |
| /checklist | 观测清单页，已选目标+装备清单+打包确认 |
| /record/:date | 观测记录页，目标记录卡+曝光参数+失败原因+叠加备注 |
| /history | 历史复盘页，时间线记录列表+统计面板 |

## 4. 数据模型

### 4.1 数据模型定义
```mermaid
erDiagram
    OBSERVATION_PLAN {
        string date PK "观测日期"
        string moonPhase "月相"
        number moonIllumination "月照百分比"
        string moonRise "月升时间"
        string moonSet "月落时间"
        array weatherHours "逐小时天气"
    }
    
    OBSERVATION_ITEM {
        string id PK "目标ID"
        string name "名称"
        string type "类型: 星系/星云/星团/行星"
        string magnitude "星等"
        string difficulty "难度: 易/中/难"
        string bestTime "最佳时段"
        string equipment "建议设备"
        string constellation "所属星座"
    }
    
    CHECKLIST_TARGET {
        string id PK "清单ID"
        string planDate FK "关联计划日期"
        string targetId FK "目标ID"
        number order "排序序号"
        string notes "备注"
        boolean completed "是否已观测"
    }
    
    EQUIPMENT_ITEM {
        string id PK "装备ID"
        string name "名称"
        string category "分类: 光学/摄影/辅助/电源"
        boolean essential "是否必备"
        boolean packed "是否已打包"
    }
    
    OBSERVATION_RECORD {
        string id PK "记录ID"
        string date FK "观测日期"
        string targetId FK "目标ID"
        boolean seen "是否看到"
        number seeing "视宁度1-5"
        string iso "ISO"
        string shutter "快门"
        string aperture "光圈"
        number frames "张数"
        string darkFrames "暗场"
        string flatFrames "平场"
        string biasFrames "偏置场"
        string failReason "失败原因"
        string stackNotes "叠加备注"
        string software "后期软件"
        string totalExposure "总曝光时间"
        string notes "心得"
    }
```

### 4.2 数据存储说明
- 所有数据存储在 LocalStorage 中，Key 前缀：`astro-plan-*`
- `astro-plan-config`：用户偏好设置
- `astro-plan-checklist-:date`：某日观测清单
- `astro-plan-equipment`：装备清单模板
- `astro-plan-records`：所有历史观测记录数组
- 月相和天气数据：使用工具函数根据日期实时计算/生成，不持久化
