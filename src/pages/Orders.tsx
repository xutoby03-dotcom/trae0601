import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Checkbox,
  Tag,
  Space,
  Card,
  message,
  Tooltip,
  Timeline,
  Drawer,
  Descriptions,
  Divider,
  Rate,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { RepairOrder, FaultType, Frequency, OrderStatus } from '@/types';
import {
  FAULT_TYPE_LABEL,
  FREQUENCY_LABEL,
  FREQUENCY_WEIGHT,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  HANDLERS,
  AREAS,
} from '@/types';
import { useStore } from '@/store';

export default function Orders() {
  const { chairs, orders, addOrder, updateOrder, addRepair } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<RepairOrder | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignOrder, setAssignOrder] = useState<RepairOrder | null>(null);
  const [assignForm] = Form.useForm();

  const [filterStatus, setFilterStatus] = useState<OrderStatus | undefined>();
  const [filterFault, setFilterFault] = useState<FaultType | undefined>();
  const [search, setSearch] = useState('');

  const frequencyColor: Record<Frequency, string> = {
    rare: 'green',
    occasional: 'blue',
    frequent: 'orange',
    always: 'red',
  };

  const chairMap = useMemo(() => {
    const m: Record<string, { code: string; area: string }> = {};
    chairs.forEach((c) => (m[c.id] = { code: c.code, area: c.area }));
    return m;
  }, [chairs]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filterStatus && o.status !== filterStatus) return false;
      if (filterFault && !o.faultTypes.includes(filterFault)) return false;
      if (search) {
        const cc = chairMap[o.chairId]?.code || '';
        if (!cc.toLowerCase().includes(search.toLowerCase()) && !o.reporter.includes(search)) {
          return false;
        }
      }
      return true;
    });
  }, [orders, filterStatus, filterFault, search, chairMap]);

  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      addOrder({ ...values, frequency: values.frequency });
      message.success('工单已提交，行政部会尽快处理');
      setModalOpen(false);
      form.resetFields();
    } catch (e) {
      // ignore
    }
  };

  const openAssign = (order: RepairOrder) => {
    setAssignOrder(order);
    assignForm.setFieldsValue({ assignee: order.assignee });
    setAssignModalOpen(true);
  };

  const submitAssign = async () => {
    const v = await assignForm.validateFields();
    if (!assignOrder) return;
    updateOrder(assignOrder.id, { assignee: v.assignee, status: 'repairing' });
    message.success('已分配处理人，工单进入维修中');
    setAssignModalOpen(false);
  };

  const startRepair = (order: RepairOrder) => {
    updateOrder(order.id, { status: 'repairing' });
    message.success('已开始维修');
  };

  const closeOrder = (order: RepairOrder) => {
    updateOrder(order.id, { status: 'closed' });
    message.success('工单已关闭');
  };

  const completeWithRepair = (order: RepairOrder) => {
    // Navigate to repairs page by opening drawer with pre-fill - but simpler: directly add a minimal repair
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    addRepair(order.id, {
      startedAt: order.createdAt,
      finishedAt: now,
      partsReplaced: [],
      laborCost: 120,
      totalCost: 120,
      handler: order.assignee || HANDLERS[0],
      needDisable: false,
      notes: '现场调试已解决。',
    });
    message.success('已完成维修并生成记录');
  };

  const viewDetail = (order: RepairOrder) => {
    setCurrentOrder(order);
    setDrawerOpen(true);
  };

  const columns: ColumnsType<RepairOrder> = [
    {
      title: '工单编号',
      dataIndex: 'id',
      width: 130,
      render: (v: string) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{v}</span>
      ),
    },
    {
      title: '椅子',
      width: 160,
      render: (_: unknown, r) => {
        const c = chairMap[r.chairId];
        return (
          <Space direction="vertical" size={2}>
            <Tag color="teal" style={{ fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
              {c?.code || '未知'}
            </Tag>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{c?.area}</span>
          </Space>
        );
      },
    },
    {
      title: '故障类型',
      width: 220,
      render: (_: unknown, r) => (
        <Space wrap size={4}>
          {r.faultTypes.map((f) => (
            <Tag key={f} color="volcano">
              {FAULT_TYPE_LABEL[f]}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '发生频率',
      width: 110,
      render: (_: unknown, r) => (
        <Tooltip title={`权重: ${FREQUENCY_WEIGHT[r.frequency]}`}>
          <Tag color={frequencyColor[r.frequency]} className="tag-freq">
            {FREQUENCY_LABEL[r.frequency]}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: '上报人',
      dataIndex: 'reporter',
      width: 100,
      render: (v: string) => (
        <Space size={4}>
          <UserOutlined />
          {v}
        </Space>
      ),
    },
    {
      title: '处理人',
      dataIndex: 'assignee',
      width: 100,
      render: (v?: string) => (v ? <span>🧰 {v}</span> : <Tag color="default">未分配</Tag>),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: OrderStatus) => <Tag color={ORDER_STATUS_COLOR[v]}>{ORDER_STATUS_LABEL[v]}</Tag>,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v}</span>
      ),
    },
    {
      title: '操作',
      width: 280,
      fixed: 'right' as const,
      render: (_: unknown, r) => (
        <Space size={2} wrap>
          <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => viewDetail(r)}>
            详情
          </Button>
          {r.status === 'pending' && (
            <Button size="small" type="link" onClick={() => openAssign(r)}>
              分配处理人
            </Button>
          )}
          {r.status === 'pending' && r.assignee && (
            <Button size="small" type="link" icon={<PlayCircleOutlined />} onClick={() => startRepair(r)}>
              开始维修
            </Button>
          )}
          {r.status === 'repairing' && (
            <Button size="small" type="link" icon={<CheckCircleOutlined />} onClick={() => completeWithRepair(r)}>
              快速办结
            </Button>
          )}
          {(r.status === 'pending' || r.status === 'repairing') && (
            <Button size="small" type="link" danger icon={<CloseCircleOutlined />} onClick={() => closeOrder(r)}>
              关闭
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-header">问题工单</h2>
      <p className="page-subheader">员工提交的椅子故障工单，分配处理人、跟踪进度、完成维修。</p>

      <Card style={{ marginBottom: 20, borderRadius: 12 }} bordered={false}>
        <Space wrap size={14}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索椅子编号 / 上报人"
            style={{ width: 240 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select<OrderStatus>
            allowClear
            placeholder="工单状态"
            style={{ width: 150 }}
            options={Object.entries(ORDER_STATUS_LABEL).map(([v, l]) => ({ value: v as OrderStatus, label: l }))}
            value={filterStatus}
            onChange={setFilterStatus}
          />
          <Select<FaultType>
            allowClear
            placeholder="故障类型"
            style={{ width: 150 }}
            options={Object.entries(FAULT_TYPE_LABEL).map(([v, l]) => ({ value: v as FaultType, label: l }))}
            value={filterFault}
            onChange={setFilterFault}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ marginLeft: 'auto' }}>
            提交问题
          </Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }} bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1380 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条工单` }}
        />
      </Card>

      <Modal
        title="📝 提交椅子问题"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitForm}
        width={600}
        okText="提交工单"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="chairId" label="出问题的椅子" rules={[{ required: true, message: '请选择椅子' }]}>
            <Select
              showSearch
              placeholder="按编号搜索..."
              optionFilterProp="label"
              options={chairs.map((c) => ({
                value: c.id,
                label: `${c.code} — ${c.area} (${c.model})`,
              }))}
            />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="reporter" label="您的姓名" rules={[{ required: true, message: '请填写姓名' }]}>
              <Input placeholder="方便联系您" />
            </Form.Item>
            <Form.Item name="frequency" label="问题发生频率" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group>
                {Object.entries(FREQUENCY_LABEL).map(([v, l]) => (
                  <Radio.Button key={v} value={v}>
                    {l}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </div>
          <Form.Item name="faultTypes" label="问题类型（可多选）" rules={[{ required: true, message: '至少选择一项' }]}>
            <Checkbox.Group style={{ width: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {Object.entries(FAULT_TYPE_LABEL).map(([v, l]) => (
                  <Checkbox value={v} key={v} style={{ lineHeight: 2 }}>
                    {l}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            name="needDisable"
            label="是否需要暂时停用"
            valuePropName="checked"
            tooltip="影响安全或完全不能坐的情况下建议停用"
          >
            <Radio.Group>
              <Radio value={false}>不需要</Radio>
              <Radio value={true}>需要停用</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="description" label="具体描述（可选）">
            <Input.TextArea rows={3} placeholder="例如：起身时会发出「咔哒」声，坐下后慢慢下沉..." />
          </Form.Item>
          <div style={{ background: '#f0fdfa', padding: '10px 14px', borderRadius: 8, fontSize: 12, color: '#115e59' }}>
            💡 提示：频率越高的工单会被优先处理，建议如实勾选。
          </div>
        </Form>
      </Modal>

      <Modal
        title="分配维修处理人"
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onOk={submitAssign}
        width={400}
      >
        <Form form={assignForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="assignee" label="处理人" rules={[{ required: true, message: '请选择处理人' }]}>
            <Select options={HANDLERS.map((h) => ({ value: h, label: `🧰 ${h}` }))} />
          </Form.Item>
          <div style={{ fontSize: 12, color: '#6b7280' }}>分配后工单状态将自动变为「维修中」。</div>
        </Form>
      </Modal>

      <Drawer
        title={`工单详情：${currentOrder?.id || ''}`}
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Tag color={ORDER_STATUS_COLOR[(currentOrder?.status || 'pending') as OrderStatus]}>
              {ORDER_STATUS_LABEL[(currentOrder?.status || 'pending') as OrderStatus]}
            </Tag>
          </Space>
        }
      >
        {currentOrder && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="椅子编号">{chairMap[currentOrder.chairId]?.code}</Descriptions.Item>
              <Descriptions.Item label="所在区域">{chairMap[currentOrder.chairId]?.area}</Descriptions.Item>
              <Descriptions.Item label="上报人">{currentOrder.reporter}</Descriptions.Item>
              <Descriptions.Item label="提交时间">
                <Space><ClockCircleOutlined />{currentOrder.createdAt}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="处理人">
                {currentOrder.assignee ? `🧰 ${currentOrder.assignee}` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="是否需要停用">{currentOrder.needDisable ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="故障频率">
                <Tag color={frequencyColor[currentOrder.frequency]} className="tag-freq">
                  {FREQUENCY_LABEL[currentOrder.frequency]}
                </Tag>
                {' '}（严重指数
                <Rate
                  disabled
                  count={4}
                  value={FREQUENCY_WEIGHT[currentOrder.frequency]}
                  style={{ fontSize: 14, marginLeft: 6 }}
                />
                ）
              </Descriptions.Item>
              <Descriptions.Item label="故障类型">
                {currentOrder.faultTypes.map((f) => (
                  <Tag color="volcano" key={f} style={{ marginBottom: 4 }}>
                    {FAULT_TYPE_LABEL[f]}
                  </Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="问题描述">
                {currentOrder.description || '—'}
              </Descriptions.Item>
            </Descriptions>

            <Divider plain style={{ margin: '24px 0 16px' }}>
              处理进度
            </Divider>
            <Timeline
              items={[
                { color: 'green', children: `工单创建于 ${currentOrder.createdAt}，上报人 ${currentOrder.reporter}` },
                currentOrder.assignee
                  ? { color: 'blue', children: `已分配处理人：${currentOrder.assignee}` }
                  : { color: 'gray', children: '等待分配处理人' },
                currentOrder.repair
                  ? { color: 'cyan', children: `开始维修：${currentOrder.repair.startedAt}` }
                  : { color: 'gray', children: '尚未开始维修' },
                currentOrder.repair
                  ? { color: 'green', children: `维修完成：${currentOrder.repair.finishedAt}（${currentOrder.repair.handler}）` }
                  : currentOrder.status === 'closed'
                  ? { color: 'red', children: '工单已关闭，未维修' }
                  : { color: 'gray', children: '等待维修完成' },
              ]}
            />
            {currentOrder.repair && (
              <>
                <Divider plain style={{ margin: '20px 0 12px' }}>维修记录摘要</Divider>
                <Card size="small" style={{ borderRadius: 8, background: '#fafafa' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>更换部件：{currentOrder.repair.partsReplaced.length ? currentOrder.repair.partsReplaced.map((p) => `${p.name}×${p.quantity}`).join('，') : '无'}</div>
                    <div>总费用：<b style={{ color: '#dc2626' }}>¥{currentOrder.repair.totalCost}</b></div>
                    <div>是否停用：{currentOrder.repair.needDisable ? '是' : '否'}</div>
                    <div>备注：{currentOrder.repair.notes}</div>
                  </div>
                </Card>
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
