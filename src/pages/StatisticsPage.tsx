import React, { useMemo } from 'react';
import { Card, Table, Tag, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';
import {
  calculateStatistics,
  formatDateTime,
  getDeviceTypeIcon,
  isOverdue,
} from '../utils/helpers';
import type { ColumnsType } from 'antd/es/table';
import type { AnomalyTicket } from '../types';

const StatisticsPage: React.FC = () => {
  const { points, inspectionRecords, anomalyTickets, getPointById } = useStore();

  const stats = useMemo(
    () => calculateStatistics(points, inspectionRecords, anomalyTickets),
    [points, inspectionRecords, anomalyTickets]
  );

  const overallStats = useMemo(() => {
    const totalPoints = points.length;
    const overdueCount = points.filter(isOverdue).length;
    const normalRate =
      inspectionRecords.length > 0
        ? Math.round(
            (inspectionRecords.filter((r) => r.status === 'normal').length /
              inspectionRecords.length) *
              100
          )
        : 0;
    const openTickets = anomalyTickets.filter((t) => t.status !== 'reviewed').length;
    return { totalPoints, overdueCount, normalRate, openTickets };
  }, [points, inspectionRecords, anomalyTickets]);

  const floorChartOption = {
    title: {
      text: '各楼层合格率',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        const item = stats.floorPassRate.find(
          (f) => f.floor === data.name
        );
        return `${data.name}<br/>合格率: ${data.value}%<br/>总数: ${item?.total || 0}<br/>合格: ${item?.passed || 0}`;
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: stats.floorPassRate.map((f) => f.floor),
      axisLabel: { fontSize: 13 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', fontSize: 12 },
    },
    series: [
      {
        name: '合格率',
        type: 'bar',
        data: stats.floorPassRate.map((f) => ({
          value: f.passRate,
          itemStyle: {
            color:
              f.passRate >= 90
                ? '#10B981'
                : f.passRate >= 70
                  ? '#F59E0B'
                  : '#EF4444',
            borderRadius: [6, 6, 0, 0],
          },
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontWeight: 'bold',
        },
        barWidth: '50%',
      },
    ],
  };

  const typeChartOption = {
    title: {
      text: '异常设备类型分布',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}次 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    color: ['#DC2626', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'],
    series: [
      {
        name: '异常次数',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c}次',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data:
          stats.anomalyByType.length > 0
            ? stats.anomalyByType.map((t) => ({
                name: t.type,
                value: t.count,
              }))
            : [{ name: '暂无数据', value: 1, itemStyle: { color: '#E5E7EB' } }],
      },
    ],
  };

  const openTicketsColumns: ColumnsType<AnomalyTicket> = [
    {
      title: '工单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AnomalyTicket['status']) => (
        <StatusBadge type="anomaly" status={status} />
      ),
    },
    {
      title: '点位信息',
      key: 'point',
      width: 200,
      render: (_, record) => {
        const point = getPointById(record.pointId);
        if (!point) return <span className="text-gray-400">点位已删除</span>;
        return (
          <div className="flex items-center gap-2">
            <span className="text-xl">{getDeviceTypeIcon(point.deviceType)}</span>
            <div>
              <div className="font-medium text-gray-800 text-sm">
                {point.area} - {point.deviceType}
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {point.deviceNo}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: '异常描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => (
        <span className="text-gray-700 text-sm" title={desc}>
          {desc}
        </span>
      ),
    },
    {
      title: '上报时间',
      dataIndex: 'reportTime',
      key: 'reportTime',
      width: 160,
      render: (time: string) => (
        <span className="text-sm text-gray-600">{formatDateTime(time)}</span>
      ),
    },
    {
      title: '责任人',
      key: 'person',
      width: 100,
      render: (_, record) => {
        const point = getPointById(record.pointId);
        return (
          <Tag color="blue" className="text-xs">
            {point?.personInCharge || '-'}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">点位总数</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {overallStats.totalPoints}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">逾期未巡检</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {overallStats.overdueCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">巡检合格率</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {overallStats.normalRate}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">本月未闭环</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {stats.openTicketsThisMonth.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <ReactECharts
            option={floorChartOption}
            style={{ height: 350 }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>

        <Card className="border-0 shadow-sm">
          <ReactECharts
            option={typeChartOption}
            style={{ height: 350 }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>
      </div>

      <Card
        className="border-0 shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="font-bold">本月未闭环问题</span>
            <Tag color="orange" className="ml-2">
              {stats.openTicketsThisMonth.length} 条
            </Tag>
          </div>
        }
      >
        {stats.openTicketsThisMonth.length === 0 ? (
          <Empty
            description="本月所有异常问题已闭环"
            className="py-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={openTicketsColumns}
            dataSource={stats.openTicketsThisMonth}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条未闭环问题`,
            }}
            rowClassName={() => 'bg-orange-50/30'}
          />
        )}
      </Card>

      <Card
        className="border-0 shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <span className="text-xl">⏰</span>
            <span className="font-bold">逾期未巡检点位</span>
            <Tag color="red" className="ml-2 animate-pulse">
              {stats.overduePoints.length} 个
            </Tag>
          </div>
        }
      >
        {stats.overduePoints.length === 0 ? (
          <Empty
            description="暂无逾期点位，继续保持！"
            className="py-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.overduePoints.map((point) => {
              const days = Math.abs(
                Math.ceil(
                  (new Date().getTime() -
                    new Date(point.nextInspectionDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              );
              return (
                <div
                  key={point.id}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getDeviceTypeIcon(point.deviceType)}
                      </span>
                      <div>
                        <div className="font-bold text-gray-800">
                          {point.area} - {point.deviceType}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {point.deviceNo}
                        </div>
                      </div>
                    </div>
                    <Tag color="red" className="animate-pulse">
                      逾期 {days} 天
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="text-gray-500">责任人：</span>
                      {point.personInCharge}
                    </div>
                    <div>
                      <span className="text-gray-500">应巡检日期：</span>
                      {point.nextInspectionDate}
                    </div>
                    <div>
                      <span className="text-gray-500">检查周期：</span>每{' '}
                      {point.inspectionCycle} 天
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StatisticsPage;
