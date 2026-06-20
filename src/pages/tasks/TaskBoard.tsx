import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Badge,
  Avatar,
  Tag,
  Table,
  Tooltip,
  Space,
  Modal,
  Empty,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import {
  Search,
  LayoutGrid,
  List,
  Users,
  AlertTriangle,
  Clock,
  FolderOpen,
  Play,
  CheckCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Coffee,
  FileText,
  SprayCan,
  Sparkles,
  Tag as TagIcon,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useTaskStore } from '@/stores/taskStore';
import { useCounterStore } from '@/stores/counterStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import {
  TASK_STATUS_CONFIG,
  TASK_URGENCY_CONFIG,
  MATERIAL_CONFIG,
  type SupplyTask,
  type TaskStatus,
  type TaskUrgency,
} from '@/types/index';
import { cn } from '@/lib/utils';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { RangePicker } = DatePicker;

const URGENCY_ORDER: Record<TaskUrgency, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
};

const MATERIAL_ICON_MAP = {
  scentPaper: FileText,
  coffeeBean: Coffee,
  sprayNozzle: SprayCan,
  cleaningCloth: Sparkles,
  labelSticker: TagIcon,
};

type ViewMode = 'kanban' | 'list';

interface TaskWithDetails extends SupplyTask {
  counterName: string;
  brandColor: string;
  drawer: string;
  assigneeName?: string;
  assigneeAvatar?: string;
}

export default function TaskBoard() {
  const navigate = useNavigate();
  const { getTasksWithDetails, assignTask, startTask, completeTask } = useTaskStore();
  const { counters, getCounterById } = useCounterStore();
  const { getInventoryItemByCounterAndMaterial } = useInventoryStore();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchText, setSearchText] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<TaskUrgency | 'all'>('all');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [completedCollapsed, setCompletedCollapsed] = useState(true);
  const [batchAssignVisible, setBatchAssignVisible] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [assignTargetId, setAssignTargetId] = useState<string>('');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const tasksWithDetails = useMemo<TaskWithDetails[]>(() => {
    const baseTasks = getTasksWithDetails();
    return baseTasks.map((task) => {
      const counter = getCounterById(task.counterId);
      const invItem = getInventoryItemByCounterAndMaterial(task.counterId, task.materialType);
      let assigneeAvatar: string | undefined;
      let assigneeName: string | undefined;
      if (task.assigneeId && counter) {
        const guide = counter.guides.find((g) => g.id === task.assigneeId);
        assigneeAvatar = guide?.avatar;
        assigneeName = guide?.name;
      }
      return {
        ...task,
        counterName: counter?.name || '未知品牌区',
        brandColor: counter?.brandColor || '#722F37',
        drawer: invItem?.drawer || '未知',
        assigneeName,
        assigneeAvatar,
      };
    });
  }, [getTasksWithDetails, getCounterById, getInventoryItemByCounterAndMaterial]);

  const filteredTasks = useMemo(() => {
    return tasksWithDetails.filter((task) => {
      if (searchText) {
        const lower = searchText.toLowerCase();
        const materialName = MATERIAL_CONFIG[task.materialType].name;
        if (
          !task.counterName.toLowerCase().includes(lower) &&
          !materialName.toLowerCase().includes(lower)
        ) {
          return false;
        }
      }
      if (urgencyFilter !== 'all' && task.urgency !== urgencyFilter) {
        return false;
      }
      if (dateRange) {
        const taskDate = dayjs(task.createdAt);
        if (taskDate.isBefore(dateRange[0].startOf('day')) || taskDate.isAfter(dateRange[1].endOf('day'))) {
          return false;
        }
      }
      return true;
    });
  }, [tasksWithDetails, searchText, urgencyFilter, dateRange]);

  const groupedTasks = useMemo(() => {
    const result: Record<TaskStatus, TaskWithDetails[]> = {
      pending: [],
      inProgress: [],
      completed: [],
    };
    filteredTasks.forEach((task) => {
      result[task.status].push(task);
    });
    result.pending.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);
    result.inProgress.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);
    result.completed.sort((a, b) => dayjs(b.completedAt || b.createdAt).valueOf() - dayjs(a.completedAt || a.createdAt).valueOf());
    return result;
  }, [filteredTasks]);

  const allGuides = useMemo(() => {
    const guides: { id: string; name: string; avatar: string; counterName: string }[] = [];
    counters.forEach((c) => {
      c.guides.forEach((g) => {
        guides.push({
          id: g.id,
          name: g.name,
          avatar: g.avatar,
          counterName: c.name,
        });
      });
    });
    return guides;
  }, [counters]);

  const formatRelativeTime = (date: string) => {
    return dayjs(date).fromNow();
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (_e: React.DragEvent, targetStatus: TaskStatus) => {
    if (!draggedTask) return;
    const task = tasksWithDetails.find((t) => t.id === draggedTask);
    if (!task) return;

    const operatorId = 'guide-1';
    const operatorName = '李店长';

    if (targetStatus === 'inProgress' && task.status === 'pending') {
      startTask(task.id, operatorId, operatorName);
      message.success('任务已开始');
    } else if (targetStatus === 'completed' && task.status === 'inProgress') {
      completeTask(task.id, operatorId, operatorName);
      message.success('任务已完成');
    } else if (targetStatus !== task.status) {
      message.warning('只能按顺序拖动：待处理 → 进行中 → 已完成');
    }

    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleBatchAssign = () => {
    if (selectedTaskIds.length === 0) {
      message.warning('请先选择任务');
      return;
    }
    if (!assignTargetId) {
      message.warning('请选择分配人');
      return;
    }
    Promise.all(
      selectedTaskIds.map((id) => assignTask(id, assignTargetId, 'guide-1', '李店长'))
    ).then(() => {
      message.success(`已将 ${selectedTaskIds.length} 个任务分配给 ${allGuides.find((g) => g.id === assignTargetId)?.name}`);
      setBatchAssignVisible(false);
      setSelectedTaskIds([]);
      setAssignTargetId('');
    });
  };

  const handleRowSelection = (ids: React.Key[]) => {
    setSelectedTaskIds(ids as string[]);
  };

  const MaterialIcon = ({ type, size = 16, className, style }: { type: string; size?: number; className?: string; style?: React.CSSProperties }) => {
    const Icon = MATERIAL_ICON_MAP[type as keyof typeof MATERIAL_ICON_MAP] || FileText;
    return <Icon size={size} className={className} style={style} />;
  };

  const TaskCard = ({ task, index }: { task: TaskWithDetails; index: number }) => {
    const matConfig = MATERIAL_CONFIG[task.materialType];
    const urgencyConfig = TASK_URGENCY_CONFIG[task.urgency];

    return (
      <div
        draggable
        onDragStart={() => handleDragStart(task.id)}
        onDragEnd={handleDragEnd}
        className={cn(
          'group card-elegant relative overflow-hidden cursor-grab active:cursor-grabbing mb-3',
          'transition-all duration-300 animate-fade-in-up',
          draggedTask === task.id && 'opacity-50 scale-105 rotate-1 shadow-gold-glow'
        )}
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => navigate(`/tasks/${task.id}`)}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
          style={{ backgroundColor: urgencyConfig.color }}
        />

        <div className="pl-4 pr-4 py-4">
          <div className="flex items-start justify-between mb-3">
            <div
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-white text-xs font-medium"
              style={{ backgroundColor: task.brandColor }}
            >
              <span className="truncate max-w-[100px]">{task.counterName}</span>
            </div>
            <Tooltip title="拖拽移动">
              <GripVertical size={16} className="text-cream-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: matConfig.color + '20' }}
            >
              <MaterialIcon type={task.materialType} size={16} className="" style={{ color: matConfig.color }} />
            </div>
            <div>
              <p className="font-medium text-wine-800 text-sm">{matConfig.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-xs text-status-danger font-semibold">
                  <AlertTriangle size={12} />
                  缺 {task.shortageQty}
                </span>
                <span className="text-cream-400 text-xs">→</span>
                <span className="text-xs text-status-normal font-medium">
                  目标 {task.targetQty}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3 text-xs text-cream-500">
            <div className="flex items-center gap-1">
              <FolderOpen size={12} />
              <span>抽屉 {task.drawer}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatRelativeTime(task.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-wine-50">
            <div className="flex items-center gap-2">
              {task.assigneeName ? (
                <>
                  <Avatar size={24} src={task.assigneeAvatar} className="!w-6 !h-6" />
                  <span className="text-xs text-wine-700 font-medium">{task.assigneeName}</span>
                </>
              ) : (
                <span className="text-xs text-cream-400 flex items-center gap-1">
                  <Users size={12} />
                  待分配
                </span>
              )}
            </div>

            <Space size={4} onClick={(e) => e.stopPropagation()}>
              {task.status === 'pending' && (
                <Tooltip title="开始任务">
                  <Button
                    type="text"
                    size="small"
                    icon={<Play size={14} />}
                    className="!text-status-warning !px-2"
                    onClick={() => {
                      startTask(task.id, 'guide-1', '李店长');
                      message.success('已开始任务');
                    }}
                  />
                </Tooltip>
              )}
              {task.status === 'inProgress' && (
                <Tooltip title="标记完成">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckCircle size={14} />}
                    className="!text-status-normal !px-2"
                    onClick={() => {
                      completeTask(task.id, 'guide-1', '李店长');
                      message.success('任务已完成');
                    }}
                  />
                </Tooltip>
              )}
              <Tooltip title="查看详情">
                <Button
                  type="text"
                  size="small"
                  icon={<Eye size={14} />}
                  className="!text-wine-600 !px-2"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                />
              </Tooltip>
            </Space>
          </div>
        </div>
      </div>
    );
  };

  const KanbanColumn = ({
    status,
    titleColor,
    borderColor,
    tasks,
    collapsible = false,
    collapsed = false,
    onToggleCollapse,
  }: {
    status: TaskStatus;
    titleColor: string;
    borderColor: string;
    tasks: TaskWithDetails[];
    collapsible?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
  }) => {
    const isDragOver = dragOverColumn === status;

    return (
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 rounded-2xl transition-all duration-300',
          isDragOver && 'bg-gold-50/50 ring-2 ring-gold-300 ring-offset-2'
        )}
        onDragOver={(e) => handleDragOver(e, status)}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b-2"
          style={{ borderColor }}
        >
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-lg font-semibold" style={{ color: titleColor }}>
              {TASK_STATUS_CONFIG[status].name}
            </h3>
            <Badge
              count={tasks.length}
              showZero
              style={{
                backgroundColor: tasks.length > 0 ? titleColor : '#E5E7EB',
                color: tasks.length > 0 ? '#fff' : '#9CA3AF',
              }}
            />
          </div>
          {collapsible && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg hover:bg-wine-50 text-cream-400 hover:text-wine-600 transition-colors"
            >
              {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          )}
        </div>

        <div
          className={cn(
            'flex-1 overflow-y-auto p-3 transition-all duration-300',
            collapsed && 'max-h-0 py-0 overflow-hidden'
          )}
        >
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-cream-400">
              <Empty description="暂无任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            tasks.map((task, index) => <TaskCard key={task.id} task={task} index={index} />)
          )}
        </div>
      </div>
    );
  };

  const listColumns: ColumnsType<TaskWithDetails> = useMemo(
    () => [
      {
        title: '任务ID',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        render: (id) => <span className="font-mono text-xs text-cream-500">{id.slice(-8).toUpperCase()}</span>,
      },
      {
        title: '品牌区',
        dataIndex: 'counterName',
        key: 'counterName',
        render: (name, record) => (
          <Tag
            color={record.brandColor}
            className="!border-0 !px-3 !py-1 !rounded-lg"
          >
            {name}
          </Tag>
        ),
      },
      {
        title: '耗材',
        dataIndex: 'materialType',
        key: 'materialType',
        render: (type) => {
          const config = MATERIAL_CONFIG[type];
          return (
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: config.color + '20' }}
              >
                <MaterialIcon type={type} size={14} style={{ color: config.color }} />
              </div>
              <span className="text-wine-800 font-medium">{config.name}</span>
            </div>
          );
        },
      },
      {
        title: '缺货数',
        key: 'shortage',
        width: 120,
        render: (_, record) => (
          <div className="flex items-center gap-1">
            <span className="text-status-danger font-semibold">-{record.shortageQty}</span>
            <span className="text-cream-400">/</span>
            <span className="text-status-normal">{record.targetQty}</span>
          </div>
        ),
      },
      {
        title: '紧急程度',
        dataIndex: 'urgency',
        key: 'urgency',
        width: 100,
        render: (urgency) => {
          const config = TASK_URGENCY_CONFIG[urgency];
          return (
            <Tag color={config.color} className="!border-0">
              {config.name}
            </Tag>
          );
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => (
          <span className={TASK_STATUS_CONFIG[status].className}>
            {TASK_STATUS_CONFIG[status].name}
          </span>
        ),
      },
      {
        title: '分配人',
        key: 'assignee',
        width: 120,
        render: (_, record) =>
          record.assigneeName ? (
            <div className="flex items-center gap-2">
              <Avatar size={24} src={record.assigneeAvatar} className="!w-6 !h-6" />
              <span className="text-sm">{record.assigneeName}</span>
            </div>
          ) : (
            <span className="text-cream-400 text-sm">待分配</span>
          ),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 160,
        render: (date) => (
          <div className="text-sm">
            <p className="text-wine-700">{dayjs(date).format('MM-DD HH:mm')}</p>
            <p className="text-xs text-cream-400">{formatRelativeTime(date)}</p>
          </div>
        ),
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_, record) => (
          <Space size={4}>
            {record.status === 'pending' && (
              <Button
                type="link"
                size="small"
                icon={<Play size={14} />}
                className="!text-status-warning"
                onClick={() => {
                  startTask(record.id, 'guide-1', '李店长');
                  message.success('已开始任务');
                }}
              >
                开始
              </Button>
            )}
            {record.status === 'inProgress' && (
              <Button
                type="link"
                size="small"
                icon={<CheckCircle size={14} />}
                className="!text-status-normal"
                onClick={() => {
                  completeTask(record.id, 'guide-1', '李店长');
                  message.success('任务已完成');
                }}
              >
                完成
              </Button>
            )}
            <Button
              type="link"
              size="small"
              icon={<Eye size={14} />}
              onClick={() => navigate(`/tasks/${record.id}`)}
            >
              查看
            </Button>
          </Space>
        ),
      },
    ],
    [navigate, startTask, completeTask]
  );

  return (
    <div className="animate-fade-in-up space-y-4">
      <Card className="card-elegant !shadow-none" styles={{ body: { padding: '16px 20px' } }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400"
            />
            <Input
              placeholder="搜索品牌区、耗材名称..."
              className="!pl-10 !h-10"
              prefix={null}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>

          <Select
            className="!w-36"
            placeholder="紧急程度"
            value={urgencyFilter === 'all' ? undefined : urgencyFilter}
            onChange={(v) => setUrgencyFilter(v ?? 'all')}
            allowClear
            size="large"
            options={[
              { value: 'urgent', label: '🔴 紧急' },
              { value: 'high', label: '🟠 高' },
              { value: 'normal', label: '🟢 普通' },
            ]}
          />

          <RangePicker
            size="large"
            className="!w-64"
            placeholder={['开始日期', '结束日期']}
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
          />

          <div className="flex-1" />

          <div className="flex items-center gap-2 p-1 rounded-xl bg-cream-100">
            <Tooltip title="看板视图">
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                  viewMode === 'kanban'
                    ? 'bg-white text-wine-700 shadow-elegant'
                    : 'text-cream-500 hover:text-wine-600'
                )}
              >
                <LayoutGrid size={18} />
              </button>
            </Tooltip>
            <Tooltip title="列表视图">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                  viewMode === 'list'
                    ? 'bg-white text-wine-700 shadow-elegant'
                    : 'text-cream-500 hover:text-wine-600'
                )}
              >
                <List size={18} />
              </button>
            </Tooltip>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<Users size={16} />}
            onClick={() => setBatchAssignVisible(true)}
            className="btn-primary !h-10"
          >
            批量分配
          </Button>
        </div>
      </Card>

      {viewMode === 'kanban' ? (
        <Card className="card-elegant !shadow-none" styles={{ body: { padding: 0 } }}>
          <div className="flex gap-4 p-4 min-h-[600px]">
            <KanbanColumn
              status="pending"
              titleColor="#FF9800"
              borderColor="#FF9800"
              tasks={groupedTasks.pending}
            />
            <KanbanColumn
              status="inProgress"
              titleColor="#C9A962"
              borderColor="#C9A962"
              tasks={groupedTasks.inProgress}
            />
            <KanbanColumn
              status="completed"
              titleColor="#4CAF50"
              borderColor="#4CAF50"
              tasks={groupedTasks.completed}
              collapsible
              collapsed={completedCollapsed}
              onToggleCollapse={() => setCompletedCollapsed(!completedCollapsed)}
            />
          </div>
        </Card>
      ) : (
        <Card className="card-elegant !shadow-none">
          <Table<TaskWithDetails>
            columns={listColumns}
            dataSource={filteredTasks}
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedTaskIds,
              onChange: handleRowSelection,
              getCheckboxProps: (record) => ({
                disabled: record.status === 'completed',
              }),
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条任务`,
            }}
            scroll={{ x: 1200 }}
          />
          {selectedTaskIds.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-gold-50 border border-gold-200">
              <span className="text-gold-700">
                已选择 <strong>{selectedTaskIds.length}</strong> 个待处理/进行中任务
              </span>
              <Button
                type="primary"
                icon={<Users size={16} />}
                onClick={() => setBatchAssignVisible(true)}
                className="btn-primary"
              >
                批量分配
              </Button>
            </div>
          )}
        </Card>
      )}

      <Modal
        title={<span className="text-wine-700 font-serif text-lg">批量分配任务</span>}
        open={batchAssignVisible}
        onOk={handleBatchAssign}
        onCancel={() => {
          setBatchAssignVisible(false);
          setAssignTargetId('');
        }}
        okText="确认分配"
        cancelText="取消"
        okButtonProps={{ className: 'btn-primary' }}
        width={520}
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-wine-700 mb-2">
              已选任务数
            </label>
            <div className="p-3 rounded-xl bg-wine-50 border border-wine-100">
              <span className="text-2xl font-bold text-wine-700 font-serif">
                {selectedTaskIds.length}
              </span>
              <span className="ml-2 text-cream-500">个任务</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-wine-700 mb-2">
              分配给 <span className="text-status-danger">*</span>
            </label>
            <Select
              size="large"
              className="!w-full"
              placeholder="请选择分配人"
              value={assignTargetId || undefined}
              onChange={setAssignTargetId}
              showSearch
              optionFilterProp="label"
              options={allGuides.map((g) => ({
                value: g.id,
                label: `${g.name}（${g.counterName}）`,
              }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
