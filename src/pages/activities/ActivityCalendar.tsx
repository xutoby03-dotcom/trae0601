import { useState, useMemo } from 'react';
import {
  Calendar as CalendarAntd,
  Modal,
  Form,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Tag,
  Tooltip,
  Popover,
  Divider,
  Badge,
  message,
  Empty,
  Checkbox,
} from 'antd';
import type { Dayjs } from 'dayjs';
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Store,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  Zap,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { useActivityStore } from '@/stores/activityStore';
import { useCounterStore } from '@/stores/counterStore';
import type { Activity } from '@/types/index';
import { cn } from '@/lib/utils';

dayjs.locale('zh-cn');

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const MULTIPLIER_PRESETS = [1.5, 2, 2.5, 3];

interface ActivityGroup {
  ongoing: Activity[];
  upcoming: Activity[];
  ended: Activity[];
}

const ACTIVITY_COLORS = [
  { bg: '#722F37', light: '#722F3715', text: '#722F37' },
  { bg: '#C9A962', light: '#C9A96215', text: '#C9A962' },
  { bg: '#4A6741', light: '#4A674115', text: '#4A6741' },
  { bg: '#FF6B35', light: '#FF6B3515', text: '#FF6B35' },
  { bg: '#1A1A2E', light: '#1A1A2E15', text: '#1A1A2E' },
];

const getActivityColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACTIVITY_COLORS[Math.abs(hash) % ACTIVITY_COLORS.length];
};

export default function ActivityCalendar() {
  const { activities, addActivity, updateActivity, deleteActivity } = useActivityStore();
  const { counters } = useCounterStore();

  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [popoverDate, setPopoverDate] = useState<Dayjs | null>(null);
  const [form] = Form.useForm();
  const [selectedCounterIds, setSelectedCounterIds] = useState<string[]>([]);

  const activityGroups = useMemo<ActivityGroup>(() => {
    const today = dayjs().startOf('day');
    const groups: ActivityGroup = {
      ongoing: [],
      upcoming: [],
      ended: [],
    };

    activities.forEach((activity) => {
      const start = dayjs(activity.startDate).startOf('day');
      const end = dayjs(activity.endDate).endOf('day');

      if (today.isBefore(start)) {
        groups.upcoming.push(activity);
      } else if (today.isAfter(end)) {
        groups.ended.push(activity);
      } else {
        groups.ongoing.push(activity);
      }
    });

    groups.ongoing.sort((a, b) => dayjs(a.endDate).valueOf() - dayjs(b.endDate).valueOf());
    groups.upcoming.sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());
    groups.ended.sort((a, b) => dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf());

    return groups;
  }, [activities]);

  const dateActivityMap = useMemo(() => {
    const map = new Map<string, Activity[]>();
    activities.forEach((activity) => {
      const start = dayjs(activity.startDate).startOf('day');
      const end = dayjs(activity.endDate).endOf('day');
      let current = start.clone();
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        const key = current.format('YYYY-MM-DD');
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(activity);
        current = current.add(1, 'day');
      }
    });
    return map;
  }, [activities]);

  const allCounterIds = counters.map((c) => c.id);

  const openCreateModal = (presetDate?: Dayjs) => {
    setEditingActivity(null);
    setSelectedCounterIds([]);
    form.resetFields();
    if (presetDate) {
      form.setFieldsValue({
        dateRange: [presetDate, presetDate],
      });
    }
    setModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setSelectedCounterIds([...activity.counterIds]);
    form.setFieldsValue({
      name: activity.name,
      dateRange: [dayjs(activity.startDate), dayjs(activity.endDate)],
      thresholdMultiplier: activity.thresholdMultiplier,
      counterIds: activity.counterIds,
      description: activity.description,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.dateRange as [Dayjs, Dayjs];
      const counterIds = values.counterIds as string[];

      const data = {
        name: values.name as string,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        thresholdMultiplier: values.thresholdMultiplier as number,
        counterIds,
        description: values.description as string,
      };

      if (editingActivity) {
        await updateActivity(editingActivity.id, data);
        message.success('活动更新成功');
      } else {
        await addActivity(data);
        message.success('活动创建成功');
      }

      setModalOpen(false);
      form.resetFields();
      setEditingActivity(null);
      setSelectedCounterIds([]);
    } catch {
      // Validation error handled by antd
    }
  };

  const handleDelete = (activity: Activity) => {
    Modal.confirm({
      title: '确认删除活动',
      content: `确定要删除活动「${activity.name}」吗？此操作不可恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteActivity(activity.id);
        message.success('活动已删除');
      },
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCounterIds([...allCounterIds]);
      form.setFieldsValue({ counterIds: allCounterIds });
    } else {
      setSelectedCounterIds([]);
      form.setFieldsValue({ counterIds: [] });
    }
  };

  const getShortName = (name: string) => {
    if (name.length <= 4) return name;
    return name.slice(0, 4);
  };

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayActivities = dateActivityMap.get(dateStr) || [];
    const isToday = value.isSame(dayjs(), 'day');

    return (
      <Popover
        trigger="click"
        open={popoverDate?.format('YYYY-MM-DD') === dateStr}
        onOpenChange={(open) => {
          if (open) {
            setPopoverDate(value);
          } else if (popoverDate?.format('YYYY-MM-DD') === dateStr) {
            setPopoverDate(null);
          }
        }}
        placement="bottom"
        overlayClassName="!min-w-[320px]"
        content={
          <div className="p-1">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-wine-100">
              <div>
                <p className="font-serif text-lg font-bold text-wine-800">
                  {value.format('M月D日')}
                </p>
                <p className="text-xs text-cream-500">{value.format('dddd')}</p>
              </div>
              <Button
                type="primary"
                size="small"
                icon={<Plus size={14} />}
                onClick={() => {
                  setPopoverDate(null);
                  openCreateModal(value);
                }}
                className="btn-primary !px-3 !py-1"
              >
                添加活动
              </Button>
            </div>

            {dayActivities.length === 0 ? (
              <Empty description="当天无活动" image={Empty.PRESENTED_IMAGE_SIMPLE} className="!py-4" />
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {dayActivities.map((act) => {
                  const color = getActivityColor(act.id);
                  return (
                    <div
                      key={act.id}
                      className={cn(
                        'p-3 rounded-xl border transition-all duration-200 hover:shadow-elegant cursor-pointer'
                      )}
                      style={{ backgroundColor: color.light, borderColor: color.bg + '30' }}
                      onClick={() => {
                        setPopoverDate(null);
                        openEditModal(act);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: color.bg }}
                          >
                            <Sparkles size={14} className="text-white" />
                          </div>
                          <span className="font-semibold text-wine-800">{act.name}</span>
                        </div>
                        <Tag
                          color="gold"
                          className="!m-0 !px-2 !py-0.5 !rounded-lg"
                        >
                          ×{act.thresholdMultiplier}
                        </Tag>
                      </div>
                      <p className="text-xs text-cream-500 mb-2">
                        {dayjs(act.startDate).format('MM-DD')} ~ {dayjs(act.endDate).format('MM-DD')}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {act.counterIds.slice(0, 3).map((id) => {
                          const counter = counters.find((c) => c.id === id);
                          return (
                            <Tag
                              key={id}
                              className="!m-0 !text-xs !px-2 !py-0.5"
                              style={{ backgroundColor: counter?.brandColor + '15', borderColor: counter?.brandColor + '30', color: counter?.brandColor }}
                            >
                              {getShortName(counter?.name || '未知')}
                            </Tag>
                          );
                        })}
                        {act.counterIds.length > 3 && (
                          <Tag className="!m-0 !text-xs !px-2 !py-0.5 !bg-cream-100 !text-cream-600 !border-cream-200">
                            +{act.counterIds.length - 3}
                          </Tag>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        }
      >
        <div
          className={cn(
            'min-h-[80px] p-1.5 rounded-lg transition-all duration-200 cursor-pointer',
            'hover:bg-cream-50',
            isToday && 'ring-2 ring-gold-400 ring-offset-2'
          )}
        >
          <div className="flex items-start justify-between mb-1">
            <span
              className={cn(
                'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                isToday
                  ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-gold-glow'
                  : value.month() !== currentMonth.month()
                  ? 'text-cream-300'
                  : 'text-wine-700'
              )}
            >
              {value.date()}
            </span>
          </div>

          <div className="space-y-1">
            {dayActivities.slice(0, 2).map((act) => {
              const color = getActivityColor(act.id);
              return (
                <div
                  key={act.id}
                  className={cn(
                    'flex items-center justify-between gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium truncate'
                  )}
                  style={{ backgroundColor: color.bg, color: '#fff' }}
                >
                  <span className="truncate">{getShortName(act.name)}</span>
                  <span className="flex-shrink-0 opacity-90">×{act.thresholdMultiplier}</span>
                </div>
              );
            })}
            {dayActivities.length > 2 && (
              <div className="text-xs text-cream-500 px-1.5">
                +{dayActivities.length - 2} 个更多
              </div>
            )}
          </div>
        </div>
      </Popover>
    );
  };

  const ActivityCard = ({ activity }: { activity: Activity }) => {
    const color = getActivityColor(activity.id);
    const start = dayjs(activity.startDate);
    const end = dayjs(activity.endDate);
    const isOngoing = activityGroups.ongoing.some((a) => a.id === activity.id);
    const isUpcoming = activityGroups.upcoming.some((a) => a.id === activity.id);

    let statusConfig;
    if (isOngoing) {
      statusConfig = { icon: <Zap size={12} />, text: '进行中', tag: 'tag-gold' };
    } else if (isUpcoming) {
      statusConfig = { icon: <CalendarClock size={12} />, text: '即将开始', tag: 'tag-status-warning' };
    } else {
      statusConfig = { icon: <CheckCircle2 size={12} />, text: '已结束', tag: 'tag-status-normal' };
    }

    return (
      <div
        className={cn(
          'group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-card-hover animate-fade-in-up'
        )}
        style={{ borderColor: color.bg + '25', backgroundColor: color.light }}
      >
        <div className="h-1.5" style={{ backgroundColor: color.bg }} />

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ backgroundColor: color.bg }}
              >
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-wine-800 truncate">{activity.name}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={cn(statusConfig.tag, '!text-xs !py-0 !px-2')}>
                    {statusConfig.icon}
                    {statusConfig.text}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div
                className="text-3xl font-bold font-serif leading-none"
                style={{ color: color.bg }}
              >
                ×{activity.thresholdMultiplier}
              </div>
              <p className="text-xs text-cream-500 mt-1">阈值加倍</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-cream-600 mb-3 px-2 py-1.5 rounded-lg bg-white/50">
            <Clock size={12} className="flex-shrink-0" />
            <span>
              {start.format('YYYY.M.D')} - {end.format('YYYY.M.D')}
            </span>
            <span className="text-cream-400 mx-1">·</span>
            <span className="flex items-center gap-1">
              <TrendingUp size={12} />
              共 {end.diff(start, 'day') + 1} 天
            </span>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-1 text-xs text-cream-500 mb-1.5">
              <Store size={12} />
              <span>适用品牌区 ({activity.counterIds.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {activity.counterIds.map((id) => {
                const counter = counters.find((c) => c.id === id);
                return (
                  <Tag
                    key={id}
                    className="!m-0 !text-xs !px-2 !py-0.5 !rounded-md"
                    style={{
                      backgroundColor: (counter?.brandColor || '#722F37') + '15',
                      borderColor: (counter?.brandColor || '#722F37') + '30',
                      color: counter?.brandColor || '#722F37',
                    }}
                  >
                    {getShortName(counter?.name || '未知')}
                  </Tag>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 pt-3 border-t border-wine-100/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip title="编辑活动">
              <Button
                type="text"
                size="small"
                icon={<Pencil size={15} />}
                className="!text-wine-600 !px-2"
                onClick={() => openEditModal(activity)}
              />
            </Tooltip>
            <Tooltip title="删除活动">
              <Button
                type="text"
                size="small"
                icon={<Trash2 size={15} />}
                className="!text-status-danger !px-2"
                onClick={() => handleDelete(activity)}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

  const ActivitySection = ({
    title,
    activities,
    icon,
    accent,
    emptyText,
  }: {
    title: string;
    activities: Activity[];
    icon: React.ReactNode;
    accent: string;
    emptyText: string;
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + '20' }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <h3 className="font-serif font-semibold text-wine-800">{title}</h3>
        <Badge
          count={activities.length}
          showZero
          style={{ backgroundColor: activities.length > 0 ? accent : '#E5E7EB', color: activities.length > 0 ? '#fff' : '#9CA3AF' }}
          size="small"
        />
      </div>
      {activities.length === 0 ? (
        <div className="py-6 text-center text-cream-400 text-sm bg-cream-50 rounded-xl border border-dashed border-wine-100">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act, idx) => (
            <div key={act.id} style={{ animationDelay: `${idx * 60}ms` }}>
              <ActivityCard activity={act} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-10 gap-4">
      <div className="lg:col-span-7">
        <Card
          className="card-elegant !shadow-none h-full"
          styles={{ body: { padding: '20px' } }}
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-wine-500" />
                <span className="text-wine-700 font-serif">活动日历</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-wine-600">
                <button
                  onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-wine-50 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="font-serif font-semibold min-w-[120px] text-center">
                  {currentMonth.format('YYYY年 M月')}
                </span>
                <button
                  onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-wine-50 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          }
        >
          <CalendarAntd
            value={currentMonth}
            onChange={(d) => setCurrentMonth(d as Dayjs)}
            cellRender={dateCellRender}
            fullscreen
            headerRender={() => null}
            className="!border-0 !p-0 activity-calendar-custom"
          />

          <Divider className="!my-5" />

          <div className="flex flex-wrap items-center gap-4 text-xs text-cream-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full ring-2 ring-gold-400 ring-offset-1 flex items-center justify-center bg-gradient-to-br from-gold-400 to-gold-600">
                <span className="text-[10px] text-white font-bold">今</span>
              </div>
              <span>今日</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 px-2 rounded-md bg-[#722F37] text-white text-[10px] flex items-center">
                活动 ×2.0
              </div>
              <span>活动日</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={12} className="text-cream-400" />
              <span>点击日期查看详情或快速添加活动</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <div className="space-y-4">
          <Card className="card-elegant !shadow-none" styles={{ body: { padding: '16px' } }}>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={18} />}
              onClick={() => openCreateModal()}
              className="btn-primary w-full !h-12 !text-base"
            >
              新建活动
            </Button>
          </Card>

          <Card
            className="card-elegant !shadow-none"
            styles={{ body: { padding: '20px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' } }}
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-gold-500" />
                <span className="text-wine-700 font-serif">活动列表</span>
              </div>
            }
          >
            <ActivitySection
              title="当前进行中"
              activities={activityGroups.ongoing}
              icon={<Zap size={12} />}
              accent="#C9A962"
              emptyText="暂无进行中的活动"
            />
            <ActivitySection
              title="即将开始"
              activities={activityGroups.upcoming}
              icon={<CalendarClock size={12} />}
              accent="#FF9800"
              emptyText="暂无即将开始的活动"
            />
            <ActivitySection
              title="已结束"
              activities={activityGroups.ended}
              icon={<CheckCircle2 size={12} />}
              accent="#4CAF50"
              emptyText="暂无已结束的活动"
            />
          </Card>
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-wine-700 font-serif text-lg">
              {editingActivity ? '编辑活动' : '新建活动'}
            </span>
          </div>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditingActivity(null);
          form.resetFields();
          setSelectedCounterIds([]);
        }}
        okText={editingActivity ? '保存修改' : '创建活动'}
        cancelText="取消"
        okButtonProps={{ className: 'btn-primary' }}
        width={640}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-2"
          initialValues={{
            thresholdMultiplier: 2,
            counterIds: [],
          }}
        >
          <Form.Item
            label={<span className="text-wine-700 font-medium">活动名称 <span className="text-status-danger">*</span></span>}
            name="name"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input
              size="large"
              placeholder="例如：五一香氛节特惠、618年中大促"
              prefix={<CalendarDays size={18} className="text-cream-400" />}
              maxLength={30}
              showCount
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-wine-700 font-medium">活动时间 <span className="text-status-danger">*</span></span>}
            name="dateRange"
            rules={[{ required: true, message: '请选择活动时间范围' }]}
          >
            <RangePicker
              size="large"
              className="!w-full"
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-wine-700 font-medium">阈值加倍系数 <span className="text-status-danger">*</span></span>}
            name="thresholdMultiplier"
            rules={[{ required: true, message: '请选择或输入阈值加倍系数' }]}
          >
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {MULTIPLIER_PRESETS.map((m) => (
                  <Button
                    key={m}
                    type={form.getFieldValue('thresholdMultiplier') === m ? 'primary' : 'default'}
                    onClick={() => form.setFieldsValue({ thresholdMultiplier: m })}
                    className={cn(
                      '!h-10 !px-5 !rounded-xl !font-semibold transition-all',
                      form.getFieldValue('thresholdMultiplier') === m
                        ? '!bg-gradient-to-r !from-wine-600 !to-wine-700 !text-white !border-gold-400/50 shadow-gold-glow'
                        : '!bg-white !text-wine-700 !border-gold-300 hover:!bg-gold-50'
                    )}
                  >
                    ×{m}
                  </Button>
                ))}
              </div>
              <InputNumber
                size="large"
                className="!w-full"
                min={1}
                max={10}
                step={0.1}
                precision={1}
                placeholder="或自定义输入系数（1.0 - 10.0）"
                addonBefore={<TrendingUp size={16} className="text-gold-600" />}
                addonAfter="倍"
                formatter={(value) => (value ?? '').toString()}
              />
            </div>
          </Form.Item>

          <Form.Item
            label={<span className="text-wine-700 font-medium">适用品牌区 <span className="text-status-danger">*</span></span>}
            name="counterIds"
            rules={[{ required: true, message: '请至少选择一个品牌区', type: 'array', min: 1 }]}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-cream-50 border border-wine-100/50">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCounterIds.length === allCounterIds.length && allCounterIds.length > 0}
                    indeterminate={selectedCounterIds.length > 0 && selectedCounterIds.length < allCounterIds.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-wine-700">全选所有品牌区</span>
                </div>
                <Tag color="gold" className="!m-0">
                  共 {allCounterIds.length} 个
                </Tag>
              </div>

              <Select
                mode="multiple"
                size="large"
                className="!w-full"
                placeholder="选择适用的品牌区"
                maxTagCount="responsive"
                onChange={(vals) => setSelectedCounterIds(vals)}
                options={counters.map((c) => ({
                  value: c.id,
                  label: (
                    <div className="flex items-center gap-2 py-0.5">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.brandColor }}
                      />
                      <span>{c.name}</span>
                    </div>
                  ),
                }))}
              />
            </div>
          </Form.Item>

          <Form.Item
            label={<span className="text-wine-700 font-medium">活动说明</span>}
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="补充说明活动的详细信息、注意事项等（可选）"
              maxLength={200}
              showCount
              className="!resize-none"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
