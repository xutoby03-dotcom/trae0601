import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  CalendarClock,
} from 'lucide-react';
import dayjs from 'dayjs';
import StatCard from '@/components/StatCard';
import { SeverityTag, RepairStatusTag } from '@/components/Tags';
import { RepeatFaultBarChart } from '@/components/StatisticsCharts';
import { useFacilityStore, useRepairStore } from '@/store';
import type { Repair, Severity } from '@/types';
import {
  getPendingRepairsCount,
  getCompletedRate,
  getAverageRepairDuration,
  getUpcomingInspections,
  getRepeatFaultFacilities,
  SEVERITY_ORDER,
  type UpcomingInspection,
  type RepeatFaultItem,
} from '@/utils/statistics';

const WEEKDAY_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-emerald-500',
  'bg-teal-500',
];
const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function Dashboard() {
  const { facilities } = useFacilityStore();
  const { repairs } = useRepairStore();

  const facilityMap = useMemo(() => {
    const m = new Map<string, (typeof facilities)[number]>();
    facilities.forEach(f => m.set(f.id, f));
    return m;
  }, [facilities]);

  const stats = useMemo(
    () => ({
      pendingCount: getPendingRepairsCount(repairs),
      inProgressCount: repairs.filter(r => r.status === 'in_progress').length,
      completedRate: getCompletedRate(repairs),
      avgDuration: getAverageRepairDuration(repairs),
    }),
    [repairs]
  );

  const pendingRepairs: Repair[] = useMemo(() => {
    return repairs
      .filter(r => r.status !== 'completed' && r.status !== 'cancelled')
      .sort((a, b) => {
        const sevDiff = SEVERITY_ORDER[b.severity as Severity] - SEVERITY_ORDER[a.severity as Severity];
        if (sevDiff !== 0) return sevDiff;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      })
      .slice(0, 10);
  }, [repairs]);

  const repeatFaultTop5: RepeatFaultItem[] = useMemo(
    () => getRepeatFaultFacilities(facilities, repairs, 1),
    [facilities, repairs]
  );

  const upcoming: UpcomingInspection[] = useMemo(
    () => getUpcomingInspections(facilities, 7),
    [facilities]
  );

  const repairColumns: ColumnsType<Repair> = [
    {
      title: '报修单号',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (v: string) => <span className="text-gray-500 text-xs font-mono">{v.slice(-6).toUpperCase()}</span>,
    },
    {
      title: '设施名称',
      key: 'facility',
      width: 110,
      render: (_: unknown, r) => {
        const f = facilityMap.get(r.facility_id);
        return (
          <Link to={`/facilities/${r.facility_id}`} className="text-gray-800 hover:text-orange-500 font-medium text-sm">
            {f?.name || '未知设施'}
          </Link>
        );
      },
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 80,
      render: (v: Severity) => <SeverityTag severity={v} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v: Repair['status']) => <RepairStatusTag status={v} />,
    },
    {
      title: '发现人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 100,
      ellipsis: true,
      render: v => <span className="text-sm text-gray-600">{v}</span>,
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      render: (v: string) => <span className="text-sm text-gray-500">{dayjs(v).format('MM-DD HH:mm')}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: unknown, r) => (
        <div className="flex gap-1">
          <Link to={`/repairs/${r.id}`}>
            <Button type="link" size="small" className="!px-1 !h-auto !py-0">
              查看
            </Button>
          </Link>
          {(r.status === 'pending') && (
            <Button type="link" size="small" className="!px-1 !h-auto !py-0 !text-orange-500">
              分派
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
        <p className="text-gray-500 text-sm mt-1">{dayjs().format('YYYY年MM月DD日')} 儿童游乐设施运维概览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="未处理报修"
          value={stats.pendingCount}
          description="需跟进的报修数量"
          color="orange"
          icon={<AlertTriangle className="w-6 h-6" />}
        />
        <StatCard
          title="进行中维修"
          value={stats.inProgressCount}
          description="当前正在处理的工单"
          color="blue"
          icon={<Wrench className="w-6 h-6" />}
        />
        <StatCard
          title="本月完成率"
          value={`${stats.completedRate}%`}
          description="本月报修单完成比例"
          color="green"
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
        <StatCard
          title="平均维修时长"
          value={`${stats.avgDuration}h`}
          description="从开始到完成的平均耗时"
          color="purple"
          icon={<Clock className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2 shadow-sm"
          title={
            <div className="flex items-center justify-between w-full pr-2">
              <span className="font-semibold text-gray-800">待处理报修 TOP 10</span>
              <Link
                to="/repairs"
                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 font-normal"
              >
                查看全部 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          }
          styles={{ body: { padding: 0 } }}
        >
          <Table<Repair>
            size="small"
            rowKey="id"
            columns={repairColumns}
            dataSource={pendingRepairs}
            pagination={false}
            scroll={{ x: 720 }}
            rowClassName={(r) =>
              (r.severity === 'high' || r.severity === 'critical')
                ? '!border-l-4 !border-l-red-500'
                : ''
            }
          />
        </Card>

        <Card
          className="shadow-sm"
          title={<span className="font-semibold text-gray-800">重复故障设施预警</span>}
          styles={{ body: { padding: '16px 20px 20px' } }}
        >
          <RepeatFaultBarChart data={repeatFaultTop5} />
          <div className="mt-2 border-t pt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th className="text-left font-normal pb-2">设施名称</th>
                  <th className="text-left font-normal pb-2">故障次数</th>
                  <th className="text-left font-normal pb-2">最近故障</th>
                </tr>
              </thead>
              <tbody>
                {repeatFaultTop5.slice(0, 5).map(item => (
                  <tr key={item.facility.id} className="border-t border-gray-50">
                    <td className="py-2 text-gray-700 truncate max-w-[110px]">
                      <Tooltip title={item.facility.name}>
                        <Link to={`/facilities/${item.facility.id}`} className="hover:text-orange-500">
                          {item.facility.name}
                        </Link>
                      </Tooltip>
                    </td>
                    <td className="py-2">
                      <Tag color="red" style={{ margin: 0 }} className="!px-2">{item.count}次</Tag>
                    </td>
                    <td className="py-2 text-gray-500 text-xs">{item.lastDate.format('MM-DD')}</td>
                  </tr>
                ))}
                {repeatFaultTop5.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-400 text-sm">
                      暂无重复故障设施
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card
        className="shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-800">未来7天巡检计划</span>
          </div>
        }
      >
        {upcoming.length === 0 ? (
          <div className="py-10 text-center text-gray-400">暂无巡检计划</div>
        ) : (
          <div className="relative pl-4">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
            <div className="space-y-3">
              {upcoming.map(({ facility, nextDate, daysLeft }) => {
                const weekday = nextDate.day();
                const isOverdue = daysLeft < 0;
                return (
                  <div
                    key={`${facility.id}-${nextDate.format('YYYYMMDD')}`}
                    className="relative flex items-start gap-4"
                  >
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white shadow-sm relative z-10 ${
                        isOverdue ? 'bg-red-500' : WEEKDAY_COLORS[weekday]
                      }`}
                    >
                      <span className="text-[10px] opacity-90">{WEEKDAY_NAMES[weekday]}</span>
                      <span className="text-lg font-bold leading-tight">{nextDate.format('DD')}</span>
                    </div>
                    <Link
                      to={`/facilities/${facility.id}`}
                      className={`flex-1 rounded-lg border px-4 py-3 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                        isOverdue ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{facility.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            责任人：<span className="text-gray-600">{facility.responsible_person}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span>{facility.location}</span>
                          </p>
                        </div>
                        {isOverdue ? (
                          <Tag color="red" style={{ margin: 0 }}>逾期{Math.abs(daysLeft)}天</Tag>
                        ) : daysLeft === 0 ? (
                          <Tag color="orange" style={{ margin: 0 }}>今天</Tag>
                        ) : daysLeft === 1 ? (
                          <Tag color="gold" style={{ margin: 0 }}>明天</Tag>
                        ) : (
                          <Tag color="blue" style={{ margin: 0 }}>还有{daysLeft}天</Tag>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
