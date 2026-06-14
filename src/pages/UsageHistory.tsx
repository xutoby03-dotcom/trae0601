import { useState, useMemo } from 'react';
import {
  Table,
  Input,
  DatePicker,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Descriptions,
  Drawer,
  Button,
} from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';
import { useStore } from '../store/useStore';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import type { UsageRecord, Ingredient } from '../types';

const { RangePicker } = DatePicker;

function UsageHistory() {
  const usageRecords = useStore((s) => s.usageRecords);
  const ingredients = useStore((s) => s.ingredients);
  const openRecords = useStore((s) => s.openRecords);

  const [searchName, setSearchName] = useState('');
  const [searchBatch, setSearchBatch] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<UsageRecord | null>(null);

  const ingredientMap = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);
  const openRecordMap = useMemo(() => new Map(openRecords.map((r) => [r.id, r])), [openRecords]);

  const filteredRecords = useMemo(() => {
    return usageRecords
      .filter((u) => {
        const ing = ingredientMap.get(u.ingredientId);
        if (searchName && ing && !ing.name.includes(searchName)) return false;
        if (searchBatch && !u.productBatch.includes(searchBatch)) return false;
        if (dateRange) {
          const d = dayjs(u.usageDate);
          if (d.isBefore(dateRange[0], 'day') || d.isAfter(dateRange[1], 'day')) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [usageRecords, ingredientMap, searchName, searchBatch, dateRange]);

  // Statistics
  const totalRecords = filteredRecords.length;
  const totalAmount = filteredRecords.reduce((s, r) => s + r.amount, 0);
  const uniqueIngredients = new Set(filteredRecords.map((r) => r.ingredientId)).size;
  const uniqueBatches = new Set(filteredRecords.map((r) => r.productBatch)).size;

  // Group by ingredient for stats
  const ingredientUsageStats = useMemo(() => {
    const map = new Map<string, { name: string; total: number; unit: Ingredient['unit']; count: number }>();
    filteredRecords.forEach((u) => {
      const ing = ingredientMap.get(u.ingredientId);
      if (!ing) return;
      const current = map.get(u.ingredientId) || {
        name: ing.name,
        total: 0,
        unit: ing.unit,
        count: 0,
      };
      current.total += u.amount;
      current.count += 1;
      map.set(u.ingredientId, current);
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [filteredRecords, ingredientMap]);

  const handleViewDetail = (record: UsageRecord) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const columns = [
    {
      title: '取用日期',
      dataIndex: 'usageDate',
      key: 'usageDate',
      width: 120,
      render: (d: string) => formatDate(d),
      sorter: (a: UsageRecord, b: UsageRecord) => a.usageDate.localeCompare(b.usageDate),
    },
    {
      title: '原料名称',
      key: 'name',
      width: 140,
      render: (_: unknown, r: UsageRecord) => {
        const ing = ingredientMap.get(r.ingredientId);
        return (
          <Space direction="vertical" size={0}>
            <strong>{ing?.name || '未知'}</strong>
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>{ing?.brand}</span>
          </Space>
        );
      },
    },
    {
      title: '批次',
      key: 'batch',
      width: 110,
      render: (_: unknown, r: UsageRecord) => ingredientMap.get(r.ingredientId)?.batch || '-',
    },
    {
      title: '用量',
      key: 'amount',
      width: 110,
      render: (_: unknown, r: UsageRecord) => {
        const ing = ingredientMap.get(r.ingredientId);
        return (
          <Tag color="orange" style={{ margin: 0 }}>
            -{r.amount}
            {ing?.unit || ''}
          </Tag>
        );
      },
      sorter: (a: UsageRecord, b: UsageRecord) => a.amount - b.amount,
    },
    {
      title: '产品批次',
      dataIndex: 'productBatch',
      key: 'productBatch',
      width: 140,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '回封',
      dataIndex: 'resealed',
      key: 'resealed',
      width: 80,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'red'} style={{ margin: 0 }}>
          {v ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 90,
    },
    {
      title: '存放位置',
      key: 'location',
      width: 100,
      render: (_: unknown, r: UsageRecord) => openRecordMap.get(r.openRecordId)?.freezerLocation || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, r: UsageRecord) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(r)}>
          详情
        </Button>
      ),
    },
  ];

  const onDateChange: RangePickerProps['onChange'] = (dates) => {
    setDateRange(dates as [Dayjs, Dayjs] | null);
  };

  return (
    <div>
      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="取用记录" value={totalRecords} suffix="次" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="涉及原料" value={uniqueIngredients} suffix="种" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="产品批次" value={uniqueBatches} suffix="个" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="总用量（统计期间）" value={totalAmount.toFixed(0)} suffix="单位合计" />
          </Card>
        </Col>
      </Row>

      {/* Top Usage Chart */}
      {ingredientUsageStats.length > 0 && (
        <Card className="table-card" style={{ marginBottom: 20 }} title="原料用量排行">
          <Row gutter={[16, 16]}>
            {ingredientUsageStats.slice(0, 8).map((s, idx) => {
              const max = ingredientUsageStats[0].total;
              const percent = Math.round((s.total / max) * 100);
              const colors = ['#fa8c16', '#1677ff', '#52c41a', '#722ed1', '#13c2c2', '#eb2f96', '#faad14', '#2f54eb'];
              return (
                <Col span={6} key={s.id}>
                  <div style={{ padding: 12, background: '#fafafa', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>
                        <Tag color={idx < 3 ? colors[idx] : 'default'}>{idx + 1}</Tag>
                        <strong>{s.name}</strong>
                      </span>
                      <span style={{ color: colors[idx % colors.length], fontWeight: 600 }}>
                        {s.total}
                        {s.unit}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: '#f0f0f0',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: colors[idx % colors.length],
                          width: `${percent}%`,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                      {s.count} 次取用
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      <div className="table-card">
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Input
            placeholder="搜索原料名称"
            prefix={<SearchOutlined />}
            style={{ width: 220 }}
            allowClear
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <Input
            placeholder="搜索产品批次号"
            prefix={<SearchOutlined />}
            style={{ width: 220 }}
            allowClear
            value={searchBatch}
            onChange={(e) => setSearchBatch(e.target.value)}
          />
          <RangePicker
            onChange={onDateChange}
            allowClear
            placeholder={['开始日期', '结束日期']}
          />
          <Button
            onClick={() => {
              setSearchName('');
              setSearchBatch('');
              setDateRange(null);
            }}
          >
            重置
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </div>

      <Drawer
        title="取用记录详情"
        placement="right"
        width={480}
        onClose={() => {
          setDetailOpen(false);
          setSelectedRecord(null);
        }}
        open={detailOpen}
      >
        {selectedRecord && (
          <div>
            <Descriptions title="基本信息" column={1} bordered size="small">
              <Descriptions.Item label="取用日期">
                {formatDate(selectedRecord.usageDate)}
              </Descriptions.Item>
              <Descriptions.Item label="操作人">
                {selectedRecord.operator}
              </Descriptions.Item>
              <Descriptions.Item label="产品批次">
                <Tag color="blue">{selectedRecord.productBatch}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="原料名称">
                {ingredientMap.get(selectedRecord.ingredientId)?.name}
              </Descriptions.Item>
              <Descriptions.Item label="品牌/批次">
                {ingredientMap.get(selectedRecord.ingredientId)?.brand} /{' '}
                {ingredientMap.get(selectedRecord.ingredientId)?.batch}
              </Descriptions.Item>
              <Descriptions.Item label="取用数量">
                <Tag color="orange">
                  -{selectedRecord.amount}
                  {ingredientMap.get(selectedRecord.ingredientId)?.unit}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="是否回封">
                <Tag color={selectedRecord.resealed ? 'green' : 'red'}>
                  {selectedRecord.resealed ? '已回封' : '未回封'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="存放位置">
                {openRecordMap.get(selectedRecord.openRecordId)?.freezerLocation}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDateTime(selectedRecord.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="备注">
                {selectedRecord.note || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default UsageHistory;
