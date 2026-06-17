import { useState, useEffect, useMemo } from 'react'
import {
  Table,
  Card,
  Select,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
  Descriptions,
  Statistic
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getOvens,
  getOven,
  createOven,
  updateOven,
  deleteOven,
  updateOvenStatus
} from '@/api/ovens'
import { getEmployees } from '@/api/employees'

const { Option } = Select
const { Search } = Input

const statusMap = {
  active: { label: '正常', color: 'green' },
  maintenance: { label: '维修中', color: 'orange' },
  decommissioned: { label: '已停用', color: 'red' }
}

const getStatusTag = (status) => {
  const config = statusMap[status] || statusMap.active
  return <Tag color={config.color}>{config.label}</Tag>
}

const getDeviationColor = (deviation) => {
  if (deviation === null || deviation === undefined) return 'default'
  const abs = Math.abs(deviation)
  if (abs <= 10) return 'green'
  if (abs <= 20) return 'orange'
  return 'red'
}

const getDeviationDisplay = (deviation) => {
  if (deviation === null || deviation === undefined) return '-'
  const sign = deviation > 0 ? '+' : ''
  return `${sign}${deviation}℃`
}

const Ovens = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [ovens, setOvens] = useState([])
  const [employees, setEmployees] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [statusFilter, setStatusFilter] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingOven, setEditingOven] = useState(null)
  const [ovenDetail, setOvenDetail] = useState(null)

  const fetchOvens = async (page = 1, pageSize = 10, status = null, search = '') => {
    setLoading(true)
    try {
      const params = {
        page,
        pageSize
      }
      if (status) {
        params.status = status
      }
      const data = await getOvens(params)
      let list = data.list
      if (search) {
        list = list.filter(item =>
          item.model.toLowerCase().includes(search.toLowerCase())
        )
      }
      setOvens(list)
      setPagination({
        current: page,
        pageSize,
        total: data.total
      })
    } catch (err) {
      console.error('获取烤箱列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees({ pageSize: 100 })
      setEmployees(data.list || [])
    } catch (err) {
      console.error('获取员工列表失败:', err)
    }
  }

  useEffect(() => {
    fetchOvens()
    fetchEmployees()
  }, [])

  const handleSearch = (value) => {
    setSearchText(value)
    fetchOvens(1, pagination.pageSize, statusFilter, value)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    fetchOvens(1, pagination.pageSize, value, searchText)
  }

  const handleTableChange = (page) => {
    fetchOvens(page.current, page.pageSize, statusFilter, searchText)
  }

  const handleAdd = () => {
    setEditingOven(null)
    form.resetFields()
    form.setFieldsValue({ status: 'active' })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingOven(record)
    form.setFieldsValue({
      model: record.model,
      serialNumber: record.serialNumber,
      totalLayers: record.totalLayers,
      probePosition: record.probePosition,
      commonTempZoneLow: record.commonTempZoneLow,
      commonTempZoneHigh: record.commonTempZoneHigh,
      employeeId: record.employeeId,
      status: record.status
    })
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingOven) {
        await updateOven(editingOven.id, values)
        message.success('更新成功')
      } else {
        await createOven(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchOvens(pagination.current, pagination.pageSize, statusFilter, searchText)
    } catch (err) {
      console.error('提交失败:', err)
    }
  }

  const handleView = async (record) => {
    setDetailLoading(true)
    try {
      const data = await getOven(record.id)
      setOvenDetail(data)
      setDetailVisible(true)
    } catch (err) {
      console.error('获取烤箱详情失败:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOvenStatus(id, newStatus)
      message.success('状态更新成功')
      fetchOvens(pagination.current, pagination.pageSize, statusFilter, searchText)
    } catch (err) {
      console.error('更新状态失败:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteOven(id)
      message.success('删除成功')
      fetchOvens(pagination.current, pagination.pageSize, statusFilter, searchText)
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const columns = useMemo(() => [
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      render: (text, record) => (
        <Space>
          {getStatusTag(record.status)}
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '序列号',
      dataIndex: 'serialNumber',
      key: 'serialNumber'
    },
    {
      title: '层数',
      dataIndex: 'totalLayers',
      key: 'totalLayers',
      width: 80
    },
    {
      title: '探针位置',
      dataIndex: 'probePosition',
      key: 'probePosition'
    },
    {
      title: '常用温区',
      dataIndex: 'commonTempZoneLow',
      key: 'commonTempZone',
      render: (_, record) => `${record.commonTempZoneLow}-${record.commonTempZoneHigh}℃`
    },
    {
      title: '负责人',
      dataIndex: ['employee', 'name'],
      key: 'employeeName',
      render: (text) => text || '-'
    },
    {
      title: '最近偏差',
      dataIndex: ['latestCalibration', 'deviation'],
      key: 'latestDeviation',
      render: (deviation) => (
        <Tag color={getDeviationColor(deviation)}>
          {getDeviationDisplay(deviation)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Select
            value={record.status}
            size="small"
            style={{ width: 100 }}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            <Option value="active">正常</Option>
            <Option value="maintenance">维修中</Option>
            <Option value="decommissioned">已停用</Option>
          </Select>
          <Popconfirm
            title="确定要删除这个烤箱吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [pagination, statusFilter, searchText])

  const calibrationColumns = [
    {
      title: '校准时间',
      dataIndex: 'calibratedAt',
      key: 'calibratedAt',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '层位',
      dataIndex: 'layerNumber',
      key: 'layerNumber',
      width: 60
    },
    {
      title: '设定温度',
      dataIndex: 'setTemp',
      key: 'setTemp',
      render: (temp) => `${temp}℃`
    },
    {
      title: '实际温度',
      dataIndex: 'actualTemp',
      key: 'actualTemp',
      render: (temp) => `${temp}℃`
    },
    {
      title: '偏差',
      dataIndex: 'deviation',
      key: 'deviation',
      render: (deviation) => (
        <Tag color={getDeviationColor(deviation)}>
          {getDeviationDisplay(deviation)}
        </Tag>
      )
    },
    {
      title: '调温建议',
      dataIndex: 'tempSuggestion',
      key: 'tempSuggestion',
      render: (text) => {
        if (!text) return '-'
        const hasWarning = text.includes('偏高') || text.includes('偏低')
        return hasWarning ? <Tag color="orange">{text}</Tag> : text
      }
    },
    {
      title: '操作人',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text) => text || '-'
    }
  ]

  return (
    <div>
      <Card
        title="设备管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增烤箱
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="按状态筛选"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
            value={statusFilter}
          >
            <Option value="active">正常</Option>
            <Option value="maintenance">维修中</Option>
            <Option value="decommissioned">已停用</Option>
          </Select>
          <Search
            placeholder="搜索型号"
            allowClear
            style={{ width: 250 }}
            onSearch={handleSearch}
            onChange={(e) => {
              if (!e.target.value) {
                handleSearch('')
              }
            }}
          />
        </Space>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={ovens}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingOven ? '编辑烤箱' : '新增烤箱'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="model"
                label="型号"
                rules={[{ required: true, message: '请输入型号' }]}
              >
                <Input placeholder="请输入型号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="serialNumber"
                label="序列号"
                rules={[{ required: true, message: '请输入序列号' }]}
              >
                <Input placeholder="请输入序列号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="totalLayers"
                label="层数"
                rules={[
                  { required: true, message: '请输入层数' },
                  { type: 'number', min: 1, message: '层数必须大于0' }
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="请输入层数"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="probePosition"
                label="探针位置"
                rules={[{ required: true, message: '请输入探针位置' }]}
              >
                <Input placeholder="请输入探针位置" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="commonTempZoneLow"
                label="常用温区下限"
                rules={[{ required: true, message: '请输入温度下限' }]}
              >
                <InputNumber
                  min={0}
                  max={500}
                  style={{ width: '100%' }}
                  placeholder="℃"
                  addonAfter="℃"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="commonTempZoneHigh"
                label="常用温区上限"
                dependencies={['commonTempZoneLow']}
                rules={[
                  { required: true, message: '请输入温度上限' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('commonTempZoneLow') < value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('温度上限必须大于下限'))
                    }
                  })
                ]}
              >
                <InputNumber
                  min={0}
                  max={500}
                  style={{ width: '100%' }}
                  placeholder="℃"
                  addonAfter="℃"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="employeeId"
                label="负责人"
              >
                <Select
                  placeholder="请选择负责人"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {employees.map(emp => (
                    <Option key={emp.id} value={emp.id}>
                      {emp.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">正常</Option>
                  <Option value="maintenance">维修中</Option>
                  <Option value="decommissioned">已停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="烤箱详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : ovenDetail && (
          <div>
            <Card title="基本信息" style={{ marginBottom: 16 }}>
              <Descriptions column={3} size="small">
                <Descriptions.Item label="型号">
                  <Space>
                    {getStatusTag(ovenDetail.status)}
                    <span>{ovenDetail.model}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="序列号">
                  {ovenDetail.serialNumber}
                </Descriptions.Item>
                <Descriptions.Item label="层数">
                  {ovenDetail.totalLayers}
                </Descriptions.Item>
                <Descriptions.Item label="探针位置">
                  {ovenDetail.probePosition}
                </Descriptions.Item>
                <Descriptions.Item label="常用温区">
                  {ovenDetail.commonTempZoneLow}-{ovenDetail.commonTempZoneHigh}℃
                </Descriptions.Item>
                <Descriptions.Item label="负责人">
                  {ovenDetail.employee?.name || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="关联配方数"
                    value={ovenDetail.recipeCount || 0}
                    suffix="个"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="最近30天失败批次"
                    value={ovenDetail.failedBatchesLast30Days || 0}
                    suffix="次"
                    valueStyle={{ color: (ovenDetail.failedBatchesLast30Days || 0) > 0 ? '#cf1322' : '#3f8600' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="最近10条校准历史">
              <Table
                rowKey="id"
                columns={calibrationColumns}
                dataSource={ovenDetail.calibrationHistory || []}
                pagination={false}
                size="small"
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Ovens
