import { useMemo } from 'react';
import { Card, Tabs, List, Tag, Space, Avatar, Empty, Spin, Alert } from 'antd';
import {
  RiseOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  FireOutlined,
  DollarOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useStore } from '@/store';
import {
  AREAS,
  MODELS,
  FAULT_TYPE_LABEL,
  HANDLERS,
  ARMREST_TYPE_LABEL,
  FREQUENCY_LABEL,
  FREQUENCY_WEIGHT,
} from '@/types';
import type { FaultType, Frequency } from '@/types';
import dayjs from 'dayjs';

export default function Statistics() {
  const { chairs, orders, loading, error } = useStore();

  const doneRepairs = useMemo(() => orders.filter((o) => o.repair), [orders]);
  const chairMap = useMemo(() => {
    const m: Record<string, { code: string; area: string; model: string }> = {};
    chairs.forEach((c) => (m[c.id] = { code: c.code, area: c.area, model: c.model }));
    return m;
  }, [chairs]);

  // 1) 按型号统计（维修次数、平均处理时长）
  const statsByModel = useMemo(() => {
    const map: Record<string, { orderCount: number; totalHours: number; cost: number; disableCount: number }> = {};
    MODELS.forEach((m) => (map[m] = { orderCount: 0, totalHours: 0, cost: 0, disableCount: 0 }));
    orders.forEach((o) => {
      const model = chairMap[o.chairId]?.model;
      if (model && map[model]) {
        map[model].orderCount += 1;
        if (o.repair) {
          const hours = dayjs(o.repair.finishedAt).diff(dayjs(o.repair.startedAt), 'hour', true);
          map[model].totalHours += hours;
          map[model].cost += o.repair.totalCost;
          if (o.repair.needDisable) map[model].disableCount += 1;
        }
      }
    });
    return MODELS.map((m) => ({
      model: m,
      orderCount: map[m].orderCount,
      avgHours: map[m].orderCount ? +(map[m].totalHours / map[m].orderCount).toFixed(1) : 0,
      cost: map[m].cost,
      disableCount: map[m].disableCount,
      chairCount: chairs.filter((c) => c.model === m).length,
    })).sort((a, b) => b.orderCount - a.orderCount);
  }, [orders, chairMap, chairs]);

  // 2) 按区域统计
  const statsByArea = useMemo(() => {
    return AREAS.map((area) => {
      const areaChairIds = chairs.filter((c) => c.area === area).map((c) => c.id);
      const areaOrders = orders.filter((o) => areaChairIds.includes(o.chairId));
      const areaDone = areaOrders.filter((o) => o.repair);
      const totalHours = areaDone.reduce(
        (s, o) => s + dayjs(o.repair!.finishedAt).diff(dayjs(o.repair!.startedAt), 'hour', true),
        0
      );
      return {
        area,
        chairCount: areaChairIds.length,
        orderCount: areaOrders.length,
        doneCount: areaDone.length,
        totalCost: areaDone.reduce((s, o) => s + o.repair!.totalCost, 0),
        avgHours: areaDone.length ? +(totalHours / areaDone.length).toFixed(1) : 0,
      };
    });
  }, [chairs, orders]);

  // 3) 高频故障椅 TOP 10
  const topChairs = useMemo(() => {
    const map: Record<string, { orders: typeof orders; weight: number; disableFlag: boolean }> = {};
    orders.forEach((o) => {
      if (!map[o.chairId]) map[o.chairId] = { orders: [], weight: 0, disableFlag: false };
      map[o.chairId].orders.push(o);
      map[o.chairId].weight += FREQUENCY_WEIGHT[o.frequency as Frequency] + 1;
      if (o.repair?.needDisable) map[o.chairId].disableFlag = true;
    });
    return Object.entries(map)
      .map(([chairId, info]) => {
        const c = chairMap[chairId];
        return {
          chairId,
          code: c?.code || chairId,
          area: c?.area,
          model: c?.model,
          orderCount: info.orders.length,
          weight: info.weight,
          disableFlag: info.disableFlag,
          faults: info.orders.flatMap((o) => o.faultTypes),
        };
      })
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 12);
  }, [orders, chairMap]);

  // 4) 故障类型分布
  const faultTypeDist = useMemo(() => {
    const map: Record<string, number> = {};
    (Object.keys(FAULT_TYPE_LABEL) as FaultType[]).forEach((k) => (map[k] = 0));
    orders.forEach((o) => o.faultTypes.forEach((f) => (map[f] += 1)));
    return Object.entries(map).map(([k, v]) => ({ name: FAULT_TYPE_LABEL[k as FaultType], value: v }));
  }, [orders]);

  // 5) 月度趋势
  const monthlyTrend = useMemo(() => {
    const map: Record<string, number> = {};
    const costMap: Record<string, number> = {};
    orders.forEach((o) => {
      const key = o.createdAt.slice(0, 7);
      map[key] = (map[key] || 0) + 1;
      if (o.repair) {
        costMap[key] = (costMap[key] || 0) + o.repair.totalCost;
      }
    });
    const keys = Object.keys(map).sort();
    return {
      months: keys,
      orders: keys.map((k) => map[k]),
      costs: keys.map((k) => costMap[k] || 0),
    };
  }, [orders]);

  // 6) 处理人绩效
  const handlerStats = useMemo(() => {
    return HANDLERS.map((h) => {
      const mine = doneRepairs.filter((o) => o.repair!.handler === h);
      const hours = mine.reduce(
        (s, o) => s + dayjs(o.repair!.finishedAt).diff(dayjs(o.repair!.startedAt), 'hour', true),
        0
      );
      return {
        handler: h,
        count: mine.length,
        avgHours: mine.length ? +(hours / mine.length).toFixed(1) : 0,
        totalCost: mine.reduce((s, o) => s + o.repair!.totalCost, 0),
        disableCount: mine.filter((o) => o.repair!.needDisable).length,
      };
    }).sort((a, b) => b.count - a.count);
  }, [doneRepairs]);

  // 7) 平均处理时长TOP型号（柱状图）
  const modelRankChart = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['维修次数', '平均处理时长(小时)'], top: 0 },
    grid: { left: 120, right: 60, top: 40, bottom: 30 },
    xAxis: [
      { type: 'value', name: '次数', position: 'bottom' },
      { type: 'value', name: '小时', position: 'top' },
    ],
    yAxis: {
      type: 'category',
      data: statsByModel.map((s) => s.model.replace(/^[^ ]+ /, '')),
    },
    series: [
      {
        name: '维修次数',
        type: 'bar',
        data: statsByModel.map((s) => s.orderCount),
        itemStyle: { color: '#0f766e', borderRadius: [0, 6, 6, 0] },
        barWidth: 14,
      },
      {
        name: '平均处理时长(小时)',
        type: 'bar',
        xAxisIndex: 1,
        data: statsByModel.map((s) => s.avgHours),
        itemStyle: { color: '#f59e0b', borderRadius: [0, 6, 6, 0] },
        barWidth: 14,
      },
    ],
  };

  const areaChart = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['椅子数', '工单数', '费用(¥)'], top: 0 },
    grid: { left: 40, right: 60, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: statsByArea.map((a) => a.area) },
    yAxis: [
      { type: 'value', name: '数量' },
      { type: 'value', name: '元' },
    ],
    series: [
      {
        name: '椅子数',
        type: 'bar',
        data: statsByArea.map((a) => a.chairCount),
        itemStyle: { color: '#94a3b8', borderRadius: [6, 6, 0, 0] },
        barGap: 0,
        barWidth: 14,
      },
      {
        name: '工单数',
        type: 'bar',
        data: statsByArea.map((a) => a.orderCount),
        itemStyle: { color: '#0f766e', borderRadius: [6, 6, 0, 0] },
        barWidth: 14,
      },
      {
        name: '费用(¥)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: statsByArea.map((a) => a.totalCost),
        itemStyle: { color: '#dc2626' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8,
      },
    ],
  };

  const faultPie = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, type: 'scroll' },
    series: [
      {
        name: '故障类型分布',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {c} ({d}%)' },
        data: faultTypeDist,
        color: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4'],
      },
    ],
  };

  const monthlyChart = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['工单数量', '维修费用'], top: 0 },
    grid: { left: 50, right: 60, top: 40, bottom: 30 },
    xAxis: { type: 'category', boundaryGap: false, data: monthlyTrend.months },
    yAxis: [
      { type: 'value', name: '数量' },
      { type: 'value', name: '元' },
    ],
    series: [
      {
        name: '工单数量',
        type: 'line',
        smooth: true,
        areaStyle: { color: 'rgba(15,118,110,0.15)' },
        data: monthlyTrend.orders,
        itemStyle: { color: '#0f766e' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 7,
      },
      {
        name: '维修费用',
        type: 'bar',
        yAxisIndex: 1,
        data: monthlyTrend.costs,
        itemStyle: { color: 'rgba(249,115,22,0.7)', borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
      },
    ],
  };

  const handlerChart = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['完成数量', '平均耗时(h)', '总费用(¥)'], top: 0 },
    grid: { left: 50, right: 60, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: handlerStats.map((h) => h.handler) },
    yAxis: [
      { type: 'value', name: '次/小时' },
      { type: 'value', name: '元' },
    ],
    series: [
      {
        name: '完成数量',
        type: 'bar',
        data: handlerStats.map((h) => h.count),
        itemStyle: { color: '#0f766e', borderRadius: [6, 6, 0, 0] },
        barGap: 0,
        barWidth: 14,
      },
      {
        name: '平均耗时(h)',
        type: 'bar',
        data: handlerStats.map((h) => h.avgHours),
        itemStyle: { color: '#06b6d4', borderRadius: [6, 6, 0, 0] },
        barWidth: 14,
      },
      {
        name: '总费用(¥)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: handlerStats.map((h) => h.totalCost),
        itemStyle: { color: '#dc2626' },
        lineStyle: { width: 3 },
      },
    ],
  };

  return (
    <div>
      {error && (
        <Alert type="error" message="数据加载失败" description={error} style={{ marginBottom: 20 }} showIcon />
      )}
      <Spin spinning={loading} tip="数据加载中...">
        <h2 className="page-header">统计分析</h2>
        <p className="page-subheader">
          从型号、区域、维修次数、处理时长等维度分析，辅助采购与运维决策。
        </p>

      <Space size={16} style={{ marginBottom: 20 }} wrap>
        <div className="stat-card" style={{ minWidth: 170 }}>
          <div className="label">总工单</div>
          <div className="value">{orders.length}</div>
          <div className="trend" style={{ color: '#059669' }}>
            完成率 {orders.length ? Math.round((doneRepairs.length / orders.length) * 100) : 0}%
          </div>
        </div>
        <div className="stat-card" style={{ minWidth: 170 }}>
          <div className="label">总维修费用</div>
          <div className="value" style={{ color: '#dc2626' }}>
            ¥{doneRepairs.reduce((s, o) => s + o.repair!.totalCost, 0).toLocaleString()}
          </div>
          <div className="trend" style={{ color: '#6b7280' }}>
            共 {doneRepairs.length} 次维修
          </div>
        </div>
        <div className="stat-card" style={{ minWidth: 170 }}>
          <div className="label">平均处理时长</div>
          <div className="value">
            {doneRepairs.length
              ? (
                  doneRepairs.reduce(
                    (s, o) => s + dayjs(o.repair!.finishedAt).diff(dayjs(o.repair!.startedAt), 'hour', true),
                    0
                  ) / doneRepairs.length
                ).toFixed(1)
              : 0}
            <span style={{ fontSize: 14, marginLeft: 4 }}>h</span>
          </div>
          <div className="trend" style={{ color: '#6b7280' }}>每单平均耗时</div>
        </div>
        <div className="stat-card" style={{ minWidth: 170 }}>
          <div className="label">高危椅子</div>
          <div className="value" style={{ color: '#dc2626' }}>
            {topChairs.filter((t) => t.weight >= 7).length}
          </div>
          <div className="trend" style={{ color: '#6b7280' }}>
            建议更换或大修
          </div>
        </div>
      </Space>

      <Tabs
        size="large"
        defaultActiveKey="model"
        items={[
          {
            key: 'model',
            label: (
              <span>
                <PartitionOutlined /> 按型号分析
              </span>
            ),
            children: (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <Card title="📊 型号维修次数与平均耗时对比" style={{ borderRadius: 12 }} bordered={false}>
                    <ReactECharts option={modelRankChart} style={{ height: 320 }} />
                  </Card>
                  <Card title="🍩 故障类型分布" style={{ borderRadius: 12 }} bordered={false}>
                    <ReactECharts option={faultPie} style={{ height: 320 }} />
                  </Card>
                </div>
                <Card title="📋 型号明细表" style={{ borderRadius: 12 }} bordered={false}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={thStyle}>排名</th>
                        <th style={thStyle}>型号</th>
                        <th style={thStyle}>椅子数</th>
                        <th style={thStyle}>维修次数</th>
                        <th style={thStyle}>故障/椅子比</th>
                        <th style={thStyle}>平均耗时</th>
                        <th style={thStyle}>累计费用</th>
                        <th style={thStyle}>需停用数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsByModel.map((s, i) => (
                        <tr key={s.model} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={tdStyle}>
                            <Tag color={i === 0 ? 'red' : i < 3 ? 'orange' : 'default'}>
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </Tag>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{s.model}</td>
                          <td style={tdStyle}>{s.chairCount}</td>
                          <td style={tdStyle}>
                            <Tag color={s.orderCount / s.chairCount > 0.8 ? 'red' : s.orderCount / s.chairCount > 0.4 ? 'orange' : 'green'}>
                              {s.orderCount} 次
                            </Tag>
                          </td>
                          <td style={tdStyle}>{s.chairCount ? Math.round((s.orderCount / s.chairCount) * 100) : 0}%</td>
                          <td style={tdStyle}>{s.avgHours} h</td>
                          <td style={{ ...tdStyle, color: '#dc2626', fontWeight: 600 }}>¥{s.cost}</td>
                          <td style={tdStyle}>{s.disableCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            ),
          },
          {
            key: 'area',
            label: (
              <span>
                <EnvironmentOutlined /> 按区域分析
              </span>
            ),
            children: (
              <div>
                <Card title="📈 各区域椅子、工单与费用" style={{ borderRadius: 12, marginBottom: 20 }} bordered={false}>
                  <ReactECharts option={areaChart} style={{ height: 340 }} />
                </Card>
                <Card title="📋 区域明细表" style={{ borderRadius: 12 }} bordered={false}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={thStyle}>区域</th>
                        <th style={thStyle}>椅子数</th>
                        <th style={thStyle}>工单数</th>
                        <th style={thStyle}>完成数</th>
                        <th style={thStyle}>完成率</th>
                        <th style={thStyle}>平均耗时</th>
                        <th style={thStyle}>累计费用</th>
                        <th style={thStyle}>单次均费</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsByArea.map((s) => (
                        <tr key={s.area} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{s.area}</td>
                          <td style={tdStyle}>{s.chairCount}</td>
                          <td style={tdStyle}><Tag color={s.orderCount / s.chairCount > 0.8 ? 'red' : s.orderCount / s.chairCount > 0.4 ? 'orange' : 'blue'}>{s.orderCount}</Tag></td>
                          <td style={tdStyle}>{s.doneCount}</td>
                          <td style={tdStyle}>{s.orderCount ? Math.round((s.doneCount / s.orderCount) * 100) : 0}%</td>
                          <td style={tdStyle}>{s.avgHours} h</td>
                          <td style={{ ...tdStyle, color: '#dc2626', fontWeight: 600 }}>¥{s.totalCost}</td>
                          <td style={tdStyle}>¥{s.doneCount ? Math.round(s.totalCost / s.doneCount) : 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            ),
          },
          {
            key: 'trend',
            label: (
              <span>
                <RiseOutlined /> 时间趋势
              </span>
            ),
            children: (
              <Card title="📅 月度工单与费用趋势" style={{ borderRadius: 12 }} bordered={false}>
                <ReactECharts option={monthlyChart} style={{ height: 380 }} />
              </Card>
            ),
          },
          {
            key: 'handler',
            label: (
              <span>
                <ToolOutlined /> 处理人绩效
              </span>
            ),
            children: (
              <div>
                <Card title="👷 处理人完成量与耗时对比" style={{ borderRadius: 12, marginBottom: 20 }} bordered={false}>
                  <ReactECharts option={handlerChart} style={{ height: 340 }} />
                </Card>
                <Card title="📋 处理人绩效表" style={{ borderRadius: 12 }} bordered={false}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={thStyle}>排名</th>
                        <th style={thStyle}>处理人</th>
                        <th style={thStyle}>完成维修</th>
                        <th style={thStyle}>平均耗时</th>
                        <th style={thStyle}>累计费用</th>
                        <th style={thStyle}>涉及停用</th>
                      </tr>
                    </thead>
                    <tbody>
                      {handlerStats.map((h, i) => (
                        <tr key={h.handler} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={tdStyle}>
                            <Tag color={i === 0 ? 'gold' : i < 3 ? 'blue' : 'default'}>
                              {i === 0 ? '🏆' : `#${i + 1}`}
                            </Tag>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>🧰 {h.handler}</td>
                          <td style={tdStyle}>{h.count} 单</td>
                          <td style={tdStyle}>{h.avgHours} h</td>
                          <td style={{ ...tdStyle, color: '#dc2626', fontWeight: 600 }}>¥{h.totalCost}</td>
                          <td style={tdStyle}>{h.disableCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            ),
          },
          {
            key: 'top',
            label: (
              <span>
                <FireOutlined /> 高频故障椅 TOP
              </span>
            ),
            children: (
              <Card title="🔥 最高频故障椅子（按频率加权）" style={{ borderRadius: 12 }} bordered={false}>
                {topChairs.length === 0 ? (
                  <Empty description="暂无数据" />
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={topChairs}
                    renderItem={(c, i) => {
                      const faultCounter: Record<string, number> = {};
                      c.faults.forEach((f) => (faultCounter[f] = (faultCounter[f] || 0) + 1));
                      const topFault = Object.entries(faultCounter).sort((a, b) => b[1] - a[1])[0];
                      return (
                        <List.Item
                          style={{
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 10,
                            background: i < 3 ? 'linear-gradient(90deg, #fef2f2 0%, #fff 40%)' : '#fafafa',
                          }}
                          actions={[
                            <Tag key="count" color="red">
                              维修 {c.orderCount} 次
                            </Tag>,
                            <Tag key="weight" color={c.weight > 7 ? 'red' : c.weight > 4 ? 'orange' : 'blue'}>
                              加权 {c.weight}
                            </Tag>,
                            c.disableFlag ? <Tag key="dis" color="red">有停用记录</Tag> : null,
                          ].filter(Boolean)}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                size={48}
                                style={{
                                  background: i === 0 ? '#dc2626' : i === 1 ? '#f97316' : i === 2 ? '#f59e0b' : '#0f766e',
                                  fontWeight: 700,
                                  fontSize: 16,
                                }}
                              >
                                {i + 1}
                              </Avatar>
                            }
                            title={
                              <Space>
                                <Tag color="teal" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
                                  {c.code}
                                </Tag>
                                <b>{c.model}</b>
                                <span style={{ color: '#6b7280', fontSize: 12 }}>{c.area}</span>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" size={4} style={{ marginTop: 4 }}>
                                <Space wrap>
                                  {Object.entries(faultCounter).slice(0, 5).map(([f, n]) => (
                                    <Tag key={f} color={n >= 2 ? 'volcano' : 'default'}>
                                      {FAULT_TYPE_LABEL[f as FaultType]} × {n}
                                    </Tag>
                                  ))}
                                </Space>
                                {topFault && (
                                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                                    最典型故障：<b>{FAULT_TYPE_LABEL[topFault[0] as FaultType]}</b> 出现 {topFault[1]} 次，建议
                                    {topFault[1] >= 3 ? '整椅更换或大修' : '定期关注'}
                                  </span>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                )}
              </Card>
            ),
          },
        ]}
      />
      </Spin>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#374151',
  fontSize: 13,
  borderBottom: '2px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  color: '#374151',
};

// 避免未使用的import警告
void ARMREST_TYPE_LABEL;
void FREQUENCY_LABEL;
void ClockCircleOutlined;
void DollarOutlined;
