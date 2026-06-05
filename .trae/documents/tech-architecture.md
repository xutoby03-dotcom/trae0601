## 1. 架构设计

```mermaid
flowchart TB
    subgraph "前端层"
        "React 18 App" --> "路由层(React Router)"
        "路由层" --> "编辑器主页"
        "路由层" --> "公式管理页"
        "路由层" --> "文档模式页"
    end

    subgraph "状态管理层"
        "Zustand Store" --> "公式状态"
        "Zustand Store" --> "编辑器状态"
        "Zustand Store" --> "项目状态"
        "Zustand Store" --> "主题状态"
        "Zustand Store" --> "撤销重做历史"
    end

    subgraph "核心引擎"
        "CodeMirror 6" --> "LaTeX语法高亮"
        "KaTeX" --> "公式渲染引擎"
        "html2canvas" --> "PNG导出"
        "jsPDF" --> "PDF导出"
    end

    subgraph "持久化层"
        "IndexedDB(idb)" --> "公式库"
        "IndexedDB(idb)" --> "文档数据"
        "IndexedDB(idb)" --> "项目配置"
    end

    "前端层" --> "状态管理层"
    "状态管理层" --> "核心引擎"
    "状态管理层" --> "持久化层"
```

## 2. 技术说明

- **前端框架**：React 18 + TypeScript + Vite
- **样式方案**：Tailwind CSS 3 + CSS Variables主题系统
- **状态管理**：Zustand（公式状态、编辑器状态、项目状态、撤销重做）
- **代码编辑器**：CodeMirror 6（@codemirror/lang-latex语法高亮）
- **公式渲染**：KaTeX（快速渲染，200ms防抖）
- **持久化**：idb（IndexedDB Promise封装）
- **导出工具**：html2canvas（PNG）、dom-to-svg（SVG）、jsPDF（PDF）
- **图标**：lucide-react
- **初始化工具**：vite-init react-ts模板

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 编辑器主页（三栏布局） |
| /formulas | 公式管理页（公式片段库） |
| /document | 文档模式页（类Overleaf极简版） |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    "Project" ||--o{ "Formula" : "contains"
    "Project" ||--o{ "Document" : "contains"
    "Project" {
        "string id PK"
        "string name"
        "number createdAt"
        "number updatedAt"
    }
    "Formula" {
        "string id PK"
        "string projectId FK"
        "string name"
        "string category"
        "string latex"
        "number fontSize"
        "string fontFamily"
        "string fontColor"
        "string bgColor"
        "number createdAt"
        "number updatedAt"
    }
    "Document" {
        "string id PK"
        "string projectId FK"
        "string title"
        "string content"
        "number createdAt"
        "number updatedAt"
    }
```

### 4.2 IndexedDB存储结构

- **projects** 存储：id(主键)、name、createdAt、updatedAt
- **formulas** 存储：id(主键)、projectId(索引)、name、category(索引)、latex、fontSize、fontFamily、fontColor、bgColor、createdAt、updatedAt
- **documents** 存储：id(主键)、projectId(索引)、title、content、createdAt、updatedAt

## 5. 组件架构

### 5.1 核心组件

| 组件 | 职责 |
|------|------|
| EditorLayout | 三栏布局容器，可拖拽调整比例 |
| LatexEditor | CodeMirror编辑器封装，LaTeX语法高亮，光标管理 |
| PreviewPanel | KaTeX渲染区，防抖200ms，渲染设置 |
| SymbolPanel | 符号面板，多Tab分类，点击插入 |
| TemplatePanel | 模板预设面板，一键插入+占位符 |
| HandwritePanel | 手写画板，Canvas绑定鼠标事件，mock识别 |
| ImageRecognize | 图片上传，mock识别返回LaTeX |
| FormulaSettings | 渲染尺寸/字体/颜色/背景设置 |
| ExportToolbar | 导出PNG/SVG/PDF/MathML/复制LaTeX |
| FormulaManager | 公式列表CRUD，搜索筛选，导入导出 |
| DocumentEditor | 文档模式编辑器，富文本+LaTeX混合 |
| ThemeToggle | 深色/浅色主题切换 |

### 5.2 Zustand Store设计

```typescript
interface AppStore {
  // 项目
  projects: Project[]
  currentProjectId: string | null
  
  // 编辑器
  latexCode: string
  cursorPosition: number
  
  // 渲染设置
  renderSettings: {
    fontSize: number
    fontFamily: string
    fontColor: string
    bgColor: string
  }
  
  // 主题
  theme: 'light' | 'dark'
  
  // 撤销重做
  undoStack: string[]
  redoStack: string[]
  
  // 操作方法
  setLatexCode: (code: string) => void
  insertAtCursor: (text: string) => void
  undo: () => void
  redo: () => void
  setTheme: (theme: 'light' | 'dark') => void
  // ... 其他方法
}
```
