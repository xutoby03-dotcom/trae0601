import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  DatePicker,
  Tabs,
  Table,
  Progress,
  Badge,
  Modal,
  List,
  Select,
  Tag,
  Space,
  ConfigProvider,
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
dayjs.extend(quarterOfYear);
import {
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Clock,
  BarChart3,
  Trophy,
  Calendar as CalendarIcon,
  User,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import {
  SeverityPieChart,
  PendingByFacilityBar,
  DurationTrendLine,
  ProblemTypeCompareChart,
} from '@/components/StatisticsCharts';
import { useFacilityStore, useRepairStore } from '@/store';
import { FACILITY_STATUS_CONFIG } from '@/types';
import {
  getPendingRepairsCount,
  getCompletedRate,
  getAverageRepairDuration,
  getRepeatFaultFacilities,
  getInspectionCalendarData,
  type RepeatFaultItem,
  type CalendarInspectionInfo,
} from '@/utils/statistics';

const { RangePicker } = DatePicker;

type TimeRange = '7d' | '30d' | 'quarter' | 'custom';

export default function Statistics() {
  const { facilities } = useFacilityStore();
  const { repairs } = useRepairStore();

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [customRange, setCustomRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [calendarDate, setCalendarDate] = useState<Dayjs>(dayjs().add(1, 'month'));
  const [modalDate, setModalDate] = useState<string | null>(null);

  const dateFilteredRepairs = useMemo(() => {
    let start: Dayjs, end: Dayjs;
    const now = dayjs();

    switch (timeRange) {
      case '7d':
        start = now.subtract(6, 'day').startOf('day');
        end = now.endOf('day');
        break;
      case '30d':
        start = now.subtract(29, 'day').startOf('day');
        end = now.endOf('day');
        break;
      case 'quarter':
        start = now.startOf('quarter');
        end = now.endOf('quarter');
        break;
      case 'custom':
        if (customRange) {
          start = customRange[0].startOf('day');
          end = customRange[1].endOf('day');
        } else {
          start = now.subtract(29, 'day').startOf('day');
          end = now.endOf('day');
        }
        break;
    }

    return repairs.filter(r => {
      const created = dayjs(r.created_at);
      return created.isAfter(start.subtract(1, 'ms')) && created.isBefore(end.add(1, 'ms'));
    });
  }, [repairs, timeRange, customRange]);

  const stats = useMemo(() => ({
    pendingCount: getPendingRepairsCount(dateFilteredRepairs),
    inProgressCount: dateFilteredRepairs.filter(r => r.status === 'in_progress').length,
    completedRate: getCompletedRate(dateFilteredRepairs),
    avgDuration: getAverageRepairDuration(dateFilteredRepairs),
  }), [dateFilteredRepairs]);

  const repeatFaultList: RepeatFaultItem[] = useMemo(
    () => getRepeatFaultFacilities(facilities, dateFilteredRepairs, 2),
    [facilities, dateFilteredRepairs]
  );

  const [repeatSort, setRepeatSort] = useState<'count' | 'lastDate'>('count');
  const sortedRepeatList = useMemo(() => {
    return [...repeatFaultList].sort((a, b) => {
      if (repeatSort === 'count') return b.count - a.count;
      return b.lastDate.valueOf() - a.lastDate.valueOf();
    });
  }, [repeatFaultList, repeatSort]);

  const maxCount = useMemo(
    () => Math.max(...repeatFaultList.map(r => r.count), 1),
    [repeatFaultList]
  );

  const calendarData: Map<string, CalendarInspectionInfo> = useMemo(() => {
    const y = calendarDate.year();
    const m = calendarDate.month();
    return getInspectionCalendarData(facilities, y, m);
  }, [facilities, calendarDate]);

  const dateCellRender = (value: Dayjs) => {
    void value;
    return null;
  };
  void dateCellRender;

  const dateFullCellRender = (value: Dayjs) => {
    void value;
    return null;
  };
  void dateFullCellRender;

  const modalInfo = modalDate ? calendarData.get(modalDate) : null;

  const repeatColumns: ColumnsType<RepeatFaultItem & { _rank: number }> = [
    {
      title: '排名',
      key: 'rank',
      width: 70,
      align: 'center',
      render: (_: unknown, __, index) => {
        const rank = index + 1;
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500 mx-auto" />;
        if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400 mx-auto" />;
        if (rank === 3) return <Trophy className="w-6 h-6 text-orange-400 mx-auto" />;
        return <span className="text-gray-500 font-medium">{rank}</span>;
      },
    },
    {
      title: '设施名称',
      key: 'name',
      render: (_: unknown, r) => (
        <Link to={`/facilities/${r.facility.id}`} className="text-gray-800 hover:text-orange-500 font-medium">
          {r.facility.name}
        </Link>
      ),
    },
    {
      title: '故障次数',
      key: 'count',
      width: 240,
      sorter: (a, b) => a.count - b.count,
      defaultSortOrder: 'descend',
      render: (_: unknown, r) => (
        <div className="flex items-center gap-3">
          <Progress
            percent={Math.round((r.count / maxCount) * 100)}
            showInfo={false}
            strokeColor={{
              '0%': '#FFD770',
              '100%': r.count >= maxCount ? '#E63946' : '#FF6B35',
            }}
            trailColor="#F3F4F6"
            className="!w-32 !min-w-0"
          />
          <span
            className={`text-sm font-semibold ${
              r.count >= maxCount ? 'text-red-500' : 'text-orange-500'
            }`}
          >
            {r.count}次
          </span>
        </div>
      ),
    },
    {
      title: '首次故障',
      key: 'firstDate',
      width: 120,
      render: (_: unknown, r) => (
        <span className="text-sm text-gray-500">{r.firstDate.format('YYYY-MM-DD')}</span>
      ),
    },
    {
      title: '最近故障',
      key: 'lastDate',
      width: 120,
      sorter: (a, b) => a.lastDate.valueOf() - b.lastDate.valueOf(),
      render: (_: unknown, r) => (
        <span className="text-sm text-gray-500">{r.lastDate.format('YYYY-MM-DD')}</span>
      ),
    },
    {
      title: '当前状态',
      key: 'status',
      width: 100,
      render: (_: unknown, r) => {
        const cfg = FACILITY_STATUS_CONFIG[r.facility.status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto bg-gray-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-orange-500" />
            数据统计分析
          </h1>
          <p className="text-gray-500 text-sm mt-1">多维度分析设施运维情况，辅助决策</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Space.Compact>
            <Select<TimeRange>
              value={timeRange}
              onChange={v => {
                setTimeRange(v);
                if (v !== 'custom') setCustomRange(null);
              }}
              style={{ width: 130 }}
              size="middle"
              options={[
                { value: '7d', label: '最近7天' },
                { value: '30d', label: '近30天' },
                { value: 'quarter', label: '本季度' },
                { value: 'custom', label: '自定义' },
              ]}
            />
            {timeRange === 'custom' && (
              <RangePicker
                value={customRange}
                onChange={v => setCustomRange(v as [Dayjs, Dayjs])}
                size="middle"
              />
            )}
          </Space.Compact>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="未处理报修"
          value={stats.pendingCount}
          description="待跟进工单"
          color="orange"
          size="small"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard
          title="进行中维修"
          value={stats.inProgressCount}
          description="当前处理中"
          color="blue"
          size="small"
          icon={<Wrench className="w-5 h-5" />}
        />
        <StatCard
          title="完成率"
          value={`${stats.completedRate}%`}
          description="本时段完成比例"
          color="green"
          size="small"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          title="平均时长"
          value={`${stats.avgDuration}h`}
          description="维修平均耗时"
          color="purple"
          size="small"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="shadow-sm"
          title={<span className="font-semibold text-gray-800">严重程度分布</span>}
        >
          <SeverityPieChart repairs={dateFilteredRepairs} />
        </Card>
        <Card
          className="shadow-sm"
          title={<span className="font-semibold text-gray-800">各设施未处理报修数 TOP10</span>}
        >
          <PendingByFacilityBar facilities={facilities} repairs={dateFilteredRepairs} />
        </Card>
      </div>

      <Card
        className="shadow-sm"
        title={<span className="font-semibold text-gray-800">维修效率分析</span>}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: '近30天平均维修时长趋势',
              children: <DurationTrendLine repairs={repairs} days={30} />,
            },
            {
              key: '2',
              label: '按问题类型对比',
              children: <ProblemTypeCompareChart repairs={dateFilteredRepairs} />,
            },
          ]}
        />
      </Card>

      <Card
        className="shadow-sm"
        title={
          <div className="flex items-center justify-between w-full pr-2">
            <span className="font-semibold text-gray-800">重复故障设施（≥2次）</span>
            <Space size="middle">
              <span className="text-xs text-gray-400">排序：</span>
              <Select
                size="small"
                value={repeatSort}
                onChange={setRepeatSort}
                style={{ width: 130 }}
                options={[
                  { value: 'count', label: '按故障次数' },
                  { value: 'lastDate', label: '按最近日期' },
                ]}
              />
            </Space>
          </div>
        }
        styles={{ body: { padding: 0 } }}
      >
        <Table<RepeatFaultItem & { _rank: number }>
          size="middle"
          rowKey={r => r.facility.id}
          columns={repeatColumns}
          dataSource={sortedRepeatList.map((r, i) => ({ ...r, _rank: i + 1 }))}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{ emptyText: '暂无重复故障设施（≥2次）' }}
        />
      </Card>

      <Card
        className="shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-800">下月巡检日历</span>
          </div>
        }
      >
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#FF6B35',
            },
            components: {
              Calendar: {
                fullBg: '#fff',
              },
            },
          }}
        >
          <div className="ant-picker-calendar">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Badge color="#FF6B35" text={<span className="text-xs">有巡检</span>} />
                <Badge color="#E63946" text={<span className="text-xs">逾期</span>} />
              </div>
              <Space.Compact>
                <Select
                  size="small"
                  value={calendarDate.year()}
                  onChange={y => setCalendarDate(dayjs(`${y}-${calendarDate.month() + 1}-01`))}
                  style={{ width: 100 }}
                  options={Array.from({ length: 5 }, (_, i) => ({
                    value: dayjs().year() - 2 + i,
                    label: `${dayjs().year() - 2 + i}年`,
                  }))}
                />
                <Select
                  size="small"
                  value={calendarDate.month()}
                  onChange={m => setCalendarDate(dayjs(`${calendarDate.year()}-${m + 1}-01`))}
                  style={{ width: 90 }}
                  options={Array.from({ length: 12 }, (_, i) => ({
                    value: i,
                    label: `${i + 1}月`,
                  }))}
                />
              </Space.Compact>
            </div>

            {(() => {
              const year = calendarDate.year();
              const month = calendarDate.month();
              const firstDay = dayjs(`${year}-${month + 1}-01`);
              const startWeekday = firstDay.day();
              const daysInMonth = firstDay.daysInMonth();
              const prevMonthDays = dayjs(`${year}-${month + 1}-01`).subtract(1, 'month').daysInMonth();

              const cells: { day: number; currentMonth: boolean; date: Dayjs }[] = [];
              for (let i = startWeekday - 1; i >= 0; i--) {
                const d = prevMonthDays - i;
                cells.push({
                  day: d,
                  currentMonth: false,
                  date: firstDay.subtract(i + 1, 'day'),
                });
              }
              for (let d = 1; d <= daysInMonth; d++) {
                cells.push({
                  day: d,
                  currentMonth: true,
                  date: dayjs(`${year}-${month + 1}-${d}`),
                });
              }
              const remain = 42 - cells.length;
              for (let d = 1; d <= remain; d++) {
                cells.push({
                  day: d,
                  currentMonth: false,
                  date: firstDay.add(daysInMonth + d - 1, 'day'),
                });
              }

              return (
                <div>
                  <div className="grid grid-cols-7 mb-1">
                    {['日', '一', '二', '三', '四', '五', '六'].map(w => (
                      <div key={w} className="text-center text-xs text-gray-500 py-2 font-medium">
                        {w}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((cell, i) => {
                      const key = cell.date.format('YYYY-MM-DD');
                      const info = calendarData.get(key);
                      const isToday = cell.date.isSame(dayjs(), 'day');
                      return (
                        <div
                          key={i}
                          className={`min-h-[84px] p-1.5 rounded cursor-pointer border border-transparent hover:border-orange-200 transition-all ${
                            cell.currentMonth ? '' : 'opacity-30'
                          } ${info?.isOverdue && cell.currentMonth ? 'bg-red-50' : ''} ${
                            isToday && cell.currentMonth ? 'ring-1 ring-orange-400 bg-orange-50/30' : ''
                          }`}
                          onClick={() => info && info.items.length > 0 && setModalDate(key)}
                        >
                          <div
                            className={`text-sm font-medium ${
                              info?.isOverdue && cell.currentMonth
                                ? 'text-red-500'
                                : isToday && cell.currentMonth
                                ? 'text-orange-600'
                                : 'text-gray-700'
                            }`}
                          >
                            {cell.day}
                          </div>
                          {info && info.items.length > 0 && cell.currentMonth && (
                            <div className="mt-1 flex flex-col gap-0.5">
                              {info.items.slice(0, 2).map((it, idx) => (
                                <div
                                  key={idx}
                                  className={`text-[10px] truncate px-1 rounded leading-tight ${
                                    info.isOverdue
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-orange-50 text-orange-600'
                                  }`}
                                >
                                  {it.facility.name}
                                </div>
                              ))}
                              {info.items.length > 2 && (
                                <div className="text-[10px] text-gray-400 pl-1">
                                  +{info.items.length - 2} 更多
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </ConfigProvider>
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-orange-500" />
            <span>{modalDate} 巡检设施列表</span>
          </div>
        }
        open={!!modalDate}
        onCancel={() => setModalDate(null)}
        footer={null}
        width={520}
      >
        {modalInfo && (
          <List
            itemLayout="horizontal"
            dataSource={modalInfo.items}
            locale={{ emptyText: '暂无巡检任务' }}
            renderItem={item => (
              <List.Item
                className="!px-0"
                style={{ borderBottom: '1px solid #f3f4f6' }}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.daysLeft < 0 ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                  }
                  title={
                    <Link
                      to={`/facilities/${item.facility.id}`}
                      className="text-gray-800 hover:text-orange-500 font-medium"
                      onClick={() => setModalDate(null)}
                    >
                      {item.facility.name}
                    </Link>
                  }
                  description={
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>责任人：{item.facility.responsible_person}</span>
                      <span>·</span>
                      <span>{item.facility.location}</span>
                    </div>
                  }
                />
                {item.daysLeft < 0 ? (
                  <Tag color="red">逾期{Math.abs(item.daysLeft)}天</Tag>
                ) : item.daysLeft === 0 ? (
                  <Tag color="orange">今天</Tag>
                ) : (
                  <Tag color="blue">{item.daysLeft}天后</Tag>
                )}
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
}
