import { useMemo } from 'react';
import { Card, List, Tag, Space, Avatar, Progress, Button, Divider, Empty, Spin, Alert } from 'antd';
import {
  AlertOutlined,
  RiseOutlined,
  ToolOutlined,
  DollarOutlined,
  FireOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import {
  FAULT_TYPE_LABEL,
  FREQUENCY_LABEL,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  FREQUENCY_WEIGHT,
  HANDLERS,
} from '@/types';
import type { FaultType, Frequency } from '@/types';
import dayjs from 'dayjs';

export default function Dashboard() {
  const { chairs, orders, loading, error } = useStore();
  const navigate = useNavigate();
  const doneRepairs = orders.filter((o) => o.repair);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending');
    const repairing = orders.filter((o) => o.status === 'repairing');
    const totalCost = doneRepairs.reduce((s, o) => s + (o.repair?.totalCost || 0), 0);
    const totalHours = doneRepairs.reduce(
      (s, o) => s + dayjs(o.repair!.finishedAt).diff(dayjs(o.repair!.startedAt), 'hour', true),
      0
    );
    const disabled = chairs.filter((c) => c.disabled).length;
    const highRiskCount = chairs.filter((c) => {
      const cos = orders.filter((o) => o.chairId === c.id);
      const w = cos.reduce((s, o) => s + FREQUENCY_WEIGHT[o.frequency as Frequency] + 1, 0);
      return w >= 7;
    }).length;
    return {
      pending: pending.length,
      repairing: repairing.length,
      done: doneRepairs.length,
      totalCost,
      avgHours: doneRepairs.length ? totalHours / doneRepairs.length : 0,
      chairCount: chairs.length,
      disabled,
      highRiskCount,
      closeRate: orders.length ? Math.round((doneRepairs.length / orders.length) * 100) : 0,
    };
  }, [orders, chairs, doneRepairs]);

  const pendingList = useMemo(
    () =>
      [...orders]
        .filter((o) => o.status === 'pending' || o.status === 'repairing')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8),
    [orders]
  );

  const highRiskChairs = useMemo(() => {
    const map: Record<string, { orders: typeof orders; weight: number }> = {};
    orders.forEach((o) => {
      if (!map[o.chairId]) map[o.chairId] = { orders: [], weight: 0 };
      map[o.chairId].orders.push(o);
      map[o.chairId].weight += FREQUENCY_WEIGHT[o.frequency as Frequency] + 1;
    });
    const chairMap: Record<string, { code: string; area: string; model: string }> = {};
    chairs.forEach((c) => (chairMap[c.id] = { code: c.code, area: c.area, model: c.model }));
    return Object.entries(map)
      .map(([chairId, info]) => ({
        chairId,
        code: chairMap[chairId]?.code || chairId,
        area: chairMap[chairId]?.area,
        model: chairMap[chairId]?.model,
        orderCount: info.orders.length,
        weight: info.weight,
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
  }, [orders, chairs]);

  const handlerLoad = useMemo(() => {
    return HANDLERS.map((h) => {
      const assigned = orders.filter((o) => o.assignee === h && (o.status === 'pending' || o.status === 'repairing'));
      const done = doneRepairs.filter((o) => o.repair?.handler === h).length;
      return {
        handler: h,
        loading: assigned.length,
        done,
      };
    });
  }, [orders, doneRepairs]);

  const lastMonthTrend = useMemo(() => {
    // 取最近6个月
    const months: string[] = [];
    const counts: number[] = [];
    const costs: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = dayjs().subtract(i, 'month');
      const key = d.format('YYYY-MM');
      months.push(key);
      const monthOrders = orders.filter((o) => o.createdAt.startsWith(key));
      counts.push(monthOrders.length);
      costs.push(monthOrders.reduce((s, o) => s + (o.repair?.totalCost || 0), 0));
    }
    return { months, counts, costs };
  }, [orders]);

  const faultChart = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, type: 'scroll', textStyle: { fontSize: 11 } },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: (Object.keys(FAULT_TYPE_LABEL) as FaultType[]).map((k) => ({
          value: orders.filter((o) => o.faultTypes.includes(k)).length,
          name: FAULT_TYPE_LABEL[k],
        })),
        color: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4'],
      },
    ],
  };

  const trendChart = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['工单数', '费用'], top: 0, right: 0 },
    grid: { left: 40, right: 40, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: lastMonthTrend.months,
      axisLabel: { fontSize: 11 },
    },
    yAxis: [
      { type: 'value', axisLabel: { fontSize: 11 } },
      { type: 'value', axisLabel: { fontSize: 11 } },
    ],
    series: [
      {
        name: '工单数',
        type: 'line',
        smooth: true,
        data: lastMonthTrend.counts,
        areaStyle: { color: 'rgba(15,118,110,0.15)' },
        itemStyle: { color: '#0f766e' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 7,
      },
      {
        name: '费用',
        type: 'bar',
        yAxisIndex: 1,
        data: lastMonthTrend.costs,
        itemStyle: { color: 'rgba(249,115,22,0.7)', borderRadius: [4, 4, 0, 0] },
        barWidth: 18,
      },
    ],
  };

  return (
    <div>
      {error && (
        <Alert
          type="error"
          message="数据加载失败"
          description={error}
          style={{ marginBottom: 20 }}
          showIcon
        />
      )}
      <Spin spinning={loading} tip="数据加载中...">
        <h2 className="page-header">工作台总览</h2>
        <p className="page-subheader">欢迎回来！这是今日工学椅运维情况的整体概览。</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="label">
            <Space><AlertOutlined style={{ color: '#f59e0b' }} />待处理工单</Space>
          </div>
          <div className="value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
          <div className="trend" style={{ color: '#6b7280' }}>
            <Space>维修中 {stats.repairing} 单</Space>
            <Button
              type="link"
              size="small"
              style={{ padding: 0 }}
              onClick={() => navigate('/orders')}
            >
              去处理 <ArrowRightOutlined />
            </Button>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #059669' }}>
          <div className="label">
            <Space><SafetyCertificateOutlined style={{ color: '#059669' }} />累计完成</Space>
          </div>
          <div className="value" style={{ color: '#059669' }}>{stats.done}</div>
          <div className="trend" style={{ color: '#6b7280' }}>
            完成率 {stats.closeRate}%
            <Progress
              percent={stats.closeRate}
              size="small"
              showInfo={false}
              style={{ width: 80, marginTop: 6 }}
              strokeColor="#10b981"
            />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
          <div className="label">
            <Space><DollarOutlined style={{ color: '#dc2626' }} />累计维修费用</Space>
          </div>
          <div className="value" style={{ color: '#dc2626' }}>¥{stats.totalCost.toLocaleString()}</div>
          <div className="trend" style={{ color: '#6b7280' }}>
            平均 {stats.done ? `¥${Math.round(stats.totalCost / stats.done)}` : 0}/单
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
          <div className="label">
            <Space><FireOutlined style={{ color: '#0ea5e9' }} />高危椅子</Space>
          </div>
          <div className="value" style={{ color: '#0ea5e9' }}>{stats.highRiskCount}</div>
          <div className="trend" style={{ color: '#6b7280' }}>
            建议重点关注 · 停用中 {stats.disabled} 把
            <Button
              type="link"
              size="small"
              style={{ padding: 0 }}
              onClick={() => navigate('/seatmap')}
            >
              查看座位图 <ArrowRightOutlined />
            </Button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card
          title={
            <Space>
              <RiseOutlined style={{ color: '#0f766e' }} />
              近半年工单与费用趋势
            </Space>
          }
          style={{ borderRadius: 12 }}
          bordered={false}
          extra={
            <Button type="link" size="small" onClick={() => navigate('/statistics?tab=trend')}>
              完整分析 <ArrowRightOutlined />
            </Button>
          }
        >
          <ReactECharts option={trendChart} style={{ height: 280 }} />
        </Card>
        <Card
          title={
            <Space>
              <ToolOutlined style={{ color: '#0f766e' }} />
              故障类型分布
            </Space>
          }
          style={{ borderRadius: 12 }}
          bordered={false}
        >
          <ReactECharts option={faultChart} style={{ height: 280 }} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 20 }}>
        <Card
          title={
            <Space>
              <ClockCircleOutlined style={{ color: '#f59e0b' }} />
              待处理 / 维修中 TOP
            </Space>
          }
          style={{ borderRadius: 12 }}
          bordered={false}
          extra={
            <Button type="link" size="small" onClick={() => navigate('/orders')}>
              全部工单 <ArrowRightOutlined />
            </Button>
          }
          bodyStyle={{ padding: 0 }}
        >
          {pendingList.length === 0 ? (
            <Empty description="全部处理完成 🎉" style={{ padding: 40 }} />
          ) : (
            <List
              size="small"
              dataSource={pendingList}
              renderItem={(o) => {
                const c = chairs.find((x) => x.id === o.chairId);
                return (
                  <List.Item
                    style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}
                    onClick={() => navigate('/orders')}
                  >
                    <List.Item.Meta
                      avatar={
                        <Tag color={o.status === 'pending' ? 'orange' : 'blue'} style={{ margin: 0 }}>
                          {ORDER_STATUS_LABEL[o.status]}
                        </Tag>
                      }
                      title={
                        <Space>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6b7280' }}>
                            {o.id}
                          </span>
                          <Tag color="teal">{c?.code}</Tag>
                          {o.assignee && <span style={{ fontSize: 12, color: '#6b7280' }}>🧰 {o.assignee}</span>}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={2} style={{ marginTop: 2 }}>
                          <Space wrap size={3}>
                            {o.faultTypes.map((f) => (
                              <Tag color="volcano" key={f} style={{ fontSize: 11 }}>
                                {FAULT_TYPE_LABEL[f]}
                              </Tag>
                            ))}
                            <Tag
                              color={
                                o.frequency === 'always' || o.frequency === 'frequent' ? 'red' : 'default'
                              }
                              style={{ fontSize: 11 }}
                            >
                              {FREQUENCY_LABEL[o.frequency as Frequency]}
                            </Tag>
                          </Space>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            {o.reporter} · {o.createdAt}
                          </span>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        <Card
          title={
            <Space>
              <FireOutlined style={{ color: '#ef4444' }} />
              高频故障椅子
            </Space>
          }
          style={{ borderRadius: 12 }}
          bordered={false}
          extra={
            <Button type="link" size="small" onClick={() => navigate('/statistics?tab=top')}>
              TOP榜单 <ArrowRightOutlined />
            </Button>
          }
        >
          {highRiskChairs.length === 0 ? (
            <Empty description="暂无" style={{ padding: 20 }} />
          ) : (
            <List
              size="small"
              dataSource={highRiskChairs}
              renderItem={(c, i) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={32}
                        style={{
                          background: i === 0 ? '#dc2626' : i === 1 ? '#f97316' : '#f59e0b',
                          fontWeight: 700,
                        }}
                      >
                        {i + 1}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <Tag color="teal" style={{ fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
                          {c.code}
                        </Tag>
                        <span style={{ fontSize: 12 }}>{c.area}</span>
                      </Space>
                    }
                    description={
                      <Space style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          维修{c.orderCount}次 · 加权{c.weight}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        <Card
          title={
            <Space>
              <TeamOutlined style={{ color: '#0f766e' }} />
              维修组负荷
            </Space>
          }
          style={{ borderRadius: 12 }}
          bordered={false}
        >
          {handlerLoad.map((h, i) => (
            <div key={h.handler} style={{ marginBottom: i === handlerLoad.length - 1 ? 0 : 14 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  fontSize: 13,
                }}
              >
                <span>🧰 {h.handler}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <Tag color={h.loading > 3 ? 'red' : h.loading > 1 ? 'orange' : 'green'}>
                    在办 {h.loading}
                  </Tag>
                  <span style={{ color: '#6b7280' }}> 已结{h.done}</span>
                </span>
              </div>
              <Progress
                percent={Math.min(100, h.loading * 20)}
                showInfo={false}
                size="small"
                strokeColor={h.loading > 3 ? '#ef4444' : h.loading > 1 ? '#f59e0b' : '#10b981'}
                trailColor="#f3f4f6"
              />
            </div>
          ))}
          <Divider style={{ margin: '16px 0 12px' }} />
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            平均处理时长 <b style={{ color: '#0f766e' }}>{stats.avgHours.toFixed(1)} 小时/单</b>
            <br />
            椅子总数 <b>{stats.chairCount}</b> 把 · 停用 <b style={{ color: '#dc2626' }}>{stats.disabled}</b> 把
          </div>
        </Card>
      </div>
      </Spin>
    </div>
  );
}
