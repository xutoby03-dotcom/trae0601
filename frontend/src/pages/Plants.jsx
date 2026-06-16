import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Space,
  Modal,
  message,
  Descriptions,
  Popconfirm,
  Row,
  Col,
} from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getPlants, getPlantById, createPlant, updatePlant, deletePlant } from '../api/plants'
import { getWaterRecordsByPlant } from '../api/waterRecords'

const { Option } = Select
const { TextArea } = Input

const statusMap = {
  healthy: { text: '健康', color: 'green' },
  warning: { text: '注意', color: 'orange' },
  sick: { text: '生病', color: 'red' },
  dead: { text: '死亡', color: 'default' },
}

const sunSensitivityMap = {
  low: { text: '耐阴', color: 'blue' },
  medium: { text: '中等', color: 'default' },
  high: { text: '喜阳', color: 'orange' },
}

function Plants() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState({ location: '', groupName: '', status: '' })
  const [locationOptions, setLocationOptions] = useState([])
  const [groupNameOptions, setGroupNameOptions] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingPlant, setEditingPlant] = useState(null)
  const [detailPlant, setDetailPlant] = useState(null)
  const [waterRecords, setWaterRecords] = useState([])
  const [form] = Form.useForm()

  const fetchPlants = async (page = 1, pageSize = 10, filterParams = {}) => {
    setLoading(true)
    try {
      const res = await getPlants({
        page,
        pageSize,
        ...filterParams,
      })
      if (res.code === 0) {
        const list = res.data.list || res.data || []
        setData(list)
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: res.data.total || 0,
        }))
        const locations = [...new Set(list.map((p) => p.location).filter(Boolean))]
        const groupNames = [...new Set(list.map((p) => p.groupName).filter(Boolean))]
        setLocationOptions(locations)
        setGroupNameOptions(groupNames)
      } else {
        message.error(res.message || '获取植物列表失败')
      }
    } catch (err) {
      console.error('获取植物列表失败:', err)
      message.error('获取植物列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlants()
  }, [])

  const handleSearch = () => {
    fetchPlants(1, pagination.pageSize, filters)
  }

  const handleTableChange = (page) => {
    fetchPlants(page.current, page.pageSize, filters)
  }

  const handleAdd = () => {
    setEditingPlant(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = async (record) => {
    setEditingPlant(record)
    try {
      const res = await getPlantById(record.id)
      if (res.code === 0) {
        form.setFieldsValue(res.data)
      }
    } catch (err) {
      console.error('获取植物详情失败:', err)
      form.setFieldsValue(record)
    }
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      const res = await deletePlant(id)
      if (res.code === 0) {
        message.success('删除成功')
        fetchPlants(pagination.current, pagination.pageSize, filters)
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (err) {
      console.error('删除植物失败:', err)
      message.error('删除失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingPlant) {
        const res = await updatePlant(editingPlant.id, values)
        if (res.code === 0) {
          message.success('更新成功')
          setModalVisible(false)
          fetchPlants(pagination.current, pagination.pageSize, filters)
        } else {
          message.error(res.message || '更新失败')
        }
      } else {
        const res = await createPlant(values)
        if (res.code === 0) {
          message.success('创建成功')
          setModalVisible(false)
          fetchPlants(1, pagination.pageSize, filters)
        } else {
          message.error(res.message || '创建失败')
        }
      }
    } catch (error) {
      if (error.errorFields) return
      message.error(editingPlant ? '更新失败' : '创建失败')
    }
  }

  const handleViewDetail = async (record) => {
    setDetailVisible(true)
    setDetailPlant(record)
    try {
      const [plantRes, recordsRes] = await Promise.all([
        getPlantById(record.id),
        getWaterRecordsByPlant(record.id),
      ])
      if (plantRes.code === 0) {
        setDetailPlant(plantRes.data)
      }
      if (recordsRes.code === 0) {
        setWaterRecords(recordsRes.data.list || recordsRes.data || [])
      }
    } catch (error) {
      console.error('获取详情失败', error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '品种', dataIndex: 'species', key: 'species' },
    { title: '位置', dataIndex: 'location', key: 'location' },
    { title: '盆径(cm)', dataIndex: 'potSize', key: 'potSize', width: 100 },
    {
      title: '怕晒程度',
      dataIndex: 'sunSensitivity',
      key: 'sunSensitivity',
      width: 100,
      render: (value) => {
        const item = sunSensitivityMap[value] || { text: value, color: 'default' }
        return <Tag color={item.color}>{item.text}</Tag>
      },
    },
    { title: '负责小组', dataIndex: 'groupName', key: 'groupName', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value) => {
        const item = statusMap[value] || { text: value, color: 'default' }
        return <Tag color={item.color}>{item.text}</Tag>
      },
    },
    {
      title: '上次浇水时间',
      dataIndex: 'lastWateredAt',
      key: 'lastWateredAt',
      width: 180,
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这株植物吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card title="植物管理">
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              placeholder="请选择位置"
              allowClear
              style={{ width: '100%' }}
              value={filters.location || undefined}
              onChange={(value) => setFilters({ ...filters, location: value || '' })}
            >
              {locationOptions.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="请选择负责小组"
              allowClear
              style={{ width: '100%' }}
              value={filters.groupName || undefined}
              onChange={(value) => setFilters({ ...filters, groupName: value || '' })}
            >
              {groupNameOptions.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="请选择状态"
              allowClear
              style={{ width: '100%' }}
              value={filters.status || undefined}
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              {Object.entries(statusMap).map(([key, item]) => (
                <Option key={key} value={key}>
                  {item.text}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增植物
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingPlant ? '编辑植物' : '新增植物'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="名称"
                rules={[{ required: true, message: '请输入名称' }]}
              >
                <Input placeholder="请输入名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="species"
                label="品种"
                rules={[{ required: true, message: '请输入品种' }]}
              >
                <Input placeholder="请输入品种" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="位置"
                rules={[{ required: true, message: '请输入位置' }]}
              >
                <Input placeholder="请输入位置" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="potSize"
                label="盆径(cm)"
                rules={[{ required: true, message: '请输入盆径' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入盆径" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sunSensitivity" label="怕晒程度">
                <Select placeholder="请选择怕晒程度">
                  {Object.entries(sunSensitivityMap).map(([key, item]) => (
                    <Option key={key} value={key}>
                      {item.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="groupName" label="负责小组" rules={[{ required: true, message: '请输入负责小组' }]}>
                <Input placeholder="请输入负责小组" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态">
                  {Object.entries(statusMap).map(([key, item]) => (
                    <Option key={key} value={key}>
                      {item.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="waterIntervalDays" label="浇水间隔(天)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入浇水间隔天数" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="植物详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {detailPlant && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID">{detailPlant.id}</Descriptions.Item>
              <Descriptions.Item label="名称">{detailPlant.name}</Descriptions.Item>
              <Descriptions.Item label="品种">{detailPlant.species}</Descriptions.Item>
              <Descriptions.Item label="位置">{detailPlant.location}</Descriptions.Item>
              <Descriptions.Item label="盆径(cm)">{detailPlant.potSize}</Descriptions.Item>
              <Descriptions.Item label="怕晒程度">
                {sunSensitivityMap[detailPlant.sunSensitivity]?.text || detailPlant.sunSensitivity}
              </Descriptions.Item>
              <Descriptions.Item label="负责小组">{detailPlant.groupName}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {statusMap[detailPlant.status]?.text || detailPlant.status}
              </Descriptions.Item>
              <Descriptions.Item label="浇水间隔(天)">{detailPlant.waterIntervalDays || '-'}</Descriptions.Item>
              <Descriptions.Item label="上次浇水时间">
                {detailPlant.lastWateredAt ? dayjs(detailPlant.lastWateredAt).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {detailPlant.notes || '-'}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h4 style={{ marginBottom: 12 }}>最近浇水记录</h4>
              {waterRecords.length > 0 ? (
                <Table
                  size="small"
                  dataSource={waterRecords}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '日期', dataIndex: 'recordDate', key: 'recordDate', render: (v) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
                    { title: '浇水量(ml)', dataIndex: 'waterAmount', key: 'waterAmount' },
                    { title: '操作人', dataIndex: 'employeeName', key: 'employeeName' },
                  ]}
                />
              ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>暂无浇水记录</p>
              )}
            </div>
          </>
        )}
      </Modal>
    </Card>
  )
}

export default Plants
