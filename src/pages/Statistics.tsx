import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Tabs,
  Radio,
  Select,
  Space,
  Progress,
  Button,
  Tooltip,
  Empty,
  Spin,
  App,
} from 'antd';
import {
  FireOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useStore } from '../store/useStore';
import type { Ingredient, PurchaseSuggestion } from '../types';
import type { DiscardStat, ExpiringSoonItem, DailyUsageItem } from '../api/stats';
import { formatDate } from '../utils/dateUtils';

const COLORS = ['#fa8c16', '#1677ff', '#52c41a', '#722ed1', '#13c2c2', '#eb2f96', '#faad14', '#2f54eb'];

function Statistics() {
  const { message: msg } = App.useApp();
  const ingredients = useStore((s) => s.ingredients);
  const openRecords = useStore((s) => s.openRecords);
  const usageRecords = useStore((s) => s.usageRecords);

  const getDiscardStats = useStore((s) => s.getDiscardStats);
  const getExpiringSoon = useStore((s) => s.getExpiringSoon);
  const getDailyUsage = useStore((s) => s.getDailyUsage);
  const getPurchaseSuggestions = useStore((s) => s.getPurchaseSuggestions);
  const getIngredientLoss = useStore((s) => s.getIngredientLoss);

  const [chartRange, setChartRange] = useState<7 | 14 | 30>(14);
  const [activeTab, setActiveTab] = useState('loss');

  const [discardStats, setDiscardStats] = useState<DiscardStat[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<ExpiringSoonItem[]>([]);
  const [dailyUsages, setDailyUsages] = useState<DailyUsageItem[]>([]);
  const [suggestions, setSuggestions] = useState<PurchaseSuggestion[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [expiryStatusFilter, setExpiryStatusFilter] = useState<'all' | 'expired' | '1day' | '3days' | '7days'>('all');
  const [expiryFreezerFilter, setExpiryFreezerFilter] = useState<string>('all');
  const [purchaseUrgencyFilter, setPurchaseUrgencyFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    const loadAll = async () => {
      try {
        setStatsLoading(true);
        const [ds, es, du, ps] = await Promise.all([
          getDiscardStats(),
          getExpiringSoon(7),
          getDailyUsage(chartRange),
          getPurchaseSuggestions(),
        ]);
        setDiscardStats(ds);
        setExpiringSoon(es);
        setDailyUsages(du as unknown as DailyUsageItem[]);
        setSuggestions(ps);
      } catch (e: unknown) {
        const err = e as Error;
        console.error('Failed to load statistics:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    loadAll();
  }, [getDiscardStats, getExpiringSoon, getDailyUsage, getPurchaseSuggestions, chartRange]);

  // Discarded total
  const discardedRecords = openRecords.filter((r) => r.isDiscarded);
  const totalDiscardedWeight = discardedRecords.reduce(
    (s, r) => {
      void ingredients.find((i) => i.id === r.ingredientId);
      return s + r.remainingWeight;
    },
    0
  );
  const totalOpenedWeight = openRecords.reduce(
    (s, r) => {
      const used = usageRecords
        .filter((u) => u.openRecordId === r.id)
        .reduce((sum, u) => sum + u.amount, 0);
      return s + used + r.remainingWeight;
    },
    0
  );
  const overallLossRate = totalOpenedWeight > 0 ? (totalDiscardedWeight / totalOpenedWeight) * 100 : 0;

  // Daily usage chart data
  const usageChartData = useMemo(() => {
    if (dailyUsages.length === 0) return [];
    const dateMap = new Map<string, Record<string, number | string>>();
    const ingredientTotals = new Map<string, number>();
    dailyUsages.forEach((u) => {
      const current = ingredientTotals.get(u.ingredientId) || 0;
      ingredientTotals.set(u.ingredientId, current + u.totalUsed);
    });
    const topIngredients = Array.from(ingredientTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);
    const topIngredientNames = new Map(
      topIngredients.map((id) => {
        const ing = ingredients.find((i) => i.id === id);
        return [id, ing?.name || id];
      })
    );

    dailyUsages.forEach((u) => {
      if (!topIngredients.includes(u.ingredientId)) return;
      const key = u.date;
      const current = (dateMap.get(key) || { date: key }) as Record<string, number | string>;
      const name = topIngredientNames.get(u.ingredientId) || u.ingredientName;
      current[name] = (current[name] as number || 0) + u.totalUsed;
      dateMap.set(key, current);
    });

    return Array.from(dateMap.values()).sort((a, b) => (a.date as string).localeCompare(b.date as string));
  }, [dailyUsages, ingredients]);

  // Loss rate per ingredient
  const ingredientLossData = useMemo(() => {
    return ingredients
      .map((ing) => ({
        ...getIngredientLoss(ing.id),
        name: ing.name,
        id: ing.id,
      }))
      .sort((a, b) => b.lossRate - a.lossRate)
      .slice(0, 10);
  }, [ingredients, getIngredientLoss]);

  // Loss rate chart data
  const lossChartData = ingredientLossData.map((d) => ({
    name: d.name,
    '损耗率(%)': d.lossRate,
    '报废量': d.totalDiscarded,
  }));

  // Freezer location options from expiring soon data
  const freezerOptions = useMemo(() => {
    const locations = new Set(expiringSoon.map((e) => e.freezerLocation));
    return Array.from(locations).sort();
  }, [expiringSoon]);

  // Filtered expiring soon list
  const filteredExpiringSoon = useMemo(() => {
    return expiringSoon.filter((e) => {
      const statusMatch =
        expiryStatusFilter === 'all'
          ? true
          : expiryStatusFilter === 'expired'
          ? e.daysLeft < 0
          : expiryStatusFilter === '1day'
          ? e.daysLeft >= 0 && e.daysLeft <= 1
          : expiryStatusFilter === '3days'
          ? e.daysLeft > 1 && e.daysLeft <= 3
          : e.daysLeft > 3 && e.daysLeft <= 7;

      const freezerMatch = expiryFreezerFilter === 'all' ? true : e.freezerLocation === expiryFreezerFilter;

      return statusMatch && freezerMatch;
    });
  }, [expiringSoon, expiryStatusFilter, expiryFreezerFilter]);

  // Filtered purchase suggestions list
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      return purchaseUrgencyFilter === 'all' ? true : s.urgency === purchaseUrgencyFilter;
    });
  }, [suggestions, purchaseUrgencyFilter]);

  // Suggestions grouped by urgency
  const highSuggestions = suggestions.filter((s) => s.urgency === 'high');
  const mediumSuggestions = suggestions.filter((s) => s.urgency === 'medium');

  const getUrgencyTag = (urgency: PurchaseSuggestion['urgency']) => {
    if (urgency === 'high') return <Tag color="red" icon={<FireOutlined />}>紧急</Tag>;
    if (urgency === 'medium') return <Tag color="orange">建议采购</Tag>;
    return <Tag color="green">库存充足</Tag>;
  };

  const purchaseColumns = [
    {
      title: '原料',
      key: 'name',
      width: 140,
      render: (_: unknown, r: PurchaseSuggestion) => (
        <Space direction="vertical" size={0}>
          <strong>{r.ingredientName}</strong>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>{r.brand}</span>
        </Space>
      ),
    },
    {
      title: '紧急度',
      key: 'urgency',
      width: 110,
      render: (_: unknown, r: PurchaseSuggestion) => getUrgencyTag(r.urgency),
    },
    {
      title: '当前库存',
      key: 'stock',
      width: 120,
      render: (_: unknown, r: PurchaseSuggestion) => (
        <span style={{ color: r.currentStock <= 0 ? '#cf1322' : '#262626', fontWeight: 600 }}>
          {r.currentStock}
          {r.unit}
        </span>
      ),
      sorter: (a: PurchaseSuggestion, b: PurchaseSuggestion) => a.currentStock - b.currentStock,
    },
    {
      title: '日均用量',
      key: 'avg',
      width: 120,
      render: (_: unknown, r: PurchaseSuggestion) =>
        `${r.avgDailyUsage}${r.unit}/天`,
    },
    {
      title: '可用天数',
      key: 'daysLeft',
      width: 110,
      render: (_: unknown, r: PurchaseSuggestion) => {
        const text = r.daysLeft >= 999 ? '∞' : `${r.daysLeft} 天`;
        return (
          <span style={{ color: r.daysLeft <= 3 ? '#cf1322' : r.daysLeft <= 7 ? '#faad14' : '#389e0d', fontWeight: 500 }}>
            {text}
          </span>
        );
      },
      sorter: (a: PurchaseSuggestion, b: PurchaseSuggestion) => a.daysLeft - b.daysLeft,
    },
    {
      title: '建议采购量',
      key: 'suggest',
      width: 140,
      render: (_: unknown, r: PurchaseSuggestion) => (
        <Tag color="orange" style={{ margin: 0 }}>
          <ShoppingCartOutlined /> {r.suggestedQuantity}
          {r.unit}
        </Tag>
      ),
    },
  ];

  const exportPurchase = () => {
    const lines = ['原料名称,品牌,紧急度,当前库存,日均用量,可用天数,建议采购量'];
    filteredSuggestions.forEach((s) => {
      const urgencyText = s.urgency === 'high' ? '紧急' : s.urgency === 'medium' ? '建议' : '充足';
      const daysText = s.daysLeft >= 999 ? '充足' : s.daysLeft.toString();
      lines.push(
        `${s.ingredientName},${s.brand},${urgencyText},${s.currentStock}${s.unit},${s.avgDailyUsage}${s.unit}/天,${daysText}天,${s.suggestedQuantity}${s.unit}`
      );
    });
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filterSuffix =
      purchaseUrgencyFilter !== 'all'
        ? `_${purchaseUrgencyFilter === 'high' ? '紧急' : purchaseUrgencyFilter === 'medium' ? '建议采购' : '库存充足'}`
        : '';
    a.download = `采购建议${filterSuffix}_${formatDate(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    msg.success(`已导出 ${filteredSuggestions.length} 条采购建议`);
  };

  const expiryColumns = [
    {
      title: '原料',
      key: 'name',
      width: 140,
      render: (_: unknown, r: ExpiringSoonItem) => (
        <Space direction="vertical" size={0}>
          <strong>{r.ingredient.name}</strong>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>{r.ingredient.brand}</span>
        </Space>
      ),
    },
    {
      title: '批次',
      key: 'batch',
      dataIndex: ['ingredient', 'batch'],
      width: 120,
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      render: (_: unknown, r: ExpiringSoonItem) => {
        if (r.daysLeft < 0)
          return <span className="expiry-tag-danger">超期 {Math.abs(r.daysLeft)} 天</span>;
        if (r.daysLeft <= 1) return <span className="expiry-tag-warning">剩余 {r.daysLeft} 天</span>;
        return <span className="expiry-tag-normal">剩余 {r.daysLeft} 天</span>;
      },
    },
    {
      title: '开封日期',
      key: 'openDate',
      dataIndex: 'openDate',
      width: 120,
      render: (d: string) => formatDate(d),
    },
    {
      title: '开封后可用',
      key: 'openedDays',
      width: 110,
      render: (_: unknown, r: ExpiringSoonItem) => `${r.ingredient.openedDays} 天`,
    },
    {
      title: '剩余量',
      key: 'remaining',
      width: 100,
      render: (_: unknown, r: ExpiringSoonItem) => (
        <span>
          {r.remainingWeight}
          {r.ingredient.unit}
        </span>
      ),
    },
    {
      title: '存放位置',
      dataIndex: 'freezerLocation',
      key: 'location',
      width: 110,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
    },
  ];

  const withLoading = (content: React.ReactNode, extraPadding = false) =>
    statsLoading ? (
      <div style={{ textAlign: 'center', padding: extraPadding ? '80px 0' : '40px 0' }}>
        <Spin />
      </div>
    ) : (
      content
    );

  return (
    <div>
      {/* Summary */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="整体损耗率"
              value={overallLossRate.toFixed(2)}
              suffix="%"
              valueStyle={{ color: overallLossRate > 15 ? '#cf1322' : '#389e0d' }}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="报废次数"
              value={discardedRecords.length}
              suffix="次"
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="紧急采购"
              value={highSuggestions.length}
              suffix="项"
              valueStyle={{ color: '#cf1322' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="临期原料"
              value={expiringSoon.length}
              suffix="项"
              valueStyle={{ color: '#faad14' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'loss',
            label: '损耗与报废分析',
          },
          {
            key: 'usage',
            label: '用量趋势',
          },
          {
            key: 'expiry',
            label: '临期清单',
          },
          {
            key: 'purchase',
            label: '采购建议',
          },
        ]}
      />

      {activeTab === 'loss' && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card
              className="table-card"
              title={
                <span>
                  报废原因分布
                  <Tooltip title="统计所有报废记录的原因分类及占比">
                    <InfoCircleOutlined style={{ marginLeft: 8, color: '#8c8c8c' }} />
                  </Tooltip>
                </span>
              }
            >
              {withLoading(
                discardStats.length === 0 ? (
                  <Empty description="暂无报废数据" style={{ padding: '40px 0' }} />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={discardStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ reason, percent }) => `${reason} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="reason"
                        >
                          {discardStats.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                      {discardStats.map((s, i) => (
                        <Col span={12} key={s.reason}>
                          <div
                            style={{
                              padding: 8,
                              borderRadius: 6,
                              background: '#fafafa',
                              borderLeft: `4px solid ${COLORS[i % COLORS.length]}`,
                            }}
                          >
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{s.reason}</div>
                            <div style={{ fontWeight: 600 }}>
                              {s.count} 次 · {s.weight} 单位
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </>
                )
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card
              className="table-card"
              title={
                <span>
                  原料损耗率排行 (Top 10)
                  <Tooltip title="按各原料的报废量占总量百分比降序排列">
                    <InfoCircleOutlined style={{ marginLeft: 8, color: '#8c8c8c' }} />
                  </Tooltip>
                </span>
              }
            >
              {withLoading(
                ingredientLossData.every((d) => d.lossRate === 0) ? (
                  <Empty description="暂无损耗数据" style={{ padding: '40px 0' }} />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={lossChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" unit="%" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="损耗率(%)" fill="#fa8c16" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 16 }}>
                      {ingredientLossData.map((d) => (
                        <div
                          key={d.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          <span>{d.name}</span>
                          <Space>
                            <Progress
                              percent={Math.min(d.lossRate, 100)}
                              size="small"
                              showInfo={false}
                              style={{ width: 100 }}
                              strokeColor={d.lossRate > 20 ? '#cf1322' : d.lossRate > 10 ? '#faad14' : '#52c41a'}
                            />
                            <span
                              style={{
                                color: d.lossRate > 20 ? '#cf1322' : d.lossRate > 10 ? '#faad14' : '#389e0d',
                                fontWeight: 600,
                                width: 70,
                                textAlign: 'right',
                              }}
                            >
                              {d.lossRate}% ({d.totalDiscarded})
                            </span>
                          </Space>
                        </div>
                      ))}
                    </div>
                  </>
                )
              )}
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === 'usage' && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              className="table-card"
              title={
                <Space>
                  <span>原料用量趋势图（Top 5 原料）</span>
                  <Radio.Group
                    value={chartRange}
                    onChange={(e) => setChartRange(e.target.value)}
                    size="small"
                    optionType="button"
                  >
                    <Radio.Button value={7}>近 7 天</Radio.Button>
                    <Radio.Button value={14}>近 14 天</Radio.Button>
                    <Radio.Button value={30}>近 30 天</Radio.Button>
                  </Radio.Group>
                </Space>
              }
            >
              {withLoading(
                usageChartData.length === 0 ? (
                  <Empty description="暂无用量数据" style={{ padding: '80px 0' }} />
                ) : (
                  <ResponsiveContainer width="100%" height={380}>
                    <LineChart data={usageChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      {Array.from(
                        new Set(usageChartData.flatMap((d) => Object.keys(d).filter((k) => k !== 'date')))
                      ).map((name, idx) => (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={COLORS[idx % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ),
                true
              )}
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === 'expiry' && (
        <div className="table-card" style={{ marginTop: 16 }}>
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <Space wrap>
              <Tag color="red">已超期 {expiringSoon.filter((e) => e.daysLeft < 0).length}</Tag>
              <Tag color="orange">1天内 {expiringSoon.filter((e) => e.daysLeft >= 0 && e.daysLeft <= 1).length}</Tag>
              <Tag color="gold">3天内 {expiringSoon.filter((e) => e.daysLeft > 1 && e.daysLeft <= 3).length}</Tag>
              <Tag color="green">7天内 {expiringSoon.filter((e) => e.daysLeft > 3).length}</Tag>
            </Space>
            <Space>
              <Select
                value={expiryStatusFilter}
                onChange={setExpiryStatusFilter}
                style={{ width: 140 }}
                size="small"
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'expired', label: '已超期' },
                  { value: '1day', label: '1天内到期' },
                  { value: '3days', label: '3天内到期' },
                  { value: '7days', label: '7天内到期' },
                ]}
              />
              <Select
                value={expiryFreezerFilter}
                onChange={setExpiryFreezerFilter}
                style={{ width: 160 }}
                size="small"
                placeholder="选择冰柜"
                options={[
                  { value: 'all', label: '全部冰柜' },
                  ...freezerOptions.map((loc) => ({ value: loc, label: `❄️ ${loc}` })),
                ]}
              />
            </Space>
          </div>
          {withLoading(
            filteredExpiringSoon.length === 0 ? (
              <Empty
                description={expiryStatusFilter === 'all' && expiryFreezerFilter === 'all' ? '✅ 未来 7 天内没有临期原料' : '没有符合筛选条件的记录'}
                style={{ padding: '60px 0' }}
              />
            ) : (
              <Table
                columns={expiryColumns}
                dataSource={filteredExpiringSoon}
                rowKey="id"
                pagination={{
                  pageSize: 15,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条临期记录`,
                }}
              />
            ),
            true
          )}
        </div>
      )}

      {activeTab === 'purchase' && (
        <div className="table-card" style={{ marginTop: 16 }}>
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <Space wrap>
              <Tag color="red" icon={<FireOutlined />}>
                紧急 {highSuggestions.length}
              </Tag>
              <Tag color="orange">建议采购 {mediumSuggestions.length}</Tag>
              <Tag color="green">
                库存充足 {suggestions.length - highSuggestions.length - mediumSuggestions.length}
              </Tag>
            </Space>
            <Space>
              <Select
                value={purchaseUrgencyFilter}
                onChange={setPurchaseUrgencyFilter}
                style={{ width: 140 }}
                size="small"
                options={[
                  { value: 'all', label: '全部紧急度' },
                  { value: 'high', label: '🔥 紧急' },
                  { value: 'medium', label: '⚠️ 建议采购' },
                  { value: 'low', label: '✅ 库存充足' },
                ]}
              />
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={exportPurchase}
              >
                导出采购清单 {filteredSuggestions.length > 0 && `(${filteredSuggestions.length})`}
              </Button>
            </Space>
          </div>
          {withLoading(
            filteredSuggestions.length === 0 ? (
              <Empty
                description={purchaseUrgencyFilter === 'all' ? '暂无采购建议' : '没有符合筛选条件的记录'}
                style={{ padding: '60px 0' }}
              />
            ) : (
              <Table
                columns={purchaseColumns}
                dataSource={filteredSuggestions}
                rowKey="ingredientId"
                pagination={{
                  pageSize: 15,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 项原料`,
                }}
              />
            ),
            true
          )}
        </div>
      )}
    </div>
  );
}

// Re-declare Ingredient to avoid unused import warning (it's used above in type inference)
export type { Ingredient };

export default Statistics;
