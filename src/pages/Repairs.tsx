import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  Space,
  Card,
  message,
  Popconfirm,
  Drawer,
  Descriptions,
  Image,
  DatePicker,
  Switch,
  Divider,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { RepairRecord, Part, RepairOrder } from '@/types';
import { FAULT_TYPE_LABEL, HANDLERS, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/types';
import { useStore } from '@/store';
import dayjs, { Dayjs } from 'dayjs';

export default function Repairs() {
  const { chairs, orders, addRepair, updateOrder } = useStore();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<{ record: RepairRecord; order: RepairOrder } | null>(null);

  const [filterHandler, setFilterHandler] = useState<string | undefined>();
  const [filterNeedDisable, setFilterNeedDisable] = useState<boolean | undefined>();
  const [search, setSearch] = useState('');

  const repairs = useMemo(() => {
    const arr: { record: RepairRecord; order: RepairOrder }[] = [];
    orders.forEach((o) => {
      if (o.repair) arr.push({ record: o.repair, order: o });
    });
    return arr;
  }, [orders]);

  const chairMap = useMemo(() => {
    const m: Record<string, { code: string; area: string; model: string }> = {};
    chairs.forEach((c) => (m[c.id] = { code: c.code, area: c.area, model: c.model }));
    return m;
  }, [chairs]);

  const filtered = useMemo(() => {
    return repairs.filter(({ record, order }) => {
      if (filterHandler && record.handler !== filterHandler) return false;
      if (filterNeedDisable !== undefined && record.needDisable !== filterNeedDisable) return false;
      if (search) {
        const cc = chairMap[order.chairId]?.code || '';
        const parts = record.partsReplaced.map((p) => p.name).join(',');
        if (
          !cc.toLowerCase().includes(search.toLowerCase()) &&
          !order.reporter.includes(search) &&
          !parts.includes(search)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [repairs, filterHandler, filterNeedDisable, search, chairMap]);

  const pendingOrdersForRepair = useMemo(
    () => orders.filter((o) => o.status === 'pending' || o.status === 'repairing'),
    [orders]
  );

  const submitAdd = async () => {
    try {
      const values = await form.validateFields();
      const orderId = values.orderId;
      const startedAt = (values.startedAt as Dayjs).format('YYYY-MM-DD HH:mm:ss');
      const finishedAt = (values.finishedAt as Dayjs).format('YYYY-MM-DD HH:mm:ss');
      const parts: Part[] = (values.parts || []).filter((p: Part) => p.name);
      const partsCost = parts.reduce((s, p) => s + (p.unitCost || 0) * (p.quantity || 0), 0);
      const totalCost = partsCost + (values.laborCost || 0);
      addRepair(orderId, {
        startedAt,
        finishedAt,
        partsReplaced: parts,
        laborCost: values.laborCost || 0,
        totalCost,
        handler: values.handler,
        needDisable: !!values.needDisable,
        notes: values.notes || '',
      });
      message.success('维修记录已保存，工单已办结');
      setAddModalOpen(false);
      form.resetFields();
    } catch (e) {
      // ignore
    }
  };

  const viewDetail = (record: RepairRecord, order: RepairOrder) => {
    setCurrentRecord({ record, order });
    setDrawerOpen(true);
  };

  const toggleDisable = (record: RepairRecord, order: RepairOrder, val: boolean) => {
    updateOrder(order.id, {
      repair: { ...record, needDisable: val },
    });
    message.success(val ? '椅子已标记为停用' : '椅子已解除停用');
  };

  const columns: ColumnsType<{ record: RepairRecord; order: RepairOrder }> = [
    {
      title: '维修单号',
      width: 140,
      render: (_: unknown, { record }) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{record.id}</span>
      ),
    },
    {
      title: '关联椅子',
      width: 170,
      render: (_: unknown, { order }) => {
        const c = chairMap[order.chairId];
        return (
          <Space direction="vertical" size={1}>
            <Tag color="teal" style={{ fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
              {c?.code}
            </Tag>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{c?.area}</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{c?.model}</span>
          </Space>
        );
      },
    },
    {
      title: '原故障',
      width: 190,
      render: (_: unknown, { order }) => (
        <Space wrap size={4}>
          {order.faultTypes.map((f) => (
            <Tag key={f} color="volcano">
              {FAULT_TYPE_LABEL[f]}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '更换部件',
      width: 220,
      render: (_: unknown, { record }) =>
        record.partsReplaced.length ? (
          <Space wrap size={4}>
            {record.partsReplaced.map((p, i) => (
              <Tag key={i} color="blue">
                {p.name}×{p.quantity}
              </Tag>
            ))}
          </Space>
        ) : (
          <span style={{ color: '#9ca3af' }}>—</span>
        ),
    },
    {
      title: '费用',
      width: 110,
      render: (_: unknown, { record }) => (
        <span style={{ fontWeight: 600, color: '#dc2626', fontFamily: 'JetBrains Mono, monospace' }}>
          ¥{record.totalCost}
        </span>
      ),
    },
    {
      title: '处理人',
      dataIndex: ['record', 'handler'],
      width: 100,
      render: (v: string) => `🧰 ${v}`,
    },
    {
      title: '是否停用',
      width: 100,
      render: (_: unknown, { record, order }) => (
        <Space>
          {record.needDisable ? (
            <Tag color="red" icon={<WarningOutlined />}>
              停用
            </Tag>
          ) : (
            <Tag color="green">正常</Tag>
          )}
          <Switch
            size="small"
            checked={record.needDisable}
            onChange={(v) => toggleDisable(record, order, v)}
          />
        </Space>
      ),
    },
    {
      title: '处理时长',
      width: 110,
      render: (_: unknown, { record }) => {
        const hrs = dayjs(record.finishedAt).diff(dayjs(record.startedAt), 'hour', true);
        return (
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {hrs < 1 ? `${Math.round(hrs * 60)}分钟` : `${hrs.toFixed(1)}小时`}
          </span>
        );
      },
    },
    {
      title: '完成时间',
      dataIndex: ['record', 'finishedAt'],
      width: 160,
      render: (v: string) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v}</span>
      ),
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, { record, order }) => (
        <Space size={2}>
          <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => viewDetail(record, order)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  const totalCost = filtered.reduce((s, r) => s + r.record.totalCost, 0);
  const totalHours = filtered.reduce(
    (s, r) => s + dayjs(r.record.finishedAt).diff(dayjs(r.record.startedAt), 'hour', true),
    0
  );

  return (
    <div>
      <h2 className="page-header">维修记录</h2>
      <p className="page-subheader">
        记录维修前后的部件更换、费用、处理人与是否停用，形成完整的维修档案。
      </p>

      <Space size={16} style={{ marginBottom: 20 }} wrap>
        <div className="stat-card" style={{ minWidth: 180 }}>
          <div className="label">累计维修次数</div>
          <div className="value">{filtered.length}</div>
          <div className="trend" style={{ color: '#059669' }}>
            ▲ 覆盖 {new Set(filtered.map((r) => r.order.chairId)).size} 把椅子
          </div>
        </div>
        <div className="stat-card" style={{ minWidth: 180 }}>
          <div className="label">累计维修费用</div>
          <div className="value" style={{ color: '#dc2626' }}>¥{totalCost.toLocaleString()}</div>
          <div className="trend" style={{ color: '#6b7280' }}>
            平均单次 ¥{filtered.length ? Math.round(totalCost / filtered.length) : 0}
          </div>
        </div>
        <div className="stat-card" style={{ minWidth: 180 }}>
          <div className="label">累计处理时长</div>
          <div className="value">{totalHours.toFixed(0)}h</div>
          <div className="trend" style={{ color: '#6b7280' }}>
            平均 {(filtered.length ? totalHours / filtered.length : 0).toFixed(1)} 小时/单
          </div>
        </div>
        <div className="stat-card" style={{ minWidth: 180 }}>
          <div className="label">停用椅子数</div>
          <div className="value" style={{ color: '#dc2626' }}>
            {filtered.filter((r) => r.record.needDisable).length}
          </div>
          <div className="trend" style={{ color: '#6b7280' }}>
            占比 {filtered.length ? Math.round((filtered.filter((r) => r.record.needDisable).length / filtered.length) * 100) : 0}%
          </div>
        </div>
      </Space>

      <Card style={{ marginBottom: 20, borderRadius: 12 }} bordered={false}>
        <Space wrap size={14}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索椅子编号 / 上报人 / 部件名"
            style={{ width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            allowClear
            placeholder="处理人"
            style={{ width: 150 }}
            options={HANDLERS.map((h) => ({ value: h, label: `🧰 ${h}` }))}
            value={filterHandler}
            onChange={setFilterHandler}
          />
          <Select
            allowClear
            placeholder="是否停用"
            style={{ width: 140 }}
            options={[
              { value: true, label: '标记停用' },
              { value: false, label: '未停用' },
            ]}
            value={filterNeedDisable}
            onChange={setFilterNeedDisable}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)} style={{ marginLeft: 'auto' }}>
            登记维修
          </Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }} bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          rowKey={(r) => r.record.id}
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1500 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条维修记录` }}
        />
      </Card>

      <Modal
        title="🛠 登记维修记录"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={submitAdd}
        width={720}
        okText="保存维修"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" initialValues={{ parts: [{}], needDisable: false, laborCost: 100 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="orderId"
              label="关联工单"
              rules={[{ required: true, message: '请选择要办结的工单' }]}
              extra="只显示待处理和维修中的工单"
            >
              <Select
                showSearch
                placeholder="选择工单..."
                optionFilterProp="label"
                options={pendingOrdersForRepair.map((o) => ({
                  value: o.id,
                  label: `${o.id} | ${chairMap[o.chairId]?.code || '?'} | ${o.reporter} - ${o.faultTypes
                    .map((f) => FAULT_TYPE_LABEL[f])
                    .join('、')}`,
                }))}
              />
            </Form.Item>
            <Form.Item name="handler" label="处理人" rules={[{ required: true, message: '请选择处理人' }]}>
              <Select options={HANDLERS.map((h) => ({ value: h, label: `🧰 ${h}` }))} />
            </Form.Item>
            <Form.Item name="startedAt" label="开始时间" rules={[{ required: true }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="finishedAt" label="完成时间" rules={[{ required: true }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Divider orientation="left" plain style={{ margin: '8px 0 12px' }}>
            🔧 更换部件（可空）
          </Divider>
          <Form.List name="parts">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }} wrap>
                    <Form.Item
                      {...field}
                      label={field.name === 0 ? '部件名' : ''}
                      name={[field.name, 'name']}
                      style={{ marginBottom: 0, minWidth: 160 }}
                    >
                      <Input placeholder="如：气压杆" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label={field.name === 0 ? '数量' : ''}
                      name={[field.name, 'quantity']}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber min={1} max={10} />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label={field.name === 0 ? '单价(¥)' : ''}
                      name={[field.name, 'unitCost']}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber min={0} step={10} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: '#dc2626', cursor: 'pointer' }} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />} style={{ marginTop: 4 }}>
                  添加更换部件
                </Button>
              </>
            )}
          </Form.List>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
            <Form.Item name="laborCost" label="人工费(¥)" rules={[{ required: true }]}>
              <InputNumber min={0} step={20} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="needDisable" label="是否需要停用该椅子" valuePropName="checked" extra="涉及安全或需等待配件时请勾选">
              <Switch />
            </Form.Item>
          </div>
          <Form.Item name="notes" label="维修备注">
            <Input.TextArea rows={3} placeholder="故障原因、修复过程、是否需要复检等" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`维修详情：${currentRecord?.record.id || ''}`}
        width={640}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {currentRecord && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="关联工单">{currentRecord.order.id}</Descriptions.Item>
              <Descriptions.Item label="工单状态">
                <Tag color={ORDER_STATUS_COLOR[currentRecord.order.status]}>
                  {ORDER_STATUS_LABEL[currentRecord.order.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="椅子编号">{chairMap[currentRecord.order.chairId]?.code}</Descriptions.Item>
              <Descriptions.Item label="型号">{chairMap[currentRecord.order.chairId]?.model}</Descriptions.Item>
              <Descriptions.Item label="处理人">🧰 {currentRecord.record.handler}</Descriptions.Item>
              <Descriptions.Item label="处理时长">
                {dayjs(currentRecord.record.finishedAt)
                  .diff(dayjs(currentRecord.record.startedAt), 'hour', true)
                  .toFixed(1)}{' '}
                小时
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">{currentRecord.record.startedAt}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{currentRecord.record.finishedAt}</Descriptions.Item>
              <Descriptions.Item label="人工费">¥{currentRecord.record.laborCost}</Descriptions.Item>
              <Descriptions.Item label="总费用">
                <b style={{ color: '#dc2626' }}>¥{currentRecord.record.totalCost}</b>
              </Descriptions.Item>
              <Descriptions.Item label="是否停用" span={2}>
                {currentRecord.record.needDisable ? (
                  <Tag color="red" icon={<WarningOutlined />}>
                    已标记停用
                  </Tag>
                ) : (
                  <Tag color="green">正常使用</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="原始故障" span={2}>
                {currentRecord.order.faultTypes.map((f) => (
                  <Tag color="volcano" key={f} style={{ marginBottom: 4 }}>
                    {FAULT_TYPE_LABEL[f]}
                  </Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {currentRecord.record.notes || '—'}
              </Descriptions.Item>
            </Descriptions>

            <Divider plain style={{ margin: '24px 0 16px' }}>
              更换部件清单
            </Divider>
            <Card size="small" style={{ borderRadius: 8 }}>
              {currentRecord.record.partsReplaced.length === 0 ? (
                <span style={{ color: '#9ca3af' }}>本次维修未更换部件</span>
              ) : (
                <Table
                  size="small"
                  rowKey="name"
                  pagination={false}
                  columns={[
                    { title: '部件', dataIndex: 'name' },
                    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
                    { title: '单价', dataIndex: 'unitCost', width: 100, render: (v) => `¥${v}` },
                    {
                      title: '小计',
                      width: 100,
                      render: (_: unknown, r: Part) => `¥${r.quantity * r.unitCost}`,
                    },
                  ]}
                  dataSource={currentRecord.record.partsReplaced}
                />
              )}
            </Card>

            <Divider plain style={{ margin: '24px 0 16px' }}>
              维修前后对比
            </Divider>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>维修前</div>
                <Image
                  width="100%"
                  height={180}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                  src={currentRecord.record.beforePhoto || `https://picsum.photos/seed/before-${currentRecord.record.id}/400/300`}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>维修后</div>
                <Image
                  width="100%"
                  height={180}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                  src={currentRecord.record.afterPhoto || `https://picsum.photos/seed/after-${currentRecord.record.id}/400/300`}
                />
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
