import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Select,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Tag,
  Space,
  Popconfirm,
  message,
  Alert,
  Row,
  Col,
  Tooltip,
  Descriptions,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getCalibrations,
  getCalibration,
  createCalibration,
  updateCalibration,
  deleteCalibration,
} from '@/api/calibration'
import { getOvens } from '@/api/ovens'
import { getEmployees } from '@/api/employees'

const { RangePicker } = DatePicker
const { Option } = Select

const generateTempSuggestion = (deviation, topHeat, bottomHeat) => {
  const suggestions = []
  const absDeviation = Math.abs(deviation)

  if (
    topHeat !== undefined &&
    topHeat !== null &&
    bottomHeat !== undefined &&
    bottomHeat !== null
  ) {
    const topBottomDiff = topHeat - bottomHeat
    const absTopBottomDiff = Math.abs(topBottomDiff)
    if (absTopBottomDiff > 10) {
      if (topBottomDiff > 0) {
        suggestions.push(`上火偏高${topBottomDiff}度，建议降低上火${topBottomDiff}度`)
      } else {
        suggestions.push(`下火偏高${absTopBottomDiff}度，建议降低下火${absTopBottomDiff}度`)
      }
    }
  }

  if (absDeviation > 10) {
    if (deviation < 0) {
      suggestions.push(`实际比设定低${absDeviation}度，建议设定温度增加${absDeviation}度`)
    } else {
      suggestions.push(`实际比设定高${absDeviation}度，建议设定温度降低${absDeviation}度`)
    }
  }

  if (suggestions.length === 0) {
    return '温度正常，无需调整'
  }

  return suggestions.join('；')
}

const Calibration = () => {
  const [form] = Form.useForm()
  const [filterForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [ovens, setOvens] = useState([])
  const [employees, setEmployees] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [detailRecord, setDetailRecord] = useState(null)
  const [previewSuggestion, setPreviewSuggestion] = useState(null)

  useEffect(() => {
    fetchOvens()
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchData()
  }, [pagination])

  const fetchOvens = async () => {
    try {
      const res = await getOvens({ pageSize: 100 })
      setOvens(res.list || [])
    } catch (err) {
      console.error('获取烤箱列表失败:', err)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees({ pageSize: 100 })
      setEmployees(res.list || [])
    } catch (err) {
      console.error('获取员工列表失败:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const filters = filterForm.getFieldsValue()
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (filters.ovenId) {
        params.ovenId = filters.ovenId
      }
      if (filters.layerNumber) {
        params.layerNumber = filters.layerNumber
      }
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD HH:mm:ss')
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD HH:mm:ss')
      }
      const res = await getCalibrations(params)
      setData(res.list || [])
      setTotal(res.total || 0)
    } catch (err) {
      message.error('获取校准记录失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    setTimeout(() => fetchData(), 0)
  }

  const handleReset = () => {
    filterForm.resetFields()
    setPagination((prev) => ({ ...prev, current: 1 }))
    setTimeout(() => fetchData(), 0)
  }

  const handleAdd = () => {
    setEditingRecord(null)
    setPreviewSuggestion(null)
    const currentEmployeeId = localStorage.getItem('currentEmployeeId')
    form.resetFields()
    form.setFieldsValue({
      calibratedAt: dayjs(),
      employeeId: currentEmployeeId || undefined,
    })
    setModalVisible(true)
  }

  const handleEdit = async (record) => {
    try {
      const res = await getCalibration(record.id)
      setEditingRecord(res)
      setPreviewSuggestion(null)
      form.resetFields()
      form.setFieldsValue({
        ovenId: res.ovenId,
        layerNumber: res.layerNumber,
        setTemp: res.setTemp,
        actualTemp: res.actualTemp,
        topHeat: res.topHeat,
        bottomHeat: res.bottomHeat,
        preheatMinutes: res.preheatMinutes,
        testPoint: res.testPoint,
        employeeId: res.employeeId,
        calibratedAt: dayjs(res.calibratedAt),
        notes: res.notes,
      })
      const deviation = res.actualTemp - res.setTemp
      const suggestion = generateTempSuggestion(deviation, res.topHeat, res.bottomHeat)
      setPreviewSuggestion(suggestion)
      setModalVisible(true)
    } catch (err) {
      message.error('获取校准记录详情失败')
      console.error(err)
    }
  }

  const handleViewDetail = async (record) => {
    try {
      const res = await getCalibration(record.id)
      setDetailRecord(res)
      setDetailVisible(true)
    } catch (err) {
      message.error('获取校准记录详情失败')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCalibration(id)
      message.success('删除成功')
      fetchData()
    } catch (err) {
      message.error('删除失败')
      console.error(err)
    }
  }

  const handleFormValuesChange = (_, allValues) => {
    const { setTemp, actualTemp, topHeat, bottomHeat } = allValues
    if (setTemp !== undefined && setTemp !== null && actualTemp !== undefined && actualTemp !== null) {
      const deviation = actualTemp - setTemp
      const suggestion = generateTempSuggestion(deviation, topHeat, bottomHeat)
      setPreviewSuggestion(suggestion)
    } else {
      setPreviewSuggestion(null)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        calibratedAt: values.calibratedAt.format('YYYY-MM-DD HH:mm:ss'),
      }

      if (editingRecord) {
        await updateCalibration(editingRecord.id, submitData)
        message.success('更新成功')
      } else {
        await createCalibration(submitData)
        message.success('创建成功')
      }

      setModalVisible(false)
      fetchData()
    } catch (err) {
      if (err.errorFields) {
        return
      }
      message.error(editingRecord ? '更新失败' : '创建失败')
      console.error(err)
    }
  }

  const getDeviationColor = (deviation) => {
    if (Math.abs(deviation) <= 10) return 'success'
    if (deviation > 0) return 'error'
    return 'processing'
  }

  const getDeviationText = (deviation) => {
    if (deviation > 0) return `+${deviation}`
    return String(deviation)
  }

  const getSuggestionTag = (suggestion) => {
    if (!suggestion) return null
    const isNormal = suggestion === '温度正常，无需调整'
    return (
      <Tooltip title={suggestion}>
        <Tag color={isNormal ? 'success' : 'warning'}>
          {isNormal ? '正常' : '需调整'}
        </Tag>
      </Tooltip>
    )
  }

  const columns = [
    {
      title: '校准时间',
      dataIndex: 'calibratedAt',
      width: 170,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '烤箱型号',
      dataIndex: 'ovenModel',
      width: 140,
    },
    {
      title: '层位',
      dataIndex: 'layerNumber',
      width: 60,
      render: (text) => `第${text}层`,
    },
    {
      title: '设定温度',
      dataIndex: 'setTemp',
      width: 90,
      render: (text) => `${text}°C`,
    },
    {
      title: '实际温度',
      dataIndex: 'actualTemp',
      width: 90,
      render: (text) => `${text}°C`,
    },
    {
      title: '偏差',
      dataIndex: 'deviation',
      width: 80,
      render: (text) => (
        <span style={{ color: getDeviationColor(text) === 'error' ? '#ff4d4f' : getDeviationColor(text) === 'processing' ? '#1890ff' : '#52c41a', fontWeight: 'bold' }}>
          {getDeviationText(text)}°C
        </span>
      ),
    },
    {
      title: '上下火',
      width: 100,
      render: (_, record) => `${record.topHeat}/${record.bottomHeat}`,
    },
    {
      title: '预热时间',
      dataIndex: 'preheatMinutes',
      width: 90,
      render: (text) => `${text}分钟`,
    },
    {
      title: '测试点',
      dataIndex: 'testPoint',
      width: 80,
    },
    {
      title: '调温建议',
      dataIndex: 'tempSuggestion',
      width: 100,
      render: (text) => getSuggestionTag(text),
    },
    {
      title: '操作人',
      dataIndex: 'employeeName',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
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
          <Popconfirm
            title="确定要删除这条校准记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="📊 校准记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增校准
          </Button>
        }
      >
        <Card style={{ marginBottom: 16, background: '#fafafa' }}>
          <Form form={filterForm} layout="inline">
            <Form.Item name="ovenId" label="烤箱">
              <Select placeholder="请选择烤箱" style={{ width: 180 }} allowClear>
                {ovens.map((oven) => (
                  <Option key={oven.id} value={oven.id}>
                    {oven.model}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="layerNumber" label="层位">
              <InputNumber placeholder="层位" min={1} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="dateRange" label="日期范围">
              <RangePicker showTime style={{ width: 360 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1300 }}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize })
            },
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑校准记录' : '新增校准记录'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleFormValuesChange}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ovenId"
                label="烤箱"
                rules={[{ required: true, message: '请选择烤箱' }]}
              >
                <Select placeholder="请选择烤箱">
                  {ovens.map((oven) => (
                    <Option key={oven.id} value={oven.id}>
                      {oven.model}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="layerNumber"
                label="层位"
                rules={[{ required: true, message: '请输入层位' }]}
              >
                <InputNumber placeholder="层位" min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="setTemp"
                label="设定温度 (°C)"
                rules={[{ required: true, message: '请输入设定温度' }]}
              >
                <InputNumber placeholder="设定温度" min={0} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actualTemp"
                label="实际温度 (°C)"
                rules={[{ required: true, message: '请输入实际温度' }]}
              >
                <InputNumber placeholder="实际温度" min={0} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="topHeat"
                label="上火 (°C)"
                rules={[{ required: true, message: '请输入上火温度' }]}
              >
                <InputNumber placeholder="上火" min={0} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="bottomHeat"
                label="下火 (°C)"
                rules={[{ required: true, message: '请输入下火温度' }]}
              >
                <InputNumber placeholder="下火" min={0} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="preheatMinutes"
                label="预热时间 (分钟)"
                rules={[{ required: true, message: '请输入预热时间' }]}
              >
                <InputNumber placeholder="预热时间" min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="testPoint"
                label="测试点"
                rules={[{ required: true, message: '请输入测试点' }]}
              >
                <Input placeholder="例如：center, left, right" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="employeeId"
                label="操作人"
                rules={[{ required: true, message: '请选择操作人' }]}
              >
                <Select placeholder="请选择操作人">
                  {employees.map((emp) => (
                    <Option key={emp.id} value={emp.id}>
                      {emp.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="calibratedAt"
                label="校准时间"
                rules={[{ required: true, message: '请选择校准时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="notes" label="备注">
                <Input placeholder="备注信息（可选）" />
              </Form.Item>
            </Col>
          </Row>

          {previewSuggestion && (
            <Alert
              type={previewSuggestion === '温度正常，无需调整' ? 'success' : 'warning'}
              showIcon
              message="调温建议预览"
              description={previewSuggestion}
              style={{ marginTop: 16 }}
            />
          )}
        </Form>
      </Modal>

      <Modal
        title="校准记录详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {detailRecord && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="烤箱型号" span={2}>
              {detailRecord.ovenModel}
            </Descriptions.Item>
            <Descriptions.Item label="层位">
              第{detailRecord.layerNumber}层
            </Descriptions.Item>
            <Descriptions.Item label="测试点">
              {detailRecord.testPoint}
            </Descriptions.Item>
            <Descriptions.Item label="设定温度">
              {detailRecord.setTemp}°C
            </Descriptions.Item>
            <Descriptions.Item label="实际温度">
              {detailRecord.actualTemp}°C
            </Descriptions.Item>
            <Descriptions.Item label="偏差" span={2}>
              <span
                style={{
                  color:
                    Math.abs(detailRecord.deviation) <= 10
                      ? '#52c41a'
                      : detailRecord.deviation > 0
                      ? '#ff4d4f'
                      : '#1890ff',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
              >
                {getDeviationText(detailRecord.deviation)}°C
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="上火">
              {detailRecord.topHeat}°C
            </Descriptions.Item>
            <Descriptions.Item label="下火">
              {detailRecord.bottomHeat}°C
            </Descriptions.Item>
            <Descriptions.Item label="预热时间">
              {detailRecord.preheatMinutes}分钟
            </Descriptions.Item>
            <Descriptions.Item label="操作人">
              {detailRecord.employeeName}
            </Descriptions.Item>
            <Descriptions.Item label="校准时间" span={2}>
              {dayjs(detailRecord.calibratedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="调温建议" span={2}>
              {detailRecord.tempSuggestion === '温度正常，无需调整' ? (
                <Tag color="success">{detailRecord.tempSuggestion}</Tag>
              ) : (
                <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>
                  {detailRecord.tempSuggestion}
                </span>
              )}
            </Descriptions.Item>
            {detailRecord.notes && (
              <Descriptions.Item label="备注" span={2}>
                {detailRecord.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Calibration
