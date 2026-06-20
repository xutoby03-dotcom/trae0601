import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Steps,
  Avatar,
  Tag,
  Select,
  Input,
  Tooltip,
  Timeline,
  Divider,
  Empty,
  message,
  Drawer,
} from 'antd';
import {
  ArrowLeft,
  AlertTriangle,
  Coffee,
  FileText,
  SprayCan,
  Sparkles,
  Tag as TagIcon,
  FolderOpen,
  Target,
  Clock,
  User,
  Users,
  Send,
  MessageSquarePlus,
  CheckCircle,
  RotateCcw,
  Play,
  CalendarDays,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { useTaskStore } from '@/stores/taskStore';
import { useCounterStore } from '@/stores/counterStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useActivityStore } from '@/stores/activityStore';
import {
  TASK_STATUS_CONFIG,
  TASK_URGENCY_CONFIG,
  MATERIAL_CONFIG,
  type OperationLog,
} from '@/types/index';
import { cn } from '@/lib/utils';

dayjs.locale('zh-cn');

const MATERIAL_ICON_MAP = {
  scentPaper: FileText,
  coffeeBean: Coffee,
  sprayNozzle: SprayCan,
  cleaningCloth: Sparkles,
  labelSticker: TagIcon,
};

const STATUS_STEP_ORDER = ['pending', 'inProgress', 'completed'] as const;

const MaterialIcon = ({ type, size = 16, className, style }: { type: string; size?: number; className?: string; style?: React.CSSProperties }) => {
  const Icon = MATERIAL_ICON_MAP[type as keyof typeof MATERIAL_ICON_MAP] || FileText;
  return <Icon size={size} className={className} style={style} />;
};

export default function TaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getTaskById, assignTask, startTask, completeTask, _addOperationLog, tasks } = useTaskStore();
  const { getCounterById, counters } = useCounterStore();
  const { getInventoryItemByCounterAndMaterial } = useInventoryStore();
  const { getActivityByDate } = useActivityStore();

  const [noteText, setNoteText] = useState('');
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [newAssigneeId, setNewAssigneeId] = useState('');

  const task = id ? getTaskById(id) : undefined;

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <Empty
          description={
            <div className="text-center">
              <div className="text-wine-700 font-serif text-lg mb-2">任务不存在</div>
              <div className="text-cream-500 text-sm mb-4">未找到编号为 "{id}" 的补给任务</div>
              <Button type="primary" className="btn-primary" onClick={() => navigate('/tasks')}>
                返回任务看板
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const taskDetails = useMemo(() => {
    if (!task) return null;
    const counter = getCounterById(task.counterId);
    const invItem = getInventoryItemByCounterAndMaterial(task.counterId, task.materialType);
    const activity = getActivityByDate(task.counterId, task.createdAt);

    let assigneeName: string | undefined;
    let assigneeAvatar: string | undefined;
    if (task.assigneeId && counter) {
      const guide = counter.guides.find((g) => g.id === task.assigneeId);
      assigneeName = guide?.name;
      assigneeAvatar = guide?.avatar;
    }

    const matConfig = MATERIAL_CONFIG[task.materialType];
    const baseThreshold = invItem?.threshold ?? 0;
    const effectiveThreshold = activity ? Math.round(baseThreshold * activity.thresholdMultiplier) : baseThreshold;

    return {
      task,
      counter,
      invItem,
      activity,
      assigneeName,
      assigneeAvatar,
      matConfig,
      baseThreshold,
      effectiveThreshold,
    };
  }, [task, getCounterById, getInventoryItemByCounterAndMaterial, getActivityByDate]);

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

  const currentStepIndex = useMemo(() => {
    if (!task) return 0;
    return STATUS_STEP_ORDER.indexOf(task.status as typeof STATUS_STEP_ORDER[number]);
  }, [task]);

  if (!task || !taskDetails) {
    return (
      <div className="animate-fade-in-up">
        <Card className="card-elegant">
          <Empty description="任务不存在或已被删除" />
          <div className="text-center mt-6">
            <Button
              type="primary"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate('/tasks')}
              className="btn-primary"
            >
              返回任务列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { counter, invItem, activity, assigneeName, assigneeAvatar, matConfig, baseThreshold, effectiveThreshold } = taskDetails;
  const urgencyConfig = TASK_URGENCY_CONFIG[task.urgency];
  const statusConfig = TASK_STATUS_CONFIG[task.status];

  const handleStartTask = () => {
    startTask(task.id, 'guide-1', '李店长');
    message.success('任务已开始');
  };

  const handleCompleteTask = () => {
    completeTask(task.id, 'guide-1', '李店长');
    message.success('任务已完成');
  };

  const handleReopenTask = () => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        const withLog = _addOperationLog(t, '重新打开', 'guide-1', '李店长', '管理员重新打开任务');
        return { ...withLog, status: 'pending' as const, completedAt: undefined };
      }
      return t;
    });
    useTaskStore.setState({ tasks: updatedTasks });
    message.success('任务已重新打开');
  };

  const handleAssignTask = () => {
    if (!newAssigneeId) {
      message.warning('请选择分配人');
      return;
    }
    assignTask(task.id, newAssigneeId, 'guide-1', '李店长').then(() => {
      message.success(`已分配给 ${allGuides.find((g) => g.id === newAssigneeId)?.name}`);
      setAssignDrawerOpen(false);
      setNewAssigneeId('');
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) {
      message.warning('请输入备注内容');
      return;
    }
    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        return _addOperationLog(t, '添加备注', 'guide-1', '李店长', noteText.trim());
      }
      return t;
    });
    useTaskStore.setState({ tasks: updatedTasks });
    setNoteText('');
    message.success('备注已添加');
  };

  const getTimelineColor = (action: string) => {
    if (action.includes('创建')) return '#722F37';
    if (action.includes('分配')) return '#C9A962';
    if (action.includes('领取')) return '#FF9800';
    if (action.includes('开始') || action.includes('配送')) return '#4A6741';
    if (action.includes('完成') || action.includes('确认') || action.includes('签收')) return '#4CAF50';
    if (action.includes('重新')) return '#E53935';
    if (action.includes('备注')) return '#6B7280';
    return '#9CA3AF';
  };

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-wine-700 hover:bg-wine-50 border border-wine-100 transition-all duration-200 group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">返回任务列表</span>
        </button>
        <div className="text-sm text-cream-500 flex items-center gap-1">
          <span>巡查补给</span>
          <ChevronRight size={14} />
          <span>补给任务</span>
          <ChevronRight size={14} />
          <span className="text-wine-700 font-medium">任务详情</span>
        </div>
      </div>

      <Card className="card-elegant !shadow-none" styles={{ body: { padding: '24px 28px' } }}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="font-mono text-sm text-cream-500 px-3 py-1 rounded-lg bg-cream-100">
                TASK-{task.id.slice(-6).toUpperCase()}
              </div>
              <span className={cn(statusConfig.className, '!text-sm !px-4 !py-1.5')}>
                {statusConfig.name}
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: urgencyConfig.color }}
                />
                <span className="text-sm font-medium" style={{ color: urgencyConfig.color }}>
                  {urgencyConfig.name}
                </span>
                <span className="text-xs text-cream-400">优先级</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: matConfig.color + '15' }}
              >
                <MaterialIcon type={task.materialType} size={32} style={{ color: matConfig.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-serif font-bold text-wine-800 mb-2">
                  {counter?.name || '未知品牌区'} - {matConfig.name}补货
                </h1>
                <p className="text-cream-500 text-sm">
                  <span className="inline-flex items-center gap-1 mr-4">
                    <CalendarDays size={14} />
                    创建于 {dayjs(task.createdAt).format('YYYY年M月D日 HH:mm')}
                  </span>
                  {task.completedAt && (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle size={14} />
                      完成于 {dayjs(task.completedAt).format('YYYY年M月D日 HH:mm')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-20 gap-4">
        <div className="lg:col-span-13 space-y-4">
          <Card
            className="card-elegant !shadow-none overflow-hidden"
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-wine-500" />
                <span className="text-wine-700 font-serif">缺货详情</span>
              </div>
            }
          >
            <div className="rounded-xl overflow-hidden mb-5 border border-wine-100">
              <div className="flex items-center gap-4 p-5" style={{ background: `linear-gradient(135deg, ${counter?.brandColor}10, ${counter?.brandColor}05)` }}>
                <div
                  className="w-1.5 self-stretch rounded-full"
                  style={{ backgroundColor: counter?.brandColor }}
                />
                {counter?.photoUrls && counter.photoUrls.length > 0 && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-elegant">
                    <img
                      src={counter.photoUrls[0]}
                      alt={counter.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className="inline-block px-3 py-1 rounded-lg text-white text-sm font-medium mb-2"
                    style={{ backgroundColor: counter?.brandColor }}
                  >
                    {counter?.name}
                  </div>
                  <p className="text-sm text-cream-500 line-clamp-2">
                    {counter?.description || '暂无描述'}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-cream-500">
                    <span>试香台 {counter?.tastingTableCount} 个</span>
                    <span>展示瓶 {counter?.displayBottleCount} 个</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cream-50 to-wine-50 rounded-xl p-5 border border-wine-100/50">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: matConfig.color + '20' }}
                >
                  <MaterialIcon type={task.materialType} size={28} style={{ color: matConfig.color }} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-wine-800">{matConfig.name}</h3>
                  <p className="text-sm text-cream-500">单位：{matConfig.unit}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className="bg-white rounded-xl p-4 border border-wine-100/50">
                  <p className="text-xs text-cream-500 mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-status-danger" />
                    当前数量
                  </p>
                  <p className="text-2xl font-bold font-serif text-status-danger">
                    {invItem ? task.targetQty - task.shortageQty : '-'}
                  </p>
                  <p className="text-xs text-cream-400 mt-1">{matConfig.unit}</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-status-warning/20">
                  <p className="text-xs text-cream-500 mb-1 flex items-center gap-1">
                    <TrendingUp size={12} className="text-status-warning" />
                    缺货数量
                  </p>
                  <p className="text-2xl font-bold font-serif text-status-warning">
                    +{task.shortageQty}
                  </p>
                  <p className="text-xs text-cream-400 mt-1">需补给</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-status-normal/20">
                  <p className="text-xs text-cream-500 mb-1 flex items-center gap-1">
                    <Target size={12} className="text-status-normal" />
                    目标数量
                  </p>
                  <p className="text-2xl font-bold font-serif text-status-normal">
                    {task.targetQty}
                  </p>
                  <p className="text-xs text-cream-400 mt-1">补给后</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-wine-100/50">
                  <p className="text-xs text-cream-500 mb-1 flex items-center gap-1">
                    <FolderOpen size={12} />
                    存放抽屉
                  </p>
                  <p className="text-2xl font-bold font-serif text-wine-700">
                    {invItem?.drawer || '-'}
                  </p>
                  <p className="text-xs text-cream-400 mt-1">位置编号</p>
                </div>
              </div>

              <Divider className="!my-4" dashed />

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-cream-500">基础阈值：</span>
                  <Tag color="blue" className="!m-0">
                    {baseThreshold} {matConfig.unit}
                  </Tag>
                </div>
                {activity && (
                  <>
                    <ChevronRight size={14} className="text-gold-500" />
                    <div className="flex items-center gap-2">
                      <span className="text-cream-500">
                        活动「{activity.name}」加倍：
                      </span>
                      <Tag color="gold" className="!m-0">
                        ×{activity.thresholdMultiplier}
                      </Tag>
                    </div>
                    <ChevronRight size={14} className="text-gold-500" />
                    <div className="flex items-center gap-2">
                      <span className="text-cream-500">活动阈值：</span>
                      <Tag color="orange" className="!m-0">
                        {effectiveThreshold} {matConfig.unit}
                      </Tag>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card
            className="card-elegant !shadow-none"
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-gold-500" />
                <span className="text-wine-700 font-serif">操作日志</span>
                <span className="ml-2 text-xs text-cream-400">
                  ({task.operationLogs.length} 条记录)
                </span>
              </div>
            }
          >
            {task.operationLogs.length === 0 ? (
              <Empty description="暂无操作记录" />
            ) : (
              <Timeline
                mode="left"
                className="!ml-0"
                items={task.operationLogs
                  .slice()
                  .reverse()
                  .map((log: OperationLog, index) => ({
                    color: getTimelineColor(log.action),
                    dot: (
                      <div
                        className="w-3 h-3 rounded-full -ml-0.5"
                        style={{ backgroundColor: getTimelineColor(log.action) }}
                      />
                    ),
                    label: (
                      <div className="text-right pr-4">
                        <p className="text-sm font-medium text-wine-700 font-mono">
                          {dayjs(log.timestamp).format('HH:mm')}
                        </p>
                        <p className="text-xs text-cream-400">
                          {dayjs(log.timestamp).format('MM-DD')}
                        </p>
                        {index === 0 && (
                          <Tag color="gold" className="mt-2 !text-xs !py-0">
                            最新
                          </Tag>
                        )}
                      </div>
                    ),
                    children: (
                      <div
                        className={cn(
                          'rounded-xl p-4 border transition-all duration-300',
                          index === 0
                            ? 'bg-gold-50 border-gold-200 shadow-gold-glow'
                            : 'bg-white border-wine-50'
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar
                            size={28}
                            style={{ backgroundColor: '#C9A962' }}
                            icon={<User size={14} />}
                            className="!w-7 !h-7"
                          />
                          <div>
                            <span className="font-medium text-wine-800">
                              {log.operatorName || '系统'}
                            </span>
                            <Tag
                              color={getTimelineColor(log.action)}
                              className="!ml-2 !text-xs"
                            >
                              {log.action}
                            </Tag>
                          </div>
                        </div>
                        {log.note && (
                          <p className="text-sm text-cream-600 pl-10 leading-relaxed">
                            {log.note}
                          </p>
                        )}
                      </div>
                    ),
                  }))}
              />
            )}
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <Card
            className="card-elegant !shadow-none"
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-status-normal" />
                <span className="text-wine-700 font-serif">任务进度</span>
              </div>
            }
          >
            <Steps
              direction="vertical"
              current={currentStepIndex}
              size="small"
              className="!py-2"
              items={[
                {
                  title: <span className="font-medium text-wine-800">待处理</span>,
                  description: (
                    <p className="text-xs text-cream-500 mt-1">
                      任务已创建，等待领取或分配
                    </p>
                  ),
                  status: task.status === 'pending' ? 'process' : currentStepIndex > 0 ? 'finish' : 'wait',
                },
                {
                  title: <span className="font-medium text-wine-800">进行中</span>,
                  description: (
                    <p className="text-xs text-cream-500 mt-1">
                      配送员正在处理补货任务
                    </p>
                  ),
                  status: task.status === 'inProgress' ? 'process' : currentStepIndex > 1 ? 'finish' : 'wait',
                },
                {
                  title: <span className="font-medium text-wine-800">已完成</span>,
                  description: (
                    <p className="text-xs text-cream-500 mt-1">
                      耗材已送达并确认签收
                    </p>
                  ),
                  status: task.status === 'completed' ? 'finish' : 'wait',
                },
              ]}
            />
          </Card>

          <Card
            className="card-elegant !shadow-none"
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-wine-500" />
                  <span className="text-wine-700 font-serif">分配人</span>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<Users size={14} />}
                  className="!text-gold-600"
                  onClick={() => setAssignDrawerOpen(true)}
                >
                  更换分配人
                </Button>
              </div>
            }
          >
            {assigneeName ? (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-wine-50 to-gold-50 border border-wine-100/50">
                <Avatar size={56} src={assigneeAvatar} className="!w-14 !h-14 ring-4 ring-white shadow-elegant" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-wine-800 text-lg">{assigneeName}</p>
                  <p className="text-sm text-cream-500 flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    {counter?.name}导购
                  </p>
                </div>
                <Tag color="green" className="!px-3 !py-1">
                  已分配
                </Tag>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-wine-200 text-center">
                <div className="w-14 h-14 rounded-full bg-cream-100 flex items-center justify-center mx-auto">
                  <Users size={24} className="text-cream-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-wine-600 font-medium">暂未分配</p>
                  <p className="text-xs text-cream-500 mt-1">请点击右侧「更换分配人」进行分配</p>
                </div>
              </div>
            )}
          </Card>

          <Card
            className="card-elegant !shadow-none"
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-gold-500" />
                <span className="text-wine-700 font-serif">添加备注</span>
              </div>
            }
          >
            <div className="space-y-3">
              <Input.TextArea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="输入任务相关的备注信息，如特殊说明、注意事项等..."
                rows={4}
                className="!resize-none"
                maxLength={200}
                showCount
              />
              <Button
                type="primary"
                icon={<MessageSquarePlus size={16} />}
                onClick={handleAddNote}
                className="btn-primary w-full"
                disabled={!noteText.trim()}
              >
                添加备注
              </Button>
            </div>
          </Card>

          <Card className="card-elegant !shadow-none !border-gold-200">
            <div className="space-y-3">
              {task.status === 'pending' && (
                <>
                  <Button
                    type="primary"
                    icon={<Play size={18} />}
                    size="large"
                    onClick={handleStartTask}
                    className="btn-primary w-full !h-11"
                  >
                    领取并开始任务
                  </Button>
                  <Button
                    icon={<Send size={18} />}
                    size="large"
                    onClick={() => setAssignDrawerOpen(true)}
                    className="btn-secondary w-full !h-11"
                  >
                    分配给他人
                  </Button>
                </>
              )}
              {task.status === 'inProgress' && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckCircle size={18} />}
                    size="large"
                    onClick={handleCompleteTask}
                    className="btn-primary w-full !h-11"
                  >
                    标记任务完成
                  </Button>
                  <Button
                    icon={<MessageSquarePlus size={18} />}
                    size="large"
                    onClick={() => {
                      const el = document.querySelector('textarea');
                      el?.focus();
                    }}
                    className="btn-secondary w-full !h-11"
                  >
                    添加备注说明
                  </Button>
                </>
              )}
              {task.status === 'completed' && (
                <Tooltip title="仅管理员可重新打开任务">
                  <Button
                    icon={<RotateCcw size={18} />}
                    size="large"
                    onClick={handleReopenTask}
                    className="!w-full !h-11 !bg-status-danger !text-white !border-status-danger hover:!bg-status-danger/90"
                  >
                    重新打开任务（管理员）
                  </Button>
                </Tooltip>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Drawer
        title={
          <span className="text-wine-700 font-serif">
            更换分配人 - TASK-{task.id.slice(-6).toUpperCase()}
          </span>
        }
        width={420}
        open={assignDrawerOpen}
        onClose={() => {
          setAssignDrawerOpen(false);
          setNewAssigneeId('');
        }}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setAssignDrawerOpen(false);
                setNewAssigneeId('');
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              className="btn-primary"
              onClick={handleAssignTask}
              disabled={!newAssigneeId}
            >
              确认分配
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-wine-700 mb-3">
              选择分配人员
            </label>
            <Select
              size="large"
              className="!w-full"
              placeholder="请选择要分配给哪位导购"
              value={newAssigneeId || undefined}
              onChange={setNewAssigneeId}
              showSearch
              optionFilterProp="label"
              options={allGuides.map((g) => ({
                value: g.id,
                label: `${g.name}（${g.counterName}）`,
              }))}
            />
          </div>

          <Divider className="!my-4">或从下方选择</Divider>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {allGuides.map((g) => (
              <button
                key={g.id}
                onClick={() => setNewAssigneeId(g.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left',
                  newAssigneeId === g.id
                    ? 'border-gold-400 bg-gold-50 shadow-gold-glow'
                    : 'border-wine-100 hover:border-gold-200 hover:bg-wine-50'
                )}
              >
                <Avatar size={44} src={g.avatar} className="!w-11 !h-11" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-wine-800">{g.name}</p>
                  <p className="text-xs text-cream-500">{g.counterName} · 导购</p>
                </div>
                {newAssigneeId === g.id && (
                  <CheckCircle size={20} className="text-gold-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
