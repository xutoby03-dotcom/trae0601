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
  Radio,
  Upload,
  Descriptions,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { PhotoDetail, PhotoThumb } from '@/components'
import {
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
} from '@/api/batches'
import { getRecipes } from '@/api/recipes'
import { getOvens } from '@/api/ovens'
import { getEmployees } from '@/api/employees'

const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

const highlightFailureReason = (reason) => {
  if (!reason) return '-'
  const tempKeywords = ['温度', '度', '低', '高', '过热', '过冷', '预热']
  const hasTempKeyword = tempKeywords.some((keyword) => reason.includes(keyword))
  if (hasTempKeyword) {
    return (
      <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{reason}</span>
    )
  }
  return reason
}

const Batches = () => {
  const [batches, setBatches] = useState([])
  const [recipes, setRecipes] = useState([])
  const [ovens, setOvens] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const [filters, setFilters] = useState({
    recipeId: null,
    ovenId: null,
    result: null,
    dateRange: null,
  })

  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [resultValue, setResultValue] = useState('success')
  const [uploadFile, setUploadFile] = useState(null)

  const [detailVisible, setDetailVisible] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchRecipes()
    fetchOvens()
  }, [])

  useEffect(() => {
    fetchBatches()
  }, [pagination.current, pagination.pageSize, filters])

  const fetchRecipes = async () => {
    try {
      const res = await getRecipes({ pageSize: 100 })
      setRecipes(res.list || [])
    } catch (err) {
      console.error('获取配方列表失败:', err)
    }
  }

  const fetchOvens = async () => {
    try {
      const res = await getOvens({ pageSize: 100 })
      setOvens(res.list || [])
    } catch (err) {
      console.error('获取烤箱列表失败:', err)
    }
  }

  const fetchBatches = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (filters.recipeId) {
        params.recipeId = filters.recipeId
      }
      if (filters.ovenId) {
        params.ovenId = filters.ovenId
      }
      if (filters.result) {
        params.result = filters.result
      }
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD')
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD')
      }
      const res = await getBatches(params)
      setBatches(res.list || [])
      setPagination((prev) => ({ ...prev, total: res.total || 0 }))
    } catch (err) {
      console.error('获取批次列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingRecord(null)
    setResultValue('success')
    setUploadFile(null)
    form.resetFields()
    form.setFieldsValue({
      result: 'success',
      producedAt: dayjs(),
    })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setResultValue(record.result)
    setUploadFile(null)
    form.setFieldsValue({
      recipeId: record.recipeId,
      ovenId: record.ovenId,
      layerUsed: record.layerUsed,
      actualTemp: record.actualTemp,
      result: record.result,
      failureReason: record.failureReason,
      producedAt: record.producedAt ? dayjs(record.producedAt) : dayjs(),
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteBatch(id)
      message.success('删除成功')
      fetchBatches()
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const formData = new FormData()
      formData.append('recipeId', values.recipeId)
      formData.append('ovenId', values.ovenId)
      formData.append('layerUsed', values.layerUsed)
      if (values.actualTemp !== undefined && values.actualTemp !== null) {
        formData.append('actualTemp', values.actualTemp)
      }
      formData.append('result', values.result)
      if (values.result === 'failed' && values.failureReason) {
        formData.append('failureReason', values.failureReason)
      }
      if (values.producedAt) {
        formData.append('producedAt', values.producedAt.format('YYYY-MM-DD HH:mm:ss'))
      }
      if (uploadFile) {
        formData.append('photo', uploadFile)
      }

      if (editingRecord) {
        await updateBatch(editingRecord.id, formData)
        message.success('更新成功')
      } else {
        await createBatch(formData)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchBatches()
    } catch (err) {
      console.error('提交失败:', err)
    }
  }

  const handleViewDetail = async (record) => {
    setDetailLoading(true)
    setDetailVisible(true)
    try {
      const data = await getBatch(record.id)

      let recipeInfo = null
      let ovenInfo = null

      if (data.recipeId) {
        try {
          const recipeRes = await getRecipes({ pageSize: 100 })
          recipeInfo = recipeRes.list?.find((r) => r.id === data.recipeId) || null
        } catch (e) {
          console.error('获取配方信息失败:', e)
        }
      }

      if (data.ovenId) {
        try {
          const ovenRes = await getOvens({ pageSize: 100 })
          ovenInfo = ovenRes.list?.find((o) => o.id === data.ovenId) || null
        } catch (e) {
          console.error('获取烤箱信息失败:', e)
        }
      }

      setDetailData({
        ...data,
        recipeInfo,
        ovenInfo,
      })
    } catch (err) {
      console.error('获取详情失败:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleResultChange = (e) => {
    const value = e.target.value
    setResultValue(value)
    if (value === 'success') {
      form.setFieldsValue({ failureReason: undefined })
    }
  }

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('只能上传图片文件')
        return false
      }
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error("图片大小不能超过 10MB")
        return false
      }
      setUploadFile(file)
      return false
    },
    onRemove: () => {
      setUploadFile(null)
    },
    fileList: uploadFile ? [uploadFile] : [],
    maxCount: 1,
    listType: 'picture-card',
  }

  const columns = [
    {
      title: '生产日期',
      dataIndex: 'producedAt',
      key: 'producedAt',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
      width: 160,
    },
    {
      title: '产品名称',
      dataIndex: 'recipeName',
      key: 'recipeName',
      render: (name) => name || '-',
    },
    {
      title: '使用烤箱',
      dataIndex: 'ovenModel',
      key: 'ovenModel',
      render: (model) => model || '-',
    },
    {
      title: '层位',
      dataIndex: 'layerUsed',
      key: 'layerUsed',
      render: (layer) => (layer !== null && layer !== undefined ? `第${layer}层` : '-'),
      width: 80,
    },
    {
      title: '实际温度',
      dataIndex: 'actualTemp',
      key: 'actualTemp',
      render: (temp) => (temp !== null && temp !== undefined ? `${temp}°C` : '-'),
      width: 100,
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (result) => (
        <Tag color={result === 'success' ? 'green' : 'red'}>
          {result === 'success' ? '成功' : '失败'}
        </Tag>
      ),
      width: 80,
    },
    {
      title: '失败原因',
      dataIndex: 'failureReason',
      key: 'failureReason',
      ellipsis: true,
      render: highlightFailureReason,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
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
            title="确定要删除这条批次记录吗？"
            description="删除后无法恢复"
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
      width: 180,
    },
  ]

  return (
    <div>
      <Card
        title="批次记录管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增批次
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              style={{ width: 180 }}
              placeholder="按配方筛选"
              allowClear
              value={filters.recipeId}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, recipeId: value }))
                setPagination((prev) => ({ ...prev, current: 1 }))
              }}
            >
              {recipes.map((recipe) => (
                <Option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 200 }}
              placeholder="按烤箱筛选"
              allowClear
              value={filters.ovenId}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, ovenId: value }))
                setPagination((prev) => ({ ...prev, current: 1 }))
              }}
            >
              {ovens.map((oven) => (
                <Option key={oven.id} value={oven.id}>
                  {oven.model}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 120 }}
              placeholder="按结果筛选"
              allowClear
              value={filters.result}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, result: value }))
                setPagination((prev) => ({ ...prev, current: 1 }))
              }}
            >
              <Option value="success">成功</Option>
              <Option value="failed">失败</Option>
            </Select>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => {
                setFilters((prev) => ({ ...prev, dateRange: dates }))
                setPagination((prev) => ({ ...prev, current: 1 }))
              }}
            />
            <Button
              onClick={() => {
                setFilters({
                  recipeId: null,
                  ovenId: null,
                  result: null,
                  dateRange: null,
                })
                setPagination((prev) => ({ ...prev, current: 1 }))
              }}
            >
              重置筛选
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={batches}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }))
            },
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑批次' : '新增批次'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="recipeId"
                label="配方"
                rules={[{ required: true, message: '请选择配方' }]}
              >
                <Select placeholder="请选择配方">
                  {recipes.map((recipe) => (
                    <Option key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
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
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="layerUsed"
                label="层位"
                rules={[{ required: true, message: '请输入层位' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="请输入层位"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actualTemp"
                label="实际温度(°C)"
              >
                <InputNumber
                  min={0}
                  placeholder="请输入实际温度"
                  style={{ width: '100%' }}
                  formatter={(value) => (value === null || value === undefined ? '' : `${value}°C`)}
                  parser={(value) => value ? Number(value.replace('°C', '')) : null}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="result"
            label="结果"
            rules={[{ required: true, message: '请选择结果' }]}
          >
            <Radio.Group onChange={handleResultChange}>
              <Radio value="success">成功</Radio>
              <Radio value="failed">失败</Radio>
            </Radio.Group>
          </Form.Item>
          {resultValue === 'failed' && (
            <Form.Item
              name="failureReason"
              label="失败原因"
              rules={[{ required: true, message: '请输入失败原因' }]}
            >
              <TextArea rows={3} placeholder="请输入失败原因" />
            </Form.Item>
          )}
          <Form.Item
            name="producedAt"
            label="生产日期"
            rules={[{ required: true, message: '请选择生产日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              placeholder="请选择生产日期"
            />
          </Form.Item>
          {resultValue === 'failed' && (
            <Form.Item label="照片上传">
              <Upload {...uploadProps}>
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="批次详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : detailData ? (
          <div>
            <Descriptions title="批次信息" bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="生产日期">
                {detailData.producedAt
                  ? dayjs(detailData.producedAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="结果">
                <Tag color={detailData.result === 'success' ? 'green' : 'red'}>
                  {detailData.result === 'success' ? '成功' : '失败'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="产品名称">
                {detailData.recipeName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="使用烤箱">
                {detailData.ovenModel || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="层位">
                {detailData.layerUsed !== null && detailData.layerUsed !== undefined
                  ? `第${detailData.layerUsed}层`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="实际温度">
                {detailData.actualTemp !== null && detailData.actualTemp !== undefined
                  ? `${detailData.actualTemp}°C`
                  : '-'}
              </Descriptions.Item>
              {detailData.result === 'failed' && (
                <Descriptions.Item label="失败原因" span={2}>
                  {highlightFailureReason(detailData.failureReason)}
                </Descriptions.Item>
              )}
            </Descriptions>

            {detailData.result === 'failed' && detailData.photoUrl && (
              <Card
                title="失败照片"
                size="small"
                style={{ marginBottom: 24 }}
              >
                <PhotoDetail
                  src={detailData.photoUrl}
                  alt="批次失败照片"
                />
              </Card>
            )}

            <Row gutter={16}>
              <Col span={12}>
                {detailData.recipeInfo && (
                  <Card title="关联配方信息" size="small">
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="配方名称">
                        {detailData.recipeInfo.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="推荐层位">
                        {detailData.recipeInfo.recommendedLayer
                          ? `第${detailData.recipeInfo.recommendedLayer}层`
                          : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="补偿温度">
                        {detailData.recipeInfo.tempCompensation !== null
                          && detailData.recipeInfo.tempCompensation !== undefined
                          ? `${detailData.recipeInfo.tempCompensation > 0 ? '+' : ''}${detailData.recipeInfo.tempCompensation}°C`
                          : '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}
              </Col>
              <Col span={12}>
                {detailData.ovenInfo && (
                  <Card title="关联烤箱信息" size="small">
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="型号">
                        {detailData.ovenInfo.model}
                      </Descriptions.Item>
                      <Descriptions.Item label="序列号">
                        {detailData.ovenInfo.serialNumber}
                      </Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <Tag color={detailData.ovenInfo.status === 'active' ? 'green' : 'orange'}>
                          {detailData.ovenInfo.status === 'active' ? '正常' : '维护中'}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}
              </Col>
            </Row>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Batches
