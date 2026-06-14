import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Tag,
  Popconfirm,
  Radio,
  Tooltip,
  App,
  Drawer,
  Descriptions,
  Divider,
  List,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ScissorOutlined,
  WarningOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { OpenRecord, SealingMethod, FreezerLocation, DiscardReason } from '../types';
import { useStore } from '../store/useStore';
import { daysUntilExpiry, formatDate, formatDateTime, isExpired, isTempOutOfRange } from '../utils/dateUtils';

const { Option } = Select;

const sealingMethods: SealingMethod[] = ['保鲜袋', '密封罐', '保鲜膜', '原包装封口', '真空包装'];
const freezerLocations: FreezerLocation[] = ['冷藏柜A', '冷藏柜B', '冷冻柜A', '冷冻柜B', '常温货架', '阴凉处'];
const discardReasons: DiscardReason[] = ['开封超期', '储存温度不符', '剩余量不足', '外观异常', '气味异常', '发霉', '其他'];

type TabKey = 'active' | 'discarded' | 'all';

function OpenRecords() {
  const { message: msg } = App.useApp();
  const ingredients = useStore((s) => s.ingredients);
  const openRecords = useStore((s) => s.openRecords);
  const usageRecords = useStore((s) => s.usageRecords);
  const openIngredient = useStore((s) => s.openIngredient);
  const useIngredient = useStore((s) => s.useIngredient);
  const discardOpenRecord = useStore((s) => s.discardOpenRecord);
  const currentOperator = useStore((s) => s.currentOperator);

  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [openModal, setOpenModal] = useState(false);
  const [useModal, setUseModal] = useState(false);
  const [discardModal, setDiscardModal] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OpenRecord | null>(null);

  const [openForm] = Form.useForm();
  const [useForm] = Form.useForm();
  const [discardForm] = Form.useForm();

  const ingredientMap = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);

  const activeRecords = useMemo(
    () => openRecords.filter((r) => !r.isDiscarded),
    [openRecords]
  );
  const discardedRecords = useMemo(
    () => openRecords.filter((r) => r.isDiscarded),
    [openRecords]
  );

  const getDisplayRecords = () => {
    switch (activeTab) {
      case 'active':
        return activeRecords;
      case 'discarded':
        return discardedRecords;
      default:
        return openRecords;
    }
  };

  const handleOpenIngredient = () => {
    openForm.resetFields();
    openForm.setFieldsValue({
      openDate: dayjs() as unknown as Dayjs,
      operator: currentOperator,
    });
    setOpenModal(true);
  };

  const handleSubmitOpen = async () => {
    try {
      const values = await openForm.validateFields();
      const ing = ingredients.find((i) => i.id === values.ingredientId);
      if (!ing) return;

      openIngredient({
        ingredientId: values.ingredientId,
        operator: values.operator,
        openDate: (values.openDate as Dayjs).format('YYYY-MM-DD'),
        remainingWeight: values.remainingWeight ?? ing.totalWeight,
        sealingMethod: values.sealingMethod,
        freezerLocation: values.freezerLocation,
        actualTemp: values.actualTemp,
      });
      msg.success('开封记录已创建');
      setOpenModal(false);
    } catch {
      // validation error
    }
  };

  const handleUseIngredient = (record: OpenRecord) => {
    const ing = ingredientMap.get(record.ingredientId);
    setSelectedRecord(record);
    useForm.resetFields();
    useForm.setFieldsValue({
      usageDate: dayjs() as unknown as Dayjs,
      operator: currentOperator,
      resealed: true,
      amount: undefined,
      productBatch: '',
    });
    setUseModal(true);
    void ing;
  };

  const handleSubmitUse = async () => {
    try {
      const values = await useForm.validateFields();
      if (!selectedRecord) return;
      if (values.amount > selectedRecord.remainingWeight) {
        msg.error(`取用量不能超过剩余量（${selectedRecord.remainingWeight}）`);
        return;
      }

      useIngredient({
        openRecordId: selectedRecord.id,
        ingredientId: selectedRecord.ingredientId,
        amount: values.amount,
        productBatch: values.productBatch,
        resealed: values.resealed,
        operator: values.operator,
        usageDate: (values.usageDate as Dayjs).format('YYYY-MM-DD'),
        note: values.note,
      });
      msg.success('取用记录已创建');
      setUseModal(false);
      setSelectedRecord(null);
    } catch {
      // validation error
    }
  };

  const handleDiscard = (record: OpenRecord) => {
    setSelectedRecord(record);
    discardForm.resetFields();
    const ing = ingredientMap.get(record.ingredientId);
    if (ing && isExpired(record, ing)) {
      discardForm.setFieldsValue({ reason: '开封超期' });
    } else if (ing && isTempOutOfRange(record, ing)) {
      discardForm.setFieldsValue({ reason: '储存温度不符' });
    }
    setDiscardModal(true);
  };

  const handleSubmitDiscard = async () => {
    try {
      const values = await discardForm.validateFields();
      if (!selectedRecord) return;

      discardOpenRecord({
        openRecordId: selectedRecord.id,
        reason: values.reason,
        operator: currentOperator,
        note: values.note,
      });
      msg.success('已标记为报废');
      setDiscardModal(false);
      setSelectedRecord(null);
    } catch {
      // validation error
    }
  };

  const handleViewDetail = (record: OpenRecord) => {
    setSelectedRecord(record);
    setDetailDrawer(true);
  };

  const getExpiryStatus = (record: OpenRecord) => {
    const ing = ingredientMap.get(record.ingredientId);
    if (!ing) return null;
    const daysLeft = daysUntilExpiry(record, ing);
    if (record.isDiscarded) {
      return <Tag color="default">已报废</Tag>;
    }
    if (daysLeft < 0) {
      return (
        <Tooltip title={`已超期 ${Math.abs(daysLeft)} 天，请尽快处理`}>
          <Tag color="red" icon={<WarningOutlined />}>
            已超期
          </Tag>
        </Tooltip>
      );
    }
    if (daysLeft <= 1) {
      return (
        <Tooltip title={`仅剩 ${daysLeft} 天，建议尽快使用`}>
          <Tag color="orange">即将过期</Tag>
        </Tooltip>
      );
    }
    if (daysLeft <= 3) {
      return <Tag color="gold">临近过期</Tag>;
    }
    return <Tag color="green">状态正常</Tag>;
  };

  const recordUsageHistory = (recordId: string) =>
    usageRecords.filter((u) => u.openRecordId === recordId);

  const columns = [
    {
      title: '原料名称',
      key: 'name',
      width: 140,
      render: (_: unknown, r: OpenRecord) => {
        const ing = ingredientMap.get(r.ingredientId);
        return (
          <Space>
            <span style={{ fontSize: 20 }}>🍞</span>
            <Space direction="vertical" size={0}>
              <strong>{ing?.name || '未知'}</strong>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>{ing?.brand}</span>
            </Space>
          </Space>
        );
      },
    },
    {
      title: '批次',
      key: 'batch',
      width: 120,
      render: (_: unknown, r: OpenRecord) => ingredientMap.get(r.ingredientId)?.batch || '-',
    },
    {
      title: '状态',
      key: 'status',
      width: 110,
      render: (_: unknown, r: OpenRecord) => getExpiryStatus(r),
    },
    {
      title: '开封日期',
      dataIndex: 'openDate',
      key: 'openDate',
      width: 110,
      render: (d: string) => formatDate(d),
    },
    {
      title: '开封人',
      dataIndex: 'operator',
      key: 'operator',
      width: 90,
    },
    {
      title: '剩余量',
      key: 'remaining',
      width: 100,
      render: (_: unknown, r: OpenRecord) => {
        const ing = ingredientMap.get(r.ingredientId);
        const percent = ing ? Math.round((r.remainingWeight / ing.totalWeight) * 100) : 0;
        return (
          <Tooltip title={`剩余 ${r.remainingWeight}${ing?.unit || ''}，占原装 ${percent}%`}>
            <Space>
              <strong>{r.remainingWeight}</strong>
              <span style={{ color: '#8c8c8c', fontSize: 12 }}>{ing?.unit}</span>
              {r.remainingWeight <= (ing?.lowStockThreshold || 0) && (
                <WarningOutlined style={{ color: '#faad14' }} />
              )}
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: '封口方式',
      dataIndex: 'sealingMethod',
      key: 'sealingMethod',
      width: 110,
    },
    {
      title: '存放位置',
      dataIndex: 'freezerLocation',
      key: 'freezerLocation',
      width: 100,
      render: (loc: FreezerLocation) => (
        <Tag color="blue" style={{ margin: 0 }}>
          ❄️ {loc}
        </Tag>
      ),
    },
    {
      title: '实际温度',
      key: 'temp',
      width: 100,
      render: (_: unknown, r: OpenRecord) => {
        if (r.actualTemp === undefined) return '-';
        const ing = ingredientMap.get(r.ingredientId);
        const outOfRange = ing ? isTempOutOfRange(r, ing) : false;
        return (
          <Tag color={outOfRange ? 'red' : 'cyan'} style={{ margin: 0 }}>
            {r.actualTemp}°C
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right' as const,
      render: (_: unknown, r: OpenRecord) =>
        r.isDiscarded ? (
          <Space size="small">
            <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(r)}>
              详情
            </Button>
            <Tag color="red">
              报废: {r.discardReason}
            </Tag>
          </Space>
        ) : (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<ScissorOutlined />}
              onClick={() => handleUseIngredient(r)}
              disabled={r.remainingWeight <= 0}
            >
              取用
            </Button>
            <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(r)}>
              详情
            </Button>
            <Popconfirm
              title="确认报废该原料？"
              description={`将报废剩余 ${r.remainingWeight}${ingredientMap.get(r.ingredientId)?.unit || ''}`}
              okText="去报废"
              cancelText="取消"
              onConfirm={() => handleDiscard(r)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                报废
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const displayRecords = getDisplayRecords();
  const selectedIngredientForOpen = openForm.getFieldValue('ingredientId');
  const defaultWeightForOpen = ingredients.find((i) => i.id === selectedIngredientForOpen)?.totalWeight;

  return (
    <div className="table-card">
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
        <Radio.Group
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="active">
            开封中 ({activeRecords.length})
          </Radio.Button>
          <Radio.Button value="discarded">
            已报废 ({discardedRecords.length})
          </Radio.Button>
          <Radio.Button value="all">全部 ({openRecords.length})</Radio.Button>
        </Radio.Group>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenIngredient}>
          新建开封记录
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={displayRecords}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 新建开封 Modal */}
      <Modal
        title="新建开封记录"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleSubmitOpen}
        okText="确认开封"
        width={640}
        destroyOnClose
      >
        <Form form={openForm} layout="vertical">
          <Row gap={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="选择原料"
                name="ingredientId"
                rules={[{ required: true, message: '请选择原料' }]}
              >
                <Select
                  placeholder="请选择原料..."
                  showSearch
                  optionFilterProp="children"
                  onChange={() => {
                    const id = openForm.getFieldValue('ingredientId');
                    const ing = ingredients.find((i) => i.id === id);
                    if (ing) {
                      openForm.setFieldsValue({ remainingWeight: ing.totalWeight });
                    }
                  }}
                >
                  {ingredients.map((ing) => (
                    <Option key={ing.id} value={ing.id}>
                      {ing.name} - {ing.brand}（{ing.batch}）
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="开封日期"
                name="openDate"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} maxDate={dayjs() as unknown as Dayjs} />
              </Form.Item>
            </Col>
          </Row>
          <Row gap={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="操作人"
                name="operator"
                rules={[{ required: true, message: '请输入操作人' }]}
              >
                <Input placeholder="如：张师傅" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="开封时重量"
                name="remainingWeight"
                rules={[{ required: true, message: '请输入重量' }]}
                extra={
                  defaultWeightForOpen
                    ? `规格为 ${defaultWeightForOpen}，可根据实际情况调整`
                    : '请输入开封时的实际重量'
                }
              >
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gap={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="封口方式"
                name="sealingMethod"
                rules={[{ required: true, message: '请选择封口方式' }]}
              >
                <Select placeholder="请选择...">
                  {sealingMethods.map((m) => (
                    <Option key={m} value={m}>
                      {m}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="存放位置"
                name="freezerLocation"
                rules={[{ required: true, message: '请选择存放位置' }]}
              >
                <Select placeholder="请选择...">
                  {freezerLocations.map((l) => (
                    <Option key={l} value={l}>
                      ❄️ {l}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={
              <span>
                实际温度（°C）
                <Tooltip title="请输入当前存放位置实际测量的温度，用于监控是否符合储存要求">
                  <InfoCircleOutlined style={{ marginLeft: 4, color: '#8c8c8c' }} />
                </Tooltip>
              </span>
            }
            name="actualTemp"
          >
            <InputNumber style={{ width: '100%' }} step={0.5} placeholder="可选，如 4.5" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 取用 Modal */}
      <Modal
        title={
          <span>
            <ScissorOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
            原料取用
            {selectedRecord && (
              <Tag style={{ marginLeft: 8 }}>
                剩余 {selectedRecord.remainingWeight}
                {ingredientMap.get(selectedRecord.ingredientId)?.unit}
              </Tag>
            )}
          </span>
        }
        open={useModal}
        onCancel={() => {
          setUseModal(false);
          setSelectedRecord(null);
        }}
        onOk={handleSubmitUse}
        okText="确认取用"
        width={560}
        destroyOnClose
      >
        <Form form={useForm} layout="vertical">
          <Row gap={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="取用数量"
                name="amount"
                rules={[{ required: true, message: '请输入取用量' }]}
                extra={`单位：${ingredientMap.get(selectedRecord?.ingredientId || '')?.unit || ''}`}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  step={1}
                  max={selectedRecord?.remainingWeight}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="取用日期"
                name="usageDate"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} maxDate={dayjs() as unknown as Dayjs} />
              </Form.Item>
            </Col>
          </Row>
          <Row gap={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="产品批次号"
                name="productBatch"
                rules={[{ required: true, message: '请输入产品批次' }]}
                extra="用于追溯原料去向"
              >
                <Input placeholder="如：Cake20260614A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="操作人"
                name="operator"
                rules={[{ required: true, message: '请输入操作人' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gap={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="是否回封"
                name="resealed"
                rules={[{ required: true }]}
                valuePropName="checked"
              >
                <Radio.Group>
                  <Radio value={true}>已回封</Radio>
                  <Radio value={false}>未回封（弃置）</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="备注" name="note">
                <Input placeholder="可选" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 报废 Modal */}
      <Modal
        title={
          <span>
            <WarningOutlined style={{ color: '#cf1322', marginRight: 8 }} />
            原料报废确认
          </span>
        }
        open={discardModal}
        onCancel={() => {
          setDiscardModal(false);
          setSelectedRecord(null);
        }}
        onOk={handleSubmitDiscard}
        okText="确认报废"
        okButtonProps={{ danger: true }}
        width={520}
        destroyOnClose
      >
        {selectedRecord && (
          <div style={{ marginBottom: 16, padding: 16, background: '#fff1f0', borderRadius: 8 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="原料">
                {ingredientMap.get(selectedRecord.ingredientId)?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="批次">
                {ingredientMap.get(selectedRecord.ingredientId)?.batch || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="剩余数量">
                <strong style={{ color: '#cf1322' }}>
                  {selectedRecord.remainingWeight}
                  {ingredientMap.get(selectedRecord.ingredientId)?.unit}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="开封日期">
                {formatDate(selectedRecord.openDate)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
        <Form form={discardForm} layout="vertical">
          <Form.Item
            label="报废原因"
            name="reason"
            rules={[{ required: true, message: '请选择报废原因' }]}
          >
            <Select placeholder="请选择报废原因">
              {discardReasons.map((r) => (
                <Option key={r} value={r}>
                  {r}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="备注说明" name="note">
            <Input.TextArea rows={3} placeholder="可选，如异味、结块等具体描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情 Drawer */}
      <Drawer
        title="开封记录详情"
        placement="right"
        width={520}
        onClose={() => {
          setDetailDrawer(false);
          setSelectedRecord(null);
        }}
        open={detailDrawer}
      >
        {selectedRecord && (
          <div>
            <Descriptions title="基本信息" column={1} bordered size="small">
              <Descriptions.Item label="原料名称">
                {ingredientMap.get(selectedRecord.ingredientId)?.name}
              </Descriptions.Item>
              <Descriptions.Item label="品牌">
                {ingredientMap.get(selectedRecord.ingredientId)?.brand}
              </Descriptions.Item>
              <Descriptions.Item label="批次号">
                {ingredientMap.get(selectedRecord.ingredientId)?.batch}
              </Descriptions.Item>
              <Descriptions.Item label="开封日期">
                {formatDate(selectedRecord.openDate)}
              </Descriptions.Item>
              <Descriptions.Item label="操作人">{selectedRecord.operator}</Descriptions.Item>
              <Descriptions.Item label="封口方式">{selectedRecord.sealingMethod}</Descriptions.Item>
              <Descriptions.Item label="存放位置">{selectedRecord.freezerLocation}</Descriptions.Item>
              <Descriptions.Item label="实际温度">
                {selectedRecord.actualTemp !== undefined ? `${selectedRecord.actualTemp}°C` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="要求温度">
                {ingredientMap.get(selectedRecord.ingredientId)?.storageTempMin}°C ~{' '}
                {ingredientMap.get(selectedRecord.ingredientId)?.storageTempMax}°C
              </Descriptions.Item>
              <Descriptions.Item label="剩余数量">
                {selectedRecord.remainingWeight}
                {ingredientMap.get(selectedRecord.ingredientId)?.unit}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDateTime(selectedRecord.createdAt)}
              </Descriptions.Item>
            </Descriptions>

            {selectedRecord.isDiscarded && (
              <>
                <Divider />
                <Descriptions title="报废信息" column={1} bordered size="small">
                  <Descriptions.Item label="报废原因">
                    <Tag color="red">{selectedRecord.discardReason}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="报废日期">
                    {selectedRecord.discardDate}
                  </Descriptions.Item>
                  <Descriptions.Item label="操作人">
                    {selectedRecord.discardOperator}
                  </Descriptions.Item>
                  <Descriptions.Item label="备注">
                    {selectedRecord.discardNote || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            <Divider orientation="left">取用历史</Divider>
            <List
              size="small"
              dataSource={recordUsageHistory(selectedRecord.id)}
              locale={{ emptyText: '暂无取用记录' }}
              renderItem={(u) => (
                <List.Item key={u.id}>
                  <List.Item.Meta
                    title={
                      <Space>
                        <strong>
                          -{u.amount}
                          {ingredientMap.get(u.ingredientId)?.unit}
                        </strong>
                        <Tag color="blue">{u.productBatch}</Tag>
                        <Tag color={u.resealed ? 'green' : 'orange'}>
                          {u.resealed ? '已回封' : '未回封'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <span>
                        {formatDate(u.usageDate)} · {u.operator}
                        {u.note && ` · ${u.note}`}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Row({ gap, children }: { gap?: [number, number]; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        marginLeft: -(gap?.[0] || 0) / 2,
        marginRight: -(gap?.[0] || 0) / 2,
        rowGap: gap?.[1] || 0,
      }}
    >
      {children}
    </div>
  );
}

function Col({ span, children }: { span: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: `0 0 ${(span / 24) * 100}%`,
        maxWidth: `${(span / 24) * 100}%`,
        padding: '0 8px',
      }}
    >
      {children}
    </div>
  );
}

export default OpenRecords;
