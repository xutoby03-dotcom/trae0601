import { useState, useMemo } from 'react';
import { Tabs, Card, Tooltip, Badge, Descriptions, List, Tag, Button, Space, Empty, Select, Statistic } from 'antd';
import { EyeOutlined, ExclamationCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import { useStore } from '@/store';
import { AREAS, FAULT_TYPE_LABEL, FREQUENCY_LABEL, FREQUENCY_WEIGHT, ARMREST_TYPE_LABEL } from '@/types';
import type { Chair, RepairOrder, Frequency } from '@/types';
import { useNavigate } from 'react-router-dom';

function getRiskLevel(orders: RepairOrder[]): 0 | 1 | 2 | 3 {
  if (orders.length === 0) return 0;
  const score = orders.reduce((s, o) => s + FREQUENCY_WEIGHT[o.frequency as Frequency] * 1.5 + 1, 0);
  if (score < 3) return 1;
  if (score < 7) return 2;
  return 3;
}

const LEVEL_LABELS = [
  { color: '#10b981', label: '健康', desc: '暂无故障记录' },
  { color: '#f59e0b', label: '关注', desc: '有轻微问题或偶发故障' },
  { color: '#f97316', label: '警告', desc: '维修次数较多，建议重点检查' },
  { color: '#ef4444', label: '高危', desc: '高频故障，建议更换或大修' },
];

export default function SeatMap() {
  const { chairs, orders, getOrderById } = useStore();
  const navigate = useNavigate();
  const [activeArea, setActiveArea] = useState(AREAS[0]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);

  // 按区域分组椅子，并编号到行列
  const layoutMap = useMemo(() => {
    const map: Record<string, Chair[]> = {};
    AREAS.forEach((a) => (map[a] = []));
    chairs.forEach((c) => {
      if (!map[c.area]) map[c.area] = [];
      map[c.area].push(c);
    });
    return map;
  }, [chairs]);

  // 每把椅子的工单列表
  const chairOrders = useMemo(() => {
    const m: Record<string, RepairOrder[]> = {};
    orders.forEach((o) => {
      if (!m[o.chairId]) m[o.chairId] = [];
      m[o.chairId].push(o);
    });
    return m;
  }, [orders]);

  // 生成行列布局
  const buildGrid = (chairList: Chair[]) => {
    const COLS = 8;
    const rows: (Chair | null)[][] = [];
    chairList
      .sort((a, b) => a.code.localeCompare(b.code))
      .forEach((c, i) => {
        const r = Math.floor(i / COLS);
        if (!rows[r]) rows[r] = [];
        rows[r][i % COLS] = c;
      });
    const filled = rows.map((row) => {
      const r = [...row];
      while (r.length < COLS) r.push(null);
      return r;
    });
    return filled;
  };

  const openDetail = (chair: Chair) => {
    setSelectedChair(chair);
    setDetailOpen(true);
  };

  const highRiskCount = (area: string) =>
    layoutMap[area].filter((c) => getRiskLevel(chairOrders[c.id] || []) >= 2).length;

  return (
    <div>
      <h2 className="page-header">座位故障地图</h2>
      <p className="page-subheader">
        颜色深浅代表故障频率与数量综合指数，红点为高频故障椅，点击座位查看详情。
      </p>

      <div className="seat-legend" style={{ marginBottom: 20 }}>
        {LEVEL_LABELS.map((l) => (
          <div key={l.label} className="legend-item">
            <div className="legend-box" style={{ background: l.color }} />
            <span>
              <b>{l.label}</b> · {l.desc}
            </span>
          </div>
        ))}
      </div>

      <Tabs
        type="card"
        activeKey={activeArea}
        onChange={setActiveArea}
        items={AREAS.map((area) => ({
          key: area,
          label: (
            <Badge count={highRiskCount(area)} size="small" offset={[4, -4]} color="#f97316">
              {area}（{layoutMap[area]?.length || 0}位）
            </Badge>
          ),
        }))}
      />

      <Card style={{ marginTop: 16, borderRadius: 12 }} bordered={false}>
        <div
          className="seat-grid"
          style={{
            gridTemplateColumns: `repeat(8, 1fr)`,
            background:
              'linear-gradient(90deg, rgba(15,118,110,0.03) 1px, transparent 1px) 0 0 / 40px 40px, #fff',
          }}
        >
          {buildGrid(layoutMap[activeArea] || []).map((row, ri) =>
            row.map((cell, ci) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${ri}-${ci}`}
                    className="seat-cell empty"
                    title="空位"
                  >
                    ·
                  </div>
                );
              }
              const chairOrdersList = chairOrders[cell.id] || [];
              const level = getRiskLevel(chairOrdersList);
              const pending = chairOrdersList.some((o) => o.status === 'pending' || o.status === 'repairing');
              return (
                <Tooltip
                  key={cell.id}
                  title={
                    <div>
                      <div><b>{cell.code}</b> · {cell.model}</div>
                      <div>区域：{cell.area} · 扶手：{ARMREST_TYPE_LABEL[cell.armrestType]}</div>
                      <div>累计工单：{chairOrdersList.length} · 风险：{LEVEL_LABELS[level].label}</div>
                      {pending && <div style={{ color: '#f59e0b' }}>⚡ 当前有待处理工单</div>}
                    </div>
                  }
                >
                  <div
                    className={`seat-cell level-${level}`}
                    onClick={() => openDetail(cell)}
                    style={pending ? { outline: '2px solid #f59e0b', outlineOffset: '2px' } : undefined}
                  >
                    <span>{cell.code.split('-')[1] || cell.code}</span>
                    {cell.disabled && (
                      <span
                        title="停用中"
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          background: '#1f2937',
                        }}
                      />
                    )}
                  </div>
                </Tooltip>
              );
            })
          )}
        </div>

        <div style={{ marginTop: 16, color: '#6b7280', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span>
            共 {layoutMap[activeArea]?.length || 0} 把椅子 · 高危 {highRiskCount(activeArea)} 把 ·
            待处理 {layoutMap[activeArea].filter((c) => (chairOrders[c.id] || []).some((o) => o.status === 'pending' || o.status === 'repairing')).length} 把
          </span>
          <span>💡 点击座位查看该椅子的完整维修履历</span>
        </div>
      </Card>

      {detailOpen && selectedChair && (
        <ChairDetail
          chair={selectedChair}
          chairOrders={chairOrders[selectedChair.id] || []}
          onClose={() => setDetailOpen(false)}
          getOrderById={getOrderById}
          navigate={navigate}
        />
      )}
    </div>
  );
}

function ChairDetail({
  chair,
  chairOrders,
  onClose,
  navigate,
}: {
  chair: Chair;
  chairOrders: RepairOrder[];
  onClose: () => void;
  getOrderById: (id: string) => RepairOrder | undefined;
  navigate: (to: string) => void;
}) {
  const level = getRiskLevel(chairOrders);
  const partsUsed = chairOrders.reduce((sum, o) => sum + (o.repair?.partsReplaced.length || 0), 0);
  const totalCost = chairOrders.reduce((sum, o) => sum + (o.repair?.totalCost || 0), 0);

  return (
    <Card
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: LEVEL_LABELS[level].color }} />
          <span>
            <b>{chair.code}</b> · {LEVEL_LABELS[level].label}
          </span>
          {chair.disabled && <Tag color="default">已停用</Tag>}
        </Space>
      }
      extra={<Button onClick={onClose}>关闭</Button>}
      style={{ marginTop: 20, borderRadius: 12 }}
      bordered={false}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
        <div>
          <img
            src={chair.photo || `https://picsum.photos/seed/${chair.id}/600/400`}
            alt={chair.code}
            style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10 }}
          />
          <Descriptions column={1} size="small" style={{ marginTop: 16 }} bordered>
            <Descriptions.Item label="型号">{chair.model}</Descriptions.Item>
            <Descriptions.Item label="购买日期">{chair.purchaseDate}</Descriptions.Item>
            <Descriptions.Item label="气压杆批次">{chair.gasRodBatch}</Descriptions.Item>
            <Descriptions.Item label="扶手类型">{ARMREST_TYPE_LABEL[chair.armrestType]}</Descriptions.Item>
          </Descriptions>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <Statistic title="累计工单" value={chairOrders.length} prefix={<EyeOutlined />} />
            <Statistic
              title="累计费用"
              value={totalCost}
              precision={0}
              prefix="¥"
              valueStyle={{ color: '#dc2626' }}
            />
            <Statistic title="更换部件" value={partsUsed} />
            <Statistic
              title="已完成维修"
              value={chairOrders.filter((o) => o.status === 'done').length}
              valueStyle={{ color: '#059669' }}
              prefix={<SafetyOutlined />}
            />
          </div>
        </div>

        <div>
          <h3 className="section-title">维修履历（按时间倒序）</h3>
          {chairOrders.length === 0 ? (
            <Empty description="暂无任何故障记录，状态良好 🌟" style={{ marginTop: 40 }} />
          ) : (
            <List
              itemLayout="vertical"
              size="small"
              dataSource={[...chairOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
              renderItem={(o) => (
                <List.Item
                  actions={[
                    <Button
                      key="go"
                      type="link"
                      size="small"
                      onClick={() => {
                        navigate('/orders');
                        onClose();
                      }}
                    >
                      跳转工单
                    </Button>,
                  ]}
                  style={{
                    padding: 14,
                    background: '#fafafa',
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
                          {o.id}
                        </span>
                        <Tag color={o.status === 'done' ? 'green' : o.status === 'pending' ? 'orange' : o.status === 'repairing' ? 'blue' : 'default'}>
                          {o.status === 'pending' ? '待处理' : o.status === 'repairing' ? '维修中' : o.status === 'done' ? '已完成' : '已关闭'}
                        </Tag>
                        <Tag color="blue" className="tag-freq">
                          {FREQUENCY_LABEL[o.frequency as Frequency]}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <span style={{ fontSize: 12 }}>提交：{o.createdAt} · 上报人：{o.reporter}</span>
                        <div>
                          {o.faultTypes.map((f) => (
                            <Tag key={f} color="volcano">
                              {FAULT_TYPE_LABEL[f]}
                            </Tag>
                          ))}
                        </div>
                        {o.description && <div style={{ fontSize: 12, color: '#6b7280' }}>{o.description}</div>}
                        {o.repair && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: 10,
                              background: '#ecfdf5',
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          >
                            <div>
                              🛠 <b>{o.repair.handler}</b> 处理 · 耗时{' '}
                              {Math.max(1, Math.round((new Date(o.repair.finishedAt).getTime() - new Date(o.repair.startedAt).getTime()) / 3600000))} 小时 · 总费用{' '}
                              <b style={{ color: '#dc2626' }}>¥{o.repair.totalCost}</b>
                            </div>
                            {o.repair.partsReplaced.length > 0 && (
                              <div style={{ marginTop: 4 }}>
                                更换部件：{o.repair.partsReplaced.map((p) => `${p.name}×${p.quantity}`).join('，')}
                              </div>
                            )}
                            {o.repair.needDisable && <Tag color="red" style={{ marginTop: 4 }}>停用标记</Tag>}
                          </div>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
