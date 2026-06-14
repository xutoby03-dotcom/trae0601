import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Popconfirm,
  message,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { Ingredient, StorageUnit } from '../types';
import { useStore } from '../store/useStore';

const { Option } = Select;

const unitOptions: StorageUnit[] = ['g', 'kg', 'ml', 'L', 'pcs'];

interface FormValues {
  name: string;
  brand: string;
  batch: string;
  unopenedShelfLifeDays: number;
  openedDays: number;
  storageTempMin: number;
  storageTempMax: number;
  totalWeight: number;
  unit: StorageUnit;
  lowStockThreshold: number;
  photo?: string;
}

function Ingredients() {
  const ingredients = useStore((s) => s.ingredients);
  const addIngredient = useStore((s) => s.addIngredient);
  const updateIngredient = useStore((s) => s.updateIngredient);
  const deleteIngredient = useStore((s) => s.deleteIngredient);
  const getIngredientLoss = useStore((s) => s.getIngredientLoss);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [searchText, setSearchText] = useState('');

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setFileList([]);
    setModalOpen(true);
  };

  const handleEdit = (record: Ingredient) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      brand: record.brand,
      batch: record.batch,
      unopenedShelfLifeDays: record.unopenedShelfLifeDays,
      openedDays: record.openedDays,
      storageTempMin: record.storageTempMin,
      storageTempMax: record.storageTempMax,
      totalWeight: record.totalWeight,
      unit: record.unit,
      lowStockThreshold: record.lowStockThreshold,
    });
    setFileList(
      record.photo
        ? [
            {
              uid: '-1',
              name: 'photo.png',
              status: 'done',
              url: record.photo,
            },
          ]
        : []
    );
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteIngredient(id);
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const photo = fileList.length > 0 ? (fileList[0].url || (fileList[0] as unknown as { base64?: string }).base64) : undefined;

      if (editingId) {
        updateIngredient(editingId, { ...values, photo });
        message.success('更新成功');
      } else {
        addIngredient({ ...values, photo });
        message.success('添加成功');
      }
      setModalOpen(false);
    } catch {
      // validation error
    }
  };

  const uploadProps: UploadProps = {
    listType: 'picture-card',
    fileList,
    onChange: ({ fileList: newList }) => {
      setFileList(newList);
    },
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFileList([
          {
            uid: file.uid,
            name: file.name,
            status: 'done',
            url: base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
      return false;
    },
    accept: 'image/*',
    maxCount: 1,
  };

  const filteredIngredients = ingredients.filter(
    (i) =>
      i.name.includes(searchText) ||
      i.brand.includes(searchText) ||
      i.batch.includes(searchText)
  );

  const columns = [
    {
      title: '照片',
      dataIndex: 'photo',
      key: 'photo',
      width: 80,
      render: (photo: string | undefined, record: Ingredient) =>
        photo ? (
          <img src={photo} alt={record.name} className="ingredient-photo" />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              background: '#fafafa',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bfbfbf',
              fontSize: 20,
            }}
          >
            🍞
          </div>
        ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (t: string) => <strong>{t}</strong>,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
    },
    {
      title: '批次',
      dataIndex: 'batch',
      key: 'batch',
      width: 120,
    },
    {
      title: '规格',
      key: 'spec',
      width: 100,
      render: (_: unknown, r: Ingredient) => `${r.totalWeight}${r.unit}`,
    },
    {
      title: '未开封保质期',
      key: 'shelf',
      width: 120,
      render: (_: unknown, r: Ingredient) => (
        <Tag color="blue">{r.unopenedShelfLifeDays} 天</Tag>
      ),
    },
    {
      title: '开封后可用',
      key: 'opened',
      width: 110,
      render: (_: unknown, r: Ingredient) => <Tag color="orange">{r.openedDays} 天</Tag>,
    },
    {
      title: '储存温度',
      key: 'temp',
      width: 110,
      render: (_: unknown, r: Ingredient) => (
        <Tag color="cyan">
          {r.storageTempMin}°C ~ {r.storageTempMax}°C
        </Tag>
      ),
    },
    {
      title: '告警阈值',
      key: 'threshold',
      width: 110,
      render: (_: unknown, r: Ingredient) => `${r.lowStockThreshold}${r.unit}`,
    },
    {
      title: '损耗率',
      key: 'loss',
      width: 90,
      render: (_: unknown, r: Ingredient) => {
        const loss = getIngredientLoss(r.id);
        return (
          <span style={{ color: loss.lossRate > 20 ? '#cf1322' : '#389e0d', fontWeight: 600 }}>
            {loss.lossRate}%
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, r: Ingredient) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(r)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该原料档案？" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalTypes = ingredients.length;
  const totalWeight = ingredients.reduce((s, i) => s + i.totalWeight, 0);
  const needsCold = ingredients.filter(
    (i) => i.storageTempMax <= 10
  ).length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="原料种类" value={totalTypes} suffix="种" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="需冷藏/冷冻" value={needsCold} suffix="种" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="总规格量" value={totalWeight} suffix="单位合计" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="开封后平均可用"
              value={
                totalTypes
                  ? Math.round(ingredients.reduce((s, i) => s + i.openedDays, 0) / totalTypes)
                  : 0
              }
              suffix="天"
            />
          </Card>
        </Col>
      </Row>

      <div className="table-card">
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Input.Search
            placeholder="搜索名称/品牌/批次"
            style={{ width: 320 }}
            allowClear
            onSearch={(v) => setSearchText(v)}
            onChange={(e) => !e.target.value && setSearchText('')}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增原料
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredIngredients}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </div>

      <Modal
        title={editingId ? '编辑原料档案' : '新增原料档案'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText="保存"
        cancelText="取消"
        width={680}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ unit: 'g' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="原料名称"
                name="name"
                rules={[{ required: true, message: '请输入原料名称' }]}
              >
                <Input placeholder="如：淡奶油" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="品牌"
                name="brand"
                rules={[{ required: true, message: '请输入品牌' }]}
              >
                <Input placeholder="如：安佳" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="批次号"
                name="batch"
                rules={[{ required: true, message: '请输入批次号' }]}
              >
                <Input placeholder="如：AC20260601" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="照片" name="photo">
                <Upload {...uploadProps}>
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 4, fontSize: 12 }}>上传</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="规格总量"
                name="totalWeight"
                rules={[{ required: true, message: '请输入规格' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="单位"
                name="unit"
                rules={[{ required: true, message: '请选择单位' }]}
              >
                <Select>
                  {unitOptions.map((u) => (
                    <Option key={u} value={u}>
                      {u}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="告警阈值"
                name="lowStockThreshold"
                rules={[{ required: true, message: '请输入告警阈值' }]}
                extra="低于此量时提醒"
              >
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="未开封保质期（天）"
                name="unopenedShelfLifeDays"
                rules={[{ required: true, message: '请输入未开封保质期' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="开封后可用天数"
                name="openedDays"
                rules={[{ required: true, message: '请输入开封后可用天数' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="最低储存温度（°C）"
                name="storageTempMin"
                rules={[{ required: true, message: '请输入最低温度' }]}
              >
                <InputNumber style={{ width: '100%' }} step={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="最高储存温度（°C）"
                name="storageTempMax"
                rules={[{ required: true, message: '请输入最高温度' }]}
              >
                <InputNumber style={{ width: '100%' }} step={1} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default Ingredients;
