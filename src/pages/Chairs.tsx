import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Image,
  Tag,
  Space,
  Card,
  InputNumber,
  message,
  Popconfirm,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { Chair, ArmrestType } from '@/types';
import { AREAS, MODELS, ARMREST_TYPE_LABEL } from '@/types';
import { useStore } from '@/store';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

export default function Chairs() {
  const { chairs, orders, addChair, updateChair, deleteChair, setChairDisabled, loading } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Chair | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailChair, setDetailChair] = useState<Chair | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterArea, setFilterArea] = useState<string | undefined>();
  const [filterModel, setFilterModel] = useState<string | undefined>();
  const [filterArmrest, setFilterArmrest] = useState<ArmrestType | undefined>();

  const chairOrderCount = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      map[o.chairId] = (map[o.chairId] || 0) + 1;
    });
    return map;
  }, [orders]);

  const filteredChairs = useMemo(() => {
    return chairs.filter((c) => {
      if (searchText && !c.code.toLowerCase().includes(searchText.toLowerCase()) && !c.gasRodBatch.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      if (filterArea && c.area !== filterArea) return false;
      if (filterModel && c.model !== filterModel) return false;
      if (filterArmrest && c.armrestType !== filterArmrest) return false;
      return true;
    });
  }, [chairs, searchText, filterArea, filterModel, filterArmrest]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (chair: Chair) => {
    setEditing(chair);
    form.setFieldsValue({
      ...chair,
      purchaseDate: dayjs(chair.purchaseDate),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        purchaseDate: (values.purchaseDate as Dayjs).format('YYYY-MM-DD'),
        photo: values.photo || `https://picsum.photos/seed/${Date.now()}/400/300`,
      };
      if (editing) {
        await updateChair(editing.id, payload);
        message.success('椅子信息已更新');
      } else {
        await addChair(payload);
        message.success('新椅子已录入');
      }
      setModalOpen(false);
    } catch (e) {
      // validation
    }
  };

  const showDetail = (chair: Chair) => {
    setDetailChair(chair);
    setDetailOpen(true);
  };

  const handleToggleDisable = async (chair: Chair) => {
    await setChairDisabled(chair.id, !chair.disabled);
    message.success(chair.disabled ? '已恢复使用' : '已标记停用');
  };

  const columns = [
    {
      title: '编号',
      dataIndex: 'code',
      width: 110,
      fixed: 'left' as const,
      render: (v: string, r: Chair) => (
        <Space>
          <Tag color={r.disabled ? 'default' : 'teal'} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            {v}
          </Tag>
          {r.disabled && <Badge status="default" text="停用" />}
        </Space>
      ),
    },
    {
      title: '照片',
      dataIndex: 'photo',
      width: 100,
      render: (v?: string) =>
        v ? <Image width={64} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} src={v} /> : '—',
    },
    { title: '区域', dataIndex: 'area', width: 140 },
    { title: '型号', dataIndex: 'model', width: 170 },
    {
      title: '购买日期',
      dataIndex: 'purchaseDate',
      width: 120,
      render: (v: string) => <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>,
    },
    {
      title: '气压杆批次',
      dataIndex: 'gasRodBatch',
      width: 130,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    { title: '扶手类型', dataIndex: 'armrestType', width: 110, render: (v: ArmrestType) => ARMREST_TYPE_LABEL[v] },
    {
      title: '维修次数',
      width: 100,
      render: (_: unknown, r: Chair) => {
        const count = chairOrderCount[r.id] || 0;
        const color = count === 0 ? 'green' : count <= 2 ? 'orange' : 'red';
        return <Tag color={color}>{count} 次</Tag>;
      },
    },
    {
      title: '操作',
      width: 230,
      fixed: 'right' as const,
      render: (_: unknown, r: Chair) => (
        <Space size={4}>
          <Tooltip title="详情">
            <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => showDetail(r)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          </Tooltip>
          <Tooltip title={r.disabled ? '恢复使用' : '标记停用'}>
            <Button
              size="small"
              type="text"
              danger={!r.disabled}
              icon={r.disabled ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleDisable(r)}
            />
          </Tooltip>
          <Popconfirm title="确认删除这把椅子吗？" onConfirm={() => deleteChair(r.id)}>
            <Tooltip title="删除">
              <Button size="small" type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-header">椅子管理</h2>
      <p className="page-subheader">维护所有工学椅的档案信息，支持批量筛选和停用标记。</p>

      <Card style={{ marginBottom: 20, borderRadius: 12 }} bordered={false}>
        <Space wrap size={14}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索编号 / 气压杆批次"
            style={{ width: 260 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            allowClear
            placeholder="区域"
            style={{ width: 160 }}
            options={AREAS.map((a) => ({ value: a, label: a }))}
            value={filterArea}
            onChange={setFilterArea}
          />
          <Select
            allowClear
            placeholder="型号"
            style={{ width: 200 }}
            options={MODELS.map((m) => ({ value: m, label: m }))}
            value={filterModel}
            onChange={setFilterModel}
          />
          <Select<ArmrestType>
            allowClear
            placeholder="扶手类型"
            style={{ width: 150 }}
            options={Object.entries(ARMREST_TYPE_LABEL).map(([v, l]) => ({ value: v as ArmrestType, label: l }))}
            value={filterArmrest}
            onChange={setFilterArmrest}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            style={{ marginLeft: 'auto' }}
          >
            新增椅子
          </Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }} bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredChairs}
          loading={loading}
          scroll={{ x: 1250 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 把椅子` }}
        />
      </Card>

      <Modal
        title={editing ? '编辑椅子信息' : '录入新椅子'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        width={640}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="code" label="椅子编号" rules={[{ required: true, message: '请输入编号' }]}>
              <Input placeholder="例如：A-001" />
            </Form.Item>
            <Form.Item name="area" label="所属区域" rules={[{ required: true, message: '请选择区域' }]}>
              <Select options={AREAS.map((a) => ({ value: a, label: a }))} />
            </Form.Item>
            <Form.Item name="model" label="椅子型号" rules={[{ required: true, message: '请选择型号' }]}>
              <Select options={MODELS.map((m) => ({ value: m, label: m }))} />
            </Form.Item>
            <Form.Item name="purchaseDate" label="购买日期" rules={[{ required: true, message: '请选择日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="gasRodBatch" label="气压杆批次" rules={[{ required: true, message: '请输入批次' }]}>
              <Input placeholder="例如：GR2023-123" />
            </Form.Item>
            <Form.Item name="armrestType" label="扶手类型" rules={[{ required: true, message: '请选择类型' }]}>
              <Select<ArmrestType>
                options={Object.entries(ARMREST_TYPE_LABEL).map(([v, l]) => ({ value: v as ArmrestType, label: l }))}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="photo"
            label="照片URL"
            tooltip="也可以直接用下面的上传按钮选一张（可选）"
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: -8 }}>
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={(f) => {
                const reader = new FileReader();
                reader.onload = () => form.setFieldsValue({ photo: reader.result as string });
                reader.readAsDataURL(f);
                return false;
              }}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 4 }}>上传</div>
              </div>
            </Upload>
            （提示：Demo 环境下上传会转为 Base64 预览）
          </div>
        </Form>
      </Modal>

      <Modal
        title={`椅子详情：${detailChair?.code || ''}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={560}
      >
        {detailChair && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              {detailChair.photo && (
                <img
                  src={detailChair.photo}
                  alt={detailChair.code}
                  style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10 }}
                />
              )}
            </div>
            <div><div style={{ color: '#6b7280', fontSize: 12 }}>编号</div><div style={{ fontWeight: 600 }}>{detailChair.code}</div></div>
            <div><div style={{ color: '#6b7280', fontSize: 12 }}>区域</div><div>{detailChair.area}</div></div>
            <div><div style={{ color: '#6b7280', fontSize: 12 }}>型号</div><div>{detailChair.model}</div></div>
            <div><div style={{ color: '#6b7280', fontSize: 12 }}>购买日期</div><div>{detailChair.purchaseDate}</div></div>
            <div><div style={{ color: '#6b7280', fontSize: 12 }}>气压杆批次</div><div>{detailChair.gasRodBatch}</div></div>
            <div><div style={{ color: '#6b7280', fontSize: 12 }}>扶手类型</div><div>{ARMREST_TYPE_LABEL[detailChair.armrestType]}</div></div>
            <div><div style={{ color: '#6b7280', fontSize: 12 }}>累计维修</div><div>{chairOrderCount[detailChair.id] || 0} 次</div></div>
            <div><div style={{ color: '#6b7280', fontSize: 12 }}>使用状态</div><div>{detailChair.disabled ? '已停用' : '正常使用'}</div></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
